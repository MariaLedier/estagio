"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"
import { formatarMoeda, formatarKm } from "@/utils/validacao.js"
import { useUser } from "@/app/context/userContext.jsx"

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
    const [formaPagamento, setFormaPagamento] = useState("")


    const [montado, setMontado] = useState(false)
    const [tipoCombustivel, setTipoCombustivel] = useState("")

    // FILTRO DE DATAS
    const [dataInicio, setDataInicio] = useState("")
    const [dataFim, setDataFim] = useState("")

    // ANO POR FILTRO
    const [anofiltro, setAnofiltro] = useState("")




    //USUARIO
    const { user } = useUser()
    const isAdmin = user?.tipo === 2




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
        setData(new Date().toISOString().split("T")[0]) // data de hoje
        setKm("")
        setLitros("")
        setValor("")
        setTipoCombustivel("")
        setUsuarioSelecionado(user?.id || "") // usuário logado
        setFormaPagamento("")
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
        setFormaPagamento(a.abastecimento_pagamento || "")
        setModalAberto(true)
    }

    function fecharModal() {
        setModalAberto(false)
        setEditando(null)
    }


    // -------------------- SALVAR --------------------

    async function salvar(e) {
        e.preventDefault()
        // 1. Converte litros para número para comparar
        const litrosDigitados = parseFloat(litros.replace(",", "."));
        const capacidadeTanque = veiculo?.tanque ? parseFloat(veiculo.tanque) : 0;

        // 2. Validação da capacidade
        if (capacidadeTanque > 0 && litrosDigitados > capacidadeTanque) {
            toast.error(`Limite excedido! O tanque deste veículo é de apenas ${capacidadeTanque} litros.`);
            return;
        }

        if (!usuarioSelecionado || !data || !km || !litros || !valor || !tipoCombustivel || !formaPagamento) {
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
                usuario: usuarioSelecionado,
                pagamento: formaPagamento
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

        } catch (error) {
            // MOSTRA MENSAGEM VINDA DO BACKEND
            const msg = error?.response?.data?.msg || error?.message || "Erro ao salvar abastecimento"
            toast.error(msg)
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



    // --------------- IMPRIMIR --------------
    function handlePrint() {
        imprimirAbastecimentos(veiculo, abastecimentosFiltrados, totalLitros, totalValor, mediaGeral, litrosPorCombustivel, dataInicio, dataFim, anofiltro)
    }

    function imprimirAbastecimentos(veiculo, lista, totalLitros, totalValor, mediaGeral, litrosPorCombustivel, dataInicio, dataFim, anofiltro) {
    const janela = window.open("", "_blank")
    if (!janela) { alert("Permita pop-ups para imprimir."); return }
 
    function formatarDataBR(valor) {
        if (!valor) return "-"
        const d = new Date(valor)
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    }
 
    const periodoLabel = dataInicio || dataFim
        ? `${dataInicio ? formatarDataBR(dataInicio) : "início"} até ${dataFim ? formatarDataBR(dataFim) : "hoje"}`
        : anofiltro
        ? `Ano ${anofiltro}`
        : "Todos os registros"
 
    const linhas = lista.map((a, index) => {
        const anterior    = lista[index - 1]
        const kmAnterior  = anterior ? Number(anterior.km) : null
        const intervalo   = kmAnterior !== null ? Number(a.km) - kmAnterior : null
 
        return `<tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:6px 8px;font-size:12px;">${formatarDataBR(a.data)}</td>
            <td style="padding:6px 8px;font-size:12px;">${kmAnterior ? Number(kmAnterior).toLocaleString("pt-BR") + " km" : "-"}</td>
            <td style="padding:6px 8px;font-size:12px;">${Number(a.km).toLocaleString("pt-BR")} km</td>
            <td style="padding:6px 8px;font-size:12px;">${intervalo !== null ? (intervalo >= 0 ? "+" : "") + Number(intervalo).toLocaleString("pt-BR") + " km" : "-"}</td>
            <td style="padding:6px 8px;font-size:12px;">${Number(a.litros).toFixed(2)} L</td>
            <td style="padding:6px 8px;font-size:12px;">${Number(a.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
            <td style="padding:6px 8px;font-size:12px;">${a.tipoCombustivel || "-"}</td>
            <td style="padding:6px 8px;font-size:12px;">${a.kmMedia ? a.kmMedia + " km/L" : "-"}</td>
            <td style="padding:6px 8px;font-size:12px;">${a.usuario?.nome || "-"}</td>
        </tr>`
    }).join("")
 
    const blocosResumo = `
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
            <div style="flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Total Gasto</div>
                <div style="font-size:16px;font-weight:800;color:#111827;">${totalValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
            </div>
            <div style="flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Total Litros</div>
                <div style="font-size:16px;font-weight:800;color:#111827;">${totalLitros.toFixed(2)} L</div>
            </div>
            <div style="flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Média Geral</div>
                <div style="font-size:16px;font-weight:800;color:#111827;">${mediaGeral ? mediaGeral + " km/L" : "-"}</div>
            </div>
            ${Object.entries(litrosPorCombustivel).map(([tipo, litros]) => `
                <div style="flex:1;min-width:110px;background:#eff6ff;border:1px solid #bfdbfe;border-top:3px solid #2563eb;border-radius:8px;padding:12px;">
                    <div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;margin-bottom:4px;">${tipo}</div>
                    <div style="font-size:16px;font-weight:800;color:#1e3a8a;">${litros.toFixed(2)} L</div>
                </div>
            `).join("")}
        </div>
    `
 
    janela.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Abastecimentos — ${veiculo?.placa || ""}</title>
    <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Segoe UI',sans-serif;padding:28px;color:#1e293b;}
        @media print{.no-print{display:none;}}
    </style></head><body>
 
    <div class="no-print" style="margin-bottom:16px;">
        <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
            🖨️ Imprimir / Salvar PDF
        </button>
    </div>
 
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:14px;border-bottom:3px solid #2563eb;">
        <div>
            <div style="font-size:18px;font-weight:800;color:#2563eb;">CONTROLE DE FROTA</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">Relatório de Abastecimentos</div>
        </div>
        <div style="text-align:right;font-size:12px;color:#64748b;">
            <div><b>Período:</b> ${periodoLabel}</div>
            <div><b>Registros:</b> ${lista.length}</div>
        </div>
    </div>
 
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:16px;display:flex;gap:32px;flex-wrap:wrap;">
        ${[["Placa", veiculo?.placa], ["Modelo", veiculo?.modeloNome || veiculo?.modelo?.nome], ["Marca", veiculo?.marcaNome || veiculo?.marca?.nome], ["Ano", veiculo?.ano]]
            .map(([l, v]) => `<div>
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;">${l}</div>
                <div style="font-size:14px;font-weight:700;">${v || "—"}</div>
            </div>`).join("")}
    </div>
 
    ${blocosResumo}
 
    <table style="width:100%;border-collapse:collapse;">
        <thead>
            <tr style="background:#f1f5f9;">
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Data</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">KM Anterior</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">KM Atual</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Intervalo</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Litros</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Valor</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Combustível</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Km/L</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Usuário</th>
            </tr>
        </thead>
        <tbody>${linhas}</tbody>
        <tfoot>
            <tr style="background:#f1f5f9;font-weight:700;">
                <td colspan="4" style="padding:8px;font-size:12px;">TOTAIS</td>
                <td style="padding:8px;font-size:12px;">${totalLitros.toFixed(2)} L</td>
                <td style="padding:8px;font-size:12px;">${totalValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td colspan="3" style="padding:8px;font-size:12px;">Média: ${mediaGeral ? mediaGeral + " km/L" : "-"}</td>
            </tr>
        </tfoot>
    </table>
 
    </body></html>`)
    janela.document.close()
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


                    {/* IMPRESSÃO */}
                    <button onClick={() => handlePrint()} style={styles.printButton}>
                        🖨️ Imprimir / Salvar PDF
                    </button>

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
              <div style={{ width: "100%", overflowX: "auto" }}>        
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
                                            <button onClick={() => abrirEdicao(a)} style={styles.buttonEdit}> <i className="fas fa-pencil-alt"></i></button>



                                            <button onClick={() => excluir(a.id)} style={styles.buttonDelete}> <i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
                </div>  
                        
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
                                {isAdmin ? (
                                    // ADMIN PODE ALTERAR
                                    <select
                                        value={usuarioSelecionado}
                                        onChange={function (e) { setUsuarioSelecionado(e.target.value) }}
                                        style={styles.input}
                                    >
                                        <option value="">Selecione o usuário</option>
                                        {usuarios.map(function (u) {
                                            return <option key={u.id} value={u.id}>{u.nome}</option>
                                        })}
                                    </select>
                                ) : (
                                    // VENDEDOR VÊ APENAS O PRÓPRIO NOME — BLOQUEADO
                                    <input
                                        type="text"
                                        value={user?.nome || ""}
                                        disabled
                                        style={{ ...styles.input, backgroundColor: "#f1f5f9", color: "#6b7280" }}
                                    />
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <label>Data</label>
                                <input
                                    type="date"
                                    value={data}
                                    onChange={function (e) { setData(e.target.value) }}
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
                                <label>
                                    Litros
                                    {veiculo?.tanque && (
                                        <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '5px' }}>
                                            (Máx: {veiculo.tanque}L)
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={litros}
                                    onChange={handleLitros}
                                    placeholder="Ex: 40,5"
                                    style={{
                                        ...styles.input,
                                        // Se passar do limite, a borda fica vermelha
                                        borderColor: (parseFloat(litros.replace(",", ".")) > veiculo?.tanque) ? "#ef4444" : "#d1d5db"
                                    }}
                                />
                                {parseFloat(litros.replace(",", ".")) > veiculo?.tanque && (
                                    <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "2px" }}>
                                        Valor maior que a capacidade do tanque!
                                    </span>
                                )}
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

                            <div style={styles.inputGroup}>
                                <label>Forma de Pagamento</label>
                                <select
                                    value={formaPagamento}
                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="">Selecione o pagamento</option>
                                    <option value="DINHEIRO">Dinheiro</option>
                                    <option value="PIX">Pix</option>
                                    <option value="CARTAO">Cartão</option>
                                    <option value="CARTAO_EMPRESARIAL">Cartão Empresarial</option>
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
    printButton: {
        backgroundColor: "#16a34a",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold"
    }
}
