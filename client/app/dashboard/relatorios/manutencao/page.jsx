"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"

export default function RelatorioManutencaoPage() {

    const [veiculos, setVeiculos] = useState([])
    const [servicos, setServicos] = useState([])
    const [oficinas, setOficinas] = useState([])
    const [resultados, setResultados] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [jaBuscou, setJaBuscou] = useState(false)

    // Filtros
    const [veiculoFiltro, setVeiculoFiltro] = useState("")
    const [servicoFiltro, setServicoFiltro] = useState("")
    const [oficinaFiltro, setOficinaFiltro] = useState("")
    const [dataInicio, setDataInicio] = useState("")
    const [dataFim, setDataFim] = useState("")

    useEffect(() => {
        carregarVeiculos()
        carregarServicos()
        carregarOficinas()
    }, [])

    async function carregarVeiculos() {
        try {
            const dados = await apiClient.get("/veiculo")
            setVeiculos(Array.isArray(dados) ? dados : [])
        } catch {
            setVeiculos([])
        }
    }

    async function carregarServicos() {
        try {
            const dados = await apiClient.get("/servico")
            setServicos(Array.isArray(dados) ? dados : [])
        } catch {
            setServicos([])
        }
    }

    async function carregarOficinas() {
        try {
            const dados = await apiClient.get("/oficina")
            setOficinas(Array.isArray(dados) ? dados : [])
        } catch {
            setOficinas([])
        }
    }

    async function buscar() {
        setCarregando(true)
        setJaBuscou(true)
        try {
            const dados = await apiClient.get("/manutencao")
            let lista = Array.isArray(dados) ? dados : []

            if (veiculoFiltro) {
                lista = lista.filter(m =>
                    String(m.veiculo?.id ?? m.veiculo) === String(veiculoFiltro)
                )
            }

            if (servicoFiltro) {
                lista = lista.filter(m =>
                    m.itens && m.itens.some(i =>
                        String(i.servico?.id ?? i.servico) === String(servicoFiltro)
                    )
                )
            }

            // Filtro por oficina: mantém a manutenção se ao menos um item é dessa oficina
            if (oficinaFiltro) {
                lista = lista.filter(m =>
                    m.itens && m.itens.some(i =>
                        String(i.oficina?.id ?? i.oficina) === String(oficinaFiltro)
                    )
                )
            }

            if (dataInicio) {
                lista = lista.filter(m => m.data && new Date(m.data) >= new Date(dataInicio))
            }

            if (dataFim) {
                lista = lista.filter(m => m.data && new Date(m.data) <= new Date(dataFim))
            }

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
        setServicoFiltro("")
        setOficinaFiltro("")
        setDataInicio("")
        setDataFim("")
        setResultados([])
        setJaBuscou(false)
    }

    // ---- Cálculos ----

    const totalGeral = resultados.reduce((acc, m) => {
        return acc + (m.itens || []).reduce((s, i) => s + Number(i.valor || 0), 0)
    }, 0)

    const gastosPorVeiculo = resultados.reduce((acc, m) => {
        const placa = m.veiculo?.placa || "Sem placa"
        const total = (m.itens || []).reduce((s, i) => s + Number(i.valor || 0), 0)
        acc[placa] = (acc[placa] || 0) + total
        return acc
    }, {})

    // Agrupa gastos por oficina somando apenas os itens daquela oficina
    const gastosPorOficina = resultados.reduce((acc, m) => {
        (m.itens || []).forEach(i => {
            const nome = i.oficina?.nome || "Sem oficina"
            acc[nome] = (acc[nome] || 0) + Number(i.valor || 0)
        })
        return acc
    }, {})

    // Conta manutenções distintas por oficina (uma manutenção conta para a oficina se tiver ao menos 1 item dela)
    const manutencoesPorOficina = resultados.reduce((acc, m) => {
        const oficinasNaManutencao = new Set(
            (m.itens || []).map(i => i.oficina?.nome || "Sem oficina")
        )
        oficinasNaManutencao.forEach(nome => {
            acc[nome] = (acc[nome] || 0) + 1
        })
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

    function corStatus(valor) {
        if (valor === "AGENDADA") return "#2563eb"
        if (valor === "EM_ANDAMENTO") return "#f59e0b"
        if (valor === "CONCLUIDA") return "#22c55e"
        if (valor === "CANCELADA") return "#ef4444"
        return "#9ca3af"
    }

    const totalOficinas = Object.keys(gastosPorOficina).length

    return (
        <div style={s.page}>
            <div style={s.card}>

                {/* TÍTULO */}
                <div style={s.topo}>
                    <div>
                        <h1 style={s.titulo}>Relatório de Manutenções</h1>
                        <p style={s.subtitulo}>Filtre por veículo, serviço, oficina ou período para ver os gastos</p>
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
                        <label style={s.label}>Serviço</label>
                        <select value={servicoFiltro} onChange={e => setServicoFiltro(e.target.value)} style={s.input}>
                            <option value="">Todos os serviços</option>
                            {servicos.map(sv => (
                                <option key={sv.id} value={sv.id}>{sv.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Oficina</label>
                        <select value={oficinaFiltro} onChange={e => setOficinaFiltro(e.target.value)} style={s.input}>
                            <option value="">Todas as oficinas</option>
                            {oficinas.map(o => (
                                <option key={o.id} value={o.id}>{o.nome}</option>
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
                        <button onClick={limparFiltros} style={s.btnLimpar}>Limpar</button>
                    </div>

                </div>

                {/* CARDS DE RESUMO */}
                {jaBuscou && (
                    <div style={s.resumoBox}>
                        <div style={s.resumoCard}>
                            <div style={s.resumoNumero}>{resultados.length}</div>
                            <div style={s.resumoLabel}>Manutenções encontradas</div>
                        </div>
                        <div style={s.resumoCard}>
                            <div style={s.resumoNumero}>{formatarReais(totalGeral)}</div>
                            <div style={s.resumoLabel}>Total gasto no período</div>
                        </div>
                        <div style={s.resumoCard}>
                            <div style={s.resumoNumero}>
                                {resultados.filter(m => m.status === "CONCLUIDA").length}
                            </div>
                            <div style={s.resumoLabel}>Concluídas</div>
                        </div>
                        <div style={s.resumoCard}>
                            <div style={s.resumoNumero}>
                                {resultados.filter(m => m.status === "AGENDADA").length}
                            </div>
                            <div style={s.resumoLabel}>Agendadas</div>
                        </div>
                        <div style={s.resumoCard}>
                            <div style={s.resumoNumero}>{totalOficinas}</div>
                            <div style={s.resumoLabel}>Oficinas envolvidas</div>
                        </div>
                    </div>
                )}

                {/* GASTO POR VEÍCULO */}
                {jaBuscou && Object.keys(gastosPorVeiculo).length > 1 && (
                    <div style={{ marginBottom: "24px" }}>
                        <h3 style={s.secaoTitulo}>🚗 Gasto por veículo</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {Object.entries(gastosPorVeiculo)
                                .sort((a, b) => b[1] - a[1])
                                .map(([placa, total]) => (
                                    <div key={placa} style={s.chip}>
                                        <span style={{ fontWeight: "bold" }}>{placa}</span>
                                        <span style={{ color: "#2563eb", fontWeight: "bold" }}>{formatarReais(total)}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* GASTO POR OFICINA — sempre aparece após busca se houver resultados */}
                {jaBuscou && Object.keys(gastosPorOficina).length > 0 && (
                    <div style={{ marginBottom: "28px" }}>
                        <h3 style={s.secaoTitulo}>🏪 Gasto por local de manutenção</h3>
                        <div style={s.oficinaGrid}>
                            {Object.entries(gastosPorOficina)
                                .sort((a, b) => b[1] - a[1])
                                .map(([nome, total], idx) => {
                                    const percentual = totalGeral > 0 ? (total / totalGeral) * 100 : 0
                                    const qtd = manutencoesPorOficina[nome] || 0
                                    return (
                                        <div key={nome} style={s.oficinaCard}>
                                            <div style={s.oficinaCardTopo}>
                                                <div style={s.oficinaNome}>{nome}</div>
                                                {idx === 0 && Object.keys(gastosPorOficina).length > 1 && (
                                                    <span style={s.badgeMaior}>Maior gasto</span>
                                                )}
                                            </div>
                                            <div style={s.oficinaValor}>{formatarReais(total)}</div>
                                            <div style={s.barraFundo}>
                                                <div style={{ ...s.barraPreenchimento, width: `${percentual}%` }} />
                                            </div>
                                            <div style={s.officinaRodape}>
                                                <span>{percentual.toFixed(1)}% do total</span>
                                                <span>{qtd} manutenção{qtd !== 1 ? "ões" : ""}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                )}

                {/* TABELA */}
                {jaBuscou && (
                    resultados.length === 0 ? (
                        <div style={s.vazio}>
                            Nenhuma manutenção encontrada com os filtros selecionados.
                        </div>
                    ) : (
                        <table style={s.tabela}>
                            <thead style={s.thead}>
                                <tr>
                                    <th style={s.th}>Veículo</th>
                                    <th style={s.th}>Tipo</th>
                                    <th style={s.th}>Data</th>
                                    <th style={s.th}>Status</th>
                                    <th style={s.th}>Serviços realizados</th>
                                    <th style={s.th}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map(m => {
                                    const totalM = (m.itens || []).reduce((s, i) => s + Number(i.valor || 0), 0)
                                    return (
                                        <tr key={m.id} style={s.tr}>

                                            <td style={s.td}>
                                                <div style={{ fontWeight: "bold" }}>{m.veiculo?.placa || "-"}</div>
                                            </td>

                                            <td style={s.td}>
                                                <span style={{
                                                    background: m.tipo === "CORRETIVA" ? "#fee2e2" : "#dbeafe",
                                                    color: m.tipo === "CORRETIVA" ? "#b91c1c" : "#1d4ed8",
                                                    padding: "3px 8px", borderRadius: "6px",
                                                    fontSize: "12px", fontWeight: "bold"
                                                }}>
                                                    {m.tipo}
                                                </span>
                                            </td>

                                            <td style={s.td}>{formatarData(m.data)}</td>

                                            <td style={s.td}>
                                                <span style={{
                                                    background: corStatus(m.status), color: "#fff",
                                                    padding: "3px 8px", borderRadius: "6px",
                                                    fontSize: "12px", fontWeight: "bold"
                                                }}>
                                                    {m.status?.replace("_", " ")}
                                                </span>
                                            </td>

                                            <td style={s.td}>
                                                {m.itens && m.itens.length > 0 ? (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                        {m.itens.map((item, i) => (
                                                            <small key={i} style={{ color: "#6b7280" }}>
                                                                • {item.servico?.nome || "-"}
                                                                {item.oficina?.nome ? (
                                                                    <span style={{ color: "#7c3aed", fontWeight: "500" }}>
                                                                        {" "}@ {item.oficina.nome}
                                                                    </span>
                                                                ) : ""}
                                                                {item.valor ? ` (${formatarReais(item.valor)})` : ""}
                                                            </small>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "#d1d5db" }}>Sem itens</span>
                                                )}
                                            </td>

                                            <td style={{ ...s.td, fontWeight: "bold", color: "#111827" }}>
                                                {formatarReais(totalM)}
                                            </td>

                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: "#f1f5f9" }}>
                                    <td colSpan="5" style={{ ...s.td, textAlign: "right", fontWeight: "bold" }}>
                                        Total geral:
                                    </td>
                                    <td style={{ ...s.td, fontWeight: "bold", color: "#2563eb", fontSize: "16px" }}>
                                        {formatarReais(totalGeral)}
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
    filtroGrupo: { display: "flex", flexDirection: "column", gap: "5px", minWidth: "180px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
    input: { padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", background: "#fff" },

    btnBuscar: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "14px" },
    btnLimpar: { backgroundColor: "#f1f5f9", color: "#374151", padding: "10px 16px", borderRadius: "8px", border: "1px solid #d1d5db", cursor: "pointer", fontSize: "14px" },

    resumoBox: { display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "24px" },
    resumoCard: { flex: "1 1 160px", background: "#f1f5f9", borderRadius: "12px", padding: "16px 20px", textAlign: "center" },
    resumoNumero: { fontSize: "20px", fontWeight: "bold", color: "#111827" },
    resumoLabel: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },

    secaoTitulo: { marginBottom: "12px", fontSize: "15px", fontWeight: "600", color: "#374151" },
    chip: { display: "flex", gap: "10px", background: "#f1f5f9", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", alignItems: "center" },

    // Cards de oficina
    oficinaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" },
    oficinaCard: { background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "16px" },
    oficinaCardTopo: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" },
    oficinaNome: { fontSize: "14px", fontWeight: "700", color: "#4c1d95" },
    badgeMaior: { fontSize: "10px", background: "#7c3aed", color: "#fff", padding: "2px 7px", borderRadius: "20px", whiteSpace: "nowrap" },
    oficinaValor: { fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "10px" },
    barraFundo: { height: "6px", background: "#ede9fe", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" },
    barraPreenchimento: { height: "100%", background: "#7c3aed", borderRadius: "4px", transition: "width 0.4s ease" },
    officinaRodape: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#7c3aed" },

    vazio: { textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "15px" },
    tabela: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#f1f5f9" },
    th: { padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#374151" },
    tr: { borderBottom: "1px solid #e5e7eb" },
    td: { padding: "12px", verticalAlign: "top", fontSize: "14px" },
}