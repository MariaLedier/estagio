"use client"

import { useState } from "react"
import { apiClient } from "@/utils/apiClient.js"

export default function ModalVeiculo({ aberto, fechar, atualizarLista }) {

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // ---------------- DADOS VEÍCULO ----------------
  const [placa, setPlaca] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [ano, setAno] = useState("")

  // ---------------- PNEUS ----------------
  const [pneus, setPneus] = useState([
  { posicao: "Dianteiro Esquerdo", marca: "", status: "Bom" },
  { posicao: "Dianteiro Direito", marca: "", status: "Bom" },
  { posicao: "Traseiro Esquerdo", marca: "", status: "Bom" },
  { posicao: "Traseiro Direito", marca: "", status: "Bom" },
  { posicao: "Estepe", marca: "", status: "Bom" }
])

  function alterarPneu(index, campo, valor) {
    const novos = [...pneus]
    novos[index][campo] = valor
    setPneus(novos)
  }

  async function salvarVeiculo() {
    try {
      setLoading(true)

      await apiClient.post("/veiculo", {
        placa,
        marca,
        modelo,
        ano,
        pneus
      })

      atualizarLista()
      fechar()

      // resetar
      setStep(1)
      setPlaca("")
      setMarca("")
      setModelo("")
      setAno("")
      setPneus([
        { posicao: "Dianteiro Esquerdo", marca: "", status: "Bom" },
        { posicao: "Dianteiro Direito", marca: "", status: "Bom" },
        { posicao: "Traseiro Esquerdo", marca: "", status: "Bom" },
        { posicao: "Traseiro Direito", marca: "", status: "Bom" }
      ])

    } catch (error) {
      console.error("Erro ao salvar veículo", error)
    } finally {
      setLoading(false)
    }
  }

  if (!aberto) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <h3 className="mb-4">Cadastrar Veículo</h3>

        {/* INDICADOR DE PASSO */}
        <div className="mb-4">
          <strong>Passo {step} de 2</strong>
        </div>

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <>
            <div className="mb-3">
              <label>Placa</label>
              <input
                className="form-control"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Marca</label>
              <input
                className="form-control"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label>Modelo</label>
              <input
                className="form-control"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label>Ano</label>
              <input
                className="form-control"
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={fechar}>
                Cancelar
              </button>

              <button
                className="btn btn-warning"
                onClick={() => setStep(2)}
              >
                Próximo →
              </button>
            </div>
          </>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <>
            <h5 className="mb-3">Cadastro de Pneus</h5>

            {pneus.map((pneu, index) => (
              <div key={index} className="border rounded p-3 mb-3">

                <strong>{pneu.posicao}</strong>

                <input
                  className="form-control mt-2"
                  placeholder="Marca do pneu"
                  value={pneu.marca}
                  onChange={(e) =>
                    alterarPneu(index, "marca", e.target.value)
                  }
                />

                <select
                  className="form-select mt-2"
                  value={pneu.status}
                  onChange={(e) =>
                    alterarPneu(index, "status", e.target.value)
                  }
                >
                  <option>Bom</option>
                  <option>Médio</option>
                  <option>Ruim</option>
                </select>

              </div>
            ))}

            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                ← Voltar
              </button>

              <button
                className="btn btn-warning"
                onClick={salvarVeiculo}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Veículo"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },
  modal: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "600px",
    maxHeight: "90vh",
    overflowY: "auto"
  }
}