    "use client"

    import { useState, useEffect, useMemo } from "react"
    import { apiClient } from "@/utils/apiClient.js"
    import toast from "react-hot-toast"

    export default function ContasPage() {
        const [montado, setMontado] = useState(false)
        const [contas, setContas] = useState([])
        // Corrigido: pesquisa deve iniciar como string
        const [pesquisa, setPesquisa] = useState("") 
        const [filtroForma, setFiltroForma] = useState("")

        // MODAL DETALHES
        const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
        const [contaDetalhes, setContaDetalhes] = useState(null)
        const [itensDetalhes, setItensDetalhes] = useState([])
        const [loadingDetalhes, setLoadingDetalhes] = useState(false)

        useEffect(function() {
            setMontado(true)
            carregarContas()
        }, [])

        async function carregarContas() {
            try {
                const dados = await apiClient.get("/conta")
                setContas(Array.isArray(dados) ? dados : [])
            } catch {
                setContas([])
                toast.error("Erro ao carregar gastos")
            }
        }

        // Função de formatação atualizada para aceitar c.data ou c.vencimento
        function formatarData(data) {
            if (!data) return "-"
            const d = new Date(data)
            if (isNaN(d.getTime())) return "-"
            return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
        }

        // Cálculos otimizados com useMemo
        const { contasFiltradas, porVeiculo, totalGeral } = useMemo(() => {
            const filtradas = contas.filter(function(c) {
                const termo = pesquisa.toLowerCase()
                const descricao = c.descricao?.toLowerCase() || ""
                const placa = c.veiculo?.placa?.toLowerCase() || ""
                const formaOk = filtroForma ? c.formaPagamento === filtroForma : true
                return (descricao.includes(termo) || placa.includes(termo)) && formaOk
            })

            let total = 0
            let resumoVeiculos = {}

            filtradas.forEach(c => {
                const valor = Number(c.valor || 0)
                total += valor
                const placa = c.veiculo?.placa || "Sem placa"
                if (!resumoVeiculos[placa]) {
                    resumoVeiculos[placa] = { placa, total: 0, qtd: 0 }
                }
                resumoVeiculos[placa].total += valor
                resumoVeiculos[placa].qtd++
            })

            return { contasFiltradas: filtradas, porVeiculo: resumoVeiculos, totalGeral: total }
        }, [contas, pesquisa, filtroForma])

        if (!montado) return null

        async function abrirDetalhes(c) {
            setContaDetalhes(c)
            setItensDetalhes([])
            setModalDetalhesAberto(true)
            setLoadingDetalhes(true)

            try {
                // Tenta pegar o ID da manutenção de várias formas para garantir compatibilidade
                const manutencaoId = c.manutencao?.id || c.manutencao
                if (!manutencaoId) { setLoadingDetalhes(false); return }

                const manutencoes = await apiClient.get("/manutencao/veiculo/" + (c.veiculo?.id || c.veiculo))
                const lista = Array.isArray(manutencoes) ? manutencoes : []

                const manutEncontrada = lista.find(m => m.id == manutencaoId)
                if (manutEncontrada) {
                    setItensDetalhes(manutEncontrada.itens || [])
                }
            } catch {
                toast.error("Erro ao carregar detalhes")
            } finally {
                setLoadingDetalhes(false)
            }
        }

        function fecharDetalhes() {
            setModalDetalhesAberto(false)
            setContaDetalhes(null)
            setItensDetalhes([])
        }

        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div>
                            <h1 style={styles.title}>💰 Gastos com Manutenções</h1>
                            <p style={styles.subtitle}>Histórico de todos os gastos registrados</p>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                            <input
                                placeholder="Buscar por placa ou descrição..."
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                style={styles.inputBusca}
                            />
                            <select
                                value={filtroForma}
                                onChange={(e) => setFiltroForma(e.target.value)}
                                style={styles.selectForma}
                            >
                                <option value="">Todas as formas</option>
                                <option value="DINHEIRO">Dinheiro</option>
                                <option value="PIX">PIX</option>
                                <option value="BOLETO">Boleto</option>
                                <option value="CARTAO">Cartão</option>
                                <option value="CREDITO">Crédito</option>
                            </select>
                        </div>
                    </div>

                    {/* BLOCOS RESUMO */}
                    <div style={styles.containerBlocos}>
                        <div style={{ ...styles.bloco, borderTop: "3px solid #2563eb" }}>
                            <div style={styles.blocoLabel}>Total Geral</div>
                            <div style={{ ...styles.blocoValor, color: "#2563eb" }}>
                                {totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </div>
                        </div>
                        <div style={{ ...styles.bloco, borderTop: "3px solid #8b5cf6" }}>
                            <div style={styles.blocoLabel}>Total de Registros</div>
                            <div style={{ ...styles.blocoValor, color: "#8b5cf6" }}>{contasFiltradas.length}</div>
                        </div>
                        <div style={{ ...styles.bloco, borderTop: "3px solid #22c55e" }}>
                            <div style={styles.blocoLabel}>Veículos com Gastos</div>
                            <div style={{ ...styles.blocoValor, color: "#22c55e" }}>{Object.keys(porVeiculo).length}</div>
                        </div>
                    </div>

                    {/* TABELA */}
                    <table style={styles.table}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={styles.th}>Data</th>
                                <th style={styles.th}>Veículo</th>
                                <th style={styles.th}>Descrição</th>
                                <th style={styles.th}>Forma</th>
                                <th style={styles.th}>Valor</th>
                                <th style={styles.th}>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={styles.tdEmpty}>Nenhum gasto encontrado</td>
                                </tr>
                            ) : (
                                contasFiltradas.map((c) => (
                                    <tr key={c.id} style={styles.tableRow}>
                                        {/* Ajuste aqui: Tenta 'data' se 'vencimento' não existir */}
                                        <td style={styles.td}>{formatarData(c.vencimento || c.data)}</td>
                                        <td style={{ ...styles.td, fontWeight: "bold" }}>{c.veiculo?.placa || "-"}</td>
                                        <td style={styles.td}>{c.descricao}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badgeForma}>{c.formaPagamento}</span>
                                        </td>
                                        <td style={styles.valorDestaque}>
                                            {Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                        </td>
                                        <td style={styles.td}>
                                            <button onClick={() => abrirDetalhes(c)} style={styles.buttonDetalhes}>Ver Itens</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* O Modal permanece similar, mas agora os dados estão protegidos por verificações de tipo */}
                {modalDetalhesAberto && (
                    <div style={styles.overlay}>
                        <div style={{ ...styles.modal, width: "500px" }}>
                            <div style={styles.modalHeader}>
                                <h2 style={{ margin: 0 }}>🔧 Itens da Manutenção</h2>
                                <button onClick={fecharDetalhes} style={styles.closeButton}>✕</button>
                            </div>
                            <p style={styles.modalSub}>
                                {contaDetalhes?.veiculo?.placa} — {contaDetalhes?.descricao}
                            </p>
                            {loadingDetalhes ? (
                                <div style={styles.loadingCenter}>Carregando...</div>
                            ) : (
                                <div style={styles.listaItens}>
                                    {itensDetalhes.map((item, i) => (
                                        <div key={i} style={styles.itemCard}>
                                            <div>
                                                <div style={styles.itemNome}>{item.servico?.nome || "-"}</div>
                                                <div style={styles.itemOficina}>🏭 {item.oficina?.nome || "-"}</div>
                                            </div>
                                            <div style={styles.itemValor}>
                                                {Number(item.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                            </div>
                                        </div>
                                    ))}
                                    <div style={styles.totalModal}>
                                        <span>Total</span>
                                        <span>
                                            {itensDetalhes.reduce((acc, item) => acc + Number(item.valor || 0), 0)
                                                .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div style={styles.modalButtons}>
                                <button onClick={fecharDetalhes} style={styles.buttonCancel}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const styles = {
        page: { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
        card: { width: "100%", maxWidth: "1200px", backgroundColor: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" },
        title: { margin: 0, fontSize: "24px", fontWeight: "bold" },
        subtitle: { margin: 0, color: "#6b7280", fontSize: "14px" },
        inputBusca: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", width: "240px" },
        selectForma: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" },
        containerBlocos: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" },
        bloco: { backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px", minWidth: "180px", flex: "1" },
        blocoLabel: { fontSize: "12px", color: "#6b7280", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" },
        blocoValor: { fontSize: "22px", fontWeight: "bold" },
        table: { width: "100%", borderCollapse: "collapse" },
        tableHeader: { backgroundColor: "#f1f5f9" },
        th: { padding: "10px", textAlign: "left", fontSize: "13px" },
        tableRow: { borderBottom: "1px solid #e5e7eb" },
        td: { padding: "10px", fontSize: "13px" },
        tdEmpty: { textAlign: "center", padding: "30px", color: "#9ca3af" },
        badgeForma: { background: "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" },
        valorDestaque: { padding: "10px", fontSize: "13px", fontWeight: "bold", color: "#2563eb" },
        buttonDetalhes: { backgroundColor: "#2563eb", color: "#fff", padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" },
        overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 999 },
        modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", maxHeight: "90vh", overflowY: "auto" },
        modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
        closeButton: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" },
        modalSub: { color: "#6b7280", fontSize: "13px", marginBottom: "20px" },
        loadingCenter: { textAlign: "center", padding: "30px", color: "#9ca3af" },
        listaItens: { display: "flex", flexDirection: "column", gap: "10px" },
        itemCard: { padding: "14px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" },
        itemNome: { fontWeight: "bold", fontSize: "14px", marginBottom: "3px" },
        itemOficina: { color: "#6b7280", fontSize: "12px" },
        itemValor: { fontWeight: "bold", color: "#2563eb", fontSize: "16px" },
        totalModal: { padding: "14px 16px", background: "#eff6ff", borderRadius: "10px", border: "1px solid #bfdbfe", display: "flex", justifyContent: "space-between", fontWeight: "bold", marginTop: "10px" },
        modalButtons: { display: "flex", justifyContent: "flex-end", marginTop: "20px" },
        buttonCancel: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" }
    }