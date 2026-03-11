"use client"

import { useRef, useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient"
import toast from "react-hot-toast"

// ------------- FUNÇÃO PNEU PARA ATRIBUIR VALORES NO PNEU
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

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pneuExpandido, setPneuExpandido] = useState(null)
  const [pneuSelecionado, setPneuSelecionado] = useState(null)


  // ----------------USE STATE DE VEICULOS --------
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])

  // ---------------- REFS VEÍCULO ----------------

  const placa = useRef()
  const modelo = useRef()
  const marca = useRef()
  const ano = useRef()
  const renavam = useRef()
  const cor = useRef()
  const kmatual = useRef()
  const status = useRef()

  // ---------------- PNEUS ----------------

  const [pneus, setPneus] = useState([
    { posicao: "Dianteiro Esquerdo", numeroserie: "", marca: "", medida: "", velocidadekm: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
    { posicao: "Dianteiro Direito", numeroserie: "", marca: "", medida: "", velocidadekm: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
    { posicao: "Traseiro Esquerdo", numeroserie: "", marca: "", medida: "", velocidadekm: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
    { posicao: "Traseiro Direito", numeroserie: "", marca: "", medida: "", velocidadekm: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
    { posicao: "Estepe", numeroserie: "", marca: "", medida: "", velocidadekm: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_ESTOQUE" }
  ])


  // CARREGAR MARCA
  async function carregarMarcas() {

    const dados = await apiClient.get("/marca")
    setMarcas(dados)

  }

  //CARREGAR MODELO
  async function carregarModelos(marcaId) {

    const dados = await apiClient.get("/modelo/" + marcaId)
    setModelos(dados)

  }

  useEffect(() => {
    console.log("Carregando marcas")
    carregarMarcas()

  }, [])


  function alterarPneu(index, campo, valor) {
    const novos = [...pneus]
    novos[index][campo] = valor
    setPneus(novos)
  }

  function corPneu(estado) {
    switch (estado) {
      case "Bom": return "#2ecc71"
      case "Médio": return "#f1c40f"
      case "Ruim": return "#e74c3c"
      default: return "#777"
    }
  }

  async function salvarVeiculo() {

    if (
      placa.current.value != "" &&
      modelo.current.value != "" &&
      marca.current.value != ""
    ) {

      try {

        setLoading(true)

        let obj = {
          placa: placa.current.value,
          modelo: modelo.current.value,
          marca: marca.current.value,
          ano: ano.current.value,
          renavam: renavam.current.value,
          cor: cor.current.value,
          kmatual: kmatual.current.value,
          status: status.current.value
        }

        const response = await apiClient.post("/veiculo", obj)

        const veiculoId = response.veiculo_id

        for (let pneu of pneus) {

          await apiClient.post("/pneu", {
            ...pneu,
            veiculo_id: veiculoId
          })

        }

        toast.success("Veículo cadastrado!")

        atualizarLista()
        fechar()

      } catch (error) {

        console.error(error)
        toast.error("Erro ao salvar")

      } finally {
        setLoading(false)
      }

    } else {

      toast.error("Preencha os campos obrigatórios")

    }

  }

  if (!aberto) return null

  return (

    <div style={styles.overlay}>

      <div style={styles.modal}>

        <h3 className="mb-4">Cadastrar Veículo</h3>

        <strong>Passo {step} de 2</strong>

        {/* STEP 1 */}

        {step === 1 && (

          <>
            <div className="form-group">
              <label>Placa</label>
              <input ref={placa} className="form-control" />
            </div>

            <div className="form-group">
              <label>Marca</label>
              <select
                ref={marca}
                className="form-control"
                onChange={(e) => carregarModelos(e.target.value)}
              >
                <option value="">Selecione</option>

                {marcas.map((m, index) => (
                  <option key={index} value={m.id}>
                    {m.nome}
                  </option>
                ))}

              </select>
            </div>

            <div className="form-group">
              <label>Modelo</label>
              <select ref={modelo} className="form-control">

                <option value="">Selecione</option>

                {modelos.map((m, index) => (
                  <option key={index} value={m.id}>
                    {m.nome}
                  </option>
                ))}

              </select>
            </div>

            <div className="form-group">
              <label>Ano</label>
              <input ref={ano} type="number" className="form-control" />
            </div>

            <div className="form-group">
              <label>Renavam</label>
              <input ref={renavam} type="number" className="form-control" />
            </div>

            <div className="form-group">
              <label>Cor</label>
              <input ref={cor} className="form-control" />
            </div>

            <div className="form-group">
              <label>Km Atual</label>
              <input ref={kmatual} type="number" className="form-control" />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select ref={status} className="form-control">
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <div className="mt-3 d-flex justify-content-between">

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

        {/* STEP 2 */}

        {step === 2 && (

          <div style={{ display: "flex", gap: "30px" }}>

            <div style={{ flex: 1 }}>

              <h5>Cadastro de Pneus</h5>

              {pneus.map((p, index) => (

                <div key={index} className="border rounded mb-2">

                  <div
                    onClick={() => setPneuExpandido(pneuExpandido === index ? null : index)}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      background: "#f5f5f5",
                      fontWeight: "bold"
                    }}
                  >
                    {p.posicao}
                  </div>

                  {pneuExpandido === index && (

                    <div style={{ padding: "10px" }}>

                      <input
                        className="form-control mb-2"
                        placeholder="Número de Série"
                        value={p.numeroserie}
                        // ON CHANGE PARA CHAMAR A FUNÇÃO DE ALTERAR PNEU
                        onChange={(e) => alterarPneu(index, "numeroserie", e.target.value)}
                      />

                      <input
                        className="form-control mb-2"
                        placeholder="Marca"
                        value={p.marca}
                        onChange={(e) => alterarPneu(index, "marca", e.target.value)}
                      />

                      <input
                        className="form-control mb-2"
                        placeholder="Medida"
                        value={p.medida}
                        onChange={(e) => alterarPneu(index, "medida", e.target.value)}
                      />

                      <select
                        className="form-control"
                        value={p.estado}
                        onChange={(e) => alterarPneu(index, "estado", e.target.value)}
                      >
                        <option>Bom</option>
                        <option>Médio</option>
                        <option>Ruim</option>
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
                  className="btn btn-primary"
                  onClick={salvarVeiculo}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Gravar"}
                </button>

              </div>

            </div>

            <div style={{ flex: 1 }}>

              <h5>Posição dos Pneus</h5>

              <div style={styles.carro}>

                {/* DIANTEIRO ESQUERDO */}
                <div
                  onClick={() => setPneuSelecionado(0)}
                  style={{
                    ...styles.pneu,
                    top: 20,
                    left: -35,
                    position: "absolute",
                    background: corPneu(pneus[0].estado)
                  }}
                >
                  <PneuInfo pneu={pneus[0]} />
                </div>

                {/* DIANTEIRO DIREITO */}
                <div
                  onClick={() => setPneuSelecionado(1)}
                  style={{
                    ...styles.pneu,
                    top: 20,
                    right: -35,
                    position: "absolute",
                    background: corPneu(pneus[1].estado)
                  }}
                >
                  <PneuInfo pneu={pneus[1]} />
                </div>

                {/* TRASEIRO ESQUERDO */}
                <div
                  onClick={() => setPneuSelecionado(2)}
                  style={{
                    ...styles.pneu,
                    bottom: 20,
                    left: -35,
                    position: "absolute",
                    background: corPneu(pneus[2].estado)
                  }}
                >
                  <PneuInfo pneu={pneus[2]} />
                </div>

                {/* TRASEIRO DIREITO */}
                <div
                  onClick={() => setPneuSelecionado(3)}
                  style={{
                    ...styles.pneu,
                    bottom: 20,
                    right: -35,
                    position: "absolute",
                    background: corPneu(pneus[3].estado)
                  }}
                >
                  <PneuInfo pneu={pneus[3]} />
                </div>

                {/* ESTEPE */}
                <div
                  onClick={() => setPneuSelecionado(4)}
                  style={{
                    ...styles.pneu,
                    bottom: -60,
                    left: "50%",
                    transform: "translateX(-50%)",
                    position: "absolute",
                    background: corPneu(pneus[4].estado)
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
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },

  modal: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "650px",
    maxHeight: "90vh",
    overflowY: "auto"
  },

  carro: {
    position: "relative",
    width: "240px",
    height: "320px",
    margin: "auto",
    background: "linear-gradient(180deg,#dcdcdc,#f5f5f5)",
    borderRadius: "30px"
  },

  pneu: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    position: "relative",
    margin: "10px"
  }

}