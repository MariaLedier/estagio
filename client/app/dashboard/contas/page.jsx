"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { formatarMoeda } from "@/utils/validacao.js"

export default function ContasPage() {

    const [montado, setMontado] = useState(false)
    const [contas, setContas] = useState([])
    const [loading, setLoading] = useState(false)
    const [pesquisa, setPesquisa] = useState("")
    const [filtroStatus, setFiltroStatus] = useState("")

    // MODAL PAGAMENTO
    const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false)
    const [contaPagando, setContaPagando] = useState(null)
    const [valorPago, setValorPago] = useState("")

    // MODAL DETALHES
    const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
    const [contaDetalhes, setContaDetalhes] = useState(null)
    const [itensDetalhes, setItensDetalhes] = useState([])
    const [loadingDetalhes, setLoadingDetalhes] = useState(false)

    useEffect(() => {
        setMontado(true)
        carregarContas()
    }, [])

    if (!montado) return null

    // -------------------- FORMATAÇÕES --------------------

    function formatarDataInput(data) {
        if (!data) return ""
        const d = new Date(data)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }

    function converterMoedaNumero(v) {
        if (!v) return 0
        return Number(v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim())
    }

    // -------------------- CARREGAR --------------------

    async function carregarContas() {
        try {
            const dados = await apiClient.get("/conta")
            setContas(Array.isArray(dados) ? dados : [])
        } catch {
            setContas([])
            toast.error("Erro ao carregar contas")
        }
    }

    // -------------------- FILTRO --------------------

    const contasFiltradas = contas.filter(function(c) {
        const termo = pesquisa.toLowerCase()
        const descricao = c.descricao?.toLowerCase() || ""
        const placa = c.veiculo?.placa?.toLowerCase() || ""
        const statusOk = filtroStatus ? c.status === filtroStatus : true
        return (descricao.includes(termo) || placa.includes(termo)) && statusOk
    })

    // -------------------- RESUMO --------------------

    let totalPendente = 0
    let totalPago = 0
    let totalParcial = 0

    for (let i = 0; i < contasFiltradas.length; i++) {
        const c = contasFiltradas[i]
        if (c.status === "PENDENTE") totalPendente += Number(c.valor)
        if (c.status === "PAGO") totalPago += Number(c.valor)
        if (c.status === "PARCIAL") totalParcial += Number(c.valor) - Number(c.valorPago)
    }

    // -------------------- MODAL DETALHES --------------------

    async function abrirDetalhes(c) {
        setContaDetalhes(c)
        setItensDetalhes([])
        setModalDetalhesAberto(true)
        setLoadingDetalhes(true)

        try {
            const manutencaoId = c.manutencao?.id || c.manutencao
            if (!manutencaoId) {
                setLoadingDetalhes(false)
                return
            }

            const dados = await apiClient.get("/conta/manutencao/" + manutencaoId)
            const lista = Array.isArray(dados) ? dados : []

            // BUSCA OS ITENS DA MANUTENÇÃO DIRETAMENTE
            const manutencoes = await apiClient.get("/manutencao/veiculo/" + (c.veiculo?.id || c.veiculo))
            const listaMan = Array.isArray(manutencoes) ? manutencoes : []

            for (let i = 0; i < listaMan.length; i++) {
                if (listaMan[i].id == manutencaoId) {
                    setItensDetalhes(listaMan[i].itens || [])
                    break
                }
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

    // -------------------- MODAL PAGAMENTO --------------------

    function abrirPagamento(c) {
        setContaPagando(c)
        setValorPago(formatarMoeda(String(c.valor)))
        setModalPagamentoAberto(true)
    }

    function fecharModalPagamento() {
        setModalPagamentoAberto(false)
        setContaPagando(null)
        setValorPago("")
    }

    async function efetuarPagamento(e) {
        e.preventDefault()

        if (!valorPago) {
            toast.error("Informe o valor pago")
            return
        }

        setLoading(true)

        try {
            await apiClient.post("/conta/pagar", {
                id: contaPagando.id,
                valorPago: converterMoedaNumero(valorPago)
            })

            toast.success("Pagamento registrado!")
            fecharModalPagamento()
            carregarContas()

        } catch {
            toast.error("Erro ao registrar pagamento")
        } finally {
            setLoading(false)
        }
    }

    // -------------------- EXCLUIR --------------------

    async function excluir(id) {
        if (!confirm("Deseja realmente excluir esta conta?")) return
        try {
            await apiClient.delete("/conta/" + id)
            toast.success("Conta excluída!")
            carregarContas()
        } catch {
            toast.error("Erro ao excluir conta")
        }
    }

    // -------------------- HELPERS --------------------

    function corStatus(status) {
        switch (status) {
            case "PENDENTE": return "#ef4444"
            case "PAGO": return "#22c55e"
            case "PARCIAL": return "#f59e0b"
            default: return "#9ca3af"
        }
    }

    // -------------------- RENDER --------------------

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* HEADER */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>💰 Contas a Pagar</h1>
                        <p style={styles.subtitle}>Gerencie os pagamentos das manutenções</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            placeholder="Buscar por descrição ou placa..."
                            value={pesquisa}
                            onChange={function(e) { setPesquisa(e.target.value) }}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", width: "240px" }}
                        />
                        <select
                            value={filtroStatus}
                            onChange={function(e) { setFiltroStatus(e.target.value) }}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                        >
                            <option value="">Todos</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="PARCIAL">Parcial</option>
                            <option value="PAGO">Pago</option>
                        </select>
                    </div>
                </div>

                {/* BLOCOS RESUMO */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
                    <div style={{ ...styles.bloco, borderTop: "3px solid #ef4444" }}>
                        <div style={styles.blocoLabel}>Total Pendente</div>
                        <div style={{ ...styles.blocoValor, color: "#ef4444" }}>
                            {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                    </div>
                    <div style={{ ...styles.bloco, borderTop: "3px solid #f59e0b" }}>
                        <div style={styles.blocoLabel}>Restante Parcial</div>
                        <div style={{ ...styles.blocoValor, color: "#f59e0b" }}>
                            {totalParcial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                    </div>
                    <div style={{ ...styles.bloco, borderTop: "3px solid #22c55e" }}>
                        <div style={styles.blocoLabel}>Total Pago</div>
                        <div style={{ ...styles.blocoValor, color: "#22c55e" }}>
                            {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                    </div>
                </div>

                {/* TABELA */}
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Descrição</th>
                            <th style={styles.th}>Veículo</th>
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Valor Pago</th>
                            <th style={styles.th}>Forma</th>
                            <th style={styles.th}>Parcela</th>
                            <th style={styles.th}>Vencimento</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                                    Nenhuma conta encontrada
                                </td>
                            </tr>
                        ) : (
                            contasFiltradas.map(function(c) {
                                const vencido = c.status !== "PAGO" && new Date(c.vencimento) < new Date()
                                return (
                                    <tr key={c.id} style={{ ...styles.tableRow, background: vencido ? "#fff5f5" : "transparent" }}>
                                        <td style={styles.td}>{c.id}</td>
                                        <td style={styles.td}>{c.descricao}</td>
                                        <td style={styles.td}>{c.veiculo?.placa || "-"}</td>
                                        <td style={styles.td}>
                                            {Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                        </td>
                                        <td style={styles.td}>
                                            {Number(c.valorPago).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                        </td>
                                        <td style={styles.td}>{c.formaPagamento}</td>
                                        <td style={styles.td}>
                                            {c.parcela === 0 ? "Entrada" : `${c.parcela}/${c.totalParcelas}`}
                                        </td>
                                        <td style={{
                                            ...styles.td,
                                            color: vencido ? "#ef4444" : "#111827",
                                            fontWeight: vencido ? "bold" : "normal"
                                        }}>
                                            {formatarDataInput(c.vencimento)}
                                            {vencido && (
                                                <small style={{ display: "block", color: "#ef4444" }}>Vencido</small>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                background: corStatus(c.status),
                                                color: "#fff",
                                                padding: "3px 8px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td style={styles.actions}>
                                            <button
                                                onClick={function() { abrirDetalhes(c) }}
                                                style={styles.buttonDetalhes}
                                            >
                                                Detalhes
                                            </button>
                                            {c.status !== "PAGO" && (
                                                <button
                                                    onClick={function() { abrirPagamento(c) }}
                                                    style={styles.buttonPagar}
                                                >
                                                    Pagar
                                                </button>
                                            )}
                                            {c.status !== "PAGO" && (
                                                <button
                                                    onClick={function() { excluir(c.id) }}
                                                    style={styles.buttonDelete}
                                                >
                                                    Excluir
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

            </div>

            {/* MODAL DETALHES */}
            {modalDetalhesAberto && (
                <div style={styles.overlay}>
                    <div style={{ ...styles.modal, width: "500px" }}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <h2 style={{ margin: 0 }}>🔧 Itens da Manutenção</h2>
                            <button onClick={fecharDetalhes} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}>✕</button>
                        </div>

                        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>
                            {contaDetalhes?.descricao} — <strong>{contaDetalhes?.veiculo?.placa}</strong>
                        </p>

                        {loadingDetalhes ? (
                            <div style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                                Carregando itens...
                            </div>
                        ) : itensDetalhes.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                                Nenhum item encontrado
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {itensDetalhes.map(function(item, i) {
                                    return (
                                        <div key={i} style={{
                                            padding: "14px 16px",
                                            background: "#f8fafc",
                                            borderRadius: "10px",
                                            border: "1px solid #e5e7eb",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "3px" }}>
                                                    {item.servico?.nome || "-"}
                                                </div>
                                                <div style={{ color: "#6b7280", fontSize: "12px" }}>
                                                    🏭 {item.oficina?.nome || "-"}
                                                </div>
                                                {item.descricao && (
                                                    <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "3px" }}>
                                                        {item.descricao}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontWeight: "bold", color: "#2563eb", fontSize: "16px", whiteSpace: "nowrap" }}>
                                                {Number(item.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* TOTAL */}
                                <div style={{
                                    padding: "14px 16px",
                                    background: "#eff6ff",
                                    borderRadius: "10px",
                                    border: "1px solid #bfdbfe",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontWeight: "bold"
                                }}>
                                    <span>Total da Manutenção</span>
                                    <span style={{ color: "#2563eb", fontSize: "18px" }}>
                                        {itensDetalhes
                                            .reduce(function(acc, item) { return acc + Number(item.valor || 0) }, 0)
                                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                            <button onClick={fecharDetalhes} style={styles.buttonCancel}>
                                Fechar
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL PAGAMENTO */}
            {modalPagamentoAberto && (
                <div style={styles.overlay}>
                    <div style={{ ...styles.modal, width: "420px" }}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <h2 style={{ margin: 0 }}>Efetuar Pagamento</h2>
                            <button onClick={fecharModalPagamento} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}>✕</button>
                        </div>

                        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>
                            {contaPagando?.descricao}
                        </p>

                        <form onSubmit={efetuarPagamento}>

                            <div style={styles.inputGroup}>
                                <label style={{ fontSize: "13px", color: "#6b7280" }}>Valor Total da Parcela</label>
                                <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", color: "#111827" }}>
                                    {Number(contaPagando?.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </div>
                            </div>

                            {Number(contaPagando?.valorPago) > 0 && (
                                <div style={styles.inputGroup}>
                                    <label style={{ fontSize: "13px", color: "#6b7280" }}>Já Pago</label>
                                    <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px", fontWeight: "bold", fontSize: "15px", color: "#22c55e" }}>
                                        {Number(contaPagando?.valorPago).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </div>
                                </div>
                            )}

                            <div style={styles.inputGroup}>
                                <label style={{ fontSize: "13px", color: "#6b7280" }}>Valor a Pagar Agora</label>
                                <input
                                    type="text"
                                    value={valorPago}
                                    onChange={function(e) { setValorPago(formatarMoeda(e.target.value)) }}
                                    style={styles.input}
                                    placeholder="R$ 0,00"
                                    autoFocus
                                />
                                {valorPago && converterMoedaNumero(valorPago) < (Number(contaPagando?.valor) - Number(contaPagando?.valorPago)) && (
                                    <small style={{ color: "#f59e0b" }}>
                                        ⚠ Pagamento parcial — restante: {(Number(contaPagando?.valor) - Number(contaPagando?.valorPago) - converterMoedaNumero(valorPago))
                                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </small>
                                )}
                            </div>

                            <div style={styles.modalButtons}>
                                <button type="button" onClick={fecharModalPagamento} style={styles.buttonCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} style={{ ...styles.buttonPrimary, backgroundColor: "#22c55e" }}>
                                    {loading ? "Processando..." : "Confirmar Pagamento"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

const styles = {
    page: { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
    card: { width: "100%", maxWidth: "1300px", backgroundColor: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", boxSizing: "border-box" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" },
    title: { margin: 0, fontSize: "24px", fontWeight: "bold" },
    subtitle: { margin: 0, color: "#6b7280", fontSize: "14px" },
    bloco: { backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px", minWidth: "180px", flex: "1" },
    blocoLabel: { fontSize: "12px", color: "#6b7280", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" },
    blocoValor: { fontSize: "22px", fontWeight: "bold" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { backgroundColor: "#f1f5f9" },
    th: { padding: "10px", textAlign: "left", fontSize: "13px" },
    tableRow: { borderBottom: "1px solid #e5e7eb" },
    td: { padding: "10px", fontSize: "13px" },
    actions: { display: "flex", gap: "6px", padding: "10px", flexWrap: "wrap" },
    buttonPrimary: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonDetalhes: { backgroundColor: "#2563eb", color: "#fff", padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" },
    buttonPagar: { backgroundColor: "#22c55e", color: "#fff", padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" },
    buttonDelete: { backgroundColor: "#ef4444", color: "#fff", padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" },
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 999 },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
    inputGroup: { marginBottom: "14px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" },
    modalButtons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
    buttonCancel: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" }
}
