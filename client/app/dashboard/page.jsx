"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/utils/apiClient.js"
import Link from "next/link"
import ModalVeiculo from "@/components/ModalVeiculo.jsx"

export default function DashboardPage() {

    const [modalAberto,   setModalAberto]   = useState(false)
    const [veiculos,      setVeiculos]      = useState([])
    const [notificacoes,  setNotificacoes]  = useState([])
    const [mostrarPainel, setMostrarPainel] = useState(false)

    useEffect(() => {
        carregarVeiculos()
        carregarNotificacoes()
    }, [])

    async function carregarVeiculos() {
        const response = await apiClient.get("/veiculo")
        if (response) setVeiculos(response)
    }

    async function carregarNotificacoes() {
        try {
            // Busca todas as manutenções
            const manutencoes = await apiClient.get("/manutencao")
            if (!Array.isArray(manutencoes)) return

            // Pega a data de amanhã no formato YYYY-MM-DD
            const amanha = new Date()
            amanha.setDate(amanha.getDate() + 1)
            const amanhaStr = amanha.toISOString().split("T")[0]

            // Filtra só as manutenções agendadas para amanhã
            const proximas = manutencoes.filter(m => {
                if (m.status !== "AGENDADA") return false
                const dataManutencao = new Date(m.data).toISOString().split("T")[0]
                return dataManutencao === amanhaStr
            })

            setNotificacoes(proximas)

        } catch {
            setNotificacoes([])
        }
    }

    // Formata data para exibição
    function formatarData(valor) {
        if (!valor) return "-"
        return new Date(valor).toLocaleDateString("pt-BR")
    }

    return (
        <>
            {/* TOP BAR */}
            <div className="top-bar d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="m-0">Dashboard</h2>
                    <span className="text-muted">Bem-vindo ao controle de frotas</span>
                </div>

                {/* SINO DE NOTIFICAÇÃO */}
                <div style={{ position: "relative" }}>

                    {/* BOTÃO DO SINO */}
                    <button
                        onClick={() => setMostrarPainel(!mostrarPainel)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "24px",
                            position: "relative",
                            padding: "8px",
                        }}
                    >
                        🔔
                        {/* BOLINHA VERMELHA COM A QUANTIDADE */}
                        {notificacoes.length > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "2px",
                                right: "2px",
                                background: "#ef4444",
                                color: "#fff",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                {notificacoes.length}
                            </span>
                        )}
                    </button>

                    {/* PAINEL DE NOTIFICAÇÕES — aparece ao clicar no sino */}
                    {mostrarPainel && (
                        <>
                            {/* Fundo invisível para fechar ao clicar fora */}
                            <div
                                onClick={() => setMostrarPainel(false)}
                                style={{
                                    position: "fixed",
                                    inset: 0,
                                    zIndex: 998,
                                }}
                            />

                            {/* PAINEL */}
                            <div style={{
                                position: "absolute",
                                top: "48px",
                                right: 0,
                                width: "320px",
                                background: "#fff",
                                borderRadius: "12px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                border: "1px solid #e5e7eb",
                                zIndex: 999,
                                overflow: "hidden",
                            }}>

                            

                                {/* LISTA DE NOTIFICAÇÕES */}
                                {notificacoes.length === 0 ? (
                                    <div style={{
                                        padding: "24px 16px",
                                        textAlign: "center",
                                        color: "#9ca3af",
                                        fontSize: "13px",
                                    }}>
                                        Nenhuma manutenção agendada para amanhã ✅
                                    </div>
                                ) : (
                                    notificacoes.map((m, index) => (
                                        <div key={m.id} style={{
                                            padding: "12px 16px",
                                            borderBottom: index < notificacoes.length - 1 ? "1px solid #f1f5f9" : "none",
                                            background: "#fff",
                                        }}>

                                            {/* ÍCONE + TIPO */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginBottom: "4px",
                                            }}>
                                                <span style={{
                                                    background: m.tipo === "CORRETIVA" ? "#fee2e2" : "#dbeafe",
                                                    color:      m.tipo === "CORRETIVA" ? "#b91c1c" : "#1d4ed8",
                                                    fontSize: "11px",
                                                    fontWeight: "bold",
                                                    padding: "2px 8px",
                                                    borderRadius: "6px",
                                                }}>
                                                    {m.tipo}
                                                </span>
                                                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                                    {formatarData(m.data)}
                                                </span>
                                            </div>

                                            {/* PLACA DO VEÍCULO */}
                                            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#111827" }}>
                                                🚗 {m.veiculo?.placa || "Veículo não informado"}
                                            </div>

                                            {/* DESCRIÇÃO */}
                                            {m.descricao && (
                                                <div style={{
                                                    fontSize: "12px",
                                                    color: "#6b7280",
                                                    marginTop: "2px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}>
                                                    {m.descricao}
                                                </div>
                                            )}

                                         

                                        </div>
                                    ))
                                )}

                            </div>
                        </>
                    )}

                </div>
            </div>


         
            {/* CARDS ESTATÍSTICA */}
            <div className="row g-4 mb-5">
                <div className="col-6 col-md-3">
                    <div className="stat-card">
                        <h6>Total de Veículos</h6>
                        <h3>{veiculos.length}</h3>
                    </div>
                </div>
            </div>

            {/* GRID VEÍCULOS */}
            <div className="row g-4">

                {/* CARD ADICIONAR */}
                <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div
                        className="vehicle-card add-card"
                        onClick={() => setModalAberto(true)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="plus-icon">+</div>
                        <p>Adicionar Veículo</p>
                    </div>
                </div>

                {/* VEÍCULOS CADASTRADOS */}
                {veiculos.map(veiculo => (
                    <div key={veiculo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div className="vehicle-card">
                     
                             <h5>🚗 Placa: {veiculo.placa}</h5>
                            <p><strong>Modelo:</strong> {veiculo.modeloNome}</p>
                            <p><strong>Ano:</strong> {veiculo.ano}</p>
                            <Link
                                href={`/dashboard/veiculos/${veiculo.id}`}
                                className="btn btn-sm btn-warning mt-2 w-100"
                            >
                                Gerenciar
                            </Link>
                        </div>
                    </div>
                ))}

            </div>

            <ModalVeiculo
                aberto={modalAberto}
                fechar={() => setModalAberto(false)}
                atualizarLista={carregarVeiculos}
            />
        </>
    )
}