"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/utils/apiClient"
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

// Mostra marca e estado embaixo de cada pneu no desenho do carro
function InfoPneu({ pneu }) {
  return (
    <div style={{ fontSize: "10px", textAlign: "center" }}>
      <div style={{ fontWeight: "bold" }}>{pneu.marca || "—"}</div>
      <div>{pneu.estado}</div>
    </div>
  )
}

// Lista de pneus que começa no estado padrão
const PNEUS_PADRAO = [
  { posicao: "Dianteiro Esquerdo", marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
  { posicao: "Dianteiro Direito", marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
  { posicao: "Traseiro Esquerdo", marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
  { posicao: "Traseiro Direito", marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO" },
  { posicao: "Estepe", marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_ESTOQUE" }
]

// Retorna a cor do círculo do pneu de acordo com o estado
function corDoPneu(estado) {
  if (estado === "Bom") return "#2ecc71"
  if (estado === "Médio") return "#f1c40f"
  if (estado === "Ruim") return "#e74c3c"
  return "#777"
}

const CORES_VEICULO = [
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

const MARCAS_PNEU = [
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

export default function ModalVeiculo({ aberto, fechar, atualizarLista }) {

  const [passo, setPasso] = useState(1)
  const [carregando, setCarregando] = useState(false)
  const [pneuAberto, setPneuAberto] = useState(null)

  // Dados do veículo
  const [placa, setPlaca] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [ano, setAno] = useState("")
  const [renavam, setRenavam] = useState("")
  const [cor, setCor] = useState("")
  const [kmAtual, setKmAtual] = useState("")
  const [tanque, setTanque] = useState("")
  const [status, setStatus] = useState("ATIVO")

  // Listas que vêm do banco
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])

  // Lista de pneus
  const [pneus, setPneus] = useState(PNEUS_PADRAO)

  // Carrega marcas quando o modal abre
  useEffect(() => {
    async function buscarMarcas() {
      const dados = await apiClient.get("/marca")
      setMarcas(dados)
    }
    buscarMarcas()
  }, [])

  // Carrega modelos quando o usuário escolhe uma marca
  async function buscarModelos(marcaId) {
    const dados = await apiClient.get("/modelo/" + marcaId)
    setModelos(dados)
  }

  // Muda um campo de um pneu específico pelo índice
  function atualizarPneu(indice, campo, valor) {
    const copia = [...pneus]
    copia[indice][campo] = valor
    setPneus(copia)
  }


  // Limpa tudo para o estado inicial
  function limparTudo() {
    // Reset dos dados do veículo
    setPlaca("")
    setMarca("")
    setModelo("")
    setAno("")
    setRenavam("")
    setCor("")
    setKmAtual("")
    setTanque("")
    setStatus("ATIVO")

    // Reset dos pneus: mapeia o array padrão criando novos objetos
    const novosPneus = PNEUS_PADRAO.map(p => ({
      ...p,
      marca: "",
      medida: "",
      dataaquisicao: "",
      valor: "",
      estado: "Bom"
    }))

    setPneus(novosPneus)
    setPasso(1)
    setPneuAberto(null)
  }

  // Validação do passo 1 (dados do veículo)
  function validarPasso1() {
    if (!placa) { toast.error("Informe a placa"); return false }
    if (!validarPlaca(placa)) { toast.error("Placa inválida"); return false }
    if (!marca) { toast.error("Selecione a marca"); return false }
    if (!modelo) { toast.error("Selecione o modelo"); return false }
    if (!ano) { toast.error("Informe o ano"); return false }
    if (!renavam) { toast.error("Informe o renavam"); return false }
    if (!validarRenavam(renavam)) { toast.error("Renavam inválido"); return false }
    if (!cor) { toast.error("Selecione a cor"); return false }
    if (!tanque) { toast.error("Indique o tamanho do tanque em Litros"); return false }
    return true
  }

  // Validação do passo 2 — todos os pneus precisam estar preenchidos
  function validarPneus() {
    for (let i = 0; i < pneus.length; i++) {
      const p = pneus[i]
      if (!p.marca) {
        toast.error(`Preencha a marca do pneu: ${p.posicao}`)
        setPneuAberto(i)
        return false
      }
      if (!p.medida) {
        toast.error(`Preencha a medida do pneu: ${p.posicao}`)
        setPneuAberto(i)
        return false
      }
      if (!p.dataaquisicao) {
        toast.error(`Preencha a data de aquisição do pneu: ${p.posicao}`)
        setPneuAberto(i)
        return false
      }
      if (!p.valor) {
        toast.error(`Preencha o valor do pneu: ${p.posicao}`)
        setPneuAberto(i)
        return false
      }
    }
    return true
  }

  function irParaPasso2() {
    if (validarPasso1()) {
      setPasso(2)
    }
  }

  async function salvarVeiculo() {
    if (!validarPneus()) return

    try {
      setCarregando(true)

      // ← parseia km uma vez só
      const kmAtualNumero = parseInt(kmAtual.replace(/\./g, "")) || 0

      const pneusFormatados = pneus.map(p => ({
        ...p,
        valor: parseFloat(
          p.valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
        ) || 0
      }))

      const resposta = await apiClient.post("/veiculo", {
        placa, modelo, marca, ano, renavam, cor,
        kmatual: kmAtualNumero,  // ← número, não string com pontos
        tanque, status,
        pneus: pneusFormatados
      })

      const veiculoId = resposta?.veiculo ?? resposta?.data?.veiculo

      // Salva cada pneu com kmEntrada
      for (const pneu of pneusFormatados) {
        if (!pneu.marca) continue
        await apiClient.post("/pneu", {
          ...pneu,
          veiculo: veiculoId,
          kmEntrada: kmAtualNumero  // ← novo: km do veículo quando o pneu foi montado
        })
      }

      toast.success("Veículo cadastrado com sucesso!")
      limparTudo()
      atualizarLista()
      fechar()

    } catch (erro) {
      console.error("Erro completo:", erro)
      toast.error(erro.response?.data?.msg || "Erro ao salvar o veículo")
    } finally {
      setCarregando(false)
    }
  }
  // Não renderiza nada se o modal estiver fechado
  if (!aberto) return null

  return (
    <div style={estilos.fundo}>
      <div style={estilos.modal}>

        <h3 className="mb-2">Cadastrar Veículo</h3>
        <p className="text-muted mb-4">Passo {passo} de 2</p>

        {/* ========== PASSO 1 — DADOS DO VEÍCULO ========== */}
        {passo === 1 && (
          <>
            <div className="form-group mb-3">
              <label>Placa *</label>
              <input
                className="form-control"
                value={placa}
                onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
              />
              {placa && !validarPlaca(placa) && (
                <small style={{ color: "red" }}>Placa inválida</small>
              )}
            </div>

            <div className="form-group mb-3">
              <label>Marca *</label>
              <select
                className="form-control"
                value={marca}
                onChange={(e) => {
                  setMarca(e.target.value)
                  setModelo("")
                  buscarModelos(e.target.value)
                }}
              >
                <option value="">Selecione a marca</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label>Modelo *</label>
              <select
                className="form-control"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              >
                <option value="">Selecione o modelo</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label>Ano *</label>
              <input
                type="number"
                className="form-control"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label>Renavam *</label>
              <input
                type="text"
                className="form-control"
                value={renavam}
                onChange={(e) => setRenavam(formatarRenavam(e.target.value))}
              />
            </div>

            <div className="form-group mb-3">
              <label>Cor *</label>
              <select
                className="form-control"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
              >
                <option value="">Selecione a cor</option>
                {CORES_VEICULO.map((c, i) => (
                  <option key={i} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <label>Km Atual*</label>
              <input
                className="form-control"
                value={kmAtual}
                onChange={(e) => setKmAtual(formatarKm(e.target.value))}
              />
            </div>

            <div className="form-group mb-3">
              <label>Tanque *</label>
              <input
                type="number"
                className="form-control"
                value={tanque}
                onChange={(e) => setTanque(e.target.value)}
              />
            </div>

            <div className="form-group mb-4">
              <label>Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary"
                onClick={() => { limparTudo(); fechar() }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-warning"
                onClick={irParaPasso2}
              >
                Próximo →
              </button>
            </div>
          </>
        )}

        {/* ========== PASSO 2 — PNEUS ========== */}
        {passo === 2 && (
          <div style={{ display: "flex", gap: "40px" }}>

            {/* Formulário dos pneus */}
            <div style={{ flex: 1 }}>
              <h5 className="mb-3">Pneus <small style={{ color: "red", fontSize: "13px" }}>* Todos obrigatórios</small></h5>

              {pneus.map((pneu, indice) => (
                <div key={indice} className="border rounded mb-2">

                  {/* Cabeçalho clicável que expande o pneu */}
                  <div
                    style={{ padding: "10px", cursor: "pointer", background: "#f5f5f5", fontWeight: "bold" }}
                    onClick={() => setPneuAberto(pneuAberto === indice ? null : indice)}
                  >
                    {pneu.posicao}
                    {/* Indica se o pneu está completo ou não */}
                    {pneu.marca && pneu.medida && pneu.dataaquisicao && pneu.valor
                      ? <span style={{ color: "green", marginLeft: "8px" }}>✓</span>
                      : <span style={{ color: "red", marginLeft: "8px" }}>✗ incompleto</span>
                    }
                  </div>

                  {/* Campos do pneu — só aparecem quando expandido */}
                  {pneuAberto === indice && (
                    <div style={{ padding: "10px" }}>

                      <div className="mb-2">
                        <label>Marca *</label>
                        <select
                          className="form-control"
                          value={pneu.marca}
                          onChange={(e) => atualizarPneu(indice, "marca", e.target.value)}
                        >
                          <option value="">Selecione a marca</option>
                          {MARCAS_PNEU.map((m, i) => (
                            <option key={i} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-2">
                        <label>Medida *</label>
                        <input
                          className="form-control"
                          placeholder="175/65 R14"
                          value={pneu.medida}
                          onChange={(e) => atualizarPneu(indice, "medida", formatarMedidaPneu(e.target.value))}
                        />
                      </div>

                      <div className="mb-2">
                        <label>Data de Aquisição *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={pneu.dataaquisicao}
                          onChange={(e) => atualizarPneu(indice, "dataaquisicao", e.target.value)}
                        />
                      </div>

                      <div className="mb-2">
                        <label>Valor *</label>
                        <input
                          className="form-control"
                          placeholder="R$ 0,00"
                          value={pneu.valor}
                          onChange={(e) => atualizarPneu(indice, "valor", formatarMoeda(e.target.value))}
                        />
                      </div>

                      <div className="mb-2">
                        <label>Estado</label>
                        <select
                          className="form-control"
                          value={pneu.estado}
                          onChange={(e) => atualizarPneu(indice, "estado", e.target.value)}
                        >
                          <option value="Bom">Bom</option>
                          <option value="Médio">Médio</option>
                          <option value="Ruim">Ruim</option>
                        </select>
                      </div>

                    </div>
                  )}

                </div>
              ))}

              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-secondary" onClick={() => setPasso(1)}>
                  ← Voltar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={salvarVeiculo}
                  disabled={carregando}
                >
                  {carregando ? "Salvando..." : "Gravar"}
                </button>
              </div>
            </div>

            {/* Desenho do carro com os pneus */}
            <div style={{ flex: 1 }}>
              <h5 className="mb-3">Posição dos Pneus</h5>

              <div style={estilos.carro}>

                {/* Dianteiro Esquerdo */}
                <div style={{ ...estilos.pneu, top: 20, left: -35, background: corDoPneu(pneus[0].estado) }}>
                  <InfoPneu pneu={pneus[0]} />
                </div>

                {/* Dianteiro Direito */}
                <div style={{ ...estilos.pneu, top: 20, right: -35, background: corDoPneu(pneus[1].estado) }}>
                  <InfoPneu pneu={pneus[1]} />
                </div>

                {/* Traseiro Esquerdo */}
                <div style={{ ...estilos.pneu, bottom: 20, left: -35, background: corDoPneu(pneus[2].estado) }}>
                  <InfoPneu pneu={pneus[2]} />
                </div>

                {/* Traseiro Direito */}
                <div style={{ ...estilos.pneu, bottom: 20, right: -35, background: corDoPneu(pneus[3].estado) }}>
                  <InfoPneu pneu={pneus[3]} />
                </div>

                {/* Estepe */}
                <div style={{ ...estilos.pneu, bottom: -60, left: "50%", transform: "translateX(-50%)", background: corDoPneu(pneus[4].estado) }}>
                  <InfoPneu pneu={pneus[4]} />
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}









// -------------- ESTILO DA PÁGINA --------
const estilos = {
  fundo: {
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
    width: "700px",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  carro: {
    position: "relative",
    width: "240px",
    height: "320px",
    margin: "auto",
    background: "linear-gradient(180deg, #dcdcdc, #f5f5f5)",
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
    position: "absolute",
    cursor: "pointer"
  }
}