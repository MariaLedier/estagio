"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"

export default function RelatorioPneusPage() {

    const [veiculos, setVeiculos] = useState([])
    const [resultados, setResultados] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [jaBuscou, setJaBuscou] = useState(false)

    // Filtros
    const [veiculoFiltro, setVeiculoFiltro] = useState("")
    const [marcaFiltro, setMarcaFiltro] = useState("")
    const [posicaoFiltro, setPosicaoFiltro] = useState("")
    const [dataInicio, setDataInicio] = useState("")
    const [dataFim, setDataFim] = useState("")

    useEffect(() => {
        carregarVeiculos()
    }, [])

    async function carregarVeiculos() {
        try {
            const dados = await apiClient.get("/veiculo")
            setVeiculos(Array.isArray(dados) ? dados : [])
        } catch {
            setVeiculos([])
        }
    }

    async function buscar() {
        setCarregando(true)
        setJaBuscou(true)
        try {
            let lista = await apiClient.get("/pneu/descartes")
            lista = Array.isArray(lista) ? lista : []

            // Filtro por veículo
            if (veiculoFiltro) {
                lista = lista.filter(d =>
                    String(d.descarte_veiculo_id) === String(veiculoFiltro)
                )
            }

            // Filtro por marca
            if (marcaFiltro) {
                lista = lista.filter(d =>
                    (d.descarte_marca || "").toLowerCase().includes(marcaFiltro.toLowerCase())
                )
            }

            // Filtro por posição
            if (posicaoFiltro) {
                lista = lista.filter(d => d.descarte_posicao === posicaoFiltro)
            }

            // Filtro por data de saída
            if (dataInicio) {
                lista = lista.filter(d =>
                    d.descarte_data_saida && new Date(d.descarte_data_saida) >= new Date(dataInicio)
                )
            }
            if (dataFim) {
                lista = lista.filter(d =>
                    d.descarte_data_saida && new Date(d.descarte_data_saida) <= new Date(dataFim)
                )
            }

            setResultados(lista)

        } catch {
            toast.error("Erro ao buscar relatório de pneus")
            setResultados([])
        } finally {
            setCarregando(false)
        }
    }

    function limpar() {
        setVeiculoFiltro("")
        setMarcaFiltro("")
        setPosicaoFiltro("")
        setDataInicio("")
        setDataFim("")
        setResultados([])
        setJaBuscou(false)
    }

    // ---- Cálculos ----

    const totalDescartados = resultados.length

    // Média de km rodados (só os que têm km_uso)
    const comKm = resultados.filter(d => d.descarte_km_uso && Number(d.descarte_km_uso) > 0)
    const mediaKm = comKm.length > 0
        ? Math.round(comKm.reduce((acc, d) => acc + Number(d.descarte_km_uso), 0) / comKm.length)
        : null

    // Média de dias de uso
    const comDias = resultados.filter(d => d.descarte_dias_uso && Number(d.descarte_dias_uso) > 0)
    const mediaDias = comDias.length > 0
        ? Math.round(comDias.reduce((acc, d) => acc + Number(d.descarte_dias_uso), 0) / comDias.length)
        : null

    // Pneu que mais rodou
    const maisRodou = comKm.length > 0
        ? comKm.reduce((max, d) => Number(d.descarte_km_uso) > Number(max.descarte_km_uso) ? d : max, comKm[0])
        : null

    // Agrupamento por posição
    const porPosicao = resultados.reduce((acc, d) => {
        const pos = d.descarte_posicao || "Não informado"
        if (!acc[pos]) acc[pos] = { qtd: 0, totalKm: 0, comKm: 0 }
        acc[pos].qtd++
        if (d.descarte_km_uso) {
            acc[pos].totalKm += Number(d.descarte_km_uso)
            acc[pos].comKm++
        }
        return acc
    }, {})

    // Agrupamento por marca com média de km
    const porMarca = resultados.reduce((acc, d) => {
        const marca = d.descarte_marca || "Não informado"
        if (!acc[marca]) acc[marca] = { qtd: 0, totalKm: 0, comKm: 0 }
        acc[marca].qtd++
        if (d.descarte_km_uso) {
            acc[marca].totalKm += Number(d.descarte_km_uso)
            acc[marca].comKm++
        }
        return acc
    }, {})

    // Agrupamento por veículo
    const porVeiculo = resultados.reduce((acc, d) => {
        const placa = d.veiculo_placa || "Sem placa"
        if (!acc[placa]) acc[placa] = 0
        acc[placa]++
        return acc
    }, {})

    // ---- Formatações ----

    function formatarData(valor) {
        if (!valor) return "-"
        const d = new Date(valor)
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    }

    // ---- Impressão ----

    function imprimir() {
        const janela = window.open("", "_blank")
        if (!janela) { alert("Permita pop-ups para imprimir."); return }

        const linhas = resultados.map(d => `
            <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:6px 8px;font-size:11px;">${d.veiculo_placa || "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${d.descarte_marca || "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${d.descarte_medida || "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${d.descarte_posicao || "-"}</td>
                <td style="padding:6px 8px;font-size:11px;">${formatarData(d.descarte_data_entrada)}</td>
                <td style="padding:6px 8px;font-size:11px;">${formatarData(d.descarte_data_saida)}</td>
                <td style="padding:6px 8px;font-size:11px;">${d.descarte_dias_uso ?? "-"} dias</td>
                <td style="padding:6px 8px;font-size:11px;">${d.descarte_km_uso ? Number(d.descarte_km_uso).toLocaleString("pt-BR") + " km" : "-"}</td>
            </tr>
        `).join("")

        janela.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
        <title>Relatório de Pneus Descartados</title>
        <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',sans-serif;padding:28px;color:#1e293b;}@media print{.no-print{display:none;}}</style>
        </head><body>

        <div class="no-print" style="margin-bottom:16px;">
            <button onclick="window.print()" style="background:#16a34a;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
                🖨️ Imprimir / Salvar PDF
            </button>
        </div>

        <div style="display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:14px;border-bottom:3px solid #2563eb;">
            <div>
                <div style="font-size:18px;font-weight:800;color:#2563eb;">CONTROLE DE FROTA</div>
                <div style="font-size:12px;color:#64748b;margin-top:2px;">Relatório de Pneus Descartados</div>
            </div>
            <div style="text-align:right;font-size:12px;color:#64748b;">
                <div><b>Total de registros:</b> ${totalDescartados}</div>
                <div><b>Média de uso:</b> ${mediaKm ? Number(mediaKm).toLocaleString("pt-BR") + " km" : "-"}</div>
            </div>
        </div>

        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr style="background:#f1f5f9;">
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Veículo</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Marca</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Medida</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Posição</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Entrada</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Saída</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">Dias de uso</th>
                    <th style="padding:8px;text-align:left;font-size:11px;color:#6b7280;">KM rodados</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>

        </body></html>`)
        janela.document.close()
    }

    // ---- Render ----

    return (
        <div style={s.page}>
            <div style={s.card}>

                <div style={s.topo}>
                    <h1 style={s.titulo}>Relatório de Pneus Descartados</h1>
                    <p style={s.subtitulo}>Veja o histórico de trocas, durabilidade por marca e posição mais desgastada</p>
                </div>

                {/* FILTROS */}
                <div style={s.filtrosBox}>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Veículo</label>
                        <select value={veiculoFiltro} onChange={e => setVeiculoFiltro(e.target.value)} style={s.input}>
                            <option value="">Todos</option>
                            {veiculos.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.placa} — {v.marcaNome} {v.modeloNome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Marca do pneu</label>
                        <input
                            type="text"
                            value={marcaFiltro}
                            onChange={e => setMarcaFiltro(e.target.value)}
                            placeholder="Ex: Michelin"
                            style={s.input}
                        />
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Posição</label>
                        <select value={posicaoFiltro} onChange={e => setPosicaoFiltro(e.target.value)} style={s.input}>
                            <option value="">Todas</option>
                            <option value="Dianteiro Esquerdo">Dianteiro Esquerdo</option>
                            <option value="Dianteiro Direito">Dianteiro Direito</option>
                            <option value="Traseiro Esquerdo">Traseiro Esquerdo</option>
                            <option value="Traseiro Direito">Traseiro Direito</option>
                            <option value="Estepe">Estepe</option>
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Descartado de</label>
                        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} style={s.input} />
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Descartado até</label>
                        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} style={s.input} />
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <button onClick={buscar} disabled={carregando} style={s.btnBuscar}>
                            {carregando ? "Buscando..." : "🔍 Buscar"}
                        </button>
                        <button onClick={limpar} style={s.btnLimpar}>Limpar</button>
                    </div>

                </div>

                {/* RESUMO */}
                {jaBuscou && resultados.length > 0 && (
                    <>
                        <div style={s.resumoBox}>

                            <div style={s.resumoCard}>
                                <div style={s.resumoNumero}>{totalDescartados}</div>
                                <div style={s.resumoLabel}>Pneus descartados</div>
                            </div>

                            <div style={s.resumoCard}>
                                <div style={s.resumoNumero}>
                                    {mediaKm ? Number(mediaKm).toLocaleString("pt-BR") + " km" : "-"}
                                </div>
                                <div style={s.resumoLabel}>Média de KM por pneu</div>
                            </div>

                            <div style={s.resumoCard}>
                                <div style={s.resumoNumero}>
                                    {mediaDias ? mediaDias + " dias" : "-"}
                                </div>
                                <div style={s.resumoLabel}>Média de dias de uso</div>
                            </div>

                            {maisRodou && (
                                <div style={{ ...s.resumoCard, borderTop: "3px solid #22c55e" }}>
                                    <div style={{ ...s.resumoNumero, fontSize: "15px" }}>
                                        {maisRodou.descarte_marca} {maisRodou.descarte_medida}
                                    </div>
                                    <div style={s.resumoLabel}>
                                        Maior durabilidade — {Number(maisRodou.descarte_km_uso).toLocaleString("pt-BR")} km
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* POR POSIÇÃO */}
                        <div style={{ marginBottom: "16px" }}>
                            <p style={s.secaoTitulo}>Trocas por posição</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {Object.entries(porPosicao)
                                    .sort((a, b) => b[1].qtd - a[1].qtd)
                                    .map(([pos, dados]) => (
                                        <div key={pos} style={s.chipCard}>
                                            <div style={{ fontWeight: "bold", fontSize: "13px" }}>{pos}</div>
                                            <div style={{ color: "#ef4444", fontWeight: "bold" }}>{dados.qtd} trocas</div>
                                            {dados.comKm > 0 && (
                                                <div style={{ color: "#6b7280", fontSize: "12px" }}>
                                                    Média: {Number(Math.round(dados.totalKm / dados.comKm)).toLocaleString("pt-BR")} km
                                                </div>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* POR MARCA */}
                        <div style={{ marginBottom: "16px" }}>
                            <p style={s.secaoTitulo}>Durabilidade por marca</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {Object.entries(porMarca)
                                    .sort((a, b) => {
                                        const mediaA = a[1].comKm > 0 ? a[1].totalKm / a[1].comKm : 0
                                        const mediaB = b[1].comKm > 0 ? b[1].totalKm / b[1].comKm : 0
                                        return mediaB - mediaA
                                    })
                                    .map(([marca, dados]) => (
                                        <div key={marca} style={s.chipCard}>
                                            <div style={{ fontWeight: "bold", fontSize: "13px" }}>{marca}</div>
                                            <div style={{ color: "#6b7280", fontSize: "12px" }}>{dados.qtd} pneu(s)</div>
                                            {dados.comKm > 0 ? (
                                                <div style={{ color: "#2563eb", fontWeight: "bold" }}>
                                                    {Number(Math.round(dados.totalKm / dados.comKm)).toLocaleString("pt-BR")} km em média
                                                </div>
                                            ) : (
                                                <div style={{ color: "#9ca3af", fontSize: "12px" }}>Sem KM registrado</div>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* POR VEÍCULO — só aparece quando tem mais de um */}
                        {Object.keys(porVeiculo).length > 1 && (
                            <div style={{ marginBottom: "20px" }}>
                                <p style={s.secaoTitulo}>🚗 Trocas por veículo</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {Object.entries(porVeiculo)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([placa, qtd]) => (
                                            <div key={placa} style={s.chipCard}>
                                                <div style={{ fontWeight: "bold", fontSize: "13px" }}>{placa}</div>
                                                <div style={{ color: "#ef4444", fontWeight: "bold" }}>{qtd} troca(s)</div>
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
                            Nenhum pneu descartado encontrado com os filtros selecionados.
                        </div>
                    ) : (
                        <table style={s.tabela}>
                            <thead style={s.thead}>
                                <tr>
                                    <th style={s.th}>Veículo</th>
                                    <th style={s.th}>Marca</th>
                                    <th style={s.th}>Medida</th>
                                    <th style={s.th}>Posição</th>
                                    <th style={s.th}>Entrada</th>
                                    <th style={s.th}>Saída</th>
                                    <th style={s.th}>Dias de uso</th>
                                    <th style={s.th}>KM rodados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((d, i) => (
                                    <tr key={i} style={s.tr}>

                                        <td style={s.td}>
                                            <span style={{ fontWeight: "bold" }}>{d.veiculo_placa || "-"}</span>
                                        </td>

                                        <td style={s.td}>{d.descarte_marca || "-"}</td>

                                        <td style={s.td}>{d.descarte_medida || "-"}</td>

                                        <td style={s.td}>
                                            <span style={{
                                                background: "#f1f5f9",
                                                padding: "2px 8px",
                                                borderRadius: "6px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                color: "#374151"
                                            }}>
                                                {d.descarte_posicao || "-"}
                                            </span>
                                        </td>

                                        <td style={s.td}>{formatarData(d.descarte_data_entrada)}</td>

                                        <td style={s.td}>{formatarData(d.descarte_data_saida)}</td>

                                        <td style={s.td}>
                                            {d.descarte_dias_uso != null ? (
                                                <span style={{
                                                    color: Number(d.descarte_dias_uso) < 90 ? "#dc2626" : "#16a34a",
                                                    fontWeight: "bold"
                                                }}>
                                                    {d.descarte_dias_uso} dias
                                                </span>
                                            ) : "-"}
                                        </td>

                                        <td style={s.td}>
                                            {d.descarte_km_uso
                                                ? Number(d.descarte_km_uso).toLocaleString("pt-BR") + " km"
                                                : "-"
                                            }
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

            </div>
        </div>
    )
}

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
    chipCard: { background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "2px", minWidth: "130px" },

    vazio: { textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "15px" },

    tabela: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#f1f5f9" },
    th: { padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#374151" },
    tr: { borderBottom: "1px solid #e5e7eb" },
    td: { padding: "12px", verticalAlign: "top", fontSize: "14px" },
}