"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { useUser } from "@/app/context/userContext.jsx"

// ─── SEÇÕES E ITENS DO CHECKLIST ─────────────────────────────────────────────

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

// ─── FUNÇÕES AUXILIARES ───────────────────────────────────────────────────────

// Cria um objeto com todos os itens marcados como "Não verificado"
function checklistVazio() {
    const obj = {}
    SECOES.forEach(secao =>
        secao.itens.forEach(item => { obj[item.id] = "Não verificado" })
    )
    return obj
}

// Retorna a data de hoje no formato YYYY-MM-DD
function dataDeHoje() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Formata data para exibição no padrão brasileiro
function formatarDataBR(valor) {
    if (!valor) return "-"
    return new Date(valor).toLocaleDateString("pt-BR")
}

// Conta quantos itens estão em cada status
function contarStatus(itens) {
    const contagem = { Bom: 0, Regular: 0, Ruim: 0, "Não verificado": 0 }
    Object.values(itens).forEach(v => { if (contagem[v] !== undefined) contagem[v]++ })
    return contagem
}

// ─── GERAÇÃO DE PDF ───────────────────────────────────────────────────────────

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

    const secoesHtml = SECOES.map(sec => `
        <div style="margin-bottom:18px;">
            <div style="font-size:12px;font-weight:700;color:#1e3a8a;border-bottom:2px solid #e2e8f0;
                padding-bottom:5px;margin-bottom:8px;">
                ${sec.icone} ${sec.label.toUpperCase()}
            </div>
            <table style="width:100%;border-collapse:collapse;">
                ${sec.itens.map(item => {
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

    janela.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Checklist — ${veiculo?.placa || "Veículo"}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',sans-serif;color:#1e293b;background:#fff;padding:28px;}@media print{.no-print{display:none;}}</style>
    </head><body>
    <div class="no-print" style="margin-bottom:16px;">
        <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
            🖨️ Imprimir / Salvar PDF
        </button>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #2563eb;">
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
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:16px;display:flex;gap:32px;flex-wrap:wrap;">
        ${[["Placa", veiculo?.placa], ["Modelo", veiculo?.modeloNome], ["Marca", veiculo?.marcaNome], ["Ano", veiculo?.ano]]
            .map(([l, v]) => `<div>
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;">${l}</div>
                <div style="font-size:14px;font-weight:700;color:#0f172a;margin-top:2px;">${v || "—"}</div>
            </div>`).join("")}
    </div>
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;">${resumoHtml}</div>
    ${secoesHtml}
    ${observacoes ? `<div style="margin-top:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;">
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
    </body></html>`)
    janela.document.close()
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function ChecklistVeiculoPage() {

    const { id }   = useParams()
    const router   = useRouter()
    const { user } = useUser()

    const isAdmin = user?.tipo === 2

    // ── ESTADOS ──
    const [montado,        setMontado]        = useState(false)
    const [veiculo,        setVeiculo]        = useState(null)
    const [historico,      setHistorico]      = useState([])
    const [usuarios,       setUsuarios]       = useState([])
    const [salvando,       setSalvando]       = useState(false)
    const [carregando,     setCarregando]     = useState(false)
    const [abaAtiva,       setAbaAtiva]       = useState("form")
    const [secaoAberta,    setSecaoAberta]    = useState("motor")
    const [itensChecklist, setItensChecklist] = useState(checklistVazio())
    const [pesquisa,       setPesquisa]       = useState("")

    // ── CAMPOS DO FORMULÁRIO ── (padrão do professor: useState para cada campo)
    const [data,        setData]        = useState(dataDeHoje())
    const [km,          setKm]          = useState("")
    const [responsavel, setResponsavel] = useState("")
    const [observacoes, setObservacoes] = useState("")

    // ── CARREGAR AO ABRIR A PÁGINA ──
    useEffect(() => { setMontado(true) }, [])

    useEffect(() => {
        carregarVeiculo()
        carregarHistorico()
        if (isAdmin) carregarUsuarios()
    }, [id])

    // Preenche o responsável com o usuário logado quando não é admin
    useEffect(() => {
        if (!isAdmin && user?.id) {
            setResponsavel(String(user.id))
        }
    }, [user])

    if (!montado) return null

    // ── FUNÇÕES DE CARREGAMENTO ──

    async function carregarVeiculo() {
        try {
            const dados = await apiClient.get("/veiculo/" + id)
            setVeiculo(dados)
            setKm(String(dados?.kmatual || ""))
        } catch {
            toast.error("Erro ao carregar veículo")
        }
    }

    async function carregarHistorico() {
        setCarregando(true)
        try {
            const dados = await apiClient.get("/checklist/veiculo/" + id)
            setHistorico(Array.isArray(dados) ? dados : [])
        } catch {
            setHistorico([])
        } finally {
            setCarregando(false)
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

    // ── MARCAR STATUS DE UM ITEM ──
    function mudarStatus(campo, novoStatus) {
        setItensChecklist(anterior => ({ ...anterior, [campo]: novoStatus }))
    }

    // ── LIMPAR FORMULÁRIO APÓS SALVAR ──
    function resetarFormulario() {
        setItensChecklist(checklistVazio())
        setSecaoAberta("motor")
        setData(dataDeHoje())
        setKm(String(veiculo?.kmatual || ""))
        setObservacoes("")
    }

    // ── SALVAR CHECKLIST ──
    async function salvar() {
        if (!responsavel) {
            toast.error("Selecione o responsável")
            return
        }
        if (!data) {
            toast.error("Informe a data")
            return
        }

        setSalvando(true)
        try {
            await apiClient.post("/checklist", {
                veiculo:     id,
                usuario:     responsavel,
                data:        data,
                km:          km ? parseInt(km) : null,
                observacoes: observacoes,
                itens:       itensChecklist,
            })

            toast.success("Checklist salvo!")
            resetarFormulario()
            carregarHistorico()
            setAbaAtiva("historico")

        } catch {
            toast.error("Erro ao salvar checklist")
        } finally {
            setSalvando(false)
        }
    }

    // ── EXCLUIR ──
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

    // ── NOME DO RESPONSÁVEL (para o PDF) ──
    function nomeResponsavel() {
        if (!isAdmin) return user?.nome || ""
        const usuario = usuarios.find(u => String(u.id) === String(responsavel))
        return usuario?.nome || ""
    }

    // ── HISTÓRICO FILTRADO PELA PESQUISA ──
    const historicoFiltrado = historico.filter(h => {
        const termo = pesquisa.toLowerCase()
        return (
            (h.usuario?.nome || "").toLowerCase().includes(termo) ||
            (h.data || "").includes(termo)
        )
    })

    // ── CONTAGEM DOS STATUS ATUAIS ──
    const counts     = contarStatus(itensChecklist)
    const totalItens = Object.values(counts).reduce((a, b) => a + b, 0)

    // ─── TELA ────────────────────────────────────────────────────────────────

    return (
        <div style={s.page}>
            <div style={s.card}>

                {/* CABEÇALHO */}
                <div style={s.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <button onClick={() => router.back()} style={s.buttonBack}>
                            ← Voltar
                        </button>
                        <div>
                            <h1 style={s.title}>📋 Checklist — {veiculo?.placa || "..."}</h1>
                            <p style={s.subtitle}>
                                {veiculo?.marcaNome || ""} {veiculo?.modeloNome || ""} {veiculo?.ano || ""}
                            </p>
                        </div>
                    </div>

                    <input
                        value={pesquisa}
                        onChange={e => setPesquisa(e.target.value)}
                        placeholder="Buscar no histórico..."
                        style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px", width: "200px" }}
                    />
                </div>

                {/* ABAS */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content", flexWrap: "wrap" }}>
                    {[
                        { key: "form",      label: "📋 Novo Checklist" },
                        { key: "historico", label: `📁 Histórico (${historico.length})` },
                    ].map(aba => (
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

                {/* ══════════ ABA: NOVO CHECKLIST ══════════ */}
                {abaAtiva === "form" && (
                    <>
                        {/* INFORMAÇÕES DA INSPEÇÃO */}
                        <div style={s.secaoCard}>
                            <div style={s.secaoTitulo}>1. Informações da Inspeção</div>
                            <div style={s.grid3}>

                                <div style={s.inputGroup}>
                                    <label>Data *</label>
                                    <input
                                        type="date"
                                        value={data}
                                        onChange={e => setData(e.target.value)}
                                        style={s.input}
                                    />
                                </div>

                                <div style={s.inputGroup}>
                                    <label>KM Atual</label>
                                    <input
                                        type="number"
                                        value={km}
                                        onChange={e => setKm(e.target.value)}
                                        placeholder="Ex: 85420"
                                        style={s.input}
                                    />
                                </div>

                                <div style={s.inputGroup}>
                                    <label>Responsável *</label>
                                    {isAdmin ? (
                                        <select
                                            value={responsavel}
                                            onChange={e => setResponsavel(e.target.value)}
                                            style={s.input}
                                        >
                                            <option value="">-- Selecione --</option>
                                            {usuarios.map(u => (
                                                <option key={u.id} value={u.id}>{u.nome}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={user?.nome || ""}
                                                readOnly
                                                style={{ ...s.input, background: "#f1f5f9", color: "#6b7280", cursor: "not-allowed" }}
                                            />
                                            <small style={{ color: "#9ca3af" }}>Preenchido automaticamente</small>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* CONTADORES DE STATUS */}
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                            {Object.entries(counts).map(([status, quantidade]) => {
                                const cor = COR_STATUS[status]
                                return (
                                    <div key={status} style={{
                                        flex: 1, minWidth: 90,
                                        background: cor.bg, border: `1px solid ${cor.border}`,
                                        borderRadius: "10px", padding: "12px", textAlign: "center",
                                    }}>
                                        <div style={{ fontSize: "22px", fontWeight: 800, color: cor.text }}>{quantidade}</div>
                                        <div style={{ fontSize: "11px", fontWeight: 600, color: cor.text }}>{status}</div>
                                        <div style={{ fontSize: "10px", color: cor.text, opacity: .7 }}>
                                            {totalItens > 0 ? Math.round((quantidade / totalItens) * 100) : 0}%
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* SEÇÕES DO CHECKLIST */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                            {SECOES.map(secao => {
                                const estaAberta = secaoAberta === secao.id
                                const statuses   = secao.itens.map(i => itensChecklist[i.id])
                                const temRuim    = statuses.includes("Ruim")
                                const temRegular = statuses.includes("Regular")
                                const tudoBom    = statuses.every(s => s === "Bom")

                                return (
                                    <div key={secao.id} style={{
                                        ...s.secaoCard,
                                        padding: 0,
                                        border: temRuim
                                            ? "1.5px solid #fca5a5"
                                            : temRegular
                                            ? "1.5px solid #fde047"
                                            : "1.5px solid #e5e7eb",
                                    }}>

                                        {/* CABEÇALHO DA SEÇÃO — clicável para abrir/fechar */}
                                        <button
                                            onClick={() => setSecaoAberta(estaAberta ? null : secao.id)}
                                            style={{
                                                width: "100%", padding: "14px 18px",
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                background: "none", border: "none", cursor: "pointer", textAlign: "left",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                <span style={{ fontSize: "18px" }}>{secao.icone}</span>
                                                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>
                                                    {secao.label}
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
                                            <span style={{ color: "#9ca3af", fontSize: "16px" }}>
                                                {estaAberta ? "▲" : "▼"}
                                            </span>
                                        </button>

                                        {/* ITENS DA SEÇÃO */}
                                        {estaAberta && (
                                            <div style={{ padding: "0 18px 18px" }}>
                                                {secao.itens.map(item => (
                                                    <div key={item.id} style={{
                                                        display: "flex", alignItems: "center",
                                                        justifyContent: "space-between", gap: "12px",
                                                        padding: "10px 0", borderBottom: "1px solid #f1f5f9",
                                                        flexWrap: "wrap",
                                                    }}>
                                                        <span style={{ fontSize: "13px", color: "#334155", minWidth: "180px" }}>
                                                            {item.label}
                                                        </span>

                                                        {/* BOTÕES DE STATUS: Bom / Regular / Ruim / Não verificado */}
                                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                            {STATUS_OPTS.map(opcao => {
                                                                const cor        = COR_STATUS[opcao]
                                                                const selecionado = itensChecklist[item.id] === opcao
                                                                return (
                                                                    <button
                                                                        key={opcao}
                                                                        onClick={() => mudarStatus(item.id, opcao)}
                                                                        style={{
                                                                            padding: "4px 14px", borderRadius: "20px",
                                                                            border: `2px solid ${selecionado ? cor.border : "#e2e8f0"}`,
                                                                            background: selecionado ? cor.bg : "#fff",
                                                                            color: selecionado ? cor.text : "#94a3b8",
                                                                            fontWeight: selecionado ? 700 : 500,
                                                                            fontSize: "12px", cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        {opcao}
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
                        <div style={s.secaoCard}>
                            <div style={s.inputGroup}>
                                <label style={{ fontWeight: "bold" }}>Observações Gerais</label>
                                <textarea
                                    value={observacoes}
                                    onChange={e => setObservacoes(e.target.value)}
                                    rows={3}
                                    placeholder="Descreva problemas encontrados, recomendações..."
                                    style={{ ...s.input, height: "80px", resize: "vertical" }}
                                />
                            </div>
                        </div>

                        {/* BOTÕES DE AÇÃO */}
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px", flexWrap: "wrap" }}>
                            <button
                                onClick={() => gerarPDF(veiculo, itensChecklist, nomeResponsavel(), observacoes, data, km)}
                                style={s.buttonSecundario}
                            >
                                🖨️ Gerar PDF
                            </button>
                            <button
                                onClick={salvar}
                                disabled={salvando}
                                style={{ ...s.buttonPrimary, opacity: salvando ? .6 : 1 }}
                            >
                                {salvando ? "Salvando..." : "💾 Salvar Checklist"}
                            </button>
                        </div>
                    </>
                )}

                {/* ══════════ ABA: HISTÓRICO ══════════ */}
                {abaAtiva === "historico" && (
                    carregando ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                            Carregando histórico...
                        </div>
                    ) : historicoFiltrado.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                            Nenhum checklist registrado para este veículo.
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={s.table}>
                                <thead style={s.tableHeader}>
                                    <tr>
                                        <th style={s.th}>ID</th>
                                        <th style={s.th}>Data</th>
                                        <th style={s.th}>KM</th>
                                        <th style={s.th}>Responsável</th>
                                        <th style={s.th}>Resultado</th>
                                        <th style={s.th}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicoFiltrado.map(h => {
                                        const contagem = contarStatus(h.itens || {})
                                        return (
                                            <tr key={h.id} style={s.tableRow}>
                                                <td style={s.td}>{h.id}</td>
                                                <td style={s.td}>{formatarDataBR(h.data)}</td>
                                                <td style={s.td}>
                                                    {h.km ? Number(h.km).toLocaleString("pt-BR") + " km" : "-"}
                                                </td>
                                                <td style={s.td}>{h.usuario?.nome || "-"}</td>
                                                <td style={s.td}>
                                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                        {Object.entries(contagem).map(([status, qtd]) => {
                                                            if (qtd === 0) return null
                                                            const cor = COR_STATUS[status]
                                                            return (
                                                                <span key={status} style={{
                                                                    background: cor.bg, color: cor.text,
                                                                    border: `1px solid ${cor.border}`,
                                                                    padding: "2px 10px", borderRadius: "20px",
                                                                    fontSize: "11px", fontWeight: 700,
                                                                }}>
                                                                    {status}: {qtd}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                </td>
                                                <td style={s.actions}>
                                                    <button
                                                        onClick={() => gerarPDF(veiculo, h.itens || {}, h.usuario?.nome, h.observacoes, h.data, h.km)}
                                                        style={s.buttonSecundario}
                                                    >
                                                        🖨️ PDF
                                                    </button>
                                                    <button
                                                        onClick={() => excluir(h.id)}
                                                        style={s.buttonDelete}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

            </div>
        </div>
    )
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────

const s = {
    page:             { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
    card:             { width: "100%", maxWidth: "1100px", backgroundColor: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", boxSizing: "border-box" },
    header:           { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" },
    title:            { margin: 0, fontSize: "22px", fontWeight: "bold" },
    subtitle:         { margin: 0, color: "#6b7280", fontSize: "14px" },
    secaoCard:        { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "12px" },
    secaoTitulo:      { fontSize: "14px", fontWeight: "bold", color: "#1e3a8a", marginBottom: "14px" },
    grid3:            { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" },
    inputGroup:       { marginBottom: "10px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: "600", color: "#374151" },
    input:            { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontWeight: "normal", width: "100%", boxSizing: "border-box" },
    table:            { width: "100%", borderCollapse: "collapse" },
    tableHeader:      { backgroundColor: "#f1f5f9" },
    th:               { padding: "10px", textAlign: "left", fontSize: "13px" },
    tableRow:         { borderBottom: "1px solid #e5e7eb" },
    td:               { padding: "10px", verticalAlign: "middle", fontSize: "13px" },
    actions:          { display: "flex", gap: "6px", padding: "10px", alignItems: "center" },
    buttonPrimary:    { backgroundColor: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
    buttonSecundario: { backgroundColor: "#f1f5f9", color: "#2563eb", border: "1px solid #2563eb", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" },
    buttonBack:       { backgroundColor: "#f1f5f9", color: "#374151", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" },
    buttonDelete:     { backgroundColor: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" },
}