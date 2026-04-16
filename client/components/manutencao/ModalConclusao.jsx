"use client"

import { useRef } from "react"
import toast from "react-hot-toast"
import { formatarMoeda } from "@/utils/validacao.js"

export default function ModalConclusao({ aberto, fechar, total, onConfirmar, loading }) {

    const formaPagamento = useRef()
    const observacao = useRef()

    function confirmar() {
        if (!formaPagamento.current.value) {
            toast.error("Selecione a forma de pagamento")
            return
        }
        onConfirmar({
            formaPagamento: formaPagamento.current.value,
            descricao: observacao.current.value
        })
    }

    if (!aberto) return null

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                <h2 style={{ marginBottom: "6px" }}>Concluir Manutenção</h2>
                <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
                    Total: <strong>{Number(total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                </p>

                <div style={styles.grupo}>
                    <label>Forma de Pagamento:</label>
                    <select ref={formaPagamento} style={styles.input}>
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="PIX">PIX</option>
                        <option value="BOLETO">Boleto</option>
                        <option value="CREDITO">Cartão de Crédito</option>
                        <option value="DEBITO">Cartão de Débito</option>
                    </select>
                </div>

                <div style={styles.grupo}>
                    <label>Observação (opcional):</label>
                    <textarea ref={observacao}
                        style={{ ...styles.input, height: "70px", resize: "vertical" }}
                        placeholder="Ex: Pago na oficina João..." />
                </div>

                <div style={styles.botoes}>
                    <button onClick={fechar} style={styles.btnCancelar}>Cancelar</button>
                    <button onClick={confirmar} disabled={loading}
                        style={{ ...styles.btnConfirmar, opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Salvando..." : "Confirmar e Concluir"}
                    </button>
                </div>

            </div>
        </div>
    )
}

const styles = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 999 },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "420px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" },
    grupo: { marginBottom: "14px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" },
    botoes: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
    btnCancelar: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" },
    btnConfirmar: { backgroundColor: "#22c55e", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }
}