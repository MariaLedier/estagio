"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"

export default function RelatorioAbastecimentoPage() {

    const [veiculos, setVeiculos] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [resultados, setResultados] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [jaBuscou, setJaBuscou] = useState(false)

    // Filtros
    const [veiculoFiltro, setVeiculoFiltro] = useState("")
    const [combustivelFiltro, setCombustivelFiltro] = useState("")
    const [pagamentoFiltro, setPagamentoFiltro] = useState("")
    const [usuarioFiltro, setUsuarioFiltro] = useState("")
    const [dataInicio, setDataInicio] = useState("")
    const [dataFim, setDataFim] = useState("")

    useEffect(() => {
        carregarVeiculos()
        carregarUsuarios()
    }, [])

    async function carregarVeiculos() {
        try {
            const dados = await apiClient.get("/veiculo")
            setVeiculos(Array.isArray(dados) ? dados : [])
        } catch {
            setVeiculos([])
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

    // Busca todos os abastecimentos e filtra no front
    async function buscar() {
        setCarregando(true)
        setJaBuscou(true)
        try {
            // Se selecionou um veículo específico, usa a rota por veículo
            // Se não, busca todos
            let lista = []
            if (veiculoFiltro) {
                const dados = await apiClient.get("/abastecimento/veiculo/" + veiculoFiltro)
                lista = Array.isArray(dados) ? dados : []
            } else {
                const dados = await apiClient.get("/abastecimento")
                lista = Array.isArray(dados) ? dados : []
            }

            // Filtro por combustível
            if (combustivelFiltro) {
                lista = lista.filter(a => a.tipoCombustivel === combustivelFiltro)
            }

            // Filtro por forma de pagamento
            if (pagamentoFiltro) {
                lista = lista.filter(a => a.pagamento === pagamentoFiltro)
            }

            // Filtro por usuário
            if (usuarioFiltro) {
                lista = lista.filter(a =>
                    String(a.usuario?.id ?? a.usuario) === String(usuarioFiltro)
                )
            }

            // Filtro por data início
            if (dataInicio) {
                lista = lista.filter(a => {
                    if (!a.data) return false
                    return new Date(a.data) >= new Date(dataInicio)
                })
            }

            // Filtro por data fim
            if (dataFim) {
                lista = lista.filter(a => {
                    if (!a.data) return false
                    return new Date(a.data) <= new Date(dataFim)
                })
            }

            // Ordena por data crescente para os cálculos de intervalo ficarem certos
            lista.sort((a, b) => new Date(a.data) - new Date(b.data))

            setResultados(lista)

        } catch {
            toast.error("Erro ao buscar relatório")
            setResultados([])
        } finally {
            setCarregando(false)
        }
    }

    function limparFiltros() {
        setVeiculoFiltro("")
        setCombustivelFiltro("")
        setPagamentoFiltro("")
        setUsuarioFiltro("")
        setDataInicio("")
        setDataFim("")
        setResultados([])
        setJaBuscou(false)
    }

    // ---- Cálculos de totais ----

    const totalLitros = resultados.reduce((acc, a) => acc + Number(a.litros || 0), 0)
    const totalValor = resultados.reduce((acc, a) => acc + Number(a.valor || 0), 0)

    // Média geral de km/L
    const mediasValidas = resultados.filter(a => a.kmMedia && Number(a.kmMedia) > 0)
    const mediaGeral = mediasValidas.length > 0
        ? (mediasValidas.reduce((acc, a) => acc + Number(a.kmMedia), 0) / mediasValidas.length).toFixed(2)
        : null

    // Litros e valor agrupados por combustível
    const porCombustivel = resultados.reduce((acc, a) => {
        const tipo = a.tipoCombustivel || "Não informado"
        if (!acc[tipo]) acc[tipo] = { litros: 0, valor: 0, qtd: 0 }
        acc[tipo].litros += Number(a.litros || 0)
        acc[tipo].valor += Number(a.valor || 0)
        acc[tipo].qtd++
        return acc
    }, {})

    // Gasto por veículo (útil quando não filtra por veículo)
    const porVeiculo = resultados.reduce((acc, a) => {
        const placa = a.veiculo?.placa || "Sem placa"
        if (!acc[placa]) acc[placa] = { valor: 0, litros: 0, qtd: 0 }
        acc[placa].valor += Number(a.valor || 0)
        acc[placa].litros += Number(a.litros || 0)
        acc[placa].qtd++
        return acc
    }, {})

    // Gasto por forma de pagamento
    const porPagamento = resultados.reduce((acc, a) => {
        const pag = a.pagamento || "Não informado"
        if (!acc[pag]) acc[pag] = 0
        acc[pag] += Number(a.valor || 0)
        return acc
    }, {})

    // ---- Formatações ----

    function formatarData(valor) {
        if (!valor) return "-"
        const d = new Date(valor)
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    }

    function formatarReais(valor) {
        return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    const labelPagamento = {
        DINHEIRO: "Dinheiro",
        PIX: "PIX",
        CARTAO: "Cartão",
        CARTAO_EMPRESARIAL: "Cartão Empresarial"
    }

    const labelCombustivel = {
        GASOLINA: "Gasolina",
        ETANOL: "Etanol",
        DIESEL: "Diesel",
        DIESEL_S10: "Diesel S10",
        GNV: "GNV",
        FLEX: "Flex"
    }

    // ---- Impressão ----

    function imprimir() {
        const janela = window.open("", "_blank")
        if (!janela) { alert("Permita pop-ups para imprimir."); return }

        const periodoLabel = dataInicio || dataFim
            ? `${dataInicio ? formatarData(dataInicio) : "início"} até ${dataFim ? formatarData(dataFim) : "hoje"}`
            : "Todos os registros"

        const linhas = resultados.map((a, index) => {
            // Para calcular intervalo só quando é o mesmo veículo
            const anterior = resultados[index - 1]
            const mesmoVeiculo = anterior && (anterior.veiculo?.id === a.veiculo?.id)
            const intervalo = mesmoVeiculo ? Number(a.km) - Number(anterior.km) : null

            return `<tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:6px 8px;font-size:11px;">${formatarData(a.data)}</td>
                <td style="padding:6px 8px;font-size:11px;">${a.veiculo?.placa || "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${Number(a.km).toLocaleString("pt-BR")} km</td>
                <td style="padding:6px 8px;font-size:11px;">${intervalo !== null ? (intervalo >= 0 ? "+" : "") + Number(intervalo).toLocaleString("pt-BR") + " km" : "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${Number(a.litros).toFixed(2)} L</td>
                <td style="padding:6px 8px;font-size:11px;">${formatarReais(a.valor)}</td>
                <td style="padding:6px 8px;font-size:11px;">${labelCombustivel[a.tipoCombustivel] || a.tipoCombustivel || "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${a.kmMedia ? a.kmMedia + " km/L" : "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${labelPagamento[a.pagamento] || a.pagamento || "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${a.usuario?.nome || "-"}</td>
            </tr>`
        }).join("")

        janela.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
        <title>Relatório de Abastecimentos</title>
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
                <div><b>Registros:</b> ${resultados.length}</div>
            </div>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
            <div style="flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Total Gasto</div>
                <div style="font-size:16px;font-weight:800;">${formatarReais(totalValor)}</div>
            </div>
            <div style="flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Total Litros</div>
                <div style="font-size:16px;font-weight:800;">${totalLitros.toFixed(2)} L</div>
            </div>
            <div style="flex:1;min-width:110px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
                <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">Média Geral</div>
                <div style="font-size:16px;font-weight:800;">${mediaGeral ? mediaGeral + " km/L" : "-"}</div>
            </div>
            ${Object.entries(porCombustivel).map(([tipo, dados]) => `
                <div style="flex:1;min-width:110px;background:#eff6ff;border:1px solid #bfdbfe;border-top:3px solid #2563eb;border-radius:8px;padding:12px;">
                    <div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;margin-bottom:4px;">${labelCombustivel[tipo] || tipo}</div>
                    <div style="font-size:14px;font-weight:800;color:#1e3a8a;">${dados.litros.toFixed(2)} L</div>
                    <div style="font-size:11px;color:#3b82f6;">${formatarReais(dados.valor)}</div>
                </div>
            `).join("")}
        </div>

        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:#f1f5f9;">
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Data</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Veículo</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">KM</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Intervalo</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Litros</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Valor</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Combustível</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Km/L</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Pagamento</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Usuário</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
            <tfoot>
                <tr style="background:#f1f5f9;font-weight:700;">
                    <td colspan="4" style="padding:8px;font-size:12px;">TOTAIS</td>
                    <td style="padding:8px;font-size:12px;">${totalLitros.toFixed(2)} L</td>
                    <td style="padding:8px;font-size:12px;">${formatarReais(totalValor)}</td>
                    <td colspan="4" style="padding:8px;font-size:12px;">Média: ${mediaGeral ? mediaGeral + " km/L" : "-"}</td>
                </tr>
            </tfoot>
        </table>

        </body></html>`)
        janela.document.close()
    }

    // -------------------- RENDER --------------------

    return (
        <div style={s.page}>
            <div style={s.card}>

                {/* TÍTULO */}
                <div style={s.topo}>
                    <div>
                        <h1 style={s.titulo}>⛽ Relatório de Abastecimentos</h1>
                        <p style={s.subtitulo}>Filtre por veículo, combustível, pagamento ou período</p>
                    </div>
                </div>

                {/* FILTROS */}
                <div style={s.filtrosBox}>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Veículo</label>
                        <select value={veiculoFiltro} onChange={e => setVeiculoFiltro(e.target.value)} style={s.input}>
                            <option value="">Todos os veículos</option>
                            {veiculos.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.placa} — {v.marcaNome} {v.modeloNome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Combustível</label>
                        <select value={combustivelFiltro} onChange={e => setCombustivelFiltro(e.target.value)} style={s.input}>
                            <option value="">Todos</option>
                            <option value="GASOLINA">Gasolina</option>
                            <option value="ETANOL">Etanol</option>
                            <option value="DIESEL">Diesel</option>
                            <option value="DIESEL_S10">Diesel S10</option>
                            <option value="GNV">GNV</option>
                            <option value="FLEX">Flex</option>
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Forma de Pagamento</label>
                        <select value={pagamentoFiltro} onChange={e => setPagamentoFiltro(e.target.value)} style={s.input}>
                            <option value="">Todas</option>
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="PIX">PIX</option>
                            <option value="CARTAO">Cartão</option>
                            <option value="CARTAO_EMPRESARIAL">Cartão Empresarial</option>
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Usuário</label>
                        <select value={usuarioFiltro} onChange={e => setUsuarioFiltro(e.target.value)} style={s.input}>
                            <option value="">Todos</option>
                            {usuarios.map(u => (
                                <option key={u.id} value={u.id}>{u.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Data inicial</label>
                        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={s.input} />
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Data final</label>
                        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={s.input} />
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <button onClick={buscar} disabled={carregando} style={s.btnBuscar}>
                            {carregando ? "Buscando..." : "🔍 Buscar"}
                        </button>
                        <button onClick={limparFiltros} style={s.btnLimpar}>
                            Limpar
                        </button>
                    </div>

                </div>

                {/* CARDS DE RESUMO */}
                {jaBuscou && resultados.length > 0 && (
                    <>
                        <div style={s.resumoBox}>

                            <div style={s.resumoCard}>
                                <div style={s.resumoNumero}>{resultados.length}</div>
                                <div style={s.resumoLabel}>Abastecimentos</div>
                            </div>

                            <div style={s.resumoCard}>
                                <div style={s.resumoNumero}>{formatarReais(totalValor)}</div>
                                <div style={s.resumoLabel}>Total gasto</div>
                            </div>

                            <div style={s.resumoCard}>
                                <div style={s.resumoNumero}>{totalLitros.toFixed(2)} L</div>
                                <div style={s.resumoLabel}>Total em litros</div>
                            </div>

                            <div style={s.resumoCard}>
                                <div style={s.resumoNumero}>{mediaGeral ? mediaGeral + " km/L" : "-"}</div>
                                <div style={s.resumoLabel}>Média geral</div>
                            </div>

                        </div>

                        {/* POR COMBUSTÍVEL */}
                        <div style={{ marginBottom: "16px" }}>
                            <p style={s.secaoTitulo}>⛽ Por combustível</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {Object.entries(porCombustivel).map(([tipo, dados]) => (
                                    <div key={tipo} style={{ ...s.chipCard, borderTop: "3px solid #2563eb" }}>
                                        <div style={{ fontWeight: "bold", fontSize: "13px" }}>{labelCombustivel[tipo] || tipo}</div>
                                        <div style={{ color: "#2563eb", fontWeight: "bold" }}>{dados.litros.toFixed(2)} L</div>
                                        <div style={{ color: "#6b7280", fontSize: "12px" }}>{formatarReais(dados.valor)}</div>
                                        <div style={{ color: "#9ca3af", fontSize: "11px" }}>{dados.qtd} abastec.</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* POR PAGAMENTO */}
                        <div style={{ marginBottom: "16px" }}>
                            <p style={s.secaoTitulo}>💳 Por forma de pagamento</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {Object.entries(porPagamento)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([pag, valor]) => (
                                        <div key={pag} style={s.chipCard}>
                                            <div style={{ fontWeight: "bold", fontSize: "13px" }}>{labelPagamento[pag] || pag}</div>
                                            <div style={{ color: "#2563eb", fontWeight: "bold" }}>{formatarReais(valor)}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* POR VEÍCULO — só aparece quando tem mais de um */}
                        {Object.keys(porVeiculo).length > 1 && (
                            <div style={{ marginBottom: "20px" }}>
                                <p style={s.secaoTitulo}>🚗 Por veículo</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {Object.entries(porVeiculo)
                                        .sort((a, b) => b[1].valor - a[1].valor)
                                        .map(([placa, dados]) => (
                                            <div key={placa} style={s.chipCard}>
                                                <div style={{ fontWeight: "bold", fontSize: "13px" }}>{placa}</div>
                                                <div style={{ color: "#2563eb", fontWeight: "bold" }}>{formatarReais(dados.valor)}</div>
                                                <div style={{ color: "#6b7280", fontSize: "12px" }}>{dados.litros.toFixed(2)} L</div>
                                                <div style={{ color: "#9ca3af", fontSize: "11px" }}>{dados.qtd} abastec.</div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* BOTÃO IMPRIMIR */}
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                            <button onClick={imprimir} style={s.btnImprimir}>
                                🖨️ Imprimir / Salvar PDF
                            </button>
                        </div>
                    </>
                )}

                {/* TABELA */}
                {jaBuscou && (
                    resultados.length === 0 ? (
                        <div style={s.vazio}>
                            Nenhum abastecimento encontrado com os filtros selecionados.
                        </div>
                    ) : (
                        <table style={s.tabela}>
                            <thead style={s.thead}>
                                <tr>
                                    <th style={s.th}>Data</th>
                                    <th style={s.th}>Veículo</th>
                                    <th style={s.th}>KM</th>
                                    <th style={s.th}>Litros</th>
                                    <th style={s.th}>Valor</th>
                                    <th style={s.th}>Combustível</th>
                                    <th style={s.th}>Km/L</th>
                                    <th style={s.th}>Pagamento</th>
                                    <th style={s.th}>Usuário</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((a, index) => {
                                    const anterior = resultados[index - 1]
                                    const mesmoVeiculo = anterior && (anterior.veiculo?.id === a.veiculo?.id)
                                    const intervalo = mesmoVeiculo ? Number(a.km) - Number(anterior.km) : null

                                    return (
                                        <tr key={a.id} style={s.tr}>

                                            <td style={s.td}>{formatarData(a.data)}</td>

                                            <td style={s.td}>
                                                <span style={{ fontWeight: "bold" }}>{a.veiculo?.placa || "-"}</span>
                                            </td>

                                            <td style={s.td}>
                                                <div>{Number(a.km).toLocaleString("pt-BR")} km</div>
                                                {intervalo !== null && (
                                                    <small style={{
                                                        color: intervalo >= 0 ? "#16a34a" : "#dc2626",
                                                        fontSize: "11px"
                                                    }}>
                                                        {intervalo >= 0 ? "+" : ""}{Number(intervalo).toLocaleString("pt-BR")} km
                                                    </small>
                                                )}
                                            </td>

                                            <td style={s.td}>{Number(a.litros).toFixed(2)} L</td>

                                            <td style={s.td}>{formatarReais(a.valor)}</td>

                                            <td style={s.td}>
                                                <span style={{
                                                    background: "#dbeafe",
                                                    color: "#1d4ed8",
                                                    padding: "2px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold"
                                                }}>
                                                    {labelCombustivel[a.tipoCombustivel] || a.tipoCombustivel || "-"}
                                                </span>
                                            </td>

                                            <td style={s.td}>{a.kmMedia ? a.kmMedia + " km/L" : "-"}</td>

                                            <td style={s.td}>{labelPagamento[a.pagamento] || a.pagamento || "-"}</td>

                                            <td style={s.td}>{a.usuario?.nome || "-"}</td>

                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <td colSpan="3" style={{ ...s.td, textAlign: "right", fontWeight: "bold" }}>
                                        Totais:
                                    </td>
                                    <td style={{ ...s.td, fontWeight: "bold" }}>{totalLitros.toFixed(2)} L</td>
                                    <td style={{ ...s.td, fontWeight: "bold", color: "#2563eb", fontSize: "15px" }}>
                                        {formatarReais(totalValor)}
                                    </td>
                                    <td colSpan="4" style={{ ...s.td, color: "#6b7280", fontSize: "13px" }}>
                                        Média: {mediaGeral ? mediaGeral + " km/L" : "-"}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )
                )}

            </div>
        </div>
    )
}

// -------------------- ESTILOS --------------------
const s = {
    page: { minHeight: "100vh", background: "#f8fafc", padding: "30px 20px", display: "flex", justifyContent: "center" },
    card: { width: "100%", maxWidth: "1200px", backgroundColor: "#fff", padding: "28px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
    topo: { marginBottom: "24px" },
    titulo: { margin: 0, fontSize: "22px", fontWeight: "bold", color: "#111827" },
    subtitulo: { margin: "4px 0 0", color: "#6b7280", fontSize: "14px" },

    filtrosBox: { display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end", padding: "20px", background: "#f8fafc", borderRadius: "12px", marginBottom: "24px" },
    filtroGrupo: { display: "flex", flexDirection: "column", gap: "5px", minWidth: "160px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
    input: { padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", background: "#fff" },

    btnBuscar: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
    btnLimpar: { backgroundColor: "#f1f5f9", color: "#374151", padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", cursor: "pointer", fontSize: "14px" },
    btnImprimir: { backgroundColor: "#16a34a", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },

    resumoBox: { display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "20px" },
    resumoCard: { flex: "1 1 160px", background: "#f1f5f9", borderRadius: "12px", padding: "16px 20px", textAlign: "center" },
    resumoNumero: { fontSize: "20px", fontWeight: "bold", color: "#111827" },
    resumoLabel: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },

    secaoTitulo: { fontWeight: "bold", fontSize: "14px", color: "#374151", marginBottom: "10px" },
    chipCard: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "2px", minWidth: "120px" },

    vazio: { textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "15px" },

    tabela: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#f1f5f9" },
    th: { padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#374151" },
    tr: { borderBottom: "1px solid #e5e7eb" },
    td: { padding: "12px", verticalAlign: "top", fontSize: "14px" },
}