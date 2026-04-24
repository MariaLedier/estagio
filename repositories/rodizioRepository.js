import Database from "../db/database.js";
import Rodizio from "../entities/rodizio.js";
import RodizioItem from "../entities/rodizioItem.js";
import Veiculo from "../entities/veiculo.js";
import Usuario from "../entities/usuario.js";

export default class RodizioRepository {

    #banco;

    set banco(value) { this.#banco = value; }

    constructor() {
        this.#banco = new Database();
    }

    // ─── GRAVAR CABEÇALHO ─────────────────────────────────────────────────────

    async gravar(rodizio) {
        const sql = `
            INSERT INTO tb_rodizio
                (rodizio_data, rodizio_km, rodizio_observacoes,
                 rodizio_veiculo_id, rodizio_usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        const valores = [
            rodizio.data,
            rodizio.km ?? null,
            rodizio.observacoes ?? null,
            rodizio.veiculo?.id ?? rodizio.veiculo ?? null,
            rodizio.usuario?.id ?? rodizio.usuario ?? null,
        ];

        return await this.#banco.ExecutaComandoLastInserted(sql, valores);
    }

    // ─── GRAVAR ITEM ──────────────────────────────────────────────────────────

    async gravarItem(item) {
        const sql = `
            INSERT INTO tb_rodizio_item
                (item_pneu_id, item_posicao_anterior, item_posicao_nova, item_rodizio_id)
            VALUES (?, ?, ?, ?)
        `;

        const valores = [
            item.pneu?.id ?? item.pneu ?? null,
            item.posicaoAnterior,
            item.posicaoNova,
            item.rodizio?.id ?? item.rodizio ?? null,
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    // ─── ATUALIZAR POSIÇÃO DO PNEU ────────────────────────────────────────────
    // Após o rodízio, atualiza pneu_posicao em tb_pneus para refletir a nova posição

    async atualizarPosicaoPneu(pneuId, posicaoNova) {
        const sql = `
            UPDATE tb_pneus
            SET    pneus_posicao = ?
            WHERE  pneus_id      = ?
        `;
        return await this.#banco.ExecutaComandoNonQuery(sql, [posicaoNova, pneuId]);
    }

    // ─── OBTER POR ID ─────────────────────────────────────────────────────────

    async obter(id) {
        const sql = `
            SELECT
                r.*,
                v.veiculo_placa,
                u.usuario_nome
            FROM tb_rodizio r
            LEFT JOIN tb_veiculos v ON r.rodizio_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario  u ON r.rodizio_usuario_id = u.usuario_id
            WHERE r.rodizio_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [id]);

        if (rows.length > 0) {
            let rodizio = this.toMap(rows[0]);
            rodizio.itens = await this.listarItens(id);
            return rodizio;
        }

        return null;
    }

    // ─── LISTAR POR VEÍCULO ───────────────────────────────────────────────────

    async listarPorVeiculo(veiculoId) {
        const sql = `
            SELECT
                r.*,
                v.veiculo_placa,
                u.usuario_nome
            FROM tb_rodizio r
            LEFT JOIN tb_veiculos v ON r.rodizio_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario  u ON r.rodizio_usuario_id = u.usuario_id
            WHERE r.rodizio_veiculo_id = ?
            ORDER BY r.rodizio_data DESC, r.rodizio_criado_em DESC
        `;

        const rows = await this.#banco.ExecutaComando(sql, [veiculoId]);
        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            let rodizio = this.toMap(rows[i]);
            rodizio.itens = await this.listarItens(rodizio.id);
            lista.push(rodizio);
        }

        return lista;
    }

    // ─── LISTAR ITENS ─────────────────────────────────────────────────────────

    async listarItens(rodizioId) {
        const sql = `
            SELECT
                i.*,
                p.pneus_marca,
                p.pneus_medida,
                p.pneus_estado
            FROM tb_rodizio_item i
            LEFT JOIN tb_pneus p ON i.item_pneu_id = p.pneus_id
            WHERE i.item_rodizio_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [rodizioId]);
        let itens = [];

        for (let i = 0; i < rows.length; i++) {
            let item = new RodizioItem();
            item.id              = rows[i]["item_id"];
            item.posicaoAnterior = rows[i]["item_posicao_anterior"];
            item.posicaoNova     = rows[i]["item_posicao_nova"];
            item.pneu = {
                id:     rows[i]["item_pneu_id"],
                marca:  rows[i]["pneus_marca"]  || "—",
                medida: rows[i]["pneus_medida"] || "—",
                estado: rows[i]["pneus_estado"] || "—",
            };
            itens.push(item);
        }

        return itens;
    }

    // ─── DELETAR ──────────────────────────────────────────────────────────────

    async deletarItens(rodizioId) {
        const sql = `DELETE FROM tb_rodizio_item WHERE item_rodizio_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [rodizioId]);
    }

    async deletar(id) {
        await this.deletarItens(id);
        const sql = `DELETE FROM tb_rodizio WHERE rodizio_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    // ─── toMap ────────────────────────────────────────────────────────────────

    toMap(row) {
        let rodizio = new Rodizio();

        rodizio.id          = row["rodizio_id"];
        rodizio.data        = row["rodizio_data"];
        rodizio.km          = row["rodizio_km"];
        rodizio.observacoes = row["rodizio_observacoes"];
        rodizio.itens       = [];

        if (row["rodizio_veiculo_id"]) {
            let v = new Veiculo(row["rodizio_veiculo_id"]);
            v.placa = row["veiculo_placa"] || null;
            rodizio.veiculo = v;
        }

        if (row["rodizio_usuario_id"]) {
            let u = new Usuario(row["rodizio_usuario_id"]);
            u.nome = row["usuario_nome"] || null;
            rodizio.usuario = u;
        }

        return rodizio;
    }
}