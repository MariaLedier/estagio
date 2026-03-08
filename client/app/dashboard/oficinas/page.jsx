"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient.js"
import toast from "react-hot-toast"

export default function OficinaPage() {

  const [oficinas, setOficinas] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [oficinaEditando, setOficinaEditando] = useState(null)

  const [nome, setNome] = useState("")
  const [datacadastro, setDatacadastro] = useState("")
  const [cidade, setCidade] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carreagarOficina()
  }, [])

  async function carreagarOficina() {
    try {
      const response = await apiClient.get("/oficina")
      setOficinas(response)
    } catch {
      toast.error("Erro ao carregar oficina")
    }
  }


  // ---------------- EDIÇÃO DE MODAL --------------------
  function abrirNovo() {
    setOficinaEditando(null)
    setNome("")
    setDatacadastro("")
    setCidade("")
    setModalAberto(true)
  }

  function abrirEdicao(oficinas) {
    setOficinaEditando(oficinas)
    setNome(oficinas.nome)
    setDatacadastro(oficinas.datacadastro)
    setCidade(oficinas.cidade)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setOficinaEditando(null)
  }


  // --------------------GRAVAR Oficina / ALTERAR ---------------------------

  async function salvarOficina(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (oficinaEditando) {
        await apiClient.put("/oficina", {
          id: oficinaEditando.id,
          nome,
          datacadastro,
          cidade
        })
        toast.success("Oficina alterada com sucesso!")
      } else {
        await apiClient.post("/oficina", { nome, datacadastro, cidade})
        toast.success("Oficina cadastrada com sucesso!")
      }

      fecharModal()
      carreagarOficina()

    } catch {
      toast.error("Erro ao salvar Oficina")
    } finally {
      setLoading(false)
    }
  }
  // -----------------------------EXCLUIR ----------------------------------
  async function excluir(id) {
    if (!confirm("Deseja realmente excluir esta Oficina?")) return

    try {
      await apiClient.delete("/oficina/" + id)
      toast.success("Oficina excluída com sucesso!")
      carreagarOficina()
    } catch {
      toast.error("Erro ao excluir Oficina")
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>

          <h1 style={styles.title}>
            <i className="fas fa-building flag" style={{ marginRight: "8px" }}></i>
            Gerenciamento de Oficinas
          </h1>

          <button onClick={abrirNovo} style={styles.buttonPrimary}>
            <i className="fas fa-plus" style={{ marginRight: "6px" }}></i>
            Nova Oficina
          </button>

        </div>

        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Data Cadastro</th>
              <th>Cidade</th>
              <th style={{ textAlign: "center" }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {!Array.isArray(oficinas) ? (
              <tr>
                <td colSpan="4" style={styles.emptyState}>
                  <div style={styles.emptyContainer}>
                    <p style={styles.emptyTitle}>Nenhuma Oficina cadastrado</p>
                    <p style={styles.emptyText}>
                      Clique em <strong>+ Nova Oficina</strong> para começar.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              oficinas.map((s) => (
                <tr key={s.id} style={styles.tableRow}>
                  <td style={styles.td}>{s.id}</td>
                  <td style={styles.td}>{s.nome}</td>
                   <td style={styles.td}>{s.datacadastro}</td>
                    <td style={styles.td}>{s.cidade}</td>
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
              {oficinaEditando ? "Editar Oficina" : "Nova Ofcina"}
            </h2>

            <form onSubmit={salvarOficina}>
              <div style={styles.inputGroup}>
                <label>Nome da Oficina</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

               <div style={styles.inputGroup}>
                <label>Data de Cadastro</label>
                <input
                  type="date"
                  value={datacadastro}
                  onChange={(e) => setDatacadastro(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
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