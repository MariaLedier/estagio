"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/utils/apiClient"
import Link from "next/link"
import ModalVeiculo from "@/components/ModalVeiculo.jsx"


export default function DashboardPage() {

    const [modalAberto, setModalAberto] = useState(false)

    const [veiculos, setVeiculos] = useState([])
    const [notificacoes] = useState(3)

    useEffect(() => {
        carregarVeiculos()
    }, [])

    async function carregarVeiculos() {
        const response = await apiClient.get("/veiculo")
        if (response) setVeiculos(response)
    }

    return (
        <>
            {/* TOP BAR */}
            <div className="top-bar d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="m-0">Dashboard</h2>
                    <span className="text-muted">Bem-vindo ao controle de frotas</span>
                </div>

                {/* NOTIFICAÇÃO */}
                <div className="notification-wrapper">
                    <div className="notification-icon">
                        🔔
                        {notificacoes > 0 && (
                            <span className="notification-badge">
                                {notificacoes}
                            </span>
                        )}
                    </div>
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

                <div className="col-6 col-md-3">
                    <div className="stat-card">
                        <h6>Em Manutenção</h6>
                        <h3>8</h3>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="stat-card">
                        <h6>Alertas Ativos</h6>
                        <h3>12</h3>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="stat-card">
                        <h6>Gasto Combustível</h6>
                        <h3>R$ 14.500</h3>
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
                {veiculos.map((veiculo) => (
                    <div key={veiculo.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div className="vehicle-card">

                            <h5>🚗 {veiculo.modelo}</h5>
                            <p><strong>Placa:</strong> {veiculo.placa}</p>
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