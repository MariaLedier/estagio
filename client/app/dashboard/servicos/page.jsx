"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient"
import toast from "react-hot-toast"

export default function ServicosPage() {

  const [servicos, setServicos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [servicoEditando, setServicoEditando] = useState(null)

  const [nome, setNome] = useState("")
  const [valor, setValor] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarServico()
  }, [])

  async function carregarServico() {
    try {
      const response = await apiClient.get("/servico")
      setServicos(response)
    } catch {
      toast.error("Erro ao carregar serviços")
    }
  }


  // ---------------- EDIÇÃO DE MODAL --------------------
  function abrirNovo() {
    setServicoEditando(null)
    setNome("")
    setValor("")
    setModalAberto(true)
  }

  function abrirEdicao(servico) {
    setServicoEditando(servico)
    setNome(servico.nome)
    setValor(servico.valor)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setServicoEditando(null)
  }


  // --------------------GRAVAR SERVIÇO / ALTERAR ---------------------------

  async function salvarServico(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (servicoEditando) {
        await apiClient.put("/servico", {
          id: servicoEditando.id,
          nome,
          valor
        })
        toast.success("Serviço alterado com sucesso!")
      } else {
        await apiClient.post("/servico", { nome, valor })
        toast.success("Serviço cadastrado com sucesso!")
      }

      fecharModal()
      carregarServico()

    } catch {
      toast.error("Erro ao salvar serviço")
    } finally {
      setLoading(false)
    }
  }
  // -----------------------------EXCLUIR ----------------------------------
  async function excluir(id) {
    if (!confirm("Deseja realmente excluir este serviço?")) return

    try {
      await apiClient.delete("/servico/" + id)
      toast.success("Serviço excluído com sucesso!")
      carregarServico()
    } catch {
      toast.error("Erro ao excluir serviço")
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>

          <h1 style={styles.title}>
            <i className="fas fa-wrench" style={{ marginRight: "8px" }}></i>
            Gerenciamento de Serviços
          </h1>

          <button onClick={abrirNovo} style={styles.buttonPrimary}>
            <i className="fas fa-plus" style={{ marginRight: "6px" }}></i>
            Novo Serviço
          </button>

        </div>

        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Valor</th>
              <th style={{ textAlign: "center" }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {!Array.isArray(servicos) ? (
              <tr>
                <td colSpan="4" style={styles.emptyState}>
                  <div style={styles.emptyContainer}>
                    <p style={styles.emptyTitle}>Nenhum serviço cadastrado</p>
                    <p style={styles.emptyText}>
                      Clique em <strong>+ Novo Serviço</strong> para começar.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              servicos.map((s) => (
                <tr key={s.id} style={styles.tableRow}>
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.nome}</td>
                  <td style={styles.td}>R$ {Number(s.valor).toFixed(2)}</td>
                  <td style={styles.actions}>
                    <button
                      onClick={() => abrirEdicao(s)}
                      style={styles.buttonEdit}
                    >
                      ✏ Editar
                    </button>

                    <button
                      onClick={() => excluir(s.id)}
                      style={styles.buttonDelete}
                    >
                      🗑 Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={{ marginBottom: 20 }}>
              {servicoEditando ? "Editar Serviço" : "Novo Serviço"}
            </h2>

            <form onSubmit={salvarServico}>
              <div style={styles.inputGroup}>
                <label>Nome do Serviço</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.modalButtons}>
                <button
                  type="button"
                  onClick={fecharModal}
                  style={styles.buttonCancel}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={styles.buttonPrimary}
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
const styles = {
page: {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #ffffff, #ffffff)",
  padding: "20px",
  display: "flex",
  justifyContent: "center"
},

  card: {
  width: "100%",
  maxWidth: "1000px",
  backgroundColor: "#fff",
  padding: "25px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  boxSizing: "border-box"
},

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "10px"
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "0.2s"
  },

  td: {
    padding: "10px"
  },

  title: {
    margin: 0,
    fontSize: "24px"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  tableHeader: {
    backgroundColor: "#f1f5f9"
  },

  tableRow: {
    borderBottom: "1px solid #e5e7eb",
    transition: "0.2s"
  },

  actions: {
    display: "flex",
    
    justifyContent: "center",
    gap: "6px"
  },

  buttonPrimary: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  },

  buttonEdit: {
    backgroundColor: "#facc15",
    color: "#000",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  },

  buttonDelete: {
    backgroundColor: "#ef4444",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  },

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(4px)"
  },

  modal: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "16px",
    width: "420px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
  },

  inputGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db"
  },

  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px"
  },

  buttonCancel: {
    backgroundColor: "#9ca3af",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
  }
}