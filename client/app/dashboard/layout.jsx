"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@/app/context/userContext.jsx"

export default function DashboardLayout({ children }) {

    const { user, logout } = useUser()
    const [openGerenciar, setOpenGerenciar] = useState(false)
    const [openRelatorios, setOpenRelatorios] = useState(false)
    const [menuAberto, setMenuAberto] = useState(false)

    const isAdmin = user?.tipo === 2

    return (
        <div className="admin-container">

            {/* SIDEBAR */}
            <div className={`sidebar ${menuAberto ? "open" : ""} `}>

                <div className="logo">
                    <Image
                        src="/logo.png"
                        alt="CarControl Logo"
                        width={400}
                        height={100}
                        priority
                        style={{ objectFit: "contain" }}
                    />
                </div>

                {/* INFO DO USUÁRIO LOGADO */}
                <div style={{
                    padding: "10px 16px",
                    marginBottom: "8px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    fontSize: "13px"
                }}>
                    <div style={{ fontWeight: "700", color: "#fff" }}>{user?.nome}</div>
                    <div style={{
                        fontSize: "11px",
                        color: isAdmin ? "#93c5fd" : "#86efac",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        marginTop: "2px"
                    }}>
                        {isAdmin ? "👑 Admin" : "🔑 Vendedor"}
                    </div>
                </div>

                <ul className="menu">

                    {/* Dashboard — só ADMIN */}
                    {isAdmin && (
                        <li>
                            <Link href="/dashboard" className="menu-item">
                                <i className="fas fa-chart-line"></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>
                    )}

                    {/* Abastecimento */}
                    <li>
                        <Link href="/dashboard/abastecimento" className="menu-item">
                            <i className="fas fa-gas-pump"></i>
                            <span>Abastecimento</span>
                        </Link>
                    </li>

                    {/* Manutenção */}
                    <li>
                        <Link href="/dashboard/manutencao" className="menu-item">
                            <i className="fas fa-car"></i>
                            <span>Manutenção</span>
                        </Link>
                    </li>



                    {/* Gerenciar — só ADMIN */}
                    {isAdmin && (
                        <>
                            <li
                                className={`gerenciar-btn ${openGerenciar ? "open" : ""}`}
                                onClick={() => setOpenGerenciar(!openGerenciar)}
                            >
                                <div>
                                    <i className="fas fa-cog"></i>
                                    <span>Gerenciar</span>
                                </div>
                                <i className={`fas ${openGerenciar ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                            </li>

                            {openGerenciar && (
                                <ul className="submenu">
                                    <li>
                                        <Link href="/dashboard/pneus">
                                            <i className="fas fa-circle-notch"></i>
                                            <span>Pneus</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dashboard/servicos">
                                            <i className="fas fa-wrench"></i>
                                            <span>Serviços</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dashboard/usuarios">
                                            <i className="fas fa-user"></i>
                                            <span>Usuários</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dashboard/oficinas">
                                            <i className="fas fa-building"></i>
                                            <span>Oficinas</span>
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </>
                    )}


                    {/* Relatórios — ADMIN e VENDEDOR */}
                    <li
                        className={`gerenciar-btn ${openRelatorios ? "open" : ""}`}
                        onClick={() => setOpenRelatorios(!openRelatorios)}
                    >
                        <div>
                            <i className="fas fa-file-alt"></i>
                            <span>Relatórios</span>
                        </div>
                        <i className={`fas ${openRelatorios ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                    </li>

                    {openRelatorios && (
                        <ul className="submenu">
                            <li>
                                <Link href="/dashboard/relatorios/manutencao">
                                    <i className="fas fa-wrench"></i>
                                    <span>Manutenção</span>
                                </Link>
                            </li>
                        </ul>
                    )}

                    {/* LOGOUT */}
                    <li>
                        <button
                            onClick={logout}
                            className="menu-item"
                            style={{
                                width: "100%",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                color: "#fca5a5"
                            }}
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Sair</span>
                        </button>
                    </li>

                </ul>
            </div>

            {/* CONTEÚDO */}
            <div className="content">
                <div className="topbar">
                    <button
                        className="menu-toggle"
                        onClick={() => setMenuAberto(!menuAberto)}
                    >
                        ☰
                    </button>
                </div>
                {children}
            </div>

        </div>
    )
}