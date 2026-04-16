"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { useUser } from "@/app/context/userContext.jsx"
import ModalManutencao from "@/components/manutencao/ModalManutencao.jsx"
import ModalConclusao from "@/components/manutencao/ModalConclusao.jsx"

export default function ManutencaoVeiculoPage() {

    const { id } = useParams()
    const router = useRouter()
    const { user } = useUser()
    const isAdmin = user?.tipo === 2

    const [montado, setMontado] = useState(false)
    const [veiculo, setVeiculo] = useState(null)
    const [manutencoes, setManutencoes] = useState([])
    const [servicos, setServicos] = useState([])
    const [oficinas, setOficinas] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [pesquisa, setPesquisa] = useState("")
    const [loading, setLoading] = useState(false)

    // MODAIS
    const [modalAberto, setModalAberto] = useState(false)
    const [editando, setEditando] = useState(null)
    const [modalConclusaoAberto, setModalConclusaoAberto] = useState(false)
    const [manutencaoConcluindo, setManutencaoConcluindo] = useState(null)
    const [totalConclusao, setTotalConclusao] = useState(0)

    useEffect(function() { setMontado(true) }, [])

    useEffect(function() {
        carregarVeiculo()
        carregarManutencoes()
        carregarServicos()
        carregarOficinas()
        if (isAdmin) carregarUsuarios()
    }, [id])

    if (!montado) return null

    function formatarData(valor) {
        if (!valor) return ""
        const d = new Date(valor)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }

    async function carregarVeiculo() {
        try { setVeiculo(await apiClient.get("/veiculo/" + id)) }
        catch { toast.error("Erro ao carregar veículo") }
    }

    async function carregarManutencoes() {
        try {
            const dados = await apiClient.get("/manutencao/veiculo/" + id)
            setManutencoes(Array.isArray(dados) ? dados : [])
        } catch { setManutencoes([]) }
    }

    async function carregarUsuarios() {
        try {
            const dados = await apiClient.get("/usuario")
            setUsuarios(Array.isArray(dados) ? dados : [])
        } catch { setUsuarios([]) }
    }

    async function carregarServicos() {
        try {
            const dados = await apiClient.get("/servico")
            setServicos(Array.isArray(dados) ? dados : [])
        } catch { setServicos([]) }
    }

    async function carregarOficinas() {
        try {
            const dados = await apiClient.get("/oficina")
            setOficinas(Array.isArray(dados) ? dados : [])
        } catch { setOficinas([]) }
    }

    // CHAMADO PELO ModalManutencao ao salvar
    async function handleSalvar(obj, editandoAtual) {
        if (editandoAtual) {
            await apiClient.put("/manutencao", { id: editandoAtual.id, ...obj })
            toast.success("Manutenção alterada!")
        } else {
            await apiClient.post("/manutencao", obj)
            toast.success("Manutenção cadastrada!")
        }
        carregarManutencoes()
    }

    function abrirConclusao(m) {
        let total = 0
        for (let i = 0; i < m.itens.length; i++) {
            total += Number(m.itens[i].valor || 0)
        }
        setTotalConclusao(total)
        setManutencaoConcluindo(m)
        setModalConclusaoAberto(true)
    }

    async function handleConclusao({ formaPagamento, descricao }) {
        setLoading(true)
        try {
            const hoje = new Date().toISOString().split("T")[0]
            await apiClient.post("/conta/gerar", {
                manutencaoId: manutencaoConcluindo.id,
                formaPagamento,
                descricao,
                valorEntrada: 0,
                numeroParcelas: 1,
                vencimentoPrimeira: hoje
            })
            toast.success("Manutenção concluída!")
            setModalConclusaoAberto(false)
            setManutencaoConcluindo(null)
            carregarManutencoes()
        } catch { toast.error("Erro ao concluir") }
        finally { setLoading(false) }
    }

    async function excluir(manutencaoId) {
        if (!confirm("Deseja realmente excluir esta manutenção?")) return
        try {
            await apiClient.delete("/manutencao/" + manutencaoId)
            toast.success("Excluída!")
            carregarManutencoes()
        } catch { toast.error("Erro ao excluir") }
    }

    function corStatus(v) {
        if (v === "AGENDADA") return "#2563eb"
        if (v === "EM_ANDAMENTO") return "#f59e0b"
        if (v === "CONCLUIDA") return "#22c55e"
        if (v === "CANCELADA") return "#ef4444"
        return "#9ca3af"
    }

    function corTipo(v) {
        return v === "CORRETIVA" ? "#ef4444" : "#2563eb"
    }

    const manutencoesFiltradas = manutencoes.filter(function(m) {
        const t = pesquisa.toLowerCase()
        return (m.tipo?.toLowerCase() || "").includes(t) || (m.status?.toLowerCase() || "").includes(t)
    })

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={function() { router.back() }} style={styles.btnVoltar}>← Voltar</button>
                        <div>
                            <h1 style={styles.title}>🔧 Manutenções — {veiculo?.placa || "..."}</h1>
                            <p style={styles.subtitle}>{veiculo?.marcaNome || ""} {veiculo?.modeloNome || ""} {veiculo?.ano || ""}</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                            placeholder="Buscar por tipo ou status..."
                            value={pesquisa}
                            onChange={function(e) { setPesquisa(e.target.value) }}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", width: "220px" }}
                        />
                        <button onClick={function() { setEditando(null); setModalAberto(true) }} style={styles.btnPrimary}>
                            + Nova Manutenção
                        </button>
                    </div>
                </div>

                <table style={styles.table}>
                    <thead style={{ backgroundColor: "#f1f5f9" }}>
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
                                    Nenhuma manutenção registrada
                                </td>
                            </tr>
                        ) : (
                            manutencoesFiltradas.map(function(m) {
                                return (
                                    <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                        <td style={styles.td}>{m.id}</td>
                                        <td style={styles.td}>
                                            <span style={{ background: corTipo(m.tipo), color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                                                {m.tipo}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{formatarData(m.data)}</td>
                                        <td style={styles.td}>{m.km ? Number(m.km).toLocaleString("pt-BR") + " km" : "-"}</td>
                                        <td style={styles.td}>
                                            <span style={{ background: corStatus(m.status), color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                                                {m.status?.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{m.usuario?.nome || "-"}</td>
                                        <td style={styles.td}>
                                            {m.itens && m.itens.length > 0
                                                ? m.itens.map(function(item, i) {
                                                    return (
                                                        <small key={i} style={{ display: "block", color: "#6b7280" }}>
                                                            • {item.servico?.nome || "-"} — {item.oficina?.nome || "-"}
                                                        </small>
                                                    )
                                                })
                                                : "-"
                                            }
                                        </td>
                                        <td style={{ display: "flex", gap: "6px", padding: "10px" }}>
                                            <button onClick={function() { setEditando(m); setModalAberto(true) }} style={styles.btnEdit}>
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            {m.status !== "CONCLUIDA" && m.status !== "CANCELADA" && (
                                                <button onClick={function() { abrirConclusao(m) }} style={styles.btnConcluir}>
                                                    Concluir
                                                </button>
                                            )}
                                            <button onClick={function() { excluir(m.id) }} style={styles.btnDelete}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

            </div>

            <ModalManutencao
                aberto={modalAberto}
                fechar={function() { setModalAberto(false); setEditando(null) }}
                editando={editando}
                veiculoId={id}
                veiculo={veiculo}
                servicos={servicos}
                oficinas={oficinas}
                usuarios={usuarios}
                user={user}
                isAdmin={isAdmin}
                onSalvar={handleSalvar}
            />

            <ModalConclusao
                aberto={modalConclusaoAberto}
                fechar={function() { setModalConclusaoAberto(false) }}
                total={totalConclusao}
                onConfirmar={handleConclusao}
                loading={loading}
            />

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
    th: { padding: "10px", textAlign: "left" },
    td: { padding: "10px", verticalAlign: "top" },
    btnPrimary: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    btnVoltar: { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    btnEdit: { backgroundColor: "#facc15", color: "#000", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    btnDelete: { backgroundColor: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    btnConcluir: { backgroundColor: "#22c55e", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" }
}