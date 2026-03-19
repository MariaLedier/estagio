"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { formatarMoeda, formatarKm } from "@/utils/validacao.js"

export default function AbastecimentoVeiculoPage() {

    const { id } = useParams()
    const router = useRouter()

    const [veiculo, setVeiculo] = useState(null)
    const [abastecimentos, setAbastecimentos] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalAberto, setModalAberto] = useState(false)
    const [editando, setEditando] = useState(null)

    const [data, setData] = useState("")
    const [km, setKm] = useState("")
    const [litros, setLitros] = useState("")
    const [valor, setValor] = useState("")
    const [usuarioSelecionado, setUsuarioSelecionado] = useState("")


    const [montado, setMontado] = useState(false)
    const [tipoCombustivel, setTipoCombustivel] = useState("")

    // FILTRO DE DATAS
    const [dataInicio, setDataInicio] = useState("")
    const [dataFim, setDataFim] = useState("")

    // ANO POR FILTRO
    const [anofiltro, setAnofiltro] = useState("")




    // ----------- FILTROS PARA ABASTECIMENTO POR DATA ----------------
    const abastecimentosFiltrados = abastecimentos
        .filter(function (a) {
            const dataAbastecimento = new Date(a.data).toISOString().split("T")[0]

            if (anofiltro) {
                const anoAbastecimento = dataAbastecimento.split("-")[0]
                if (anoAbastecimento !== anofiltro) return false
            }

            if (dataInicio && dataAbastecimento < dataInicio) return false
            if (dataFim && dataAbastecimento > dataFim) return false

            return true
        })
        .sort(function (a, b) {
            return new Date(a.data) - new Date(b.data)
        })




    // EXTRAIR ANOS DISPONIVEIS PARA FILTRO POR ANO
    let anosDisponiveis = []
    for (let i = 0; i < abastecimentos.length; i++) {
        const ano = new Date(abastecimentos[i].data).toISOString().split("T")[0].split("-")[0]
        if (!anosDisponiveis.includes(ano)) {
            anosDisponiveis.push(ano)
        }
    }
    anosDisponiveis.sort()

    // -------------------- CALULO PARA O BLOCO DE RESUMO ------------------

    let totalLitros = 0
    let totalValor = 0
    let somaMedias = 0
    let qtdMedias = 0
    let litrosPorCombustivel = {}

    for (let i = 0; i < abastecimentosFiltrados.length; i++) {
        const a = abastecimentosFiltrados[i]

        totalLitros += Number(a.litros)
        totalValor += Number(a.valor)

        if (a.kmMedia) {
            somaMedias += Number(a.kmMedia)
            qtdMedias++
        }

        if (a.tipoCombustivel) {
            if (!litrosPorCombustivel[a.tipoCombustivel]) {
                litrosPorCombustivel[a.tipoCombustivel] = 0
            }
            litrosPorCombustivel[a.tipoCombustivel] += Number(a.litros)
        }
    }

    const mediaGeral = qtdMedias > 0
        ? (somaMedias / qtdMedias).toFixed(2)
        : null




    // ----------------------------- USE EFFECT ------------------------

    useEffect(() => {
        setMontado(true)
    }, [])



    useEffect(() => {
        carregarVeiculo()
        carregarAbastecimentos()
        carregarUsuarios()
    }, [id])

    if (!montado) return null

    // -------------------- FORMATAÇÕES --------------------

    function handleKm(e) { setKm(formatarKm(e.target.value)) }
    function handleValor(e) { setValor(formatarMoeda(e.target.value)) }
    function handleLitros(e) {
        setLitros(e.target.value.replace(/[^0-9,]/g, ""))
    }

    function converterMoedaNumero(v) {
        if (!v) return 0
        return Number(v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim())
    }

    function formatarDataInput(data) {
        if (!data) return ""
        const d = new Date(data)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
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

    async function carregarAbastecimentos() {
        try {
            const dados = await apiClient.get("/abastecimento/veiculo/" + id)
            setAbastecimentos(Array.isArray(dados) ? dados : [])
        } catch {
            setAbastecimentos([])
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

    // -------------------- MODAL --------------------

    function abrirNovo() {
        setEditando(null)
        setData("")
        setKm("")
        setLitros("")
        setValor("")
        setTipoCombustivel("")
        setUsuarioSelecionado("")
        setModalAberto(true)
    }

    function abrirEdicao(a) {
        setEditando(a)
        setData(formatarDataInput(a.data))
        setKm(String(a.km))
        setLitros(String(a.litros))
        setValor(formatarMoeda(String(a.valor)))
        setTipoCombustivel(a.tipoCombustivel || "")
        setUsuarioSelecionado(a.usuario?.id || a.usuario || "")
        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setEditando(null)
    }


    // -------------------- SALVAR --------------------

    async function salvar(e) {
        e.preventDefault()

        if (!usuarioSelecionado || !data || !km || !litros || !valor) {
            toast.error("Preencha todos os campos")
            return
        }

        setLoading(true)

        try {
            const payload = {
                data,
                km: km.replace(/\./g, ""),
                litros: parseFloat(litros.replace(",", ".")),
                valor: converterMoedaNumero(valor),
                tipoCombustivel,
                veiculo: id,
                usuario: usuarioSelecionado
            }

            if (editando) {
                await apiClient.put("/abastecimento", { id: editando.id, ...payload })
                toast.success("Abastecimento alterado!")
            } else {
                await apiClient.post("/abastecimento", payload)
                toast.success("Abastecimento cadastrado!")
            }

            fecharModal()
            carregarAbastecimentos()

        } catch {
            toast.error("Erro ao salvar abastecimento")
        } finally {
            setLoading(false)
        }
    }

    // -------------------- EXCLUIR --------------------

    async function excluir(abastecimentoId) {
        if (!confirm("Deseja realmente excluir este abastecimento?")) return
        try {
            await apiClient.delete("/abastecimento/" + abastecimentoId)
            toast.success("Excluído!")
            carregarAbastecimentos()
        } catch {
            toast.error("Erro ao excluir")
        }
    }

    // -------------------- RENDER --------------------

    return (
        <div style={styles.page}>
            <div style={styles.card}>



                {/* HEADER COM INFO DO VEICULO */}
                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={() => router.back()} style={styles.buttonBack}>
                            ← Voltar
                        </button>
                        <div>
                            <h1 style={styles.title}>
                                Abastecimentos — {veiculo?.placa || "..."}
                            </h1>
                            <p style={styles.subtitle}>
                                {veiculo?.marca?.nome || ""} {veiculo?.modelo?.nome || ""} {veiculo?.ano || ""}
                            </p>
                        </div>
                    </div>
                    {/* FILTRO POR ANO */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <label style={{ fontSize: "13px", color: "#6b7280" }}>Ano:</label>
                        <select
                            value={anofiltro}
                            onChange={function (e) { setAnofiltro(e.target.value) }}
                            style={{ padding: "8px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                        >
                            <option value="">Todos</option>
                            {anosDisponiveis.map(function (ano) {
                                return (
                                    <option key={ano} value={ano}>{ano}</option>
                                )
                            })}
                        </select>
                    </div>

                    {/* BLOCOS DE RESUMO */}
                    {abastecimentosFiltrados.length > 0 && (
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Total Gasto</div>
                                <div style={styles.blocoValor}>
                                    {totalValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Total Litros</div>
                                <div style={styles.blocoValor}>{totalLitros.toFixed(2)} L</div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Média Geral</div>
                                <div style={styles.blocoValor}>
                                    {mediaGeral ? `${mediaGeral} km/L` : "-"}
                                </div>
                            </div>

                            {Object.entries(litrosPorCombustivel).map(([tipo, litros]) => (
                                <div key={tipo} style={{ ...styles.bloco, borderTop: "3px solid #2563eb" }}>
                                    <div style={styles.blocoLabel}>{tipo}</div>
                                    <div style={styles.blocoValor}>{litros.toFixed(2)} L</div>
                                </div>
                            ))}

                        </div>
                    )}

                    {/* FILTROS DE DATA */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <label style={{ fontSize: "13px", color: "#6b7280" }}>De:</label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <label style={{ fontSize: "13px", color: "#6b7280" }}>Até:</label>
                            <input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                            />
                        </div>
                        {(dataInicio || dataFim) && (
                            <button
                                onClick={() => { setDataInicio(""); setDataFim("") }}
                                style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: "#f1f5f9", cursor: "pointer", fontSize: "13px", color: "#6b7280" }}
                            >
                                Limpar
                            </button>
                        )}
                    </div>

                    <button onClick={abrirNovo} style={styles.buttonPrimary}>
                        + Novo Abastecimento
                    </button>
                </div>

                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Data</th>
                            <th style={styles.th}>KM Anterior</th>
                            <th style={styles.th}>KM Atual</th>
                            <th style={styles.th}>Intervalo</th>
                            <th style={styles.th}>Litros</th>
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Combustível</th>
                            <th style={styles.th}>Km/L</th>
                            <th style={styles.th}>Usuário</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {abastecimentosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                                    Nenhum abastecimento registrado para este veículo
                                </td>
                            </tr>
                        ) : (
                            abastecimentosFiltrados.map((a, index) => {
                                const anterior = abastecimentosFiltrados[index - 1]
                                const kmAnterior = anterior ? Number(anterior.km) : null
                                const intervalo = kmAnterior ? Number(a.km) - kmAnterior : null

                                return (
                                    <tr key={a.id} style={styles.tableRow}>
                                        <td style={styles.td}>{a.id}</td>
                                        <td style={styles.td}>{formatarDataInput(a.data)}</td>
                                        <td style={styles.td}>
                                            {kmAnterior ? Number(kmAnterior).toLocaleString("pt-BR") + " km" : "-"}
                                        </td>
                                        <td style={styles.td}>{Number(a.km).toLocaleString("pt-BR")} km</td>
                                        <td style={styles.td}>
                                            {intervalo !== null ? (
                                                <span style={{
                                                    background: intervalo >= 0 ? "#dcfce7" : "#fee2e2",
                                                    color: intervalo >= 0 ? "#16a34a" : "#dc2626",
                                                    padding: "3px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold"
                                                }}>
                                                    {intervalo >= 0 ? "+" : ""}{Number(intervalo).toLocaleString("pt-BR")} km
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td style={styles.td}>{Number(a.litros).toFixed(2)} L</td>
                                        <td style={styles.td}>
                                            {Number(a.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                        </td>
                                        <td style={styles.td}>{a.tipoCombustivel || "-"}</td>
                                        <td style={styles.td}>
                                            {a.kmMedia ? `${a.kmMedia} km/L` : "-"}
                                        </td>
                                        <td style={styles.td}>{a.usuario?.nome || "-"}</td>
                                        <td style={styles.actions}>
                                            <button onClick={() => abrirEdicao(a)} style={styles.buttonEdit}>Editar</button>
                                            <button onClick={() => excluir(a.id)} style={styles.buttonDelete}>Excluir</button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

            </div>

            {modalAberto && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>

                        <h2 style={{ marginBottom: 20 }}>
                            {editando ? "Editar Abastecimento" : "Novo Abastecimento"}
                        </h2>

                        <form onSubmit={salvar}>

                            <div style={styles.inputGroup}>
                                <label>Usuário</label>
                                <select
                                    value={usuarioSelecionado}
                                    onChange={(e) => setUsuarioSelecionado(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="">Selecione o usuário</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>{u.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Data</label>
                                <input
                                    type="date"
                                    value={data}
                                    onChange={(e) => setData(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>KM Atual</label>
                                <input
                                    type="text"
                                    value={km}
                                    onChange={handleKm}
                                    placeholder="Ex: 50.000"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Litros</label>
                                <input
                                    type="text"
                                    value={litros}
                                    onChange={handleLitros}
                                    placeholder="Ex: 40,5"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Valor Total</label>
                                <input
                                    type="text"
                                    value={valor}
                                    onChange={handleValor}
                                    placeholder="R$ 0,00"
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Tipo de Combustível</label>
                                <select
                                    value={tipoCombustivel}
                                    onChange={(e) => setTipoCombustivel(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="">Selecione</option>
                                    <option value="GASOLINA">Gasolina</option>
                                    <option value="ETANOL">Etanol</option>
                                    <option value="DIESEL">Diesel</option>
                                    <option value="DIESEL_S10">Diesel S10</option>
                                    <option value="GNV">GNV</option>
                                    <option value="FLEX">Flex</option>
                                </select>
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
    page:
    {
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "30px 20px",
        display: "flex",
        justifyContent: "center"
    },
    card: {
        width: "100%",
        maxWidth: "1100px",
        backgroundColor: "#fff",
        padding: "25px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", boxSizing: "border-box"
    },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" },
    title: { margin: 0, fontSize: "22px", fontWeight: "bold" },
    subtitle: { margin: 0, color: "#6b7280", fontSize: "14px" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { backgroundColor: "#f1f5f9" },
    th: { padding: "10px", textAlign: "left" },
    tableRow: { borderBottom: "1px solid #e5e7eb" },
    td: { padding: "10px" },
    actions: { display: "flex", gap: "6px", padding: "10px" },
    buttonPrimary: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonBack: { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonEdit: { backgroundColor: "#facc15", color: "#000", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    buttonDelete: { backgroundColor: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)" },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "440px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
    inputGroup: { marginBottom: "15px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" },
    modalButtons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
    buttonCancel: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" },
    bloco: {
        backgroundColor: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px 20px",
        minWidth: "140px",
        flex: "1"
    },
    blocoLabel: {
        fontSize: "12px",
        color: "#6b7280",
        marginBottom: "6px",
        fontWeight: "600",
        textTransform: "uppercase"
    },
    blocoValor: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#111827"
    },

}
