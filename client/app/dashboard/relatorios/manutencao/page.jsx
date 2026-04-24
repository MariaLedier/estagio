"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"

export default function RelatorioManutencaoPage() {

    const [veiculos, setVeiculos] = useState([])
    const [servicos, setServicos] = useState([])
    const [resultados, setResultados] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [jaBuscou, setJaBuscou] = useState(false)

    // Filtros
    const [veiculoFiltro, setVeiculoFiltro] = useState("")
    const [servicoFiltro, setServicoFiltro] = useState("")
    const [dataInicio, setDataInicio] = useState("")
    const [dataFim, setDataFim] = useState("")

    useEffect(() => {
        carregarVeiculos()
        carregarServicos()
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

    // Busca todas as manutenções e filtra no front
    async function buscar() {
        setCarregando(true)
        setJaBuscou(true)
        try {
            const dados = await apiClient.get("/manutencao")
            let lista = Array.isArray(dados) ? dados : []

            // Filtro por veículo
            if (veiculoFiltro) {
                lista = lista.filter(m =>
                    String(m.veiculo?.id ?? m.veiculo) === String(veiculoFiltro)
                )
            }

            // Filtro por serviço (verifica nos itens da manutenção)
            if (servicoFiltro) {
                lista = lista.filter(m =>
                    m.itens && m.itens.some(i =>
                        String(i.servico?.id ?? i.servico) === String(servicoFiltro)
                    )
                )
            }

            // Filtro por data início
            if (dataInicio) {
                lista = lista.filter(m => {
                    if (!m.data) return false
                    return new Date(m.data) >= new Date(dataInicio)
                })
            }

            // Filtro por data fim
            if (dataFim) {
                lista = lista.filter(m => {
                    if (!m.data) return false
                    return new Date(m.data) <= new Date(dataFim)
                })
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
        setDataInicio("")
        setDataFim("")
        setResultados([])
        setJaBuscou(false)
    }

    // ---- Cálculos de totais ----

    // Total geral de todas as manutenções filtradas
    const totalGeral = resultados.reduce((acc, m) => {
        const totalItens = (m.itens || []).reduce((s, i) => s + Number(i.valor || 0), 0)
        return acc + totalItens
    }, 0)

    // Agrupa por veículo para mostrar gasto por veículo
    const gastosPorVeiculo = resultados.reduce((acc, m) => {
        const placa = m.veiculo?.placa || "Sem placa"
        const total = (m.itens || []).reduce((s, i) => s + Number(i.valor || 0), 0)
        if (!acc[placa]) acc[placa] = 0
        acc[placa] += total
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

    return (
        <div style={s.page}>
            <div style={s.card}>

                {/* TÍTULO */}
                <div style={s.topo}>
                    <div>
                        <h1 style={s.titulo}>📋 Relatório de Manutenções</h1>
                        <p style={s.subtitulo}>Filtre por veículo, serviço ou período para ver os gastos</p>
                    </div>
                </div>

                {/* FILTROS */}
                <div style={s.filtrosBox}>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Veículo</label>
                        <select
                            value={veiculoFiltro}
                            onChange={e => setVeiculoFiltro(e.target.value)}
                            style={s.input}
                        >
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
                        <select
                            value={servicoFiltro}
                            onChange={e => setServicoFiltro(e.target.value)}
                            style={s.input}
                        >
                            <option value="">Todos os serviços</option>
                            {servicos.map(sv => (
                                <option key={sv.id} value={sv.id}>{sv.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Data inicial</label>
                        <input
                            type="date"
                            value={dataInicio}
                            onChange={e => setDataInicio(e.target.value)}
                            style={s.input}
                        />
                    </div>

                    <div style={s.filtroGrupo}>
                        <label style={s.label}>Data final</label>
                        <input
                            type="date"
                            value={dataFim}
                            onChange={e => setDataFim(e.target.value)}
                            style={s.input}
                        />
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

                {/* CARDS DE RESUMO — aparecem só após busca */}
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

                    </div>
                )}

                {/* GASTO POR VEÍCULO — aparece só se tiver mais de um veículo no resultado */}
                {jaBuscou && Object.keys(gastosPorVeiculo).length > 1 && (
                    <div style={{ marginBottom: "24px" }}>
                        <h3 style={{ marginBottom: "12px", fontSize: "15px", color: "#374151" }}>
                            💰 Gasto por veículo
                        </h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {Object.entries(gastosPorVeiculo)
                                .sort((a, b) => b[1] - a[1])
                                .map(([placa, total]) => (
                                    <div key={placa} style={s.veiculoChip}>
                                        <span style={{ fontWeight: "bold" }}>{placa}</span>
                                        <span style={{ color: "#2563eb", fontWeight: "bold" }}>
                                            {formatarReais(total)}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                {/* TABELA DE RESULTADOS */}
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
                                                    padding: "3px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold"
                                                }}>
                                                    {m.tipo}
                                                </span>
                                            </td>

                                            <td style={s.td}>{formatarData(m.data)}</td>

                                            <td style={s.td}>
                                                <span style={{
                                                    background: corStatus(m.status),
                                                    color: "#fff",
                                                    padding: "3px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold"
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
                                                                {item.oficina?.nome ? ` — ${item.oficina.nome}` : ""}
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

                            {/* RODAPÉ COM TOTAL */}
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

    veiculoChip: { display: "flex", gap: "10px", background: "#f1f5f9", padding: "8px 14px", borderRadius: "8px", fontSize: "13px", alignItems: "center" },

    vazio: { textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "15px" },

    tabela: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#f1f5f9" },
    th: { padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "700", color: "#374151" },
    tr: { borderBottom: "1px solid #e5e7eb" },
    td: { padding: "12px", verticalAlign: "top", fontSize: "14px" },
}