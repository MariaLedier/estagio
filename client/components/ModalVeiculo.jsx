"use client"

import { useState } from "react"
import { apiClient } from "@/utils/apiClient.js"

function PneuInfo({ pneu }) {

  return (
    <div style={{ fontSize: "10px", textAlign: "center" }}>
      <div style={{ fontWeight: "bold" }}>
        {pneu.marca || "—"}
      </div>
      <div>{pneu.estado}</div>
    </div>
  )
}

export default function ModalVeiculo({ aberto, fechar, atualizarLista }) {
  const [pneuExpandido, setPneuExpandido] = useState(null)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pneuSelecionado, setPneuSelecionado] = useState(null)

  // ---------------- DADOS VEÍCULO ----------------
  const [placa, setPlaca] = useState("")
  const [modelo, setModelo] = useState("")
  const [marca, setMarca] = useState("")
  const [ano, setAno] = useState("")
  const [renavam, setRenavam] = useState("")
  const [cor, setCor] = useState("")
  const [kmatual, setKmatual] = useState("")
  const [status, setStatus] = useState("")

  // ---------------- PNEUS ----------------
  const [pneus, setPneus] = useState([
    {
      posicao: "Dianteiro Esquerdo",
      numeroserie: "",
      marca: "",
      medida: "",
      velocidadekm: "",
      dataaquisicao: "",
      valor: "",
      estado: "Bom",
      status: "EM_USO"
    },
    {
      posicao: "Dianteiro Direito",
      numeroserie: "",
      marca: "",
      medida: "",
      velocidadekm: "",
      dataaquisicao: "",
      valor: "",
      estado: "Bom",
      status: "EM_USO"
    },
    {
      posicao: "Traseiro Esquerdo",
      numeroserie: "",
      marca: "",
      medida: "",
      velocidadekm: "",
      dataaquisicao: "",
      valor: "",
      estado: "Bom",
      status: "EM_USO"
    },
    {
      posicao: "Traseiro Direito",
      numeroserie: "",
      marca: "",
      medida: "",
      velocidadekm: "",
      dataaquisicao: "",
      valor: "",
      estado: "Bom",
      status: "EM_USO"
    },
    {
      posicao: "Estepe",
      numeroserie: "",
      marca: "",
      medida: "",
      velocidadekm: "",
      dataaquisicao: "",
      valor: "",
      estado: "Bom",
      status: "EM_ESTOQUE"
    }
  ])
  function corPneu(estado) {
    switch (estado) {
      case "Bom":
        return "#2ecc71"
      case "Médio":
        return "#f1c40f"
      case "Ruim":
        return "#e74c3c"
      default:
        return "#777"
    }
  }

  function alterarPneu(index, campo, valor) {
    const novos = [...pneus]
    novos[index][campo] = valor
    setPneus(novos)
  }

  async function salvarVeiculo() {
    try {
      setLoading(true)

      // 1️⃣ salva veículo
      const response = await apiClient.post("/veiculo", {
        placa,
        modelo,
        marca,
        ano,
        renavam,
        cor,
        kmatual,
        status
      })

      const veiculoId = response.veiculo_id

      // 2️⃣ salvar pneus
      for (let pneu of pneus) {

        await apiClient.post("/pneu", {
          ...pneu,
          veiculo_id: veiculoId
        })

      }

      atualizarLista()
      fechar()

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
              <label>Modelo</label>
              <input
                className="form-control"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
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

            <div className="mb-4">
              <label>Ano</label>
              <input
                className="form-control"
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label>Renavam</label>
              <input
                className="form-control"
                type="number"
                value={renavam}
                onChange={(e) => setRenavam(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label>Cor</label>
              <input
                className="form-control"
                type="text"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label>Km Atual</label>
              <input
                className="form-control"
                type="number"
                value={kmatual}
                onChange={(e) => setKmatual(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label>Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
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
          <div style={{ display: "flex", gap: "30px" }}>

            {/* LADO ESQUERDO - FORM */}
            <div style={{ flex: 1 }}>

              <h5 className="mb-3">Cadastro de Pneus</h5>

              {pneus.map((pneu, index) => (

                <div key={index} className="border rounded mb-2">

                  {/* CABEÇALHO CLICÁVEL */}
                  <div
                    onClick={() =>
                      setPneuExpandido(pneuExpandido === index ? null : index)
                    }
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      background: "#f5f5f5",
                      fontWeight: "bold"
                    }}
                  >
                    {pneu.posicao}
                  </div>

                  {/* SUBMENU */}
                  {pneuExpandido === index && (

                    <div style={{ padding: "10px" }}>

                      <label>Número de Série</label>
                      <input
                        className="form-control mb-2"
                        value={pneu.numeroserie}
                        onChange={(e) => alterarPneu(index, "numeroserie", e.target.value)}
                      />

                      <label>Marca</label>
                      <input
                        className="form-control mb-2"
                        value={pneu.marca}
                        onChange={(e) => alterarPneu(index, "marca", e.target.value)}
                      />

                      <label>Medida</label>
                      <input
                        className="form-control mb-2"
                        placeholder="Ex: 295/80 R22.5"
                        value={pneu.medida}
                        onChange={(e) => alterarPneu(index, "medida", e.target.value)}
                      />

                      <label>Velocidade KM</label>
                      <input
                        type="number"
                        className="form-control mb-2"
                        value={pneu.velocidadekm}
                        onChange={(e) => alterarPneu(index, "velocidadekm", e.target.value)}
                      />

                      <label>Data Aquisição</label>
                      <input
                        type="date"
                        className="form-control mb-2"
                        value={pneu.dataaquisicao}
                        onChange={(e) => alterarPneu(index, "dataaquisicao", e.target.value)}
                      />

                      <label>Valor</label>
                      <input
                        type="number"
                        className="form-control mb-2"
                        value={pneu.valor}
                        onChange={(e) => alterarPneu(index, "valor", e.target.value)}
                      />

                      <label>Estado</label>
                      <select
                        className="form-select mb-2"
                        value={pneu.estado}
                        onChange={(e) => alterarPneu(index, "estado", e.target.value)}
                      >
                        <option>Bom</option>
                        <option>Médio</option>
                        <option>Ruim</option>
                      </select>

                      <label>Status</label>
                      <select
                        className="form-select"
                        value={pneu.status}
                        onChange={(e) => alterarPneu(index, "status", e.target.value)}
                      >
                        <option value="EM_USO">Em Uso</option>
                        <option value="EM_ESTOQUE">Em Estoque</option>
                        <option value="DESCARTADO">Descartado</option>
                      </select>

                    </div>

                  )}

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

            </div>


            {/* LADO DIREITO - DESENHO VEICULO */}
            <div style={{ flex: 1 }}>

              <h5 className="mb-3">Posição dos Pneus</h5>

              <div style={styles.carro}>

                {/* DIANTEIRO ESQ */}
                <div
                  onClick={() => setPneuSelecionado(0)}
                  style={{
                    ...styles.pneu,
                    top: 40,
                    left: -30,
                    background: corPneu(pneus[0].estado),
                    border: pneuSelecionado === 0 ? "3px solid #000" : "none"
                  }}
                >
                  <PneuInfo pneu={pneus[0]} />
                </div>

                {/* DIANTEIRO DIR */}
                <div
                  onClick={() => setPneuSelecionado(1)}
                  style={{
                    ...styles.pneu,
                    top: 40,
                    right: -30,
                    background: corPneu(pneus[1].estado),
                    border: pneuSelecionado === 1 ? "3px solid #000" : "none"
                  }}
                >
                  <PneuInfo pneu={pneus[1]} />
                </div>

                {/* TRASEIRO ESQ */}
                <div
                  onClick={() => setPneuSelecionado(2)}
                  style={{
                    ...styles.pneu,
                    bottom: 40,
                    left: -30,
                    background: corPneu(pneus[2].estado),
                    border: pneuSelecionado === 2 ? "3px solid #000" : "none"
                  }}
                >
                  <PneuInfo pneu={pneus[2]} />
                </div>

                {/* TRASEIRO DIR */}
                <div
                  onClick={() => setPneuSelecionado(3)}
                  style={{
                    ...styles.pneu,
                    bottom: 40,
                    right: -30,
                    background: corPneu(pneus[3].estado),
                    border: pneuSelecionado === 3 ? "3px solid #000" : "none"
                  }}
                >
                  <PneuInfo pneu={pneus[3]} />
                </div>

                {/* ESTEPE */}
                <div
                  onClick={() => setPneuSelecionado(4)}
                  style={{
                    ...styles.pneuEstepe,
                    background: corPneu(pneus[4].estado),
                    border: pneuSelecionado === 4 ? "3px solid #000" : "none"
                  }}
                >
                  <PneuInfo pneu={pneus[4]} />
                </div>

              </div>

            </div>

          </div>
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
  },
  carro: {
    position: "relative",
    width: "240px",
    height: "320px",
    margin: "auto",
    background: "linear-gradient(180deg,#dcdcdc,#f5f5f5)",
    borderRadius: "30px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
  },

  pneu: {
    position: "absolute",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    padding: "5px",
    cursor: "pointer",
    transition: "0.2s",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
  },

  pneuEstepe: {
    position: "absolute",
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    color: "#fff",
    bottom: -45,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
  }
}