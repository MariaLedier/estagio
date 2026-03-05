"use client"

import { useState } from "react"

export default function VeiculosPage() {

  const [modalAberto, setModalAberto] = useState(false)
  const [step, setStep] = useState(1)

  const [placa, setPlaca] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [kmInicial, setKmInicial] = useState("")

  const [pneus, setPneus] = useState([
    { posicao: "Dianteiro Esquerdo", marca: "", status: "Bom" },
    { posicao: "Dianteiro Direito", marca: "", status: "Bom" },
    { posicao: "Traseiro Esquerdo", marca: "", status: "Bom" },
    { posicao: "Traseiro Direito", marca: "", status: "Bom" }
  ])

  function alterarPneu(index, campo, valor) {
    const novosPneus = [...pneus]
    novosPneus[index][campo] = valor
    setPneus(novosPneus)
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Veículos</h1>

      <button onClick={() => setModalAberto(true)}>
        + Novo Veículo
      </button>

      {modalAberto && (
        <div style={styles.overlay}>
          <div style={styles.modalGrande}>
            <h2>Cadastro de Veículo</h2>

            {step === 1 && (
              <>
                <div style={styles.inputGroup}>
                  <label>Placa</label>
                  <input value={placa} onChange={(e) => setPlaca(e.target.value)} />
                </div>

                <div style={styles.inputGroup}>
                  <label>Marca</label>
                  <input value={marca} onChange={(e) => setMarca(e.target.value)} />
                </div>

                <div style={styles.inputGroup}>
                  <label>Modelo</label>
                  <input value={modelo} onChange={(e) => setModelo(e.target.value)} />
                </div>

                <div style={styles.inputGroup}>
                  <label>KM Inicial</label>
                  <input
                    type="number"
                    value={kmInicial}
                    onChange={(e) => setKmInicial(e.target.value)}
                  />
                </div>

                <div style={styles.modalButtons}>
                  <button onClick={() => setModalAberto(false)}>
                    Cancelar
                  </button>

                  <button onClick={() => setStep(2)}>
                    Próximo →
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Cadastro de Pneus</h3>

                <div style={styles.carLayout}>
                  {pneus.map((pneu, index) => (
                    <div key={index} style={styles.pneuCard}>
                      <strong>{pneu.posicao}</strong>

                      <input
                        placeholder="Marca do pneu"
                        value={pneu.marca}
                        onChange={(e) =>
                          alterarPneu(index, "marca", e.target.value)
                        }
                      />

                      <select
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
                </div>

                <div style={styles.modalButtons}>
                  <button onClick={() => setStep(1)}>
                    ← Voltar
                  </button>

                  <button
                    onClick={() =>
                      console.log({ placa, marca, modelo, kmInicial, pneus })
                    }
                  >
                    Salvar Veículo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
  modalGrande: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "600px",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px"
  },
  carLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginTop: "20px"
  },
  pneuCard: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "25px"
  }
}