"use client"

import { useState, useEffect, useRef } from "react"
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

// Mostra a marca e o estado do pneu no desenho do carro
function InfoPneu({ pneu }) {
  return (
    <div style={{ fontSize: "10px", textAlign: "center" }}>
      <div style={{ fontWeight: "bold" }}>{pneu.marca || "—"}</div>
      <div>{pneu.estado}</div>
    </div>
  )
}

// Retorna a cor do círculo do pneu de acordo com o estado
function corDoPneu(estado) {
  if (estado === "Bom")   return "#2ecc71"
  if (estado === "Médio") return "#f1c40f"
  if (estado === "Ruim")  return "#e74c3c"
  return "#777"
}

const CORES_VEICULO = [
  { value: "BRANCO",   label: "Branco"   },
  { value: "PRETO",    label: "Preto"    },
  { value: "PRATA",    label: "Prata"    },
  { value: "CINZA",    label: "Cinza"    },
  { value: "VERMELHO", label: "Vermelho" },
  { value: "AZUL",     label: "Azul"     },
  { value: "VERDE",    label: "Verde"    },
  { value: "AMARELO",  label: "Amarelo"  },
  { value: "MARROM",   label: "Marrom"   }
]

const MARCAS_PNEU = [
  { value: "MICHELIN",    label: "Michelin"    },
  { value: "PIRELLI",     label: "Pirelli"     },
  { value: "BRIDGESTONE", label: "Bridgestone" },
  { value: "GOODYEAR",    label: "Goodyear"    },
  { value: "CONTINENTAL", label: "Continental" },
  { value: "DUNLOP",      label: "Dunlop"      },
  { value: "YOKOHAMA",    label: "Yokohama"    },
  { value: "HANKOOK",     label: "Hankook"     },
  { value: "FIRESTONE",   label: "Firestone"   },
  { value: "KUMHO",       label: "Kumho"       }
]

// Estado padrão dos pneus — usado para montar e limpar a lista
const PNEUS_PADRAO = [
  { posicao: "Dianteiro Esquerdo", marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO"     },
  { posicao: "Dianteiro Direito",  marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO"     },
  { posicao: "Traseiro Esquerdo",  marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO"     },
  { posicao: "Traseiro Direito",   marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_USO"     },
  { posicao: "Estepe",             marca: "", medida: "", dataaquisicao: "", valor: "", estado: "Bom", status: "EM_ESTOQUE" }
]

export default function ModalVeiculo({ aberto, fechar, atualizarLista }) {

  const [passo,      setPasso]      = useState(1)
  const [carregando, setCarregando] = useState(false)
  const [pneuAberto, setPneuAberto] = useState(null)
  const [marcas,     setMarcas]     = useState([])
  const [modelos,    setModelos]    = useState([])

  // Os pneus ficam no useState porque a tela do carro precisa atualizar ao vivo
  const [pneus, setPneus] = useState(PNEUS_PADRAO.map(p => ({ ...p })))

  // Refs dos campos do veículo — 
  const placa   = useRef()
  const marca   = useRef()
  const modelo  = useRef()
  const ano     = useRef()
  const renavam = useRef()
  const cor     = useRef()
  const kmAtual = useRef()
  const status  = useRef()

  // Carrega as marcas quando o modal abre
  useEffect(() => {
    carregarMarcas()
  }, [])

  async function carregarMarcas() {
    const dados = await apiClient.get("/marca")
    setMarcas(dados)
  }

  async function carregarModelos(marcaId) {
    const dados = await apiClient.get("/modelo/" + marcaId)
    setModelos(dados)
  }

  // Muda um campo de um pneu específico
  function atualizarPneu(indice, campo, valor) {
    const copia = [...pneus]
    copia[indice][campo] = valor
    setPneus(copia)
  }

  // Limpa todos os campos e volta ao início
  function limparTudo() {
    placa.current.value   = ""
    marca.current.value   = ""
    modelo.current.value  = ""
    ano.current.value     = ""
    renavam.current.value = ""
    cor.current.value     = ""
    kmAtual.current.value = ""
    status.current.value  = "ATIVO"

    setPneus(PNEUS_PADRAO.map(p => ({ ...p })))
    setPasso(1)
    setPneuAberto(null)
    setModelos([])
  }

  // Valida os campos do passo 1 antes de avançar
  function validarPasso1() {
    if (!placa.current.value) {
      toast.error("Informe a placa")
      return false
    }
    if (!validarPlaca(placa.current.value)) {
      toast.error("Placa inválida")
      return false
    }
    if (!marca.current.value) {
      toast.error("Selecione a marca")
      return false
    }
    if (!modelo.current.value) {
      toast.error("Selecione o modelo")
      return false
    }
    if (!ano.current.value) {
      toast.error("Informe o ano")
      return false
    }
    if (!renavam.current.value) {
      toast.error("Informe o renavam")
      return false
    }
    if (!validarRenavam(renavam.current.value)) {
      toast.error("Renavam inválido")
      return false
    }
    if (!cor.current.value) {
      toast.error("Selecione a cor")
      return false
    }
    return true
  }

  // Valida se todos os pneus estão preenchidos antes de salvar
  function validarPneus() {
    for (let i = 0; i < pneus.length; i++) {
      const p = pneus[i]
      if (!p.marca) {
        toast.error("Preencha a marca do pneu: " + p.posicao)
        setPneuAberto(i)
        return false
      }
      if (!p.medida) {
        toast.error("Preencha a medida do pneu: " + p.posicao)
        setPneuAberto(i)
        return false
      }
      if (!p.dataaquisicao) {
        toast.error("Preencha a data de aquisição do pneu: " + p.posicao)
        setPneuAberto(i)
        return false
      }
      if (!p.valor) {
        toast.error("Preencha o valor do pneu: " + p.posicao)
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

      // Monta o objeto do veículo 
      let obj = {
        placa:   placa.current.value,
        marca:   marca.current.value,
        modelo:  modelo.current.value,
        ano:     ano.current.value,
        renavam: renavam.current.value,
        cor:     cor.current.value,
        kmatual: kmAtual.current.value.replace(/\./g, ""),
        status:  status.current.value
      }

      const resposta = await apiClient.post("/veiculo", obj)
      const veiculoId = resposta.veiculo || resposta.data?.veiculo

      // Salva cada pneu vinculado ao veículo
      for (let pneu of pneus) {
        const valorNumerico = pneu.valor
          .replace("R$", "")
          .replace(/\./g, "")
          .replace(",", ".")
          .trim()

        await apiClient.post("/pneu", {
          ...pneu,
          valor: parseFloat(valorNumerico) || 0,
          veiculo: veiculoId
        })
      }

      toast.success("Veículo cadastrado com sucesso!")
      limparTudo()
      atualizarLista()
      fechar()

    } catch (erro) {
      console.error(erro)
      toast.error("Erro ao salvar o veículo")
    } finally {
      setCarregando(false)
    }
  }

  if (!aberto) return null

  return (
    <div style={estilos.fundo}>
      <div style={estilos.modal}>

        <h3 className="mb-2">Cadastrar Veículo</h3>
        <p className="text-muted mb-3">Passo {passo} de 2</p>

        {/* ===== PASSO 1 — DADOS DO VEÍCULO ===== */}
        {passo === 1 && (
          <>
            <div className="form-group">
              <label>Placa:</label>
              <input
                ref={placa}
                type="text"
                className="form-control"
                onChange={(e) => { placa.current.value = formatarPlaca(e.target.value) }}
              />
            </div>

            <div className="form-group">
              <label>Marca:</label>
              <select
                ref={marca}
                className="form-control"
                onChange={(e) => {
                  carregarModelos(e.target.value)
                  modelo.current.value = ""
                }}
              >
                <option value="">-- Selecione --</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Modelo:</label>
              <select ref={modelo} className="form-control">
                <option value="">-- Selecione --</option>
                {modelos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ano:</label>
              <input ref={ano} type="number" className="form-control" />
            </div>

            <div className="form-group">
              <label>Renavam:</label>
              <input
                ref={renavam}
                type="text"
                className="form-control"
                onChange={(e) => { renavam.current.value = formatarRenavam(e.target.value) }}
              />
            </div>

            <div className="form-group">
              <label>Cor:</label>
              <select ref={cor} className="form-control">
                <option value="">-- Selecione --</option>
                {CORES_VEICULO.map((c, i) => (
                  <option key={i} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Km Atual:</label>
              <input
                ref={kmAtual}
                type="text"
                className="form-control"
                onChange={(e) => { kmAtual.current.value = formatarKm(e.target.value) }}
              />
            </div>

            <div className="form-group">
              <label>Status:</label>
              <select ref={status} className="form-control">
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <div className="mt-3 d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={() => { limparTudo(); fechar() }}>
                Cancelar
              </button>
              <button className="btn btn-warning" onClick={irParaPasso2}>
                Próximo →
              </button>
            </div>
          </>
        )}

        {/* ===== PASSO 2 — PNEUS ===== */}
        {passo === 2 && (
          <div style={{ display: "flex", gap: "40px" }}>

            {/* Formulário dos pneus */}
            <div style={{ flex: 1 }}>
              <h5 className="mb-3">
                Pneus <small style={{ color: "red", fontSize: "13px" }}>* Todos obrigatórios</small>
              </h5>

              {pneus.map((pneu, indice) => (
                <div key={indice} className="border rounded mb-2">

                  {/* Cabeçalho clicável */}
                  <div
                    style={{ padding: "10px", cursor: "pointer", background: "#f5f5f5", fontWeight: "bold" }}
                    onClick={() => setPneuAberto(pneuAberto === indice ? null : indice)}
                  >
                    {pneu.posicao}
                    {pneu.marca && pneu.medida && pneu.dataaquisicao && pneu.valor
                      ? <span style={{ color: "green", marginLeft: "8px" }}>✓</span>
                      : <span style={{ color: "red",   marginLeft: "8px" }}>✗ incompleto</span>
                    }
                  </div>

                  {/* Campos — só aparecem quando o pneu está expandido */}
                  {pneuAberto === indice && (
                    <div style={{ padding: "10px" }}>

                      <div className="form-group">
                        <label>Marca:</label>
                        <select
                          className="form-control"
                          value={pneu.marca}
                          onChange={(e) => atualizarPneu(indice, "marca", e.target.value)}
                        >
                          <option value="">-- Selecione --</option>
                          {MARCAS_PNEU.map((m, i) => (
                            <option key={i} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Medida:</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="175/65 R14"
                          value={pneu.medida}
                          onChange={(e) => atualizarPneu(indice, "medida", formatarMedidaPneu(e.target.value))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Data de Aquisição:</label>
                        <input
                          type="date"
                          className="form-control"
                          value={pneu.dataaquisicao}
                          onChange={(e) => atualizarPneu(indice, "dataaquisicao", e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Valor:</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="R$ 0,00"
                          value={pneu.valor}
                          onChange={(e) => atualizarPneu(indice, "valor", formatarMoeda(e.target.value))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Estado:</label>
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

              <div className="mt-3 d-flex justify-content-between">
                <button className="btn btn-secondary" onClick={() => setPasso(1)}>
                  ← Voltar
                </button>
                <button className="btn btn-primary" onClick={salvarVeiculo} disabled={carregando}>
                  {carregando ? "Salvando..." : "Gravar"}
                </button>
              </div>
            </div>

            {/* Desenho do carro */}
            <div style={{ flex: 1 }}>
              <h5 className="mb-3">Posição dos Pneus</h5>

              <div style={estilos.carro}>

                <div style={{ ...estilos.pneu, top: 20, left: -35, background: corDoPneu(pneus[0].estado) }}>
                  <InfoPneu pneu={pneus[0]} />
                </div>

                <div style={{ ...estilos.pneu, top: 20, right: -35, background: corDoPneu(pneus[1].estado) }}>
                  <InfoPneu pneu={pneus[1]} />
                </div>

                <div style={{ ...estilos.pneu, bottom: 20, left: -35, background: corDoPneu(pneus[2].estado) }}>
                  <InfoPneu pneu={pneus[2]} />
                </div>

                <div style={{ ...estilos.pneu, bottom: 20, right: -35, background: corDoPneu(pneus[3].estado) }}>
                  <InfoPneu pneu={pneus[3]} />
                </div>

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

// ---------- ESTILOS ----------
const estilos = {
  fundo: {
    position: "fixed",
    top: 0, left: 0,
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