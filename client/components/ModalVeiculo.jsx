"use client"

import { useRef, useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient"

// IMPORTS DAS VALIDAÇÃOES DA UTILS
import {
  formatarRenavam,
  formatarPlaca,
  validarPlaca,
  validarRenavam,
  formatarKm,
  formatarMedidaPneu,
  formatarMoeda

} from "@/utils/validacao.js"

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
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [placa, setPlaca] = useState("")
  const [renavam, setRenavam] = useState("")
  const [kmAtual, setKmAtual] = useState("")
  const [ano, setAno] = useState("")
  const [cor, setCor] = useState("")
  const [status, setStatus] = useState("ATIVO")




  // TABELA DE CORES PARA OS VEICULOS DE FORMA SIMPLES
  const coresVeiculo = [
    { value: "BRANCO", label: "Branco" },
    { value: "PRETO", label: "Preto" },
    { value: "PRATA", label: "Prata" },
    { value: "CINZA", label: "Cinza" },
    { value: "VERMELHO", label: "Vermelho" },
    { value: "AZUL", label: "Azul" },
    { value: "VERDE", label: "Verde" },
    { value: "AMARELO", label: "Amarelo" },
    { value: "MARROM", label: "Marrom" }
  ]
  // TABELA DE MARCAS DE PNEUS DE FORMA SIMPLES
  const marcasPneu = [
    { value: "MICHELIN", label: "Michelin" },
    { value: "PIRELLI", label: "Pirelli" },
    { value: "BRIDGESTONE", label: "Bridgestone" },
    { value: "GOODYEAR", label: "Goodyear" },
    { value: "CONTINENTAL", label: "Continental" },
    { value: "DUNLOP", label: "Dunlop" },
    { value: "YOKOHAMA", label: "Yokohama" },
    { value: "HANKOOK", label: "Hankook" },
    { value: "FIRESTONE", label: "Firestone" },
    { value: "KUMHO", label: "Kumho" }
  ]


  // ------------------ FORMTAÇÃO NA DIGITAÇÃO ---------------
  const handlePlaca = (e) => {
    setPlaca(formatarPlaca(e.target.value))
  }

  const handleRenavam = (e) => {
    setRenavam(formatarRenavam(e.target.value))
  }

  const placaValida = validarPlaca(placa)

  const handleKm = (e) => {
    setKmAtual(formatarKm(e.target.value))
  }

  const handleMedida = (index, valor) => {
    alterarPneu(index, "medida", formatarMedidaPneu(valor))
  }

  const handleValor = (index, valor) => {
    alterarPneu(index, "valor", formatarMoeda(valor))
  }



  // ---------------- PNEUS ----------------

  const [pneus, setPneus] = useState([
    { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Dianteiro Esquerdo" },
    { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Dianteiro Direito" },
    { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Traseiro Esquerdo" },
    { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Traseiro Direito" },
    { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_ESTOQUE", posicao: "Estepe", }
  ])

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

  // CARREGAR MARCA
  async function carregarMarcas() {

    const dados = await apiClient.get("/marca")
    setMarcas(dados)

  }
  useEffect(() => {
    console.log("Carregando marcas")
    carregarMarcas()

  }, [])


  //CARREGAR MODELO
  async function carregarModelos(marcaId) {

    const dados = await apiClient.get("/modelo/" + marcaId)
    setModelos(dados)

  }

  //  LIMPAR FORMATAÇÃO DO MODAL
  function limparFormulario() {

    setPlaca("")
    setMarca("")
    setModelo("")
    setAno("")
    setRenavam("")
    setCor("")
    setKmAtual("")
    setStatus("ATIVO")

    setPneus([
      { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Dianteiro Esquerdo" },
      { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Dianteiro Direito" },
      { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Traseiro Esquerdo" },
      { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO", posicao: "Traseiro Direito" },
      { marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_ESTOQUE", posicao: "Estepe" }
    ])

    setStep(1)
    setPneuExpandido(null)
  }



  //  -------------------------- SALVAR VEICULO ---------------------
  async function salvarVeiculo() {

    if (
      placa &&
      modelo &&
      marca
    ) {


      try {
        if (!validarPlaca(placa)) {
          alert("Placa inválida")
          return
        }

        if (!validarRenavam(renavam)) {
          alert("Renavam inválido")
          return
        }

        setLoading(true)

        let obj = {
          placa: placa,
          modelo: modelo,
          marca: marca,
          ano: ano,
          renavam: renavam,
          cor: cor,
          kmatual: kmAtual.replace(/\./g, ""),
          status: status
        }



        const response = await apiClient.post("/veiculo", obj)

        const veiculoId = response.veiculo || response.data?.veiculo

        console.log("ID do veículo:", veiculoId)

        for (let pneu of pneus) {

          if (!pneu.marca) continue

          await apiClient.post("/pneu", {
            ...pneu,
            valor: pneu.valor.replace(/\D/g, ""),
            veiculo: veiculoId
          })

        }
        toast.success("Veículo cadastrado!")
        limparFormulario();
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

  // VALIDAÇÃO DO PREENCHIMENTO DE INFORMAÇÕES NO FRONT END - VEICULOS
  function validarStep1() {

    if (!placa) {
      toast.error("Informe a placa")
      return false
    }

    if (!marca) {
      toast.error("Selecione a marca")
      return false
    }

    if (!modelo) {
      toast.error("Selecione o modelo")
      return false
    }

    if (!ano) {
      toast.error("Informe o ano")
      return false
    }

    if (!renavam) {
      toast.error("Informe o renavam")
      return false
    }

    if (!cor) {
      toast.error("Selecione a cor")
      return false
    }

    return true
  }

  function proximoStep() {

    if (!validarStep1()) {
      return
    }

    setStep(2)
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
              <input value={placa} className="form-control" onChange={handlePlaca} />
              {placa && !placaValida && (
                <small style={{ color: "red" }}>Placa inválida</small>
              )}

            </div>

            <div className="form-group">
              <label>Marca</label>
              <select
                value={marca}
                className="form-control"
                onChange={(e) => {
                  setMarca(e.target.value)
                  carregarModelos(e.target.value)
                }}
              >
                <option value="">Selecione</option>

                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>

            </div>

            <div className="form-group">
              <label>Modelo</label>
              <select
                value={modelo}
                className="form-control"
                onChange={(e) => setModelo(e.target.value)}
              >
                <option value="">Selecione</option>

                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ano</label>
              <input
                type="number"
                className="form-control"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Renavam</label>
              <input
                value={renavam}
                type="text"
                className="form-control"
                onChange={handleRenavam}
              />
            </div>

            <div className="form-group">
              <label>Cor</label>
              <select
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="form-control"
              >
                <option value="">Selecione</option>

                {coresVeiculo.map((c, index) => (
                  <option key={index} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Km Atual</label>
              <input
                value={kmAtual}
                onChange={handleKm}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-control"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <div className="mt-3 d-flex justify-content-between">

              <button
                className="btn btn-secondary"
                onClick={() => {
                  limparFormulario()
                  fechar()
                }}
              >
                Cancelar
              </button>

              <button
                className="btn btn-warning"
                onClick={proximoStep}
              >
                Próximo →
              </button>

            </div>

          </>

        )}

        {/* STEP 2 */}

        {step === 2 && (

          <div style={{ display: "flex", gap: "50px" }}>

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

                      <select
                        className="form-control mb-2"
                        value={p.marca}
                        onChange={(e) => alterarPneu(index, "marca", e.target.value)}
                      >

                        <option value="">Selecione a marca</option>

                        {marcasPneu.map((m, i) => (
                          <option key={i} value={m.value}>
                            {m.label}
                          </option>
                        ))}

                      </select>

                      <input
                        className="form-control mb-2"
                        placeholder="175/65 R14"
                        value={p.medida}
                        onChange={(e) => handleMedida(index, e.target.value)}
                      />
                      <input
                        type="date"
                        className="form-control mb-2"
                        value={p.dataaquisicao}
                        onChange={(e) => alterarPneu(index, "dataaquisicao", e.target.value)}
                      />

                      <input
                        className="form-control mb-2"
                        placeholder="R$ 0,00"
                        value={p.valor}
                        onChange={(e) => handleValor(index, e.target.value)}
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