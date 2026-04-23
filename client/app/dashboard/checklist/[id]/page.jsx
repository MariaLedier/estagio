"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { useUser } from "@/app/context/userContext.jsx"

// ─── SEÇÕES E ITENS DO CHECKLIST (33 itens) ───────────────────────────────────

const SECOES = [
    {
        id: "motor",
        label: "Motor & Fluidos",
        icone: "⚙️",
        itens: [
            { id: "oleo",           label: "Nível de Óleo" },
            { id: "agua",           label: "Nível d'Água / Radiador" },
            { id: "fluido_freio",   label: "Fluido de Freio" },
            { id: "fluido_direcao", label: "Fluido de Direção" },
            { id: "arrefecimento",  label: "Sistema de Arrefecimento" },
            { id: "correia",        label: "Correia Dentada / Alternador" },
        ],
    },
    {
        id: "freios",
        label: "Freios",
        icone: "🛑",
        itens: [
            { id: "freio_dianteiro", label: "Pastilha Dianteira" },
            { id: "freio_traseiro",  label: "Pastilha Traseira" },
            { id: "disco_dianteiro", label: "Disco Dianteiro" },
            { id: "disco_traseiro",  label: "Disco Traseiro" },
            { id: "freio_mao",       label: "Freio de Mão" },
        ],
    },
    {
        id: "pneus",
        label: "Pneus",
        icone: "🔵",
        itens: [
            { id: "pneu_dianteiro_esq", label: "Pneu Dianteiro Esquerdo" },
            { id: "pneu_dianteiro_dir", label: "Pneu Dianteiro Direito" },
            { id: "pneu_traseiro_esq",  label: "Pneu Traseiro Esquerdo" },
            { id: "pneu_traseiro_dir",  label: "Pneu Traseiro Direito" },
            { id: "estepe",             label: "Estepe" },
            { id: "calibragem",         label: "Calibragem Geral" },
        ],
    },
    {
        id: "eletrico",
        label: "Sistema Elétrico",
        icone: "⚡",
        itens: [
            { id: "bateria",         label: "Bateria" },
            { id: "farol_dianteiro", label: "Farol Dianteiro" },
            { id: "farol_traseiro",  label: "Farol Traseiro / Lanternas" },
            { id: "setas",           label: "Setas / Pisca-Alerta" },
            { id: "luz_re",          label: "Luz de Ré" },
            { id: "painel",          label: "Painel / Instrumentos" },
        ],
    },
    {
        id: "carroceria",
        label: "Carroceria & Cabine",
        icone: "🚗",
        itens: [
            { id: "para_brisa", label: "Para-brisa / Vidros" },
            { id: "limpador",   label: "Limpador de Para-brisa" },
            { id: "portas",     label: "Portas / Travas" },
            { id: "espelhos",   label: "Espelhos Retrovisores" },
            { id: "cinto",      label: "Cintos de Segurança" },
            { id: "extintor",   label: "Extintor de Incêndio" },
            { id: "triangulo",  label: "Triângulo de Sinalização" },
        ],
    },
    {
        id: "suspensao",
        label: "Suspensão & Direção",
        icone: "🔧",
        itens: [
            { id: "amortecedor_diant", label: "Amortecedor Dianteiro" },
            { id: "amortecedor_tras",  label: "Amortecedor Traseiro" },
            { id: "alinhamento",       label: "Alinhamento / Balanceamento" },
            { id: "barra_direcao",     label: "Barra de Direção" },
        ],
    },
]

const STATUS_OPTS = ["Bom", "Regular", "Ruim", "Não verificado"]

const COR_STATUS = {
    "Bom":            { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    "Regular":        { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
    "Ruim":           { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    "Não verificado": { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function checklistVazio() {
    const obj = {}
    SECOES.forEach((s) => s.itens.forEach((i) => { obj[i.id] = "Não verificado" }))
    return obj
}

function dataDeHoje() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatarDataBR(valor) {
    if (!valor) return "-"
    const d = new Date(valor)
    return d.toLocaleDateString("pt-BR")
}

function contarStatus(itens) {
    const c = { Bom: 0, Regular: 0, Ruim: 0, "Não verificado": 0 }
    Object.values(itens).forEach((v) => { if (c[v] !== undefined) c[v]++ })
    return c
}

// ─── GERAÇÃO DE PDF (nativa, sem biblioteca) ──────────────────────────────────

function gerarPDF(veiculo, itens, responsavelNome, observacoes, data, km) {
    const janela = window.open("", "_blank")
    if (!janela) { alert("Permita pop-ups para gerar o PDF."); return }

    const badge = (s) => {
        const c = COR_STATUS[s] || COR_STATUS["Não verificado"]
        return `<span style="background:${c.bg};color:${c.text};border:1px solid ${c.border};
            padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">${s}</span>`
    }

    const counts = contarStatus(itens)
    const total  = Object.values(counts).reduce((a, b) => a + b, 0)

    const secoesHtml = SECOES.map((sec) => `
        <div style="margin-bottom:18px;">
            <div style="font-size:12px;font-weight:700;color:#1e3a8a;border-bottom:2px solid #e2e8f0;
                padding-bottom:5px;margin-bottom:8px;letter-spacing:.5px;">
                ${sec.icone} ${sec.label.toUpperCase()}
            </div>
            <table style="width:100%;border-collapse:collapse;">
                ${sec.itens.map((item) => {
                    const s = itens[item.id] || "Não verificado"
                    return `<tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:5px 4px;font-size:12px;color:#334155;">${item.label}</td>
                        <td style="padding:5px 4px;text-align:right;">${badge(s)}</td>
                    </tr>`
                }).join("")}
            </table>
        </div>
    `).join("")

    const resumoHtml = Object.entries(counts).map(([s, n]) => {
        const c = COR_STATUS[s]
        return `<div style="flex:1;min-width:90px;background:${c.bg};border:1px solid ${c.border};
            border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:20px;font-weight:800;color:${c.text};">${n}</div>
            <div style="font-size:10px;font-weight:600;color:${c.text};margin-top:2px;">
                ${s.toUpperCase()}<br/>(${total > 0 ? Math.round((n / total) * 100) : 0}%)
            </div>
        </div>`
    }).join("")

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Checklist — ${veiculo?.placa || "Veículo"}</title>
    <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Segoe UI',sans-serif;color:#1e293b;background:#fff;padding:28px;}
        @media print{.no-print{display:none;}}
    </style>
    </head><body>
    <div class="no-print" style="margin-bottom:16px;">
        <button onclick="window.print()"
            style="background:#2563eb;color:#fff;border:none;padding:10px 22px;
            border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
            🖨️ Imprimir / Salvar PDF
        </button>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:flex-start;
        margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #2563eb;">
        <div>
            <div style="font-size:20px;font-weight:800;color:#2563eb;">CONTROLE DE FROTA</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">Relatório de Checklist Veicular</div>
        </div>
        <div style="text-align:right;font-size:12px;color:#64748b;">
            <div><b>Data:</b> ${formatarDataBR(data)}</div>
            <div><b>KM:</b> ${km ? Number(km).toLocaleString("pt-BR") + " km" : "—"}</div>
            <div><b>Responsável:</b> ${responsavelNome || "—"}</div>
        </div>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;
        padding:14px;margin-bottom:16px;display:flex;gap:32px;flex-wrap:wrap;">
        ${[["Placa", veiculo?.placa], ["Modelo", veiculo?.modeloNome], ["Marca", veiculo?.marcaNome], ["Ano", veiculo?.ano]]
            .map(([l, v]) => `<div>
                <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">${l}</div>
                <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:2px;">${v || "—"}</div>
            </div>`).join("")}
    </div>

    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;">${resumoHtml}</div>

    ${secoesHtml}

    ${observacoes ? `
        <div style="margin-top:16px;background:#fffbeb;border:1px solid #fde68a;
            border-radius:8px;padding:12px;">
            <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:4px;">OBSERVAÇÕES</div>
            <div style="font-size:13px;color:#78350f;line-height:1.6;">${observacoes}</div>
        </div>` : ""}

    <div style="margin-top:32px;display:flex;justify-content:flex-end;">
        <div style="text-align:center;width:210px;">
            <div style="border-top:1px solid #94a3b8;padding-top:6px;font-size:11px;color:#64748b;">
                ${responsavelNome || "Responsável"}
            </div>
        </div>
    </div>
    </body></html>`

    janela.document.write(html)
    janela.document.close()
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function ChecklistVeiculoPage() {

    const { id }    = useParams()
    const router    = useRouter()
    const { user }  = useUser()

    const isAdmin = user?.tipo === 2

    const [montado,        setMontado]        = useState(false)
    const [veiculo,        setVeiculo]        = useState(null)
    const [historico,      setHistorico]      = useState([])
    const [usuarios,       setUsuarios]       = useState([])
    const [salvando,       setSalvando]       = useState(false)
    const [loading,        setLoading]        = useState(false)
    const [abaAtiva,       setAbaAtiva]       = useState("form")
    const [secaoAberta,    setSecaoAberta]    = useState("motor")
    const [itensChecklist, setItensChecklist] = useState(checklistVazio())
    const [pesquisa,       setPesquisa]       = useState("")

    // REFS DO FORMULÁRIO
    const refData        = useRef()
    const refKm          = useRef()
    const refResponsavel = useRef()
    const refObservacoes = useRef()
    const refPesquisa    = useRef()

    useEffect(() => { setMontado(true) }, [])

    useEffect(() => {
        carregarVeiculo()
        carregarHistorico()
        if (isAdmin) carregarUsuarios()
    }, [id])

    if (!montado) return null

    // ─── CARREGAMENTOS ────────────────────────────────────────────────────────

    async function carregarVeiculo() {
        try {
            const dados = await apiClient.get("/veiculo/" + id)
            setVeiculo(dados)
        } catch {
            toast.error("Erro ao carregar veículo")
        }
    }

    async function carregarHistorico() {
        setLoading(true)
        try {
            const dados = await apiClient.get("/checklist/veiculo/" + id)
            setHistorico(Array.isArray(dados) ? dados : [])
        } catch {
            setHistorico([])
        } finally {
            setLoading(false)
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

    // ─── ITENS DO CHECKLIST ───────────────────────────────────────────────────

    function mudarStatus(campo, novoStatus) {
        setItensChecklist((prev) => ({ ...prev, [campo]: novoStatus }))
    }

    function resetarFormulario() {
        setItensChecklist(checklistVazio())
        setSecaoAberta("motor")
        if (refObservacoes.current) refObservacoes.current.value = ""
        if (refKm.current)          refKm.current.value = veiculo?.kmatual || ""
        if (refData.current)        refData.current.value = dataDeHoje()
    }

    // ─── SALVAR ───────────────────────────────────────────────────────────────

    async function salvar() {
        const responsavelId = isAdmin
            ? refResponsavel.current?.value
            : user?.id

        if (!responsavelId) {
            toast.error("Selecione o responsável")
            return
        }
        if (!refData.current?.value) {
            toast.error("Informe a data")
            return
        }

        setSalvando(true)
        try {
            await apiClient.post("/checklist", {
                veiculo:     id,
                usuario:     responsavelId,
                data:        refData.current.value,
                km:          refKm.current?.value ? parseInt(refKm.current.value.replace(/\./g, "")) : null,
                observacoes: refObservacoes.current?.value || "",
                itens:       itensChecklist,   // todos os 33 campos
            })

            toast.success("Checklist salvo! Pneus atualizados.")
            resetarFormulario()
            carregarHistorico()
            setAbaAtiva("historico")

        } catch {
            toast.error("Erro ao salvar checklist")
        } finally {
            setSalvando(false)
        }
    }

    // ─── EXCLUIR ──────────────────────────────────────────────────────────────

    async function excluir(checklistId) {
        if (!confirm("Deseja excluir este checklist?")) return
        try {
            await apiClient.delete("/checklist/" + checklistId)
            toast.success("Checklist excluído!")
            carregarHistorico()
        } catch {
            toast.error("Erro ao excluir")
        }
    }

    // ─── HISTÓRICO FILTRADO ───────────────────────────────────────────────────

    const historicoFiltrado = historico.filter((h) => {
        const termo = pesquisa.toLowerCase()
        return (
            (h.usuario?.nome || "").toLowerCase().includes(termo) ||
            (h.data || "").includes(termo)
        )
    })

    // ─── RESUMO ───────────────────────────────────────────────────────────────

    const counts     = contarStatus(itensChecklist)
    const totalItens = Object.values(counts).reduce((a, b) => a + b, 0)

    // ─── NOME DO RESPONSÁVEL SELECIONADO (para PDF) ───────────────────────────

    function nomeResponsavel() {
        if (!isAdmin) return user?.nome || ""
        const uid = refResponsavel.current?.value
        const u   = usuarios.find((u) => String(u.id) === String(uid))
        return u?.nome || ""
    }

    // ─── RENDER ───────────────────────────────────────────────────────────────

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
                            <h1 style={styles.title}>📋 Checklist — {veiculo?.placa || "..."}</h1>
                            <p style={styles.subtitle}>
                                {veiculo?.marcaNome || ""} {veiculo?.modeloNome || ""} {veiculo?.ano || ""}
                            </p>
                        </div>
                    </div>

                    <input
                        ref={refPesquisa}
                        placeholder="Buscar no histórico..."
                        onChange={() => setPesquisa(refPesquisa.current.value)}
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", width: "200px" }}
                    />
                </div>

                {/* ABAS */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
                    {[
                        { key: "form",      label: "📋 Novo Checklist" },
                        { key: "historico", label: `📁 Histórico (${historico.length})` },
                    ].map((aba) => (
                        <button
                            key={aba.key}
                            onClick={() => setAbaAtiva(aba.key)}
                            style={{
                                padding: "8px 20px", borderRadius: "8px", border: "none",
                                background: abaAtiva === aba.key ? "#2563eb" : "transparent",
                                color: abaAtiva === aba.key ? "#fff" : "#6b7280",
                                fontWeight: "bold", fontSize: "13px", cursor: "pointer",
                            }}
                        >
                            {aba.label}
                        </button>
                    ))}
                </div>

                {/* ── ABA: FORMULÁRIO ── */}
                {abaAtiva === "form" && (
                    <>
                        {/* INFO DA INSPEÇÃO */}
                        <div style={styles.secaoCard}>
                            <div style={styles.secaoTitulo}>1. Informações da Inspeção</div>
                            <div style={styles.grid3}>

                                <div style={styles.inputGroup}>
                                    <label>Data *</label>
                                    <input
                                        ref={refData}
                                        type="date"
                                        defaultValue={dataDeHoje()}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label>KM Atual</label>
                                    <input
                                        ref={refKm}
                                        type="number"
                                        defaultValue={veiculo?.kmatual || ""}
                                        placeholder="Ex: 85420"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label>Responsável *</label>
                                    {isAdmin ? (
                                        <select ref={refResponsavel} style={styles.input} defaultValue={user?.id || ""}>
                                            <option value="">-- Selecione --</option>
                                            {usuarios.map((u) => (
                                                <option key={u.id} value={u.id}>{u.nome}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input ref={refResponsavel} type="hidden" defaultValue={user?.id || ""} />
                                            <input
                                                type="text"
                                                value={user?.nome || ""}
                                                readOnly
                                                style={{ ...styles.input, background: "#f1f5f9", color: "#6b7280", cursor: "not-allowed" }}
                                            />
                                            <small style={{ color: "#9ca3af" }}>Preenchido automaticamente</small>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* RESUMO */}
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                            {Object.entries(counts).map(([s, n]) => {
                                const c = COR_STATUS[s]
                                return (
                                    <div key={s} style={{
                                        flex: 1, minWidth: 90,
                                        background: c.bg, border: `1px solid ${c.border}`,
                                        borderRadius: "10px", padding: "12px", textAlign: "center",
                                    }}>
                                        <div style={{ fontSize: "22px", fontWeight: 800, color: c.text }}>{n}</div>
                                        <div style={{ fontSize: "11px", fontWeight: 600, color: c.text }}>{s}</div>
                                        <div style={{ fontSize: "10px", color: c.text, opacity: .7 }}>
                                            {totalItens > 0 ? Math.round((n / totalItens) * 100) : 0}%
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* SEÇÕES DO CHECKLIST */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                            {SECOES.map((sec) => {
                                const aberta   = secaoAberta === sec.id
                                const statuses = sec.itens.map((i) => itensChecklist[i.id])
                                const temRuim  = statuses.includes("Ruim")
                                const temReg   = statuses.includes("Regular")
                                const tudoBom  = statuses.every((s) => s === "Bom")

                                return (
                                    <div key={sec.id} style={{
                                        ...styles.secaoCard,
                                        padding: 0,
                                        border: temRuim
                                            ? "1.5px solid #fca5a5"
                                            : temReg
                                            ? "1.5px solid #fde047"
                                            : "1.5px solid #e5e7eb",
                                    }}>
                                        <button
                                            onClick={() => setSecaoAberta(aberta ? null : sec.id)}
                                            style={{
                                                width: "100%", padding: "14px 18px",
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                background: "none", border: "none", cursor: "pointer", textAlign: "left",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{ fontSize: "18px" }}>{sec.icone}</span>
                                                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>
                                                    {sec.label}
                                                </span>
                                                {temRuim && (
                                                    <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
                                                        ⚠ ATENÇÃO
                                                    </span>
                                                )}
                                                {!temRuim && tudoBom && (
                                                    <span style={{ background: "#d1fae5", color: "#065f46", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px" }}>
                                                        ✓ OK
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ color: "#9ca3af", fontSize: "16px" }}>{aberta ? "▲" : "▼"}</span>
                                        </button>

                                        {aberta && (
                                            <div style={{ padding: "0 18px 18px" }}>
                                                {sec.itens.map((item) => (
                                                    <div key={item.id} style={{
                                                        display: "flex", alignItems: "center",
                                                        justifyContent: "space-between", gap: "12px",
                                                        padding: "10px 0", borderBottom: "1px solid #f1f5f9",
                                                        flexWrap: "wrap",
                                                    }}>
                                                        <span style={{ fontSize: "13px", color: "#334155", minWidth: "200px" }}>
                                                            {item.label}
                                                        </span>
                                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                            {STATUS_OPTS.map((opt) => {
                                                                const c        = COR_STATUS[opt]
                                                                const selected = itensChecklist[item.id] === opt
                                                                return (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => mudarStatus(item.id, opt)}
                                                                        style={{
                                                                            padding: "4px 14px", borderRadius: "20px",
                                                                            border: `2px solid ${selected ? c.border : "#e2e8f0"}`,
                                                                            background: selected ? c.bg : "#fff",
                                                                            color: selected ? c.text : "#94a3b8",
                                                                            fontWeight: selected ? 700 : 500,
                                                                            fontSize: "12px", cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        {opt}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* OBSERVAÇÕES */}
                        <div style={styles.secaoCard}>
                            <div style={styles.inputGroup}>
                                <label style={{ fontWeight: "bold" }}>Observações Gerais</label>
                                <textarea
                                    ref={refObservacoes}
                                    rows={3}
                                    placeholder="Descreva problemas encontrados, recomendações, itens para revisão..."
                                    style={{ ...styles.input, height: "80px", resize: "vertical" }}
                                />
                            </div>
                        </div>

                        {/* AÇÕES */}
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                            <button
                                onClick={() => gerarPDF(
                                    veiculo,
                                    itensChecklist,
                                    nomeResponsavel(),
                                    refObservacoes.current?.value,
                                    refData.current?.value,
                                    refKm.current?.value
                                )}
                                style={styles.buttonSecundario}
                            >
                                🖨️ Gerar PDF
                            </button>
                            <button
                                onClick={salvar}
                                disabled={salvando}
                                style={{ ...styles.buttonPrimary, opacity: salvando ? .6 : 1 }}
                            >
                                {salvando ? "Salvando..." : "💾 Salvar Checklist"}
                            </button>
                        </div>
                    </>
                )}

                {/* ── ABA: HISTÓRICO ── */}
                {abaAtiva === "historico" && (
                    <>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                                Carregando histórico...
                            </div>
                        ) : historicoFiltrado.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                                Nenhum checklist registrado para este veículo.
                            </div>
                        ) : (
                            <table style={styles.table}>
                                <thead style={styles.tableHeader}>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Data</th>
                                        <th style={styles.th}>KM</th>
                                        <th style={styles.th}>Responsável</th>
                                        <th style={styles.th}>Resultado</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicoFiltrado.map((h) => {
                                        const c = contarStatus(h.itens || {})
                                        return (
                                            <tr key={h.id} style={styles.tableRow}>
                                                <td style={styles.td}>{h.id}</td>
                                                <td style={styles.td}>{formatarDataBR(h.data)}</td>
                                                <td style={styles.td}>
                                                    {h.km ? Number(h.km).toLocaleString("pt-BR") + " km" : "-"}
                                                </td>
                                                <td style={styles.td}>{h.usuario?.nome || "-"}</td>
                                                <td style={styles.td}>
                                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                        {Object.entries(c).map(([s, n]) => {
                                                            if (n === 0) return null
                                                            const cor = COR_STATUS[s]
                                                            return (
                                                                <span key={s} style={{
                                                                    background: cor.bg, color: cor.text,
                                                                    border: `1px solid ${cor.border}`,
                                                                    padding: "2px 10px", borderRadius: "20px",
                                                                    fontSize: "11px", fontWeight: 700,
                                                                }}>
                                                                    {s}: {n}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                </td>
                                                <td style={styles.actions}>
                                                    <button
                                                        onClick={() => gerarPDF(
                                                            veiculo,
                                                            h.itens || {},
                                                            h.usuario?.nome,
                                                            h.observacoes,
                                                            h.data,
                                                            h.km
                                                        )}
                                                        style={styles.buttonSecundario}
                                                    >
                                                        🖨️ PDF
                                                    </button>
                                                    <button
                                                        onClick={() => excluir(h.id)}
                                                        style={styles.buttonDelete}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

            </div>
        </div>
    )
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────

const styles = {
    page:          { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
    card:          { width: "100%", maxWidth: "1100px", backgroundColor: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", boxSizing: "border-box" },
    header:        { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" },
    title:         { margin: 0, fontSize: "22px", fontWeight: "bold" },
    subtitle:      { margin: 0, color: "#6b7280", fontSize: "14px" },
    secaoCard:     { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "12px" },
    secaoTitulo:   { fontSize: "14px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "14px" },
    grid3:         { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" },
    inputGroup:    { marginBottom: "10px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: "600", color: "#374151" },
    input:         { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: "normal" },
    table:         { width: "100%", borderCollapse: "collapse" },
    tableHeader:   { backgroundColor: "#f1f5f9" },
    th:            { padding: "10px", textAlign: "left", fontSize: "13px" },
    tableRow:      { borderBottom: "1px solid #e5e7eb" },
    td:            { padding: "10px", verticalAlign: "middle", fontSize: "13px" },
    actions:       { display: "flex", gap: "6px", padding: "10px", alignItems: "center" },
    buttonPrimary:    { backgroundColor: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
    buttonSecundario: { backgroundColor: "#f1f5f9", color: "#2563eb", border: "1px solid #2563eb", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
    buttonBack:       { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonDelete:     { backgroundColor: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
}