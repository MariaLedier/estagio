"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardLayout({ children }) {

    const [openGerenciar, setOpenGerenciar] = useState(false)
    const [menuAberto, setMenuAberto] = useState(false)

    return (
        <div className="admin-container">

            {/* SIDEBAR */}
            <div className={`sidebar ${menuAberto ? "open" : ""}`}>

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

                <ul className="menu">

                    <li>
                        <Link href="/dashboard" className="menu-item">
                            <i className="fas fa-chart-line"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <Link href="/dashboard/veiculos" className="menu-item">
                            <i className="fas fa-car"></i>
                            <span>Veículos</span>
                        </Link>
                    </li>

                    {/* GERENCIAR */}
                    <li
                        className={`gerenciar-btn ${openGerenciar ? 'open' : ''}`}
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

                </ul>

            </div>

            {/* CONTEÚDO */}
            <div className="content">

                {/* TOPBAR */}
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