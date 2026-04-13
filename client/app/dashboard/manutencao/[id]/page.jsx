"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { formatarMoeda, formatarKm } from "@/utils/validacao.js"
import { useUser } from "@/app/context/userContext.jsx"

export default function ManutencaoVeiculoPage() {

    const { id } = useParams()
    const router = useRouter()
    const { user } = useUser()

    const isAdmin = user?.tipo === 2   // APENAS ADMIN PODE TROCAR O USUÁRIO

    const [montado, setMontado] = useState(false)
    const [veiculo, setVeiculo] = useState(null)
    const [manutencoes, setManutencoes] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [servicos, setServicos] = useState([])
    const [oficinas, setOficinas] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalAberto, setModalAberto] = useState(false)
    const [editando, setEditando] = useState(null)
    const [pesquisa, setPesquisa] = useState("")
    const [itens, setItens] = useState([])
    const [modalConclusaoAberto, setModalConclusaoAberto] = useState(false)
    const [manutencaoConcluindo, setManutencaoConcluindo] = useState(null)
    const [totalManutencao, setTotalManutencao] = useState(0)

    // REFS DO FORMULÁRIO DE MANUTENÇÃO
    const tipo = useRef()
    const status = useRef()
    const data = useRef()
    const km = useRef()
    const usuarioSelecionado = useRef()
    const descricao = useRef()
    const campoPesquisa = useRef()

    // REFS DO MODAL DE CONCLUSÃO — só forma de pagamento e observação
    const formaPagamento = useRef()
    const descricaoPagamento = useRef()

    function dataDeHoje() {
        const hoje = new Date()
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`
    }

    useEffect(() => {
        setMontado(true)
    }, [])

    useEffect(() => {
        carregarVeiculo()
        carregarManutencoes()
        carregarServicos()
        carregarOficinas()
        if (isAdmin) carregarUsuarios()
    }, [id])

    if (!montado) return null

    // -------------------- FORMATAÇÕES --------------------

    function formatarDataInput(valor) {
        if (!valor) return ""
        const d = new Date(valor)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }

    function converterMoedaNumero(v) {
        if (!v) return 0
        return Number(v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim())
    }

    // -------------------- CARREGAR --------------------

    async function carregarVeiculo() {
        try {
            const dados = await apiClient.get("/veiculo/" + id)
            setVeiculo(dados)
        } catch {
            toast.error("Erro ao carregar veículo")
        }
    }

    async function carregarManutencoes() {
        try {
            const dados = await apiClient.get("/manutencao/veiculo/" + id)
            setManutencoes(Array.isArray(dados) ? dados : [])
        } catch {
            setManutencoes([])
        }
    }

    async function carregarUsuarios() {
        try {
            const dados = await apiClient.get("/usuario")
            setUsuarios(Array.isArray(dados) ? dados : [])
        } catch {
            setUsuarios([])
        }
    }

    async function carregarServicos() {
        try {
            const dados = await apiClient.get("/servico")
            setServicos(Array.isArray(dados) ? dados : [])
        } catch {
            setServicos([])
        }
    }

    async function carregarOficinas() {
        try {
            const dados = await apiClient.get("/oficina")
            setOficinas(Array.isArray(dados) ? dados : [])
        } catch {
            setOficinas([])
        }
    }

    // -------------------- ITENS --------------------

    function adicionarItem() {
        setItens([...itens, { descricao: "", valor: "", servico: "", oficina: "" }])
    }

    function removerItem(index) {
        const copia = [...itens]
        copia.splice(index, 1)
        setItens(copia)
    }

    function alterarItem(index, campo, valor) {
        const copia = [...itens]
        copia[index][campo] = valor
        setItens(copia)
    }

    // -------------------- FILTRO --------------------

    const manutencoesFiltradas = manutencoes.filter((m) => {
        const termo = pesquisa.toLowerCase()
        return (
            (m.tipo?.toLowerCase() || "").includes(termo) ||
            (m.status?.toLowerCase() || "").includes(termo)
        )
    })

    // -------------------- MODAL DE MANUTENÇÃO --------------------

    function abrirNovo() {
        setEditando(null)
        setItens([{ descricao: "", valor: "", servico: "", oficina: "" }])
        setModalAberto(true)

        setTimeout(() => {
            tipo.current.value = "PREVENTIVA"
            status.current.value = "AGENDADA"
            data.current.value = dataDeHoje()
            km.current.value = ""
            descricao.current.value = ""
            usuarioSelecionado.current.value = user?.id || ""
        }, 50)
    }

    function abrirEdicao(m) {
        setEditando(m)
        setItens(
            m.itens && m.itens.length > 0
                ? m.itens.map((i) => ({
                    descricao: i.descricao || "",
                    valor: formatarMoeda(String(i.valor || "0")),
                    servico: i.servico?.id || i.servico || "",
                    oficina: i.oficina?.id || i.oficina || ""
                }))
                : [{ descricao: "", valor: "", servico: "", oficina: "" }]
        )
        setModalAberto(true)

        setTimeout(() => {
            tipo.current.value = m.tipo || "PREVENTIVA"
            status.current.value = m.status || "AGENDADA"
            data.current.value = formatarDataInput(m.data)
            km.current.value = m.km ? String(m.km) : ""
            descricao.current.value = m.descricao || ""
            usuarioSelecionado.current.value = m.usuario?.id || m.usuario || user?.id || ""
        }, 50)
    }

    function fecharModal() {
        setModalAberto(false)
        setEditando(null)
    }

    // -------------------- SALVAR MANUTENÇÃO --------------------

    async function salvar() {
        if (!tipo.current.value || !data.current.value || !usuarioSelecionado.current.value) {
            toast.error("Preencha os campos obrigatórios")
            return
        }

        setLoading(true)

        try {
            const itensPayload = []
            for (let i = 0; i < itens.length; i++) {
                if (itens[i].servico && itens[i].oficina) {
                    itensPayload.push({
                        descricao: itens[i].descricao,
                        valor: converterMoedaNumero(itens[i].valor),
                        servico: itens[i].servico,
                        oficina: itens[i].oficina
                    })
                }
            }

            let obj = {
                tipo: tipo.current.value,
                data: data.current.value,
                descricao: descricao.current.value,
                status: status.current.value,
                km: km.current.value ? parseInt(km.current.value.replace(/\./g, "")) : null,
                veiculo: id,
                usuario: usuarioSelecionado.current.value,
                itens: itensPayload
            }

            if (editando) {
                await apiClient.put("/manutencao", { id: editando.id, ...obj })
                toast.success("Manutenção alterada!")
            } else {
                await apiClient.post("/manutencao", obj)
                toast.success("Manutenção cadastrada!")
            }

            fecharModal()
            carregarManutencoes()

        } catch {
            toast.error("Erro ao salvar manutenção")
        } finally {
            setLoading(false)
        }
    }

    // -------------------- EXCLUIR --------------------

    async function excluir(manutencaoId) {
        if (!confirm("Deseja realmente excluir esta manutenção?")) return
        try {
            await apiClient.delete("/manutencao/" + manutencaoId)
            toast.success("Excluída!")
            carregarManutencoes()
        } catch {
            toast.error("Erro ao excluir")
        }
    }

    // -------------------- MODAL DE CONCLUSÃO --------------------

    function abrirConclusao(m) {
        // Calcula o total somando os valores dos itens
        let total = 0
        for (let i = 0; i < m.itens.length; i++) {
            total += Number(m.itens[i].valor || 0)
        }
        setTotalManutencao(total)
        setManutencaoConcluindo(m)
        setModalConclusaoAberto(true)

        setTimeout(() => {
            formaPagamento.current.value = "DINHEIRO"
            descricaoPagamento.current.value = ""
        }, 50)
    }

    function fecharConclusao() {
        setModalConclusaoAberto(false)
        setManutencaoConcluindo(null)
    }

    async function confirmarConclusao() {
        if (!formaPagamento.current.value) {
            toast.error("Selecione a forma de pagamento")
            return
        }

        setLoading(true)

        try {
            // 1. Grava o registro de gasto (conta)
            // REMOVIDO o campo 'data', pois a tabela tb_conta não tem mais vencimento
            await apiClient.post("/conta", {
                manutencao: manutencaoConcluindo.id,
                veiculo: id,
                valor: totalManutencao,
                formaPagamento: formaPagamento.current.value,
                descricao: descricaoPagamento.current.value
                // data: dataDeHoje() <- REMOVA ESTA LINHA
            })

            // 2. Marca a manutenção como concluída
            await apiClient.put("/manutencao", {
                id: manutencaoConcluindo.id,
                status: "CONCLUIDA"
            })

            toast.success("Manutenção concluída!")
            fecharConclusao()
            carregarManutencoes()

        } catch (error) {
            console.error(error)
            toast.error("Erro ao concluir manutenção")
        } finally {
            setLoading(false)
        }
    }

    // -------------------- CORES --------------------

    function corStatus(valor) {
        if (valor === "AGENDADA") return "#2563eb"
        if (valor === "EM_ANDAMENTO") return "#f59e0b"
        if (valor === "CONCLUIDA") return "#22c55e"
        if (valor === "CANCELADA") return "#ef4444"
        return "#9ca3af"
    }

    function corTipo(valor) {
        return valor === "CORRETIVA" ? "#ef4444" : "#2563eb"
    }

    // -------------------- RENDER --------------------

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* CABEÇALHO */}
                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={() => router.back()} style={styles.buttonBack}>
                            ← Voltar
                        </button>
                        <div>
                            <h1 style={styles.title}>🔧 Manutenções — {veiculo?.placa || "..."}</h1>
                            <p style={styles.subtitle}>{veiculo?.marcaNome || ""} {veiculo?.modeloNome || ""} {veiculo?.ano || ""}</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                            ref={campoPesquisa}
                            placeholder="Buscar por tipo ou status..."
                            onChange={() => setPesquisa(campoPesquisa.current.value)}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", width: "220px" }}
                        />
                        <button onClick={abrirNovo} style={styles.buttonPrimary}>
                            + Nova Manutenção
                        </button>
                    </div>
                </div>

                {/* TABELA */}
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Data</th>
                            <th style={styles.th}>KM</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Usuário</th>
                            <th style={styles.th}>Itens</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {manutencoesFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                                    Nenhuma manutenção registrada para este veículo
                                </td>
                            </tr>
                        ) : (
                            manutencoesFiltradas.map((m) => (
                                <tr key={m.id} style={styles.tableRow}>
                                    <td style={styles.td}>{m.id}</td>
                                    <td style={styles.td}>
                                        <span style={{ background: corTipo(m.tipo), color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                                            {m.tipo}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{formatarDataInput(m.data)}</td>
                                    <td style={styles.td}>{m.km ? Number(m.km).toLocaleString("pt-BR") + " km" : "-"}</td>
                                    <td style={styles.td}>
                                        <span style={{ background: corStatus(m.status), color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                                            {m.status?.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{m.usuario?.nome || "-"}</td>
                                    <td style={styles.td}>
                                        {m.itens && m.itens.length > 0 ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                {m.itens.map((item, i) => (
                                                    <small key={i} style={{ color: "#6b7280" }}>
                                                        • {item.servico?.nome || "-"} — {item.oficina?.nome || "-"}
                                                    </small>
                                                ))}
                                            </div>
                                        ) : "-"}
                                    </td>
                                    <td style={styles.actions}>
                                        <button onClick={() => abrirEdicao(m)} style={styles.buttonEdit}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>

                                        {m.status !== "CONCLUIDA" && m.status !== "CANCELADA" && (
                                            <button onClick={() => abrirConclusao(m)} style={styles.buttonConcluir}>
                                                Concluir
                                            </button>
                                        )}

                                        <button onClick={() => excluir(m.id)} style={styles.buttonDelete}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

            </div>

            {/* MODAL DE MANUTENÇÃO */}
            {modalAberto && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>

                        <h2 style={{ marginBottom: 20 }}>
                            {editando ? "Editar Manutenção" : "Nova Manutenção"}
                        </h2>

                        <div style={styles.grid2}>

                            <div style={styles.inputGroup}>
                                <label>Tipo:</label>
                                <select ref={tipo} style={styles.input}>
                                    <option value="PREVENTIVA">Preventiva</option>
                                    <option value="CORRETIVA">Corretiva</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Status:</label>
                                <select ref={status} style={styles.input}>
                                    <option value="AGENDADA">Agendada</option>
                                    <option value="EM_ANDAMENTO">Em Andamento</option>
                                    <option value="CONCLUIDA">Concluída</option>
                                    <option value="CANCELADA">Cancelada</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Data:</label>
                                <input ref={data} type="date" style={styles.input} />
                                <small style={{ color: "#9ca3af" }}>Data atual preenchida por padrão</small>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>KM:</label>
                                <input
                                    ref={km}
                                    type="text"
                                    style={styles.input}
                                    placeholder="Ex: 54.000"
                                    onChange={() => { km.current.value = formatarKm(km.current.value) }}
                                />
                            </div>

                        </div>

                        {/* USUÁRIO — admin vê select, outros veem só o próprio nome */}
                        <div style={styles.inputGroup}>
                            <label>Usuário:</label>
                            {isAdmin ? (
                                <select ref={usuarioSelecionado} style={styles.input}>
                                    <option value="">-- Selecione --</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>{u.nome}</option>
                                    ))}
                                </select>
                            ) : (
                                <>
                                    <input ref={usuarioSelecionado} type="hidden" defaultValue={user?.id || ""} />
                                    <input
                                        type="text"
                                        value={user?.nome || ""}
                                        readOnly
                                        style={{ ...styles.input, backgroundColor: "#f1f5f9", color: "#6b7280", cursor: "not-allowed" }}
                                    />
                                    <small style={{ color: "#9ca3af" }}>Preenchido automaticamente com seu usuário</small>
                                </>
                            )}
                        </div>

                        <div style={styles.inputGroup}>
                            <label>Descrição:</label>
                            <textarea
                                ref={descricao}
                                style={{ ...styles.input, height: "70px", resize: "vertical" }}
                                placeholder="Descreva a manutenção..."
                            />
                        </div>

                        {/* ITENS DA MANUTENÇÃO */}
                        <div style={{ marginTop: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <label style={{ fontWeight: "bold" }}>Itens da Manutenção</label>
                                <button type="button" onClick={adicionarItem} style={styles.buttonAdd}>
                                    + Adicionar Item
                                </button>
                            </div>

                            {itens.map((item, index) => (
                                <div key={index} style={styles.itemRow}>

                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: "12px", color: "#6b7280" }}>Serviço</label>
                                        <select
                                            value={item.servico}
                                            onChange={(e) => alterarItem(index, "servico", e.target.value)}
                                            style={styles.inputSm}
                                        >
                                            <option value="">Selecione</option>
                                            {servicos.map((s) => (
                                                <option key={s.id} value={s.id}>{s.nome}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: "12px", color: "#6b7280" }}>Oficina</label>
                                        <select
                                            value={item.oficina}
                                            onChange={(e) => alterarItem(index, "oficina", e.target.value)}
                                            style={styles.inputSm}
                                        >
                                            <option value="">Selecione</option>
                                            {oficinas.map((o) => (
                                                <option key={o.id} value={o.id}>{o.nome}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: "12px", color: "#6b7280" }}>Descrição</label>
                                        <input
                                            type="text"
                                            value={item.descricao}
                                            onChange={(e) => alterarItem(index, "descricao", e.target.value)}
                                            style={styles.inputSm}
                                            placeholder="Descrição"
                                        />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: "12px", color: "#6b7280" }}>Valor</label>
                                        <input
                                            type="text"
                                            value={item.valor}
                                            onChange={(e) => alterarItem(index, "valor", formatarMoeda(e.target.value))}
                                            style={styles.inputSm}
                                            placeholder="R$ 0,00"
                                        />
                                    </div>

                                    <button type="button" onClick={() => removerItem(index)} style={styles.buttonRemove}>
                                        ✕
                                    </button>

                                </div>
                            ))}
                        </div>

                        <div style={styles.modalButtons}>
                            <button type="button" onClick={fecharModal} style={styles.buttonCancel}>
                                Cancelar
                            </button>
                            <button type="button" onClick={salvar} disabled={loading} style={styles.buttonPrimary}>
                                {loading ? "Salvando..." : "Salvar"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MODAL DE CONCLUSÃO — simples, só pagamento e observação */}
            {modalConclusaoAberto && (
                <div style={styles.overlay}>
                    <div style={{ ...styles.modal, width: "420px" }}>

                        <h2 style={{ marginBottom: "6px" }}>Concluir Manutenção</h2>

                        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
                            Total da manutenção:{" "}
                            <strong style={{ color: "#111827" }}>
                                {totalManutencao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </strong>
                        </p>

                        <div style={styles.inputGroup}>
                            <label>Forma de Pagamento:</label>
                            <select ref={formaPagamento} style={styles.input}>
                                <option value="DINHEIRO">Dinheiro</option>
                                <option value="PIX">PIX</option>
                                <option value="BOLETO">Boleto</option>
                                <option value="CREDITO">Cartão de Crédito</option>
                                <option value="DEBITO">Cartão de Débito</option>
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label>Observação (opcional):</label>
                            <textarea
                                ref={descricaoPagamento}
                                style={{ ...styles.input, height: "70px", resize: "vertical" }}
                                placeholder="Ex: Pago na oficina João..."
                            />
                        </div>

                        <div style={styles.modalButtons}>
                            <button type="button" onClick={fecharConclusao} style={styles.buttonCancel}>
                                Cancelar
                            </button>
                            <button type="button" onClick={confirmarConclusao} disabled={loading} style={{ ...styles.buttonPrimary, backgroundColor: "#22c55e" }}>
                                {loading ? "Salvando..." : "Confirmar e Concluir"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

// -------------------- ESTILOS --------------------
const styles = {
    page: { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
    card: { width: "100%", maxWidth: "1200px", backgroundColor: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", boxSizing: "border-box" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" },
    title: { margin: 0, fontSize: "22px", fontWeight: "bold" },
    subtitle: { margin: 0, color: "#6b7280", fontSize: "14px" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { backgroundColor: "#f1f5f9" },
    th: { padding: "10px", textAlign: "left" },
    tableRow: { borderBottom: "1px solid #e5e7eb" },
    td: { padding: "10px", verticalAlign: "top" },
    actions: { display: "flex", gap: "6px", padding: "10px" },
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "700px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
    inputGroup: { marginBottom: "12px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" },
    inputSm: { padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", width: "100%" },
    itemRow: { display: "flex", gap: "8px", alignItems: "flex-end", marginBottom: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px" },
    modalButtons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
    buttonPrimary: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonBack: { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonEdit: { backgroundColor: "#facc15", color: "#000", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    buttonDelete: { backgroundColor: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    buttonAdd: { backgroundColor: "#f1f5f9", color: "#374151", padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", cursor: "pointer", fontSize: "13px" },
    buttonRemove: { backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", alignSelf: "flex-end" },
    buttonCancel: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" },
    buttonConcluir: { backgroundColor: "#22c55e", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
}