"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"

export default function SelecionarVeiculoPage() {

    const router = useRouter()
    const [veiculos, setVeiculos] = useState([])
    const [pesquisa, setPesquisa] = useState("")

    useEffect(() => {
        carregarVeiculos()
    }, [])

    async function carregarVeiculos() {
        try {
            const dados = await apiClient.get("/veiculo")
            setVeiculos(dados)
        } catch {
            toast.error("Erro ao carregar veículos")
        }
    }

    const veiculosFiltrados = veiculos.filter((v) => {
        const termo = pesquisa.toLowerCase()
        const placa = v.placa?.toLowerCase() || ""
        const modelo = v.modelo?.nome?.toLowerCase() || ""
        const marca = v.marca?.nome?.toLowerCase() || ""
        return placa.includes(termo) || modelo.includes(termo) || marca.includes(termo)
    })

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                <h1 style={styles.title}>Abastecimento</h1>
                <p style={styles.subtitle}>Selecione o veículo para registrar o abastecimento</p>

                <input
                    placeholder="Buscar por placa, modelo ou marca..."
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                    style={styles.search}
                />

                <div style={styles.grid}>
                    {veiculosFiltrados.length === 0 ? (
                        <p style={{ color: "#9ca3af" }}>Nenhum veículo encontrado</p>
                    ) : (
                        veiculosFiltrados.map((v) => (
                            <div
                                key={v.id}
                                onClick={() => router.push(`/dashboard/abastecimento/${v.id}`)}
                                style={styles.card}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.18)"}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)"}
                            >
                                <div style={styles.cardIcon}>🚗</div>
                                <div style={styles.cardPlaca}>{v.placa}</div>
                                <div style={styles.cardModelo}>
                                    {v.marca?.nome || ""} {v.modelo?.nome || ""}
                                </div>
                                <div style={styles.cardAno}>{v.ano || ""}</div>
                                <span style={{
                                    ...styles.cardStatus,
                                    background: v.status === "ATIVO" ? "#22c55e" : "#ef4444"
                                }}>
                                    {v.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "30px 20px",
        display: "flex",
        justifyContent: "center"
    },
    container: {
        width: "100%",
        maxWidth: "1100px"
    },
    title: {
        fontSize: "28px",
        fontWeight: "bold",
        margin: 0
    },
    subtitle: {
        color: "#6b7280",
        marginTop: "6px",
        marginBottom: "20px"
    },
    search: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        marginBottom: "24px",
        boxSizing: "border-box"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px"
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "14px",
        padding: "20px",
        cursor: "pointer",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        border: "2px solid transparent"
    },
    cardIcon: {
        fontSize: "36px",
        marginBottom: "6px"
    },
    cardPlaca: {
        fontSize: "18px",
        fontWeight: "bold",
        letterSpacing: "2px"
    },
    cardModelo: {
        fontSize: "13px",
        color: "#6b7280",
        textAlign: "center"
    },
    cardAno: {
        fontSize: "13px",
        color: "#9ca3af"
    },
    cardStatus: {
        marginTop: "6px",
        color: "#fff",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "bold"
    }
}