"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { useUser } from "@/app/context/userContext.jsx"

const POSICOES = [
    "Dianteiro Esquerdo",
    "Dianteiro Direito",
    "Traseiro Esquerdo",
    "Traseiro Direito",
    "Estepe",
]

function dataDeHoje() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatarDataBR(valor) {
    if (!valor) return "-"
    return new Date(valor).toLocaleDateString("pt-BR")
}

function imprimirRelatorio(veiculo, rodizio) {
    const janela = window.open("", "_blank")
    if (!janela) { alert("Permita pop-ups para imprimir."); return }

    const linhas = (rodizio.itens || []).map((item) => `
        <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:7px 10px;font-size:12px;">${item.pneu?.marca || "—"} ${item.pneu?.medida || ""}</td>
            <td style="padding:7px 10px;font-size:12px;">${item.posicaoAnterior}</td>
            <td style="padding:7px 10px;font-size:12px;text-align:center;color:#2563eb;font-weight:700;">→</td>
            <td style="padding:7px 10px;font-size:12px;">${item.posicaoNova}</td>
            <td style="padding:7px 10px;font-size:12px;">${item.pneu?.estado || "—"}</td>
        </tr>
    `).join("")

    janela.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Rodízio — ${veiculo?.placa || ""}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',sans-serif;padding:28px;color:#1e293b;}
    @media print{.no-print{display:none;}}</style></head><body>
    <div class="no-print" style="margin-bottom:16px;">
        <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">🖨️ Imprimir / Salvar PDF</button>
    </div>
    <div style="border-bottom:3px solid #2563eb;padding-bottom:14px;margin-bottom:20px;display:flex;justify-content:space-between;">
        <div><div style="font-size:18px;font-weight:800;color:#2563eb;">CONTROLE DE FROTA</div>
        <div style="font-size:12px;color:#64748b;">Relatório de Rodízio de Pneus</div></div>
        <div style="text-align:right;font-size:12px;color:#64748b;">
            <div><b>Data:</b> ${formatarDataBR(rodizio.data)}</div>
            <div><b>KM:</b> ${rodizio.km ? Number(rodizio.km).toLocaleString("pt-BR") + " km" : "—"}</div>
            <div><b>Responsável:</b> ${rodizio.usuario?.nome || "—"}</div>
        </div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:18px;display:flex;gap:32px;flex-wrap:wrap;">
        ${[["Placa", veiculo?.placa], ["Modelo", veiculo?.modeloNome], ["Marca", veiculo?.marcaNome], ["Ano", veiculo?.ano]]
            .map(([l, v]) => `<div><div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;">${l}</div>
            <div style="font-size:14px;font-weight:700;">${v || "—"}</div></div>`).join("")}
    </div>
    ${rodizio.observacoes ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px;color:#78350f;"><b>Observações:</b> ${rodizio.observacoes}</div>` : ""}
    <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f1f5f9;">
            <th style="padding:8px 10px;text-align:left;font-size:12px;color:#6b7280;">Pneu</th>
            <th style="padding:8px 10px;text-align:left;font-size:12px;color:#6b7280;">Posição Anterior</th>
            <th style="padding:8px 10px;text-align:center;font-size:12px;color:#6b7280;"></th>
            <th style="padding:8px 10px;text-align:left;font-size:12px;color:#6b7280;">Posição Nova</th>
            <th style="padding:8px 10px;text-align:left;font-size:12px;color:#6b7280;">Estado</th>
        </tr></thead>
        <tbody>${linhas}</tbody>
    </table></body></html>`)
    janela.document.close()
}

export default function RodizioVeiculoPage() {

    const { id } = useParams()
    const router = useRouter()
    const { user } = useUser()

    const isAdmin = user?.tipo === 2

    const [montado, setMontado] = useState(false)
    const [veiculo, setVeiculo] = useState(null)
    const [movimentacoes, setMovimentacoes] = useState([])
    const [historico, setHistorico] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [salvando, setSalvando] = useState(false)
    const [loading, setLoading] = useState(false)
    const [abaAtiva, setAbaAtiva] = useState("form")

    const refData = useRef()
    const refKm = useRef()
    const refResponsavel = useRef()
    const refObservacoes = useRef()

    useEffect(() => { setMontado(true) }, [])
    useEffect(() => {
        carregarVeiculo()
        carregarPneus()
        carregarHistorico()
        if (isAdmin) carregarUsuarios()
    }, [id])

    if (!montado) return null

    async function carregarVeiculo() {
        try {
            const dados = await apiClient.get("/veiculo/" + id)
            setVeiculo(dados)
        } catch { toast.error("Erro ao carregar veículo") }
    }

    async function carregarPneus() {
        try {
            const dados = await apiClient.get("/pneu/veiculo/" + id)
            const lista = Array.isArray(dados) ? dados : []
            setMovimentacoes(lista.map((p) => ({
                pneuId: p.id,
                posicaoAnterior: p.posicao,
                posicaoNova: p.posicao,  // começa igual — usuário muda livremente
                marca: p.marca || "—",
                medida: p.medida || "—",
                estado: p.estado || "—",
            })))
        } catch { setMovimentacoes([]) }
    }

    async function carregarHistorico() {
        setLoading(true)
        try {
            const dados = await apiClient.get("/rodizio/veiculo/" + id)
            setHistorico(Array.isArray(dados) ? dados : [])
        } catch { setHistorico([]) }
        finally { setLoading(false) }
    }

    async function carregarUsuarios() {
        try {
            const dados = await apiClient.get("/usuario")
            setUsuarios(Array.isArray(dados) ? dados : [])
        } catch { setUsuarios([]) }
    }

    // MUDA POSIÇÃO NOVA — sem qualquer bloqueio, todas as posições sempre disponíveis
    function mudarPosicaoNova(pneuId, novaPosicao) {
        setMovimentacoes((prev) =>
            prev.map((m) => m.pneuId === pneuId ? { ...m, posicaoNova: novaPosicao } : m)
        )
    }

    // Detecta posições novas duplicadas apenas para mostrar aviso visual
    function posicoesDuplicadas() {
        const novas = movimentacoes.map((m) => m.posicaoNova)
        return novas.filter((p, i) => novas.indexOf(p) !== i)
    }

    const movidas = movimentacoes.filter((m) => m.posicaoAnterior !== m.posicaoNova)

    async function salvar() {
        const responsavelId = isAdmin ? refResponsavel.current?.value : user?.id
        if (!responsavelId) { toast.error("Selecione o responsável"); return }
        if (!refData.current?.value) { toast.error("Informe a data"); return }
        if (movidas.length === 0) { toast.error("Nenhuma posição foi alterada."); return }

        const duplicadas = posicoesDuplicadas()
        if (duplicadas.length > 0) {
            toast.error(`Dois pneus não podem ir para a mesma posição: ${duplicadas[0]}`)
            return
        }

        setSalvando(true)
        try {
            await apiClient.post("/rodizio", {
                veiculo: id,
                usuario: responsavelId,
                data: refData.current.value,
                km: refKm.current?.value ? parseInt(refKm.current.value.replace(/\./g, "")) : null,
                observacoes: refObservacoes.current?.value || "",
                itens: movidas.map((m) => ({
                    pneuId: m.pneuId,
                    posicaoAnterior: m.posicaoAnterior,
                    posicaoNova: m.posicaoNova,
                })),
            })
            toast.success("Rodízio realizado! Posições atualizadas.")
            if (refObservacoes.current) refObservacoes.current.value = ""
            carregarPneus()
            carregarHistorico()
            setAbaAtiva("historico")
        } catch {
            toast.error("Erro ao salvar rodízio")
        } finally {
            setSalvando(false)
        }
    }

    async function excluir(rodizioId) {
        if (!confirm("Deseja excluir este rodízio?\nAs posições dos pneus NÃO serão revertidas.")) return
        try {
            await apiClient.delete("/rodizio/" + rodizioId)
            toast.success("Rodízio excluído!")
            carregarHistorico()
        } catch { toast.error("Erro ao excluir") }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button onClick={() => router.back()} style={styles.buttonBack}>← Voltar</button>
                        <div>
                            <h1 style={styles.title}>🔄 Rodízio — {veiculo?.placa || "..."}</h1>
                            <p style={styles.subtitle}>{veiculo?.marcaNome || ""} {veiculo?.modeloNome || ""} {veiculo?.ano || ""}</p>
                        </div>
                    </div>
                </div>

                {/* ABAS */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
                    {[{ key: "form", label: "🔄 Novo Rodízio" }, { key: "historico", label: `📁 Histórico (${historico.length})` }].map((aba) => (
                        <button key={aba.key} onClick={() => setAbaAtiva(aba.key)} style={{
                            padding: "8px 20px", borderRadius: "8px", border: "none",
                            background: abaAtiva === aba.key ? "#2563eb" : "transparent",
                            color: abaAtiva === aba.key ? "#fff" : "#6b7280",
                            fontWeight: "bold", fontSize: "13px", cursor: "pointer",
                        }}>{aba.label}</button>
                    ))}
                </div>

                {/* FORMULÁRIO */}
                {abaAtiva === "form" && (
                    <>
                        <div style={styles.secaoCard}>
                            <div style={styles.secaoTitulo}>1. Informações do Rodízio</div>
                            <div style={styles.grid3}>
                                <div style={styles.inputGroup}>
                                    <label>Data *</label>
                                    <input ref={refData} type="date" defaultValue={dataDeHoje()} style={styles.input} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label>KM Atual</label>
                                    <input ref={refKm} type="number" defaultValue={veiculo?.kmatual || ""} placeholder="Ex: 85420" style={styles.input} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label>Responsável *</label>
                                    {isAdmin ? (
                                        <select ref={refResponsavel} style={styles.input} defaultValue={user?.id || ""}>
                                            <option value="">-- Selecione --</option>
                                            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                                        </select>
                                    ) : (
                                        <>
                                            <input ref={refResponsavel} type="hidden" defaultValue={user?.id || ""} />
                                            <input type="text" value={user?.nome || ""} readOnly style={{ ...styles.input, background: "#f1f5f9", color: "#6b7280", cursor: "not-allowed" }} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={styles.secaoCard}>
                            <div style={styles.secaoTitulo}>2. Defina as novas posições</div>
                            <small style={{ color: "#6b7280", display: "block", marginBottom: 14, fontSize: 12 }}>
                                Altere a posição de destino de cada pneu. Pneus que não mudarem não serão registrados.
                            </small>

                            {movimentacoes.length === 0 ? (
                                <div style={{ color: "#9ca3af", fontSize: 13 }}>Nenhum pneu cadastrado para este veículo.</div>
                            ) : (
                                <>
                                    {posicoesDuplicadas().length > 0 && (
                                        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                                            ⚠ Posição duplicada: <b>{posicoesDuplicadas()[0]}</b> — dois pneus não podem ir para a mesma posição.
                                        </div>
                                    )}
                                    <div style={{ width: "100%", overflowX: "auto" }}>
                                        <table style={styles.table}>
                                            <thead style={styles.tableHeader}>
                                                <tr>
                                                    <th style={styles.th}>Pneu</th>
                                                    <th style={styles.th}>Posição Atual</th>
                                                    <th style={{ ...styles.th, textAlign: "center" }}>→</th>
                                                    <th style={styles.th}>Nova Posição</th>
                                                    <th style={styles.th}>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {movimentacoes.map((m) => {
                                                    const mudou = m.posicaoAnterior !== m.posicaoNova
                                                    const duplicada = posicoesDuplicadas().includes(m.posicaoNova) && mudou
                                                    return (
                                                        <tr key={m.pneuId} style={{ ...styles.tableRow, background: duplicada ? "#fff5f5" : mudou ? "#f0fdf4" : "#fff" }}>
                                                            <td style={styles.td}>
                                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.marca}</div>
                                                                <div style={{ fontSize: 11, color: "#6b7280" }}>{m.medida}</div>
                                                            </td>
                                                            <td style={styles.td}><span style={{ fontSize: 13 }}>{m.posicaoAnterior}</span></td>
                                                            <td style={{ ...styles.td, textAlign: "center", fontSize: 18, fontWeight: 700, color: mudou ? "#16a34a" : "#d1d5db" }}>→</td>
                                                            <td style={styles.td}>
                                                                {/* TODAS as posições disponíveis sem bloqueio */}
                                                                <select
                                                                    value={m.posicaoNova}
                                                                    onChange={(e) => mudarPosicaoNova(m.pneuId, e.target.value)}
                                                                    style={{
                                                                        ...styles.input, padding: "7px 10px", fontSize: 13,
                                                                        border: duplicada ? "2px solid #fca5a5" : mudou ? "2px solid #86efac" : "1px solid #d1d5db",
                                                                    }}
                                                                >
                                                                    {POSICOES.map((pos) => (
                                                                        <option key={pos} value={pos}>{pos}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td style={styles.td}>
                                                                <span style={{
                                                                    background: m.estado === "Bom" ? "#d1fae5" : m.estado === "Ruim" ? "#fee2e2" : "#fef9c3",
                                                                    color: m.estado === "Bom" ? "#065f46" : m.estado === "Ruim" ? "#991b1b" : "#713f12",
                                                                    padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                                }}>{m.estado}</span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {movidas.length > 0 && (
                                        <div style={{ marginTop: 14, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1e40af" }}>
                                            <b>✅ {movidas.length} pneu(s) serão movidos:</b>{" "}
                                            {movidas.map((m) => `${m.marca} (${m.posicaoAnterior} → ${m.posicaoNova})`).join(" | ")}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div style={styles.secaoCard}>
                            <div style={styles.inputGroup}>
                                <label style={{ fontWeight: "bold" }}>Observações</label>
                                <textarea ref={refObservacoes} rows={2} placeholder="Ex: Rodízio preventivo a cada 10.000 km..."
                                    style={{ ...styles.input, height: "68px", resize: "vertical" }} />
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                            <button onClick={salvar} disabled={salvando} style={{ ...styles.buttonPrimary, opacity: salvando ? .6 : 1 }}>
                                {salvando ? "Salvando..." : "💾 Confirmar Rodízio"}
                            </button>
                        </div>
                    </>
                )}

                {/* HISTÓRICO */}
                {abaAtiva === "historico" && (
                    <>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>Carregando...</div>
                        ) : historico.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>Nenhum rodízio registrado.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {historico.map((h) => (
                                    <div key={h.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14 }}>
                                                    {formatarDataBR(h.data)}
                                                    {h.km && <span style={{ color: "#6b7280", fontWeight: 400, marginLeft: 10, fontSize: 13 }}>{Number(h.km).toLocaleString("pt-BR")} km</span>}
                                                </div>
                                                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Responsável: {h.usuario?.nome || "—"}</div>
                                                {h.observacoes && <div style={{ fontSize: 12, color: "#92400e", marginTop: 2 }}>📝 {h.observacoes}</div>}
                                            </div>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button onClick={() => imprimirRelatorio(veiculo, h)} style={styles.buttonSecundario}>🖨️ Imprimir</button>
                                                <button onClick={() => excluir(h.id)} style={styles.buttonDelete}><i className="fas fa-trash"></i></button>
                                            </div>
                                        </div>
                                        <table style={{ ...styles.table, fontSize: 12 }}>
                                            <thead><tr style={{ background: "#f8fafc" }}>
                                                <th style={styles.th}>Pneu</th>
                                                <th style={styles.th}>Posição Anterior</th>
                                                <th style={{ ...styles.th, textAlign: "center" }}></th>
                                                <th style={styles.th}>Posição Nova</th>
                                            </tr></thead>
                                            <tbody>
                                                {(h.itens || []).map((item, i) => (
                                                    <tr key={i} style={styles.tableRow}>
                                                        <td style={styles.td}>{item.pneu?.marca || "—"} {item.pneu?.medida || ""}</td>
                                                        <td style={styles.td}>{item.posicaoAnterior}</td>
                                                        <td style={{ ...styles.td, textAlign: "center", color: "#2563eb", fontWeight: 700 }}>→</td>
                                                        <td style={styles.td}>{item.posicaoNova}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    )
}

const styles = {
    page: { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
    card: { width: "100%", maxWidth: "1000px", backgroundColor: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", boxSizing: "border-box" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" },
    title: { margin: 0, fontSize: "22px", fontWeight: "bold" },
    subtitle: { margin: 0, color: "#6b7280", fontSize: "14px" },
    secaoCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "12px" },
    secaoTitulo: { fontSize: "14px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "14px" },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
    inputGroup: { marginBottom: "10px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: "600", color: "#374151" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: "normal" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { backgroundColor: "#f1f5f9" },
    th: { padding: "10px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#6b7280" },
    tableRow: { borderBottom: "1px solid #f1f5f9" },
    td: { padding: "10px", verticalAlign: "middle", fontSize: "13px" },
    buttonPrimary: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
    buttonSecundario: { backgroundColor: "#f1f5f9", color: "#2563eb", border: "1px solid #2563eb", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
    buttonBack: { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonDelete: { backgroundColor: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
}