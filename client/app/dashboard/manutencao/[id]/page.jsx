"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { formatarMoeda } from "@/utils/validacao.js"

export default function ManutencaoVeiculoPage() {

    const { id } = useParams()
    const router = useRouter()

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

    // CAMPOS MANUTENÇÃO
    const [tipo, setTipo] = useState("PREVENTIVA")
    const [data, setData] = useState("")
    const [descricao, setDescricao] = useState("")
    const [status, setStatus] = useState("AGENDADA")
    const [km, setKm] = useState("")
    const [usuarioSelecionado, setUsuarioSelecionado] = useState("")

    // ITENS
    const [itens, setItens] = useState([])

    useEffect(() => {
        setMontado(true)
    }, [])

    useEffect(() => {
        carregarVeiculo()
        carregarManutencoes()
        carregarUsuarios()
        carregarServicos()
        carregarOficinas()
    }, [id])

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
        const novos = [...itens]
        novos.splice(index, 1)
        setItens(novos)
    }

    function alterarItem(index, campo, valor) {
        const novos = [...itens]
        novos[index][campo] = valor
        setItens(novos)
    }

    function handleValorItem(index, valor) {
        alterarItem(index, "valor", formatarMoeda(valor))
    }

    // -------------------- FILTRO --------------------

    const manutencoesFiltradas = manutencoes.filter(function(m) {
        const termo = pesquisa.toLowerCase()
        const tipo = m.tipo?.toLowerCase() || ""
        const status = m.status?.toLowerCase() || ""
        return tipo.includes(termo) || status.includes(termo)
    })

    // -------------------- MODAL --------------------

    function abrirNovo() {
        setEditando(null)
        setTipo("PREVENTIVA")
        setData("")
        setDescricao("")
        setStatus("AGENDADA")
        setKm("")
        setUsuarioSelecionado("")
        setItens([{ descricao: "", valor: "", servico: "", oficina: "" }])
        setModalAberto(true)
    }

    function abrirEdicao(m) {
        setEditando(m)
        setTipo(m.tipo || "PREVENTIVA")
        setData(formatarDataInput(m.data))
        setDescricao(m.descricao || "")
        setStatus(m.status || "AGENDADA")
        setKm(m.km ? String(m.km) : "")
        setUsuarioSelecionado(m.usuario?.id || m.usuario || "")
        setItens(m.itens && m.itens.length > 0 ? m.itens.map(function(i) {
            return {
                descricao: i.descricao || "",
                valor: formatarMoeda(String(i.valor || "0")),
                servico: i.servico?.id || i.servico || "",
                oficina: i.oficina?.id || i.oficina || ""
            }
        }) : [{ descricao: "", valor: "", servico: "", oficina: "" }])
        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setEditando(null)
    }

    // -------------------- SALVAR --------------------

    async function salvar(e) {
        e.preventDefault()

        if (!tipo || !data || !usuarioSelecionado) {
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

            const payload = {
                tipo,
                data,
                descricao,
                status,
                km: km ? parseInt(km) : null,
                veiculo: id,
                usuario: usuarioSelecionado,
                itens: itensPayload
            }

            if (editando) {
                await apiClient.put("/manutencao", { id: editando.id, ...payload })
                toast.success("Manutenção alterada!")
            } else {
                await apiClient.post("/manutencao", payload)
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

    // -------------------- BADGE STATUS --------------------

    function corStatus(status) {
        switch (status) {
            case "AGENDADA": return "#2563eb"
            case "EM_ANDAMENTO": return "#f59e0b"
            case "CONCLUIDA": return "#22c55e"
            case "CANCELADA": return "#ef4444"
            default: return "#9ca3af"
        }
    }

    function corTipo(tipo) {
        return tipo === "CORRETIVA" ? "#ef4444" : "#2563eb"
    }

    // -------------------- RENDER --------------------

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* HEADER */}
                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={function() { router.back() }} style={styles.buttonBack}>
                            ← Voltar
                        </button>
                        <div>
                            <h1 style={styles.title}>
                                🔧 Manutenções — {veiculo?.placa || "..."}
                            </h1>
                            <p style={styles.subtitle}>
                                {veiculo?.marcaNome || ""} {veiculo?.modeloNome || ""} {veiculo?.ano || ""}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                            placeholder="Buscar por tipo ou status..."
                            value={pesquisa}
                            onChange={function(e) { setPesquisa(e.target.value) }}
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
                            manutencoesFiltradas.map(function(m) {
                                return (
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
                                                    {m.itens.map(function(item, i) {
                                                        return (
                                                            <small key={i} style={{ color: "#6b7280" }}>
                                                                • {item.servico?.nome || "-"} — {item.oficina?.nome || "-"}
                                                            </small>
                                                        )
                                                    })}
                                                </div>
                                            ) : "-"}
                                        </td>
                                        <td style={styles.actions}>
                                            <button onClick={function() { abrirEdicao(m) }} style={styles.buttonEdit}>Editar</button>
                                            <button onClick={function() { excluir(m.id) }} style={styles.buttonDelete}>Excluir</button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

            </div>

            {/* MODAL */}
            {modalAberto && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>

                        <h2 style={{ marginBottom: 20 }}>
                            {editando ? "Editar Manutenção" : "Nova Manutenção"}
                        </h2>

                        <form onSubmit={salvar}>

                            <div style={styles.grid2}>

                                <div style={styles.inputGroup}>
                                    <label>Tipo</label>
                                    <select value={tipo} onChange={function(e) { setTipo(e.target.value) }} style={styles.input}>
                                        <option value="PREVENTIVA">Preventiva</option>
                                        <option value="CORRETIVA">Corretiva</option>
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label>Status</label>
                                    <select value={status} onChange={function(e) { setStatus(e.target.value) }} style={styles.input}>
                                        <option value="AGENDADA">Agendada</option>
                                        <option value="EM_ANDAMENTO">Em Andamento</option>
                                        <option value="CONCLUIDA">Concluída</option>
                                        <option value="CANCELADA">Cancelada</option>
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label>Data</label>
                                    <input type="date" value={data} onChange={function(e) { setData(e.target.value) }} style={styles.input} />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label>KM</label>
                                    <input type="number" value={km} onChange={function(e) { setKm(e.target.value) }} style={styles.input} placeholder="Ex: 54000" />
                                </div>

                            </div>

                            <div style={styles.inputGroup}>
                                <label>Usuário Responsável</label>
                                <select value={usuarioSelecionado} onChange={function(e) { setUsuarioSelecionado(e.target.value) }} style={styles.input}>
                                    <option value="">Selecione</option>
                                    {usuarios.map(function(u) {
                                        return <option key={u.id} value={u.id}>{u.nome}</option>
                                    })}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Descrição</label>
                                <textarea
                                    value={descricao}
                                    onChange={function(e) { setDescricao(e.target.value) }}
                                    style={{ ...styles.input, height: "70px", resize: "vertical" }}
                                    placeholder="Descreva a manutenção..."
                                />
                            </div>

                            {/* ITENS */}
                            <div style={{ marginTop: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <label style={{ fontWeight: "bold" }}>Itens da Manutenção</label>
                                    <button type="button" onClick={adicionarItem} style={styles.buttonAdd}>
                                        + Adicionar Item
                                    </button>
                                </div>

                                {itens.map(function(item, index) {
                                    return (
                                        <div key={index} style={styles.itemRow}>

                                            <div style={{ flex: 2 }}>
                                                <label style={{ fontSize: "12px", color: "#6b7280" }}>Serviço</label>
                                                <select
                                                    value={item.servico}
                                                    onChange={function(e) { alterarItem(index, "servico", e.target.value) }}
                                                    style={styles.inputSm}
                                                >
                                                    <option value="">Selecione</option>
                                                    {servicos.map(function(s) {
                                                        return <option key={s.id} value={s.id}>{s.nome}</option>
                                                    })}
                                                </select>
                                            </div>

                                            <div style={{ flex: 2 }}>
                                                <label style={{ fontSize: "12px", color: "#6b7280" }}>Oficina</label>
                                                <select
                                                    value={item.oficina}
                                                    onChange={function(e) { alterarItem(index, "oficina", e.target.value) }}
                                                    style={styles.inputSm}
                                                >
                                                    <option value="">Selecione</option>
                                                    {oficinas.map(function(o) {
                                                        return <option key={o.id} value={o.id}>{o.nome}</option>
                                                    })}
                                                </select>
                                            </div>

                                            <div style={{ flex: 2 }}>
                                                <label style={{ fontSize: "12px", color: "#6b7280" }}>Descrição</label>
                                                <input
                                                    type="text"
                                                    value={item.descricao}
                                                    onChange={function(e) { alterarItem(index, "descricao", e.target.value) }}
                                                    style={styles.inputSm}
                                                    placeholder="Descrição"
                                                />
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: "12px", color: "#6b7280" }}>Valor</label>
                                                <input
                                                    type="text"
                                                    value={item.valor}
                                                    onChange={function(e) { handleValorItem(index, e.target.value) }}
                                                    style={styles.inputSm}
                                                    placeholder="R$ 0,00"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={function() { removerItem(index) }}
                                                style={styles.buttonRemove}
                                            >
                                                ✕
                                            </button>

                                        </div>
                                    )
                                })}
                            </div>

                            <div style={styles.modalButtons}>
                                <button type="button" onClick={fecharModal} style={styles.buttonCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} style={styles.buttonPrimary}>
                                    {loading ? "Salvando..." : "Salvar"}
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
    buttonPrimary: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonBack: { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonEdit: { backgroundColor: "#facc15", color: "#000", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    buttonDelete: { backgroundColor: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    buttonAdd: { backgroundColor: "#f1f5f9", color: "#374151", padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", cursor: "pointer", fontSize: "13px" },
    buttonRemove: { backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", alignSelf: "flex-end" },
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "700px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
    inputGroup: { marginBottom: "12px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" },
    inputSm: { padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", width: "100%" },
    itemRow: { display: "flex", gap: "8px", alignItems: "flex-end", marginBottom: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px" },
    modalButtons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
    buttonCancel: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" }
}
