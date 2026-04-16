"use client"

import { useState } from "react"
import { apiClient } from "@/utils/apiClient.js"
import { formatarMoeda } from "@/utils/validacao.js"
import toast from "react-hot-toast"

const MARCAS_PNEU = [
    "MICHELIN", "PIRELLI", "BRIDGESTONE", "GOODYEAR",
    "CONTINENTAL", "DUNLOP", "YOKOHAMA", "HANKOOK", "FIRESTONE", "KUMHO"
]

export default function ModalTrocaPneu({ aberto, fechar, veiculoId, kmAtual, onConfirmar }) {

    const [pneusVeiculo, setPneusVeiculo] = useState([])
    const [pneusEstoque, setPneusEstoque] = useState([])
    const [carregando, setCarregando] = useState(false)

    const [pneuSaidaId, setPneuSaidaId] = useState("")
    const [posicao, setPosicao] = useState("")
    const [usarEstoque, setUsarEstoque] = useState(true)
    const [pneuEstoqueSelecionado, setPneuEstoqueSelecionado] = useState("")
    const [novoPneuMarca, setNovoPneuMarca] = useState("")
    const [novoPneuMedida, setNovoPneuMedida] = useState("")
    const [novoPneuValor, setNovoPneuValor] = useState("")

    // CARREGA OS PNEUS QUANDO ABRE
    useState(function() {
        if (aberto) carregarDados()
    }, [aberto])

    async function carregarDados() {
        setCarregando(true)
        try {
            const pneusV = await apiClient.get("/pneu/veiculo/" + veiculoId)
            setPneusVeiculo(Array.isArray(pneusV) ? pneusV : [])

            const estoque = await apiClient.get("/pneu/estoque")
            setPneusEstoque(Array.isArray(estoque) ? estoque : [])
        } catch {
            toast.error("Erro ao carregar pneus")
        } finally {
            setCarregando(false)
        }
    }

    function selecionarPneuSaida(pneuId) {
        setPneuSaidaId(pneuId)
        for (let i = 0; i < pneusVeiculo.length; i++) {
            if (String(pneusVeiculo[i].id) === String(pneuId)) {
                setPosicao(pneusVeiculo[i].posicao || "")
                break
            }
        }
    }

    function converterMoeda(v) {
        if (!v) return 0
        return Number(v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim())
    }

    function dataDeHoje() {
        const hoje = new Date()
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`
    }

    function confirmar() {
        if (!pneuSaidaId) { toast.error("Selecione o pneu que vai sair"); return }
        if (!posicao) { toast.error("Informe a posição"); return }

        if (usarEstoque && !pneuEstoqueSelecionado) {
            toast.error("Selecione um pneu do estoque"); return
        }
        if (!usarEstoque && (!novoPneuMarca || !novoPneuMedida)) {
            toast.error("Preencha a marca e medida do pneu novo"); return
        }

        const pneuSaida = pneusVeiculo.find(function(p) {
            return String(p.id) === String(pneuSaidaId)
        })

        // RETORNA OS DADOS DA TROCA PARA O COMPONENTE PAI
        onConfirmar({
            pneuSaidaId,
            posicao,
            pneuEntradaId: usarEstoque ? pneuEstoqueSelecionado : null,
            novoPneu: !usarEstoque ? {
                marca: novoPneuMarca,
                medida: novoPneuMedida,
                valor: converterMoeda(novoPneuValor),
                dataaquisicao: dataDeHoje(),
                estado: "Bom"
            } : null,
            descricaoAuto: `Troca — ${posicao} (saída: ${pneuSaida?.marca || ""} ${pneuSaida?.medida || ""})`
        })

        fechar()
    }

    function fecharLimpo() {
        setPneuSaidaId("")
        setPosicao("")
        setUsarEstoque(true)
        setPneuEstoqueSelecionado("")
        setNovoPneuMarca("")
        setNovoPneuMedida("")
        setNovoPneuValor("")
        fechar()
    }

    if (!aberto) return null

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0 }}>🔄 Troca de Pneu</h2>
                    <button onClick={fecharLimpo} style={styles.btnFechar}>✕</button>
                </div>

                {carregando ? (
                    <p style={{ textAlign: "center", color: "#9ca3af" }}>Carregando pneus...</p>
                ) : (
                    <>
                        <div style={styles.grupo}>
                            <label>Pneu que vai SAIR:</label>
                            <select value={pneuSaidaId} onChange={function(e) { selecionarPneuSaida(e.target.value) }} style={styles.input}>
                                <option value="">Selecione</option>
                                {pneusVeiculo.map(function(p) {
                                    return (
                                        <option key={p.id} value={p.id}>
                                            {p.posicao} — {p.marca} {p.medida} ({p.estado})
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        <div style={styles.grupo}>
                            <label>Posição:</label>
                            <select value={posicao} onChange={function(e) { setPosicao(e.target.value) }} style={styles.input}>
                                <option value="">Selecione</option>
                                <option value="Dianteiro Esquerdo">Dianteiro Esquerdo</option>
                                <option value="Dianteiro Direito">Dianteiro Direito</option>
                                <option value="Traseiro Esquerdo">Traseiro Esquerdo</option>
                                <option value="Traseiro Direito">Traseiro Direito</option>
                                <option value="Estepe">Estepe</option>
                            </select>
                        </div>

                        {/* RADIO ESTOQUE OU NOVO */}
                        <div style={{ display: "flex", gap: "20px", marginBottom: "14px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                <input type="radio" checked={usarEstoque} onChange={function() { setUsarEstoque(true) }} />
                                Usar pneu do estoque ({pneusEstoque.length} disponíveis)
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                <input type="radio" checked={!usarEstoque} onChange={function() { setUsarEstoque(false) }} />
                                Pneu novo
                            </label>
                        </div>

                        {/* ESTOQUE */}
                        {usarEstoque && (
                            <div style={styles.grupo}>
                                <label>Pneu do estoque:</label>
                                <select value={pneuEstoqueSelecionado} onChange={function(e) { setPneuEstoqueSelecionado(e.target.value) }} style={styles.input}>
                                    <option value="">Selecione</option>
                                    {pneusEstoque.length === 0
                                        ? <option disabled>Nenhum pneu em estoque</option>
                                        : pneusEstoque.map(function(p) {
                                            return <option key={p.id} value={p.id}>{p.marca} — {p.medida} — {p.estado}</option>
                                        })
                                    }
                                </select>
                            </div>
                        )}

                        {/* PNEU NOVO */}
                        {!usarEstoque && (
                            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "12px" }}>
                                <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>Dados do pneu novo:</label>

                                <div style={styles.grupo}>
                                    <label>Marca:</label>
                                    <select value={novoPneuMarca} onChange={function(e) { setNovoPneuMarca(e.target.value) }} style={styles.input}>
                                        <option value="">Selecione</option>
                                        {MARCAS_PNEU.map(function(m) {
                                            return <option key={m} value={m}>{m}</option>
                                        })}
                                    </select>
                                </div>

                                <div style={styles.grupo}>
                                    <label>Medida:</label>
                                    <input type="text" value={novoPneuMedida}
                                        onChange={function(e) { setNovoPneuMedida(e.target.value) }}
                                        placeholder="Ex: 175/65 R14" style={styles.input} />
                                </div>

                                <div style={styles.grupo}>
                                    <label>Valor do pneu (opcional):</label>
                                    <input type="text" value={novoPneuValor}
                                        onChange={function(e) { setNovoPneuValor(formatarMoeda(e.target.value)) }}
                                        placeholder="R$ 0,00" style={styles.input} />
                                </div>
                            </div>
                        )}

                        {/* AVISO */}
                        {pneuSaidaId && (
                            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#78350f" }}>
                                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>⚠ O que vai acontecer ao salvar:</div>
                                <div>• Pneu que sai será marcado como DESCARTADO</div>
                                <div>• Histórico registrado na tabela de descartes</div>
                                <div>• KM registrada: {Number(kmAtual || 0).toLocaleString("pt-BR")} km</div>
                            </div>
                        )}

                        <div style={styles.botoes}>
                            <button onClick={fecharLimpo} style={styles.btnCancelar}>Cancelar</button>
                            <button onClick={confirmar} style={styles.btnConfirmar}>Confirmar</button>
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}

const styles = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 1100 },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "520px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
    grupo: { marginBottom: "12px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" },
    botoes: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
    btnFechar: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9ca3af" },
    btnCancelar: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" },
    btnConfirmar: { backgroundColor: "#f59e0b", color: "#000", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }
}