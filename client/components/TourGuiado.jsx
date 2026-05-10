"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"

// ─── TOURS POR PÁGINA ────────────────────────────────────────────────────────

const TOURS = {

  "/dashboard": [
    {
      titulo: "Bem-vindo ao CarControl! 👋",
      texto: "Este é o painel principal. Aqui você acompanha a frota, recebe alertas e cadastra novos veículos.",
      selector: null,
    },
    {
      titulo: "Menu lateral 📋",
      texto: "Use o menu à esquerda para navegar entre Abastecimento, Manutenção, Relatórios e mais.",
      selector: ".sidebar",
      posicaoPreferida: "direita",
    },
    {
      titulo: "Notificações 🔔",
      texto: "O sino exibe alertas de manutenções agendadas para o dia seguinte. Clique nele para ver os detalhes.",
      selector: null,
    },
    {
      titulo: "Cards de veículos 🚗",
      texto: "Cada card exibe um veículo cadastrado com placa, modelo e ano. Clique em 'Gerenciar' para ver detalhes, fazer rodízio de pneus e muito mais.",
      selector: ".vehicle-card",
    },
    {
      titulo: "Adicionar veículo ➕",
      texto: "Clique no card com '+' para cadastrar um novo veículo na frota.",
      selector: ".add-card",
    },
  ],

  "/dashboard/abastecimento": [
    {
      titulo: "Abastecimento ⛽",
      texto: "Aqui ficam todos os veículos da frota. Clique em um cartão para registrar ou consultar abastecimentos.",
      selector: null,
    },
    {
      titulo: "Campo de busca 🔍",
      texto: "Digite a placa, modelo ou marca para filtrar rapidamente o veículo desejado.",
      selector: "input[placeholder*='placa']",
    },
    {
      titulo: "Cartões de veículos",
      texto: "Clique em qualquer cartão para abrir o histórico e formulário de abastecimento daquele veículo.",
      selector: null,
    },
  ],

  "/dashboard/manutencao": [
    {
      titulo: "Manutenções 🔧",
      texto: "Selecione um veículo para gerenciar suas manutenções: agendamentos, serviços realizados e histórico.",
      selector: null,
    },
    {
      titulo: "Buscar veículo 🔍",
      texto: "Use o campo de busca para localizar o veículo pela placa, modelo ou marca.",
      selector: "input[placeholder*='placa']",
    },
  ],

  "abastecimento_detalhe": [
    {
      titulo: "Histórico de Abastecimento ⛽",
      texto: "Esta tela exibe todos os abastecimentos do veículo, além de um resumo com totais e média de km/l.",
      selector: null,
    },
    {
      titulo: "Novo Abastecimento ➕",
      texto: "Clique neste botão para registrar um novo abastecimento para este veículo.",
      selector: "button",
      textoSeletor: "Novo Abastecimento",
    },
    {
      titulo: "Filtro por período 📅",
      texto: "Filtre os abastecimentos por período ou por ano. Os totais do resumo são atualizados automaticamente.",
      selector: "input[type='date']",
    },
    {
      titulo: "Preenchendo o formulário 📝",
      texto: "Ao abrir o formulário preencha: Data, KM atual, litros, valor total, tipo de combustível e forma de pagamento. Todos os campos são obrigatórios.",
      selector: null,
    },
  ],

  "manutencao_detalhe": [
    {
      titulo: "Manutenções do Veículo 🔧",
      texto: "Aqui ficam todas as manutenções: agendadas, em andamento e concluídas.",
      selector: null,
    },
    {
      titulo: "Nova Manutenção ➕",
      texto: "Clique em '+ Nova Manutenção' para agendar um serviço. Informe data, serviço, oficina e KM.",
      selector: "button",
      textoSeletor: "Nova Manutenção",
    },
    {
      titulo: "Status das manutenções 🏷️",
      texto: "Cada manutenção pode estar: AGENDADA (amarelo), EM ANDAMENTO (azul) ou CONCLUÍDA (verde). Use os botões de ação para editar ou excluir.",
      selector: null,
    },
  ],

  "rodizio_detalhe": [
    {
      titulo: "Rodízio de Pneus 🔄",
      texto: "O rodízio alterna as posições dos pneus para garantir desgaste uniforme e prolongar a vida útil deles. Registre cada rodízio para manter o histórico completo.",
      selector: null,
    },
    {
      titulo: "Abas de navegação 📂",
      texto: "Use 'Novo Rodízio' para registrar uma nova troca de posições, ou 'Histórico' para consultar rodízios anteriores deste veículo.",
      selector: null,
    },
    {
      titulo: "Informações do Rodízio 📋",
      texto: "Preencha a Data do rodízio, o KM atual do veículo e selecione o Responsável pelo serviço antes de definir as posições.",
      selector: "input[type='date']",
    },
    {
      titulo: "Definindo novas posições 🔁",
      texto: "Para cada pneu, escolha a nova posição no menu suspenso. Pneus com posição alterada ficam em verde. Atenção: dois pneus não podem ir para a mesma posição.",
      selector: "table",
    },
    {
      titulo: "Salvando o rodízio ✅",
      texto: "Após definir todas as posições desejadas, clique em 'Salvar Rodízio'. As posições dos pneus serão atualizadas automaticamente no sistema.",
      selector: "button",
      textoSeletor: "Salvar Rodízio",
    },
  ],

  "veiculo_detalhe": [
    {
      titulo: "Detalhes do Veículo 🚗",
      texto: "Aqui você vê todas as informações do veículo: placa, marca, modelo, ano, cor, RENAVAM e KM atual.",
      selector: null,
    },
    {
      titulo: "Editar veículo ✏️",
      texto: "Clique em 'Editar' para alterar qualquer dado do veículo, como KM atual ou status.",
      selector: "button",
      textoSeletor: "Editar",
    },
    {
      titulo: "Ações Rápidas ⚡",
      texto: "Na seção 'Ações Rápidas' você acessa o Rodízio de Pneus diretamente, sem precisar navegar pelo menu.",
      selector: "button",
      textoSeletor: "Rodizio",
    },
  ],

  "/dashboard/pneus": [
    {
      titulo: "Gerenciar Pneus 🔵",
      texto: "Cadastre e gerencie os pneus da frota. Cada pneu tem medida, marca, estado e posição no veículo.",
      selector: null,
    },
  ],

  "/dashboard/servicos": [
    {
      titulo: "Serviços 🔧",
      texto: "Cadastre os tipos de serviço (ex: Troca de óleo, Alinhamento). Eles são usados ao registrar manutenções.",
      selector: null,
    },
  ],

  "/dashboard/usuarios": [
    {
      titulo: "Usuários 👤",
      texto: "Gerencie os usuários do sistema. Admin tem acesso total; Vendedor tem acesso apenas ao que lhe foi permitido.",
      selector: null,
    },
  ],

  "/dashboard/oficinas": [
    {
      titulo: "Oficinas 🏪",
      texto: "Cadastre as oficinas parceiras. Elas serão vinculadas às manutenções e trocas de pneu registradas.",
      selector: null,
    },
  ],

  "/dashboard/relatorios/abastecimento": [
    {
      titulo: "Relatório de Abastecimento 📊",
      texto: "Visualize e filtre todos os abastecimentos da frota. Use os filtros de período e veículo para refinar.",
      selector: null,
    },
    {
      titulo: "Exportar 🖨️",
      texto: "Use o botão de impressão para gerar um relatório em PDF com os dados filtrados.",
      selector: null,
    },
  ],

  "/dashboard/relatorios/manutencao": [
    {
      titulo: "Relatório de Manutenção 📊",
      texto: "Consulte o histórico de manutenções de toda a frota. Filtre por veículo, status ou período.",
      selector: null,
    },
  ],
}

// ─── DETECTA TOUR PELA ROTA ──────────────────────────────────────────────────

function obterPassos(pathname) {
  if (TOURS[pathname]) return TOURS[pathname]
  if (/\/dashboard\/abastecimento\/.+/.test(pathname)) return TOURS["abastecimento_detalhe"]
  if (/\/dashboard\/manutencao\/.+/.test(pathname))    return TOURS["manutencao_detalhe"]
  if (/\/dashboard\/rodizio\/.+/.test(pathname))       return TOURS["rodizio_detalhe"]
  if (/\/dashboard\/veiculos\/.+/.test(pathname))      return TOURS["veiculo_detalhe"]
  return null
}

// ─── PEGA ELEMENTO DO DOM ────────────────────────────────────────────────────

function obterElemento(passo) {
  if (!passo?.selector) return null
  try {
    if (passo.textoSeletor) {
      const todos = document.querySelectorAll(passo.selector)
      for (const el of todos) {
        if (el.textContent?.includes(passo.textoSeletor)) return el
      }
      return null
    }
    return document.querySelector(passo.selector)
  } catch {
    return null
  }
}

// ─── CALCULA POSIÇÃO FIXA DO TOOLTIP (viewport) ──────────────────────────────

const TW = 320   // largura do tooltip
const TH = 210   // altura estimada
const MG = 14    // margem de segurança

function calcularPos(el, passo) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (!el) {
    return {
      top:  Math.max(MG, vh / 2 - TH / 2),
      left: Math.max(MG, vw / 2 - TW / 2),
    }
  }

  const r = el.getBoundingClientRect()

  const abaixo   = vh - r.bottom
  const acima    = r.top
  const direita  = vw - r.right
  const esquerda = r.left

  const pinLeft = (base) => Math.max(MG, Math.min(base, vw - TW - MG))
  const pinTop  = (base) => Math.max(MG, Math.min(base, vh - TH - MG))

  // posição preferida (ex: sidebar → direita)
  if (passo?.posicaoPreferida === "direita" && direita >= TW + MG) {
    return { top: pinTop(r.top), left: r.right + MG }
  }

  // abaixo
  if (abaixo >= TH + MG) {
    return { top: r.bottom + MG, left: pinLeft(r.left) }
  }

  // acima
  if (acima >= TH + MG) {
    return { top: r.top - TH - MG, left: pinLeft(r.left) }
  }

  // direita
  if (direita >= TW + MG) {
    return { top: pinTop(r.top), left: r.right + MG }
  }

  // esquerda
  if (esquerda >= TW + MG) {
    return { top: pinTop(r.top), left: r.left - TW - MG }
  }

  // centro
  return {
    top:  Math.max(MG, vh / 2 - TH / 2),
    left: Math.max(MG, vw / 2 - TW / 2),
  }
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

export default function TourGuiado() {
  const pathname = usePathname()
  const passos   = obterPassos(pathname)

  const [ativo,      setAtivo]      = useState(false)
  const [etapa,      setEtapa]      = useState(0)
  const [destaque,   setDestaque]   = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

  const passo = passos?.[etapa]

  // ── atualiza highlight + tooltip ─────────────────────────────────────────
  const atualizar = useCallback(() => {
    if (!ativo || !passo) return

    const el = obterElemento(passo)

    const aplicar = () => {
      if (el) {
        const rect = el.getBoundingClientRect()
        // destaque em coordenadas de DOCUMENTO (absolute)
        setDestaque({
          top:    rect.top    + window.scrollY - 6,
          left:   rect.left   + window.scrollX - 6,
          width:  rect.width  + 12,
          height: rect.height + 12,
        })
        // tooltip em coordenadas de VIEWPORT (fixed)
        setTooltipPos(calcularPos(el, passo))
      } else {
        setDestaque(null)
        setTooltipPos(calcularPos(null, passo))
      }
    }

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      setTimeout(aplicar, 380) // aguarda scroll
    } else {
      aplicar()
    }
  }, [ativo, passo])

  useEffect(() => {
    if (ativo) {
      const t = setTimeout(atualizar, 80)
      return () => clearTimeout(t)
    }
  }, [ativo, etapa, atualizar])

  // fecha ao trocar de página
  useEffect(() => {
    setAtivo(false)
    setEtapa(0)
    setDestaque(null)
  }, [pathname])

  function iniciar()  { setEtapa(0); setAtivo(true) }
  function avancar()  { etapa < passos.length - 1 ? setEtapa(etapa + 1) : encerrar() }
  function voltar()   { if (etapa > 0) setEtapa(etapa - 1) }
  function encerrar() { setAtivo(false); setEtapa(0); setDestaque(null) }

  if (!passos) return null

  return (
    <>
      {/* ── Botão flutuante ────────────────────────────────────────────── */}
      <button
        onClick={iniciar}
        title="Ajuda guiada"
        style={{
          position:        "fixed",
          bottom:          "24px",
          right:           "24px",
          zIndex:          9000,
          width:           "52px",
          height:          "52px",
          borderRadius:    "50%",
          backgroundColor: "#2563eb",
          color:           "#fff",
          border:          "none",
          cursor:          "pointer",
          fontSize:        "20px",
          fontWeight:      "700",
          boxShadow:       "0 4px 16px rgba(37,99,235,0.45)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          transition:      "transform 0.15s, box-shadow 0.15s",
          userSelect:      "none",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.1)"
          e.currentTarget.style.boxShadow = "0 6px 22px rgba(37,99,235,0.55)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)"
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.45)"
        }}
      >
        ?
      </button>

      {/* ── Tour ativo ─────────────────────────────────────────────────── */}
      {ativo && (
        <>
          {/* Overlay */}
          <div
            onClick={encerrar}
            style={{
              position:        "fixed",
              inset:           0,
              zIndex:          9100,
              backgroundColor: "rgba(0,0,0,0.52)",
            }}
          />

          {/* Destaque (absolute — acompanha o scroll do documento) */}
          {destaque && (
            <div
              style={{
                position:      "absolute",
                top:           destaque.top,
                left:          destaque.left,
                width:         destaque.width,
                height:        destaque.height,
                zIndex:        9200,
                borderRadius:  "10px",
                boxShadow:     "0 0 0 9999px rgba(0,0,0,0.52)",
                pointerEvents: "none",
                border:        "2px solid #3b82f6",
                transition:    "all 0.3s ease",
              }}
            />
          )}

          {/* Tooltip (fixed — não se move com o scroll) */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position:        "fixed",
              top:             tooltipPos.top,
              left:            tooltipPos.left,
              zIndex:          9300,
              width:           `${TW}px`,
              backgroundColor: "#fff",
              borderRadius:    "14px",
              boxShadow:       "0 8px 32px rgba(0,0,0,0.22)",
              padding:         "20px 20px 16px",
              transition:      "top 0.25s ease, left 0.25s ease",
              pointerEvents:   "all",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "9px" }}>
              <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Passo {etapa + 1} de {passos.length}
              </span>
              <button
                onClick={encerrar}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af", lineHeight: 1, padding: "0 2px" }}
              >
                ×
              </button>
            </div>

            {/* Título */}
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#111827", marginBottom: "7px" }}>
              {passo?.titulo}
            </div>

            {/* Texto */}
            <div style={{ fontSize: "13px", color: "#374151", lineHeight: "1.65", marginBottom: "14px" }}>
              {passo?.texto}
            </div>

            {/* Progresso */}
            <div style={{ height: "4px", backgroundColor: "#e5e7eb", borderRadius: "9999px", marginBottom: "14px", overflow: "hidden" }}>
              <div style={{
                height:          "100%",
                width:           `${((etapa + 1) / passos.length) * 100}%`,
                backgroundColor: "#2563eb",
                borderRadius:    "9999px",
                transition:      "width 0.3s ease",
              }} />
            </div>

            {/* Botões */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={encerrar}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#9ca3af" }}
              >
                Pular
              </button>

              <div style={{ display: "flex", gap: "8px" }}>
                {etapa > 0 && (
                  <button
                    onClick={voltar}
                    style={{
                      padding:         "7px 13px",
                      borderRadius:    "8px",
                      border:          "1px solid #d1d5db",
                      backgroundColor: "#f9fafb",
                      cursor:          "pointer",
                      fontSize:        "13px",
                      fontWeight:      "600",
                      color:           "#374151",
                    }}
                  >
                    ← Voltar
                  </button>
                )}
                <button
                  onClick={avancar}
                  style={{
                    padding:         "7px 16px",
                    borderRadius:    "8px",
                    border:          "none",
                    backgroundColor: "#2563eb",
                    color:           "#fff",
                    cursor:          "pointer",
                    fontSize:        "13px",
                    fontWeight:      "600",
                  }}
                >
                  {etapa < passos.length - 1 ? "Próximo →" : "Concluir ✓"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}