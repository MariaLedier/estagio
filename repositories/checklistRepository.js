import Database from "../db/database.js";
import Checklist from "../entities/checklist.js";
import ChecklistItem from "../entities/checklistItem.js";
import Veiculo from "../entities/veiculo.js";
import Usuario from "../entities/usuario.js";

// ─── MAPEAMENTO PNEU ──────────────────────────────────────────────────────────
// Campo do checklist → posição em tb_pneu
const CAMPO_PARA_POSICAO_PNEU = {
    pneu_dianteiro_esq: "Dianteiro Esquerdo",
    pneu_dianteiro_dir: "Dianteiro Direito",
    pneu_traseiro_esq:  "Traseiro Esquerdo",
    pneu_traseiro_dir:  "Traseiro Direito",
    estepe:             "Estepe",
};

// ─── CONVERSÃO DE STATUS ──────────────────────────────────────────────────────
// O checklist usa "Regular" (padrão do sistema de checklist)
// mas a tabela de pneus usa "Médio".
// Esta função converte na hora de sincronizar.
function statusParaPneu(statusChecklist) {
    if (statusChecklist === "Regular") return "Médio";
    return statusChecklist; // "Bom" e "Ruim" ficam iguais
}

export default class ChecklistRepository {

    #banco;

    set banco(value) { this.#banco = value; }

    constructor() {
        this.#banco = new Database();
    }

    // ─── GRAVAR CABEÇALHO ─────────────────────────────────────────────────────

    async gravar(checklist) {
        const sql = `
            INSERT INTO tb_checklist
                (checklist_data, checklist_km, checklist_observacoes,
                 checklist_veiculo_id, checklist_usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        const valores = [
            checklist.data,
            checklist.km ?? null,
            checklist.observacoes ?? null,
            checklist.veiculo?.id ?? checklist.veiculo ?? null,
            checklist.usuario?.id ?? checklist.usuario ?? null,
        ];

        return await this.#banco.ExecutaComandoLastInserted(sql, valores);
    }

    // ─── GRAVAR ITEM ──────────────────────────────────────────────────────────

    async gravarItem(item) {
        const sql = `
            INSERT INTO tb_checklist_item
                (item_campo, item_status, item_checklist_id)
            VALUES (?, ?, ?)
        `;

        const valores = [
            item.campo,
            item.status,
            item.checklist?.id ?? item.checklist ?? null,
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    // ─── OBTER POR ID ─────────────────────────────────────────────────────────

    async obter(id) {
        const sql = `
            SELECT
                c.*,
                v.veiculo_placa,
                u.usuario_nome
            FROM tb_checklist c
            LEFT JOIN tb_veiculos v ON c.checklist_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario  u ON c.checklist_usuario_id = u.usuario_id
            WHERE c.checklist_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [id]);

        if (rows.length > 0) {
            let checklist = this.toMap(rows[0]);
            checklist.itens = await this.listarItens(id);
            return checklist;
        }

        return null;
    }

    // ─── LISTAR POR VEÍCULO ───────────────────────────────────────────────────

    async listarPorVeiculo(veiculoId) {
        const sql = `
            SELECT
                c.*,
                v.veiculo_placa,
                u.usuario_nome
            FROM tb_checklist c
            LEFT JOIN tb_veiculos v ON c.checklist_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario  u ON c.checklist_usuario_id = u.usuario_id
            WHERE c.checklist_veiculo_id = ?
            ORDER BY c.checklist_data DESC, c.checklist_criado_em DESC
        `;

        const rows = await this.#banco.ExecutaComando(sql, [veiculoId]);
        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            let checklist = this.toMap(rows[i]);
            checklist.itens = await this.listarItens(checklist.id);
            lista.push(checklist);
        }

        return lista;
    }

    // ─── LISTAR ITENS ─────────────────────────────────────────────────────────

    async listarItens(checklistId) {
        const sql = `
            SELECT item_campo, item_status
            FROM tb_checklist_item
            WHERE item_checklist_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [checklistId]);

        let itensObj = {};
        for (let i = 0; i < rows.length; i++) {
            itensObj[rows[i]["item_campo"]] = rows[i]["item_status"];
        }

        return itensObj;
    }

    // ─── SINCRONIZAR PNEUS ────────────────────────────────────────────────────
    // Atualiza pneu_estado em tb_pneus para os 5 campos de pneu.
    // Converte "Regular" (checklist) → "Médio" (padrão da tabela de pneus).
    // Ignora campos com "Não verificado".

    async sincronizarPneus(veiculoId, itens) {
        for (let campo of Object.keys(CAMPO_PARA_POSICAO_PNEU)) {
            const posicao         = CAMPO_PARA_POSICAO_PNEU[campo];
            const statusChecklist = itens[campo];

            if (!statusChecklist || statusChecklist === "Não verificado") continue;

            const estadoPneu = statusParaPneu(statusChecklist);

            const sql = `
                UPDATE tb_pneus
                SET    pneus_estado = ?
                WHERE  pneus_veiculo_id = ?
                AND    pneus_posicao    = ?
            `;

            await this.#banco.ExecutaComandoNonQuery(sql, [estadoPneu, veiculoId, posicao]);
        }
    }

    // ─── DELETAR ──────────────────────────────────────────────────────────────

    async deletarItens(checklistId) {
        const sql = `DELETE FROM tb_checklist_item WHERE item_checklist_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [checklistId]);
    }

    async deletar(id) {
        await this.deletarItens(id);
        const sql = `DELETE FROM tb_checklist WHERE checklist_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    // ─── toMap ────────────────────────────────────────────────────────────────

    toMap(row) {
        let checklist = new Checklist();

        checklist.id          = row["checklist_id"];
        checklist.data        = row["checklist_data"];
        checklist.km          = row["checklist_km"];
        checklist.observacoes = row["checklist_observacoes"];
        checklist.itens       = {};

        if (row["checklist_veiculo_id"]) {
            let v = new Veiculo(row["checklist_veiculo_id"]);
            v.placa = row["veiculo_placa"] || null;
            checklist.veiculo = v;
        }

        if (row["checklist_usuario_id"]) {
            let u = new Usuario(row["checklist_usuario_id"]);
            u.nome = row["usuario_nome"] || null;
            checklist.usuario = u;
        }

        return checklist;
    }
}