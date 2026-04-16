"use client"

import { useState, useRef, useEffect } from "react"
import { formatarMoeda, formatarKm } from "@/utils/validacao.js"
import toast from "react-hot-toast"
import ModalTrocaPneu from "./ModalTrocaPneu.jsx"

const ID_SERVICO_TROCA_PNEU = 10

export default function ModalManutencao({
    aberto,
    fechar,
    editando,
    veiculoId,
    veiculo,
    servicos,
    oficinas,
    usuarios,
    user,
    isAdmin,
    onSalvar
}) {

    const [itens, setItens] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalTrocaAberto, setModalTrocaAberto] = useState(false)
    const [itemTrocaIndex, setItemTrocaIndex] = useState(null)

    const tipo = useRef()
    const status = useRef()
    const data = useRef()
    const km = useRef()
    const usuarioRef = useRef()
    const descricao = useRef()

    function dataDeHoje() {
        const hoje = new Date()
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`
    }

    function formatarDataInput(valor) {
        if (!valor) return ""
        const d = new Date(valor)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }

    function converterMoeda(v) {
        if (!v) return 0
        return Number(v.replace("R$", "").replace(/\./g, "").replace(",", ".").trim())
    }

    // PREENCHE OS CAMPOS QUANDO ABRE
    useEffect(function() {
        if (!aberto) return
        if (editando) {
            setItens(
                editando.itens && editando.itens.length > 0
                    ? editando.itens.map(function(i) {
                        return {
                            descricao: i.descricao || "",
                            valor: formatarMoeda(String(i.valor || "0")),
                            servico: i.servico?.id || i.servico || "",
                            oficina: i.oficina?.id || i.oficina || "",
                            trocaPneu: null
                        }
                    })
                    : [{ descricao: "", valor: "", servico: "", oficina: "", trocaPneu: null }]
            )
            setTimeout(function() {
                tipo.current.value = editando.tipo || "PREVENTIVA"
                status.current.value = editando.status || "AGENDADA"
                data.current.value = formatarDataInput(editando.data)
                km.current.value = editando.km ? String(editando.km) : ""
                descricao.current.value = editando.descricao || ""
                usuarioRef.current.value = editando.usuario?.id || editando.usuario || user?.id || ""
            }, 50)
        } else {
            setItens([{ descricao: "", valor: "", servico: "", oficina: "", trocaPneu: null }])
            setTimeout(function() {
                tipo.current.value = "PREVENTIVA"
                status.current.value = "AGENDADA"
                data.current.value = dataDeHoje()
                km.current.value = ""
                descricao.current.value = ""
                usuarioRef.current.value = user?.id || ""
            }, 50)
        }
    }, [aberto])

    // -------------------- ITENS --------------------

    function adicionarItem() {
        setItens([...itens, { descricao: "", valor: "", servico: "", oficina: "", trocaPneu: null }])
    }

    function removerItem(index) {
        const copia = [...itens]
        copia.splice(index, 1)
        setItens(copia)
    }

    function alterarItem(index, campo, valor) {
        const copia = [...itens]
        copia[index][campo] = valor

        // SE SELECIONOU TROCA DE PNEU → abre modal
        if (campo === "servico" && String(valor) === String(ID_SERVICO_TROCA_PNEU)) {
            setItemTrocaIndex(index)
            setModalTrocaAberto(true)
        }

        setItens(copia)
    }

    // CHAMADO QUANDO O MODAL DE TROCA CONFIRMA
    function onTrocaConfirmada(dadosTroca) {
        const copia = [...itens]
        copia[itemTrocaIndex].trocaPneu = dadosTroca
        copia[itemTrocaIndex].descricao = dadosTroca.descricaoAuto
        setItens(copia)
        setItemTrocaIndex(null)
    }

    // CHAMADO QUANDO O MODAL DE TROCA FECHA SEM CONFIRMAR
    function onTrocaFechada() {
        if (itemTrocaIndex !== null) {
            const copia = [...itens]
            if (copia[itemTrocaIndex] && !copia[itemTrocaIndex].trocaPneu) {
                copia[itemTrocaIndex].servico = ""
            }
            setItens(copia)
        }
        setItemTrocaIndex(null)
        setModalTrocaAberto(false)
    }

    // -------------------- SALVAR --------------------

    async function salvar() {
        if (!tipo.current.value || !data.current.value || !usuarioRef.current.value) {
            toast.error("Preencha os campos obrigatórios")
            return
        }

        for (let i = 0; i < itens.length; i++) {
            if (String(itens[i].servico) === String(ID_SERVICO_TROCA_PNEU) && !itens[i].trocaPneu) {
                toast.error("Preencha os dados da troca de pneu no item " + (i + 1))
                return
            }
        }

        setLoading(true)

        try {
            const itensPayload = []
            for (let i = 0; i < itens.length; i++) {
                if (itens[i].servico && itens[i].oficina) {
                    itensPayload.push({
                        descricao: itens[i].descricao,
                        valor: converterMoeda(itens[i].valor),
                        servico: itens[i].servico,
                        oficina: itens[i].oficina,
                        trocaPneu: itens[i].trocaPneu || null
                    })
                }
            }

            const obj = {
                tipo: tipo.current.value,
                data: data.current.value,
                descricao: descricao.current.value,
                status: status.current.value,
                km: km.current.value ? parseInt(km.current.value.replace(/\./g, "")) : null,
                veiculo: veiculoId,
                usuario: usuarioRef.current.value,
                itens: itensPayload
            }

            await onSalvar(obj, editando)
            fechar()

        } catch {
            toast.error("Erro ao salvar manutenção")
        } finally {
            setLoading(false)
        }
    }

    if (!aberto) return null

    return (
        <>
            <div style={styles.overlay}>
                <div style={styles.modal}>

                    <h2 style={{ marginBottom: 20 }}>
                        {editando ? "Editar Manutenção" : "Nova Manutenção"}
                    </h2>

                    <div style={styles.grid2}>
                        <div style={styles.grupo}>
                            <label>Tipo:</label>
                            <select ref={tipo} style={styles.input}>
                                <option value="PREVENTIVA">Preventiva</option>
                                <option value="CORRETIVA">Corretiva</option>
                            </select>
                        </div>
                        <div style={styles.grupo}>
                            <label>Status:</label>
                            <select ref={status} style={styles.input}>
                                <option value="AGENDADA">Agendada</option>
                                <option value="EM_ANDAMENTO">Em Andamento</option>
                                <option value="CONCLUIDA">Concluída</option>
                                <option value="CANCELADA">Cancelada</option>
                            </select>
                        </div>
                        <div style={styles.grupo}>
                            <label>Data:</label>
                            <input ref={data} type="date" style={styles.input} />
                        </div>
                        <div style={styles.grupo}>
                            <label>KM:</label>
                            <input ref={km} type="text" style={styles.input} placeholder="Ex: 54.000"
                                onChange={function() { km.current.value = formatarKm(km.current.value) }} />
                        </div>
                    </div>

                    <div style={styles.grupo}>
                        <label>Usuário:</label>
                        {isAdmin ? (
                            <select ref={usuarioRef} style={styles.input}>
                                <option value="">-- Selecione --</option>
                                {usuarios.map(function(u) {
                                    return <option key={u.id} value={u.id}>{u.nome}</option>
                                })}
                            </select>
                        ) : (
                            <>
                                <input ref={usuarioRef} type="hidden" defaultValue={user?.id || ""} />
                                <input type="text" value={user?.nome || ""} readOnly
                                    style={{ ...styles.input, backgroundColor: "#f1f5f9", color: "#6b7280" }} />
                            </>
                        )}
                    </div>

                    <div style={styles.grupo}>
                        <label>Descrição:</label>
                        <textarea ref={descricao} style={{ ...styles.input, height: "60px", resize: "vertical" }}
                            placeholder="Descreva a manutenção..." />
                    </div>

                    {/* ITENS */}
                    <div style={{ marginTop: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <label style={{ fontWeight: "bold" }}>Itens da Manutenção</label>
                            <button type="button" onClick={adicionarItem} style={styles.btnAdd}>+ Adicionar Item</button>
                        </div>

                        {itens.map(function(item, index) {
                            const eTrocaPneu = String(item.servico) === String(ID_SERVICO_TROCA_PNEU)

                            return (
                                <div key={index} style={{
                                    ...styles.itemRow,
                                    border: eTrocaPneu && item.trocaPneu ? "2px solid #22c55e" : "1px solid #e5e7eb"
                                }}>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", width: "100%" }}>

                                        <div style={{ flex: 2 }}>
                                            <label style={styles.labelSm}>Serviço</label>
                                            <select value={item.servico}
                                                onChange={function(e) { alterarItem(index, "servico", e.target.value) }}
                                                style={styles.inputSm}>
                                                <option value="">Selecione</option>
                                                {servicos.map(function(s) {
                                                    return <option key={s.id} value={s.id}>{s.nome}</option>
                                                })}
                                            </select>
                                        </div>

                                        <div style={{ flex: 2 }}>
                                            <label style={styles.labelSm}>Oficina</label>
                                            <select value={item.oficina}
                                                onChange={function(e) { alterarItem(index, "oficina", e.target.value) }}
                                                style={styles.inputSm}>
                                                <option value="">Selecione</option>
                                                {oficinas.map(function(o) {
                                                    return <option key={o.id} value={o.id}>{o.nome}</option>
                                                })}
                                            </select>
                                        </div>

                                        <div style={{ flex: 2 }}>
                                            <label style={styles.labelSm}>Descrição</label>
                                            <input type="text" value={item.descricao}
                                                onChange={function(e) { alterarItem(index, "descricao", e.target.value) }}
                                                style={styles.inputSm} placeholder="Descrição" />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <label style={styles.labelSm}>Valor</label>
                                            <input type="text" value={item.valor}
                                                onChange={function(e) { alterarItem(index, "valor", formatarMoeda(e.target.value)) }}
                                                style={styles.inputSm} placeholder="R$ 0,00" />
                                        </div>

                                        <button type="button" onClick={function() { removerItem(index) }} style={styles.btnRemover}>✕</button>
                                    </div>

                                    {/* LINHA DE TROCA DE PNEU */}
                                    {eTrocaPneu && (
                                        <div style={{ width: "100%", paddingTop: "6px" }}>
                                            {item.trocaPneu ? (
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", padding: "8px 12px", borderRadius: "8px" }}>
                                                    <span style={{ fontSize: "13px", color: "#16a34a" }}>
                                                        ✓ Troca configurada — {item.trocaPneu.posicao}
                                                    </span>
                                                    <button type="button"
                                                        onClick={function() { setItemTrocaIndex(index); setModalTrocaAberto(true) }}
                                                        style={{ fontSize: "12px", background: "none", border: "1px solid #16a34a", color: "#16a34a", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>
                                                        Alterar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff7ed", padding: "8px 12px", borderRadius: "8px" }}>
                                                    <span style={{ fontSize: "13px", color: "#c2410c" }}>
                                                        ⚠ Preencha os dados da troca
                                                    </span>
                                                    <button type="button"
                                                        onClick={function() { setItemTrocaIndex(index); setModalTrocaAberto(true) }}
                                                        style={{ fontSize: "12px", background: "#f59e0b", border: "none", color: "#000", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontWeight: "bold" }}>
                                                        Preencher
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div style={styles.botoes}>
                        <button type="button" onClick={fechar} style={styles.btnCancelar}>Cancelar</button>
                        <button type="button" onClick={salvar} disabled={loading} style={styles.btnSalvar}>
                            {loading ? "Salvando..." : "Salvar"}
                        </button>
                    </div>

                </div>
            </div>

            {/* MODAL DE TROCA — fica dentro do ModalManutencao */}
            <ModalTrocaPneu
                aberto={modalTrocaAberto}
                fechar={onTrocaFechada}
                veiculoId={veiculoId}
                kmAtual={veiculo?.kmatual}
                onConfirmar={onTrocaConfirmada}
            />
        </>
    )
}

const styles = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)", zIndex: 999 },
    modal: { backgroundColor: "#fff", padding: "30px", borderRadius: "16px", width: "700px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", maxHeight: "90vh", overflowY: "auto" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" },
    grupo: { marginBottom: "12px", display: "flex", flexDirection: "column", gap: "5px" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" },
    inputSm: { padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px", width: "100%" },
    labelSm: { fontSize: "12px", color: "#6b7280" },
    itemRow: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px" },
    botoes: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" },
    btnAdd: { backgroundColor: "#f1f5f9", color: "#374151", padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", cursor: "pointer", fontSize: "13px" },
    btnRemover: { backgroundColor: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", alignSelf: "flex-end" },
    btnCancelar: { backgroundColor: "#9ca3af", color: "#fff", padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer" },
    btnSalvar: { backgroundColor: "#2563eb", color: "#fff", padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }
}