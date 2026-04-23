"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { formatarPlaca, formatarRenavam, formatarKm, formatarMoeda, validarPlaca, validarRenavam } from "@/utils/validacao.js"

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

    // MODAL TROCA DE PNEU
    const [modalTrocaAberto, setModalTrocaAberto] = useState(false)
    const [pneusVeiculo, setPneusVeiculo] = useState([])
    const [pneusEstoque, setPneusEstoque] = useState([])
    const [oficinas, setOficinas] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [pneuSaida, setPneuSaida] = useState("")
    const [pneuEntrada, setPneuEntrada] = useState("")
    const [posicaoTroca, setPosicaoTroca] = useState("")
    const [valorTroca, setValorTroca] = useState("")
    const [oficinaTroca, setOficinaTroca] = useState("")
    const [usuarioTroca, setUsuarioTroca] = useState("")

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

    // -------------------- TROCA DE PNEU --------------------

    async function abrirTrocaPneu() {
        setModalTrocaAberto(true)
        setPneuSaida("")
        setPneuEntrada("")
        setPosicaoTroca("")
        setValorTroca("")
        setOficinaTroca("")
        setUsuarioTroca("")

        try {
            const pneusV = await apiClient.get("/pneu/veiculo/" + id)
            setPneusVeiculo(Array.isArray(pneusV) ? pneusV : [])

            const estoque = await apiClient.get("/pneu/estoque")
            setPneusEstoque(Array.isArray(estoque) ? estoque : [])

            const ofs = await apiClient.get("/oficina")
            setOficinas(Array.isArray(ofs) ? ofs : [])

            const users = await apiClient.get("/usuario")
            setUsuarios(Array.isArray(users) ? users : [])

        } catch {
            toast.error("Erro ao carregar dados para troca")
        }
    }

    function fecharTrocaPneu() {
        setModalTrocaAberto(false)
    }

    function selecionarPneuSaida(pneuId) {
        setPneuSaida(pneuId)
        for (let i = 0; i < pneusVeiculo.length; i++) {
            if (String(pneusVeiculo[i].id) === String(pneuId)) {
                setPosicaoTroca(pneusVeiculo[i].posicao || "")
                break
            }
        }
    }

    async function confirmarTroca(e) {
        e.preventDefault()

        if (!pneuSaida) {
            toast.error("Selecione o pneu que vai sair")
            return
        }
        if (!pneuEntrada) {
            toast.error("Selecione o pneu novo")
            return
        }
        if (!posicaoTroca) {
            toast.error("Informe a posição")
            return
        }
        if (!usuarioTroca) {
            toast.error("Selecione o usuário responsável")
            return
        }
        if (!oficinaTroca) {
            toast.error("Selecione a oficina")
            return
        }
        if (!valorTroca) {
            toast.error("Informe o valor do serviço")
            return
        }

        setLoading(true)
        try {
            const valorNumero = Number(
                valorTroca.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
            )

            await apiClient.post("/pneu/trocar", {
                pneuSaida,
                pneuEntrada,
                posicao: posicaoTroca,
                veiculo: id,
                kmAtual: veiculo?.kmatual || null,
                usuario: usuarioTroca,
                valor: valorNumero,
                oficina: oficinaTroca
            })

            toast.success("Pneu trocado! Redirecionando para contas...")
            fecharTrocaPneu()
            router.push("/dashboard/contas")

        } catch {
            toast.error("Erro ao realizar troca")
        } finally {
            setLoading(false)
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

            </div>

            {/* MODAL TROCA DE PNEU */}
            {modalTrocaAberto && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0 }}>🔄 Trocar Pneu — {veiculo?.placa}</h2>
                            <button
                                onClick={fecharTrocaPneu}
                                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={confirmarTroca}>

                            <div style={styles.inputGroup}>
                                <label>Pneu que vai SAIR do veículo</label>
                                <select
                                    value={pneuSaida}
                                    onChange={function (e) { selecionarPneuSaida(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione o pneu</option>
                                    {pneusVeiculo.map(function (p) {
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {p.posicao} — {p.marca} {p.medida} ({p.estado})
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Posição da troca</label>
                                <select
                                    value={posicaoTroca}
                                    onChange={function (e) { setPosicaoTroca(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione a posição</option>
                                    <option value="Dianteiro Esquerdo">Dianteiro Esquerdo</option>
                                    <option value="Dianteiro Direito">Dianteiro Direito</option>
                                    <option value="Traseiro Esquerdo">Traseiro Esquerdo</option>
                                    <option value="Traseiro Direito">Traseiro Direito</option>
                                    <option value="Estepe">Estepe</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Pneu novo (do estoque)</label>
                                <select
                                    value={pneuEntrada}
                                    onChange={function (e) { setPneuEntrada(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione o pneu novo</option>
                                    {pneusEstoque.length === 0 ? (
                                        <option disabled>Nenhum pneu em estoque</option>
                                    ) : (
                                        pneusEstoque.map(function (p) {
                                            return (
                                                <option key={p.id} value={p.id}>
                                                    {p.marca} — {p.medida} — {p.estado}
                                                </option>
                                            )
                                        })
                                    )}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Usuário Responsável</label>
                                <select
                                    value={usuarioTroca}
                                    onChange={function (e) { setUsuarioTroca(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione o usuário</option>
                                    {usuarios.map(function (u) {
                                        return <option key={u.id} value={u.id}>{u.nome}</option>
                                    })}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Oficina</label>
                                <select
                                    value={oficinaTroca}
                                    onChange={function (e) { setOficinaTroca(e.target.value) }}
                                    style={styles.input}
                                >
                                    <option value="">Selecione a oficina</option>
                                    {oficinas.map(function (o) {
                                        return <option key={o.id} value={o.id}>{o.nome}</option>
                                    })}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Valor do Serviço (mão de obra)</label>
                                <input
                                    type="text"
                                    value={valorTroca}
                                    onChange={function (e) { setValorTroca(formatarMoeda(e.target.value)) }}
                                    placeholder="R$ 0,00"
                                    style={styles.input}
                                />
                            </div>

                            {/* AVISO */}
                            {pneuSaida && pneuEntrada && (
                                <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                                    <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#92400e" }}>⚠ O que vai acontecer:</div>
                                    <div style={{ fontSize: "13px", color: "#78350f" }}>
                                        <div>• O pneu que sai será marcado como DESCARTADO</div>
                                        <div>• KM de saída registrada: {Number(veiculo?.kmatual || 0).toLocaleString("pt-BR")} km</div>
                                        <div>• Uma manutenção CORRETIVA será criada</div>
                                        <div>• Uma conta a pagar será gerada</div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                                <button type="button" onClick={fecharTrocaPneu} style={styles.buttonCancel}>
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ ...styles.buttonPrimary, backgroundColor: "#f59e0b", color: "#000" }}
                                >
                                    {loading ? "Processando..." : "Confirmar Troca"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

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