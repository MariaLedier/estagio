'use client'

import { apiClient } from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import { useRef, useContext, use } from "react"
import toast from "react-hot-toast";
import { useUser } from "@/app/context/userContext";
import Image from "next/image";

export default function Login() {

    const nome = useRef();
    const senha = useRef();
    const router = useRouter();
const { setUser } = useUser();

async function autenticar() {
    if (nome.current.value != "" && senha.current.value != "") {
        let obj = {
            nome: nome.current.value,
            senha: senha.current.value
        }

        let response = await apiClient.post("/autenticacao/token", obj);

        if (response) {
            setUser(response.usuario);
            if (response.usuario.tipo === 2)
                router.replace("/dashboard");
            else
                router.replace("/dashboard/manutencao");
        }

    } else {
        toast.error("Preencha nome e senha");
    }
}

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.logoWrap}>
                    <Image src="/logo.png" alt="CarControl" width={200} height={60} priority style={{ objectFit: "contain" }} />
                </div>

                <h2 style={styles.titulo}>Entrar na sua conta</h2>
                <p style={styles.subtitulo}>Use suas credenciais para acessar o sistema</p>

                <div style={styles.form}>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Nome de usuário</label>
                        <input
                            ref={nome}
                            type="text"
                            placeholder="Seu nome"
                            style={styles.input}
                            autoFocus
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Senha</label>
                        <input
                            ref={senha}
                            type="password"
                            placeholder="••••••••"
                            style={styles.input}
                        />
                    </div>

                    <button onClick={autenticar} style={styles.btnEntrar}>
                        Entrar
                    </button>

                </div>
            </div>
        </div>
    )
}

const styles = {
    page: { minHeight: "100vh", background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
    card: { background: "#fff", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" },
    logoWrap: { display: "flex", justifyContent: "center", marginBottom: "24px" },
    titulo: { margin: "0 0 4px 0", fontSize: "22px", fontWeight: "800", color: "#111827", textAlign: "center" },
    subtitulo: { margin: "0 0 28px 0", fontSize: "13px", color: "#6b7280", textAlign: "center" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
    label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
    input: { padding: "11px 14px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", width: "100%", boxSizing: "border-box" },
    btnEntrar: { marginTop: "8px", padding: "13px", background: "linear-gradient(135deg, #1e3a5f, #2563eb)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }
}