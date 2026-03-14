

"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"

export default function PneusPage() {

    const [pneus, setPneus] = useState([])
    const [modalAberto, setModalAberto] = useState(false)
    const [pneuEditando, setPneuEditando] = useState(null)
    const [loading, setLoading] = useState(false)

    const [marca, setMarca] = useState("")
    const [medida, setMedida] = useState("")
    const [dataaquisicao, setDataaquisicao] = useState("")
    const [valor, setValor] = useState("")
    const [posicao, setPosicao] = useState("")
    const [estado, setEstado] = useState("Bom")
    const [status, setStatus] = useState("EM_ESTOQUE")


    useEffect(() => {
        carregarPneus()
    }, [])

    async function carregarPneus() {
        try {
            const dados = await apiClient.get("/pneu")
            setPneus(dados)
        } catch {
            toast.error("Erro ao carregar pneus")
        }
    }

    // ---------------- NOVO ----------------

    function abrirNovo() {

        setPneuEditando(null)

        setMarca("")
        setMedida("")
        setDataaquisicao("")
        setValor("")
        setPosicao("")
        setPosicao("")
        setEstado("Bom")
        setStatus("EM_ESTOQUE")
        setPosicao("")

        setModalAberto(true)
    }

    // ---------------- EDITAR ----------------

    function abrirEdicao(p) {

        if (p.status === "EM_USO") {
            toast.error("Pneu em uso não pode ser alterado aqui")
            return
        }

        setPneuEditando(p)

        setMarca(p.marca)
        setMedida(p.medida)
        setDataaquisicao(p.dataaquisicao)
        setValor(p.valor)
        setPosicao(p.posicao)
        setEstado(p.estado)
        setStatus(p.status)

        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setPneuEditando(null)
    }

    // ---------------- SALVAR ----------------

    async function salvarPneu(e) {

        e.preventDefault()
        setLoading(true)

        try {

            if (pneuEditando) {

                await apiClient.put("/pneu", {
                    id: pneuEditando.id,
                    marca,
                    medida,
                    dataaquisicao,
                    valor: valor.replace(/\D/g, ""),
                    posicao,
                    estado,
                    status
                })

                toast.success("Pneu alterado!")

            } else {

                await apiClient.post("/pneu", {
                    marca,
                    medida,
                    dataaquisicao,
                    valor: valor.replace(/\D/g, ""),
                    posicao,
                    estado,
                    status: "EM_ESTOQUE"
                })

                toast.success("Pneu cadastrado!")
            }

            fecharModal()
            carregarPneus()

        } catch {

            toast.error("Erro ao salvar pneu")

        } finally {

            setLoading(false)

        }
    }

    // ---------------- EXCLUIR ----------------

    async function excluir(id, status) {

        if (status === "EM_USO") {
            toast.error("Não é possível excluir um pneu em uso")
            return
        }

        if (!confirm("Deseja realmente excluir este pneu?")) return

        try {

            await apiClient.delete("/pneu/" + id)

            toast.success("Pneu excluído!")

            carregarPneus()

        } catch {

            toast.error("Erro ao excluir pneu")

        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.header}>

                    <h1 style={styles.title}>
                        Gerenciamento de Pneus
                    </h1>

                    <button onClick={abrirNovo} style={styles.buttonPrimary}>
                        + Novo Pneu
                    </button>

                </div>

                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th>ID</th>
                            <th>Marca</th>
                            <th>Medida</th>
                            <th>Estado</th>
                            <th>Status</th>
                            <th>Posição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>

                        {pneus.length === 0 ? (

                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                    Nenhum pneu cadastrado
                                </td>
                            </tr>

                        ) : (

                            pneus.map((p) => (

                                <tr key={p.id} style={styles.tableRow}>

                                    <td style={styles.td}>{p.id}</td>
                                    <td style={styles.td}>{p.marca}</td>
                                    <td style={styles.td}>{p.medida}</td>
                                    <td style={styles.td}>{p.estado}</td>
                                    <td style={styles.td}>{p.status}</td>

                                    <td style={styles.actions}>

                                        <button
                                            onClick={() => abrirEdicao(p)}
                                            style={styles.buttonEdit}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            onClick={() => excluir(p.id, p.status)}
                                            style={styles.buttonDelete}
                                        >
                                            Excluir
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>
                </table>
            </div>

            {modalAberto && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>

                        <h2 style={{ marginBottom: 20 }}>
                            {pneuEditando ? "Editar Pneu" : "Novo Pneu"}
                        </h2>

                        <form onSubmit={salvarPneu}>

                            <div style={styles.inputGroup}>
                                <label>Marca</label>
                                <input
                                    type="text"
                                    value={marca}
                                    onChange={(e) => setMarca(e.target.value)}
                                    disabled={pneuEditando?.status === "EM_USO"}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Medida</label>
                                <input
                                    type="text"
                                    value={marca}
                                    onChange={(e) => setMarca(e.target.value)}
                                    disabled={pneuEditando?.status === "EM_USO"}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Data Aquisição</label>
                                <input
                                    type="date"
                                    value={dataaquisicao}
                                    onChange={(e) => setDataaquisicao(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Valor</label>
                                <input
                                    type="text"
                                    value={valor}
                                    onChange={(e) => setValor(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Posição</label>
                                <input
                                    type="text"
                                    value={posicao}
                                    onChange={(e) => setPosicao(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={pneuEditando?.status === "EM_USO"}
                                style={styles.input}
                            >
                                <option value="EM_ESTOQUE">EM_ESTOQUE</option>
                                <option value="DESCARTE">DESCARTE</option>
                            </select>

                            <div style={styles.inputGroup}>
                                <label>Estado</label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    style={styles.input}
                                >
                                    <option>Bom</option>
                                    <option>Médio</option>
                                    <option>Ruim</option>
                                </select>
                            </div>

                            <div style={styles.modalButtons}>

                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    style={styles.buttonCancel}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={styles.buttonPrimary}
                                >
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
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff, #ffffff)",
        padding: "20px",
        display: "flex",
        justifyContent: "center"
    },

    card: {
        width: "100%",
        maxWidth: "1000px",
        backgroundColor: "#fff",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        boxSizing: "border-box"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
        flexWrap: "wrap",
        gap: "10px"
    },
    tableRow: {
        borderBottom: "1px solid #e5e7eb",
        transition: "0.2s"
    },

    td: {
        padding: "10px"
    },

    title: {
        margin: 0,
        fontSize: "24px"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    },

    tableHeader: {
        backgroundColor: "#f1f5f9"
    },

    tableRow: {
        borderBottom: "1px solid #e5e7eb",
        transition: "0.2s"
    },

    actions: {
        display: "flex",

        justifyContent: "center",
        gap: "6px"
    },

    buttonPrimary: {
        backgroundColor: "#2563eb",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold"
    },

    buttonEdit: {
        backgroundColor: "#facc15",
        color: "#000",
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer"
    },

    buttonDelete: {
        backgroundColor: "#ef4444",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer"
    },

    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(4px)"
    },

    modal: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "16px",
        width: "420px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
    },

    inputGroup: {
        marginBottom: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "5px"
    },

    input: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #d1d5db"
    },

    modalButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "20px"
    },

    buttonCancel: {
        backgroundColor: "#9ca3af",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer"
    }
}