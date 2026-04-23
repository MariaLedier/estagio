import Database from "../db/database.js";
import Checklist from "../entities/checklist.js";
import ChecklistItem from "../entities/checklistItem.js";
import Veiculo from "../entities/veiculo.js";
import Usuario from "../entities/usuario.js";

// ─── MAPEAMENTO PNEU ──────────────────────────────────────────────────────────
// Apenas estes 5 campos do checklist sincronizam o pneu_estado em tb_pneu.
// Todos os outros 28 campos ficam somente em tb_checklist_item para relatório.
const CAMPO_PARA_POSICAO_PNEU = {
    pneu_dianteiro_esq: "Dianteiro Esquerdo",
    pneu_dianteiro_dir: "Dianteiro Direito",
    pneu_traseiro_esq:  "Traseiro Esquerdo",
    pneu_traseiro_dir:  "Traseiro Direito",
    estepe:             "Estepe",
};

// ─── TODOS OS CAMPOS DO CHECKLIST (33 itens) ──────────────────────────────────
// Usado para garantir que todos os campos sejam salvos,
// mesmo que o frontend não envie algum (salva como "Não verificado")
const TODOS_OS_CAMPOS = [
    // Motor & Fluidos
    "oleo", "agua", "fluido_freio", "fluido_direcao", "arrefecimento", "correia",
    // Freios
    "freio_dianteiro", "freio_traseiro", "disco_dianteiro", "disco_traseiro", "freio_mao",
    // Pneus
    "pneu_dianteiro_esq", "pneu_dianteiro_dir", "pneu_traseiro_esq", "pneu_traseiro_dir",
    "estepe", "calibragem",
    // Elétrico
    "bateria", "farol_dianteiro", "farol_traseiro", "setas", "luz_re", "painel",
    // Carroceria & Cabine
    "para_brisa", "limpador", "portas", "espelhos", "cinto", "extintor", "triangulo",
    // Suspensão & Direção
    "amortecedor_diant", "amortecedor_tras", "alinhamento", "barra_direcao",
];

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
    // Salva um item individual em tb_checklist_item.
    // Chamado para TODOS os 33 campos (oleo, freio_dianteiro, pneu_traseiro_esq, bateria, etc.)

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
    // Retorna objeto { campo: status } com todos os 33 itens
    // Ex: { oleo: "Bom", freio_dianteiro: "Ruim", pneu_traseiro_esq: "Regular", ... }

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
    // Percorre APENAS os 5 campos de pneu e atualiza pneu_estado em tb_pneu.
    // Os demais campos (oleo, freios, bateria, etc.) NÃO entram aqui —
    // eles ficam somente em tb_checklist_item para relatório e histórico.

    async sincronizarPneus(veiculoId, itens) {
        for (let campo of Object.keys(CAMPO_PARA_POSICAO_PNEU)) {
            const posicao = CAMPO_PARA_POSICAO_PNEU[campo];
            const status  = itens[campo];

            // Só atualiza se o responsável realmente inspecionou
            if (!status || status === "Não verificado") continue;

            const sql = `
                UPDATE tb_pneus
                SET    pneus_estado = ?
                WHERE  pneus_veiculo_id = ?
                AND    pneus_posicao    = ?
            `;

            await this.#banco.ExecutaComandoNonQuery(sql, [status, veiculoId, posicao]);
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