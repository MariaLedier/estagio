"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"

// ─── COR POR ESTADO ───────────────────────────────────────────────────────────

function corDoPneu(estado) {
    if (estado === "Bom")   return { fundo: "#16a34a", texto: "#fff", borda: "#15803d" }
    if (estado === "Médio") return { fundo: "#f59e0b", texto: "#fff", borda: "#d97706" }
    if (estado === "Ruim")  return { fundo: "#ef4444", texto: "#fff", borda: "#dc2626" }
    return { fundo: "#9ca3af", texto: "#fff", borda: "#6b7280" }
}

// ─── POSIÇÕES DOS PNEUS NO DESENHO ────────────────────────────────────────────

const POSICOES = [
    { key: "Dianteiro Esquerdo", label: "Dianteiro\nEsquerdo", style: { top: 36,  left:  -52 } },
    { key: "Dianteiro Direito",  label: "Dianteiro\nDireito",  style: { top: 36,  right: -52 } },
    { key: "Traseiro Esquerdo",  label: "Traseiro\nEsquerdo",  style: { bottom: 36, left: -52 } },
    { key: "Traseiro Direito",   label: "Traseiro\nDireito",   style: { bottom: 36, right: -52 } },
    { key: "Estepe",             label: "Estepe",              style: { bottom: -70, left: "50%", transform: "translateX(-50%)" } },
]

// ─── PNEU INDIVIDUAL ─────────────────────────────────────────────────────────

function Pneu({ pneu, posicao }) {
    const cor    = corDoPneu(pneu?.estado)
    const marca  = pneu?.marca  || "—"
    const medida = pneu?.medida || "—"
    const estado = pneu?.estado || "—"

    return (
        <div
            title={`${posicao.key}\n${marca} ${medida}\nEstado: ${estado}`}
            style={{
                position: "absolute",
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: cor.fundo,
                border: `3px solid ${cor.borda}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,.25)",
                cursor: "default",
                ...posicao.style,
            }}
        >
            <span style={{ fontSize: 9, fontWeight: 700, color: cor.texto, textAlign: "center", lineHeight: 1.2, maxWidth: 60, wordBreak: "break-word" }}>
                {marca}
            </span>
            <span style={{ fontSize: 8, color: cor.texto, opacity: .9, marginTop: 2 }}>
                {estado}
            </span>
        </div>
    )
}

// ─── LEGENDA ──────────────────────────────────────────────────────────────────

function Legenda() {
    const itens = [
        { estado: "Bom",   cor: "#16a34a" },
        { estado: "Médio", cor: "#f59e0b" },
        { estado: "Ruim",  cor: "#ef4444" },
        { estado: "—",     cor: "#9ca3af" },
    ]

    return (
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            {itens.map((item) => (
                <div key={item.estado} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.cor }} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>
                        {item.estado === "—" ? "Não cadastrado" : item.estado}
                    </span>
                </div>
            ))}
        </div>
    )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function CarroPneus({ veiculoId }) {

    const [pneus,   setPneus]   = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!veiculoId) return
        setLoading(true)
        apiClient.get("/pneu/veiculo/" + veiculoId)
            .then((dados) => setPneus(Array.isArray(dados) ? dados : []))
            .catch(() => setPneus([]))
            .finally(() => setLoading(false))
    }, [veiculoId])

    // Mapeia posição → objeto pneu para acesso rápido
    function pneuDaPosicao(posicaoKey) {
        return pneus.find((p) => p.posicao === posicaoKey) || null
    }

    if (loading) return (
        <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            Carregando pneus...
        </div>
    )

    return (
        <div style={{ marginTop: 20, borderTop: "1px solid #e5e7eb", paddingTop: 24 }}>

            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: "bold", color: "#111827" }}>
                🔵 Situação dos Pneus
            </h3>

            {/* WRAPPER com espaço para estepe */}
            <div style={{ paddingBottom: 80 }}>
                {/* CORPO DO CARRO */}
                <div style={{
                    position: "relative",
                    width: 200,
                    height: 300,
                    margin: "0 auto",
                    background: "linear-gradient(180deg, #e2e8f0 0%, #f1f5f9 100%)",
                    borderRadius: 36,
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.10)",
                    border: "2px solid #cbd5e1",
                }}>

                    {/* PARA-BRISA DIANTEIRO */}
                    <div style={{
                        position: "absolute",
                        top: 28, left: 24, right: 24, height: 52,
                        background: "rgba(147,197,253,.45)",
                        borderRadius: "14px 14px 6px 6px",
                        border: "1.5px solid #bfdbfe",
                    }} />

                    {/* PARA-BRISA TRASEIRO */}
                    <div style={{
                        position: "absolute",
                        bottom: 28, left: 24, right: 24, height: 44,
                        background: "rgba(147,197,253,.35)",
                        borderRadius: "6px 6px 14px 14px",
                        border: "1.5px solid #bfdbfe",
                    }} />

                    {/* DIVISÓRIA CENTRAL */}
                    <div style={{
                        position: "absolute",
                        top: "50%", left: 16, right: 16,
                        height: 1,
                        background: "#cbd5e1",
                        transform: "translateY(-50%)",
                    }} />

                    {/* PNEUS */}
                    {POSICOES.map((pos) => (
                        <Pneu
                            key={pos.key}
                            posicao={pos}
                            pneu={pneuDaPosicao(pos.key)}
                        />
                    ))}

                </div>
            </div>

            <Legenda />

            {/* TABELA RESUMO */}
            <div style={{ marginTop: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "#f1f5f9" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Posição</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Marca</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Medida</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {POSICOES.map((pos) => {
                            const p   = pneuDaPosicao(pos.key)
                            const cor = corDoPneu(p?.estado)
                            return (
                                <tr key={pos.key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "8px 10px", fontWeight: 600, color: "#374151" }}>{pos.key}</td>
                                    <td style={{ padding: "8px 10px", color: "#374151" }}>{p?.marca  || "—"}</td>
                                    <td style={{ padding: "8px 10px", color: "#374151" }}>{p?.medida || "—"}</td>
                                    <td style={{ padding: "8px 10px" }}>
                                        {p?.estado ? (
                                            <span style={{
                                                background: cor.fundo, color: cor.texto,
                                                padding: "2px 10px", borderRadius: 20,
                                                fontSize: 11, fontWeight: 700,
                                            }}>
                                                {p.estado}
                                            </span>
                                        ) : (
                                            <span style={{ color: "#9ca3af" }}>—</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}