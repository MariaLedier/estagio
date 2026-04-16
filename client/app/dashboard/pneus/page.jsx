

"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import {
    formatarMedidaPneu,
    formatarMoeda,
} from "@/utils/validacao.js"

export default function PneusPage() {

    // USES STATES
    const [pneus, setPneus] = useState([])
    const [modalAberto, setModalAberto] = useState(false)
    const [pneuEditando, setPneuEditando] = useState(null)
    const [loading, setLoading] = useState(false)

    const [marca, setMarca] = useState("")
    const [medida, setMedida] = useState("")
    const [dataaquisicao, setDataaquisicao] = useState("")
    const [valor, setValor] = useState("")
    const [estado, setEstado] = useState("Bom")
    const [status, setStatus] = useState("EM_ESTOQUE")

    // FILTROS
    const [pesquisa, setPesquisa] = useState("")

    // TABELA DE MARCAS
    // TABELA DE MARCAS DE PNEUS
    const marcasPneu = [
        { value: "MICHELIN", label: "Michelin" },
        { value: "PIRELLI", label: "Pirelli" },
        { value: "BRIDGESTONE", label: "Bridgestone" },
        { value: "GOODYEAR", label: "Goodyear" },
        { value: "CONTINENTAL", label: "Continental" },
        { value: "DUNLOP", label: "Dunlop" },
        { value: "YOKOHAMA", label: "Yokohama" },
        { value: "HANKOOK", label: "Hankook" },
        { value: "FIRESTONE", label: "Firestone" },
        { value: "KUMHO", label: "Kumho" }
    ]

  
    //  -------------------------------- FORMATAÇÕES --------------------
    // FORMATAÇÃO DE MEDIDA
    function handleMedida(valor) {
        const medidaFormatada = formatarMedidaPneu(valor)
        setMedida(medidaFormatada)
    }
    function handleValor(valor) {
        const valorFormatado = formatarMoeda(valor)
        setValor(valorFormatado)
    }

    // FORMATAR DATA --- FRONT END 
    function formatarDataInput(data) {

        if (!data) return ""

        const d = new Date(data)

        const ano = d.getFullYear()
        const mes = String(d.getMonth() + 1).padStart(2, "0")
        const dia = String(d.getDate()).padStart(2, "0")

        return `${ano}-${mes}-${dia}`
    }

    function converterMoedaNumero(valor) {
        if (!valor) return 0

        return Number(
            valor
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim()
        )
    }

    // FILTROS
    // Troque a função pneusFiltrados por isso:
    const pneusFiltrados = pneus.filter((p) => {
        const termo = pesquisa.toLowerCase().replace("_", " ")

        const marca = p.marca?.toLowerCase() || ""
        const status = p.status?.toLowerCase().replace("_", " ") || ""
        const veiculo = p.veiculo?.placa?.toLowerCase() || String(p.veiculo || "").toLowerCase()

        return (
            marca.includes(termo) ||
            status.includes(termo) ||
            veiculo.includes(termo)
        )
    })



//  -------------------- CARREGAR ------------------
    async function carregarPneus() {
        try {
            const dados = await apiClient.get("/pneu")
            setPneus(dados)
        } catch {
            toast.error("Erro ao carregar pneus")
        }
    }

      useEffect(() => {
        carregarPneus()
    }, [])

    // ---------------- NOVO ----------------

    function abrirNovo() {

        setPneuEditando(null)

        setMarca("")
        setMedida("")
        setDataaquisicao("")
        setValor("")
        setEstado("Bom")
        setStatus("EM_ESTOQUE")
        setModalAberto(true)
    }

    // ---------------- EDITAR ----------------
    function abrirEdicao(p) {

        setPneuEditando(p)

        setMarca(p.marca)
        setMedida(p.medida)
        setDataaquisicao(formatarDataInput(p.dataaquisicao))
        setValor(formatarMoeda(String(p.valor)))
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
                    valor: converterMoedaNumero(valor),
                    estado,
                    status
                })

                toast.success("Pneu alterado!")

            } else {

                await apiClient.post("/pneu", {
                    marca,
                    medida,
                    dataaquisicao,
                    valor: converterMoedaNumero(valor),
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


    //  ------------------------------- RETURN DA TELA ---------------------
    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.header}>
                    <h1 style={styles.title}>Gerenciamento de Pneus</h1>

                    <input
                        placeholder="Buscar por marca, status ou veículo..."
                        value={pesquisa}
                        onChange={(e) => setPesquisa(e.target.value)}
                        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", width: "280px" }}
                    />

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
                            <th>Veículo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>

                        {pneusFiltrados.length === 0 ? (

                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                    Nenhum pneu cadastrado
                                </td>
                            </tr>

                        ) : (

                            pneusFiltrados.map((p) => (

                                <tr key={p.id} style={styles.tableRow}>

                                    <td style={styles.td}>{p.id}</td>
                                    <td style={styles.td}>{p.marca}</td>
                                    <td style={styles.td}>{p.medida}</td>
                                    <td style={styles.td}>{p.estado}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            background: p.status === "EM_USO" ? "#ff0101" : "#22c55e",
                                            color: "#fff",
                                            padding: "4px 8px",
                                            borderRadius: "6px",
                                            fontSize: "12px"
                                        }}>
                                            {p.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{p.posicao || "-"}</td>
                                    <td style={styles.td}>{p.veiculo?.placa || p.veiculo || "-"}</td>
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

                                <select
                                    value={marca}
                                    onChange={(e) => setMarca(e.target.value)}
                                    disabled={pneuEditando?.status === "EM_USO"}
                                    style={styles.input}
                                >

                                    <option value="">Selecione a marca</option>

                                    {marcasPneu.map((m) => (
                                        <option key={m.value} value={m.value}>
                                            {m.label}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            <div style={styles.inputGroup}>
                                <label>Medida</label>
                                <input
                                    type="text"
                                    value={medida}
                                    onChange={(e) => handleMedida(e.target.value)}
                                    placeholder="Ex: 275/55 R18"
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
                                    onChange={(e) => handleValor(e.target.value)}
                                    style={styles.input}
                                />
                            </div>


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