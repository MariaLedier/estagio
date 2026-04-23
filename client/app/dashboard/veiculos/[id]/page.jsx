"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { formatarPlaca, formatarRenavam, formatarKm, formatarMoeda, validarPlaca, validarRenavam } from "@/utils/validacao.js"
import CarroPneus from "@/components/CarroPneus"
export default function VeiculoDetalhePage() {

    const { id } = useParams()
    const router = useRouter()

    const [montado, setMontado] = useState(false)
    const [veiculo, setVeiculo] = useState(null)
    const [editando, setEditando] = useState(false)
    const [loading, setLoading] = useState(false)
    const [marcas, setMarcas] = useState([])
    const [modelos, setModelos] = useState([])

    // CAMPOS EDIÇÃO VEICULO
    const [placa, setPlaca] = useState("")
    const [marca, setMarca] = useState("")
    const [modelo, setModelo] = useState("")
    const [ano, setAno] = useState("")
    const [renavam, setRenavam] = useState("")
    const [cor, setCor] = useState("")
    const [kmatual, setKmatual] = useState("")
    const [status, setStatus] = useState("")
    const [tanque, setTanque] = useState("")

   

    const coresVeiculo = [
        { value: "BRANCO", label: "Branco" },
        { value: "PRETO", label: "Preto" },
        { value: "PRATA", label: "Prata" },
        { value: "CINZA", label: "Cinza" },
        { value: "VERMELHO", label: "Vermelho" },
        { value: "AZUL", label: "Azul" },
        { value: "VERDE", label: "Verde" },
        { value: "AMARELO", label: "Amarelo" },
        { value: "MARROM", label: "Marrom" }
    ]

    useEffect(function () {
        setMontado(true)
    }, [])

    useEffect(function () {
        carregarVeiculo()
        carregarMarcas()
    }, [id])

    if (!montado) return null

    // -------------------- CARREGAR --------------------

    async function carregarVeiculo() {
        try {
            const dados = await apiClient.get("/veiculo/" + id)
            setVeiculo(dados)
        } catch {
            toast.error("Erro ao carregar veículo")
        }
    }

    async function carregarMarcas() {
        try {
            const dados = await apiClient.get("/marca")
            setMarcas(Array.isArray(dados) ? dados : [])
        } catch {
            setMarcas([])
        }
    }

    async function carregarModelos(marcaId) {
        try {
            const dados = await apiClient.get("/modelo/" + marcaId)
            setModelos(Array.isArray(dados) ? dados : [])
        } catch {
            setModelos([])
        }
    }

    // -------------------- EDIÇÃO --------------------

    function abrirEdicao() {
        setPlaca(veiculo.placa || "")
        setMarca(veiculo.marca || "")
        setModelo(veiculo.modelo || "")
        setAno(veiculo.ano || "")
        setRenavam(veiculo.renavam || "")
        setCor(veiculo.cor || "")
        setKmatual(veiculo.kmatual ? String(veiculo.kmatual) : "")
        setStatus(veiculo.status || "")
        setTanque(veiculo.tanque || "")
        if (veiculo.marca) carregarModelos(veiculo.marca)
        setEditando(true)
    }

    function cancelarEdicao() {
        setEditando(false)
    }

    async function salvar() {
        if (!validarPlaca(placa)) {
            toast.error("Placa inválida")
            return
        }
        if (!validarRenavam(renavam)) {
            toast.error("Renavam inválido")
            return
        }
        if (!placa || !modelo || !ano || !renavam || !cor || !kmatual || !tanque) {
            toast.error("Preencha todos os campos")
            return
        }

        setLoading(true)
        try {
            await apiClient.put("/veiculo", {
                id,
                placa,
                modelo,
                marca,
                ano,
                renavam,
                cor,
                kmatual: kmatual.replace(/\./g, ""),
                tanque,
                status
            })
            toast.success("Veículo atualizado!")
            setEditando(false)
            carregarVeiculo()
        } catch {
            toast.error("Erro ao salvar")
        } finally {
            setLoading(false)
        }
    }

    async function inativar() {
        if (!confirm("Deseja realmente inativar este veículo?")) return
        try {
            await apiClient.delete("/veiculo/" + id)
            toast.success("Veículo inativado!")
            router.push("/dashboard")
        } catch {
            toast.error("Erro ao inativar")
        }
    }



    // -------------------- RENDER --------------------

    if (!veiculo) return (
        <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
            Carregando...
        </div>
    )

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* HEADER */}
                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={function () { router.back() }} style={styles.buttonBack}>
                            ← Voltar
                        </button>
                        <div>
                            <h1 style={styles.title}>🚗 {veiculo.placa}</h1>
                            <p style={styles.subtitle}>
                                {veiculo.marcaNome || ""} {veiculo.modeloNome || ""} — {veiculo.ano || ""}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        {!editando && (
                            <>
                                <button onClick={abrirEdicao} style={styles.buttonEdit}>
                                    ✏️ Editar
                                </button>
                                <button onClick={inativar} style={styles.buttonDelete}>
                                    Inativar
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* BLOCOS DE INFO */}
                {!editando && (
                    <>
                        <div style={styles.blocos}>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Placa</div>
                                <div style={styles.blocoValor}>{veiculo.placa}</div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Marca</div>
                                <div style={styles.blocoValor}>{veiculo.marcaNome || "-"}</div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Modelo</div>
                                <div style={styles.blocoValor}>{veiculo.modeloNome || "-"}</div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Ano</div>
                                <div style={styles.blocoValor}>{veiculo.ano}</div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Cor</div>
                                <div style={styles.blocoValor}>{veiculo.cor}</div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Renavam</div>
                                <div style={styles.blocoValor}>{veiculo.renavam}</div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>KM Atual</div>
                                <div style={styles.blocoValor}>
                                    {Number(veiculo.kmatual).toLocaleString("pt-BR")} km
                                </div>
                            </div>

                            <div style={styles.bloco}>
                                <div style={styles.blocoLabel}>Status</div>
                                <div style={{
                                    ...styles.blocoValor,
                                    color: veiculo.status === "ATIVO" ? "#16a34a" : "#dc2626"
                                }}>
                                    {veiculo.status}
                                </div>
                            </div>

                        </div>

                        {/* ATALHOS */}
                        <div style={styles.atalhos}>
                            <h3 style={{ marginBottom: "16px" }}>Ações Rápidas</h3>
                            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                <button
                                    onClick={function () { router.push("/dashboard/checklist/" + id) }}
                                    style={styles.atalho}
                                >
                                    Checklist
                                </button>
                               
                                 
                            </div>
                        </div>
                    </>
                )}

                {/* FORMULÁRIO DE EDIÇÃO */}
                {editando && (
                    <div style={styles.form}>

                        <h3 style={{ marginBottom: "20px" }}>Editar Veículo</h3>

                        <div style={styles.grid}>

                            <div style={styles.inputGroup}>
                                <label>Placa</label>
                                <input
                                    value={placa}
                                    onChange={function (e) { setPlaca(formatarPlaca(e.target.value)) }}
                                    style={styles.input}
                                />
                                {placa && !validarPlaca(placa) && (
                                    <small style={{ color: "red" }}>Placa inválida</small>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Marca</label>
                                <select
                                    value={marca}
                                    onChange={function (e) {
                                        setMarca(e.target.value)
                                        carregarModelos(e.target.value)
                                    }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione</option>
                                    {marcas.map(function (m) {
                                        return <option key={m.id} value={m.id}>{m.nome}</option>
                                    })}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Modelo</label>
                                <select
                                    value={modelo}
                                    onChange={function (e) { setModelo(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione</option>
                                    {modelos.map(function (m) {
                                        return <option key={m.id} value={m.id}>{m.nome}</option>
                                    })}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Ano</label>
                                <input
                                    type="number"
                                    value={ano}
                                    onChange={function (e) { setAno(e.target.value) }}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Renavam</label>
                                <input
                                    value={renavam}
                                    onChange={function (e) { setRenavam(formatarRenavam(e.target.value)) }}
                                    style={styles.input}
                                />
                                {renavam && !validarRenavam(renavam) && (
                                    <small style={{ color: "red" }}>Renavam inválido</small>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Cor</label>
                                <select
                                    value={cor}
                                    onChange={function (e) { setCor(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione</option>
                                    {coresVeiculo.map(function (c) {
                                        return <option key={c.value} value={c.value}>{c.label}</option>
                                    })}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>KM Atual</label>
                                <input
                                    value={kmatual}
                                    onChange={function (e) { setKmatual(formatarKm(e.target.value)) }}
                                    style={styles.input}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Tanque</label>
                                <input
                                    type="number"
                                    value={tanque}
                                    onChange={function (e) { setTanque(e.target.value) }}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label>Status</label>
                                <select
                                    value={status}
                                    onChange={function (e) { setStatus(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </div>

                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                            <button onClick={cancelarEdicao} style={styles.buttonCancel}>
                                Cancelar
                            </button>
                            <button onClick={salvar} disabled={loading} style={styles.buttonPrimary}>
                                {loading ? "Salvando..." : "Salvar"}
                            </button>
                        </div>

                    </div>
                )}
                  <CarroPneus veiculoId={id} />

            </div>

           

        </div>
    )
}

// ------------------------ ESTILOS DA PÁGINA --------------------

const styles = {
    page: { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
    card: { width: "100%", maxWidth: "900px", backgroundColor: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", boxSizing: "border-box" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "10px" },
    title: { margin: 0, fontSize: "24px", fontWeight: "bold" },
    subtitle: { margin: 0, color: "#6b7280", fontSize: "14px" },
    blocos: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "30px" },
    bloco: { backgroundColor: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px" },
    blocoLabel: { fontSize: "12px", color: "#6b7280", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase" },
    blocoValor: { fontSize: "18px", fontWeight: "bold", color: "#111827" },
    atalhos: { marginTop: "20px", borderTop: "1px solid #e5e7eb", paddingTop: "24px" },
    atalho: { backgroundColor: "#f1f5f9", color: "#374151", padding: "12px 20px", borderRadius: "10px", border: "1px solid #e5e7eb", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
    form: { marginTop: "10px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" },
    inputGroup: { marginBottom: "14px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" },
    buttonPrimary: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonEdit: { backgroundColor: "#facc15", color: "#000", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonDelete: { backgroundColor: "#ef4444", color: "#fff", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonBack: { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonCancel: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" },
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 999 },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "520px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" }
}