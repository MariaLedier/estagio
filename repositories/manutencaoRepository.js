import Database from "../db/database.js";
import Manutencao from "../entities/manutencao.js";
import ManutencaoItem from "../entities/manutencaoItem.js";
import Veiculo from "../entities/veiculo.js";
import Usuario from "../entities/usuario.js";
import Servico from "../entities/servico.js";
import Oficina from "../entities/oficina.js";

export default class ManutencaoRepository {

    #banco;

    set banco(value) { this.#banco = value; }

    constructor() {
        this.#banco = new Database();
    }

    // -------------------- GRAVAR --------------------
    async gravar(manutencao) {
        const sql = `
            INSERT INTO tb_manutencao
                (manutencao_tipo, manutencao_data, manutencao_descricao,
                 manutencao_status, manutencao_km,
                 manutencao_veiculo_id, manutencao_usuario_id,
                 manutencao_data_conclusao, manutencao_forma_pagamento)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            manutencao.tipo,
            manutencao.data,
            manutencao.descricao,
            manutencao.status,
            manutencao.km,
            manutencao.veiculo?.id ?? manutencao.veiculo ?? null,
            manutencao.usuario?.id ?? manutencao.usuario ?? null,
            manutencao.dataConclusao ?? null,
            manutencao.formaPagamento ?? null
        ];

        return await this.#banco.ExecutaComandoLastInserted(sql, valores);
    }

    // -------------------- GRAVAR ITEM --------------------
    async gravarItem(item) {
        const sql = `
            INSERT INTO tb_manutencao_item
                (item_descricao, item_valor, item_manutencao_id,
                 item_servico_id, item_oficina_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        const valores = [
            item.descricao,
            item.valor,
            item.manutencao?.id ?? item.manutencao ?? null,
            item.servico?.id ?? item.servico ?? null,
            item.oficina?.id ?? item.oficina ?? null
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    // -------------------- OBTER --------------------
    async obter(id) {
        const sql = `
            SELECT
                ma.*,
                v.veiculo_placa,
                u.usuario_nome
            FROM tb_manutencao ma
            LEFT JOIN tb_veiculos v ON ma.manutencao_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario u ON ma.manutencao_usuario_id = u.usuario_id
            WHERE ma.manutencao_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [id]);

        if (rows.length > 0) {
            let manutencao = this.toMap(rows[0]);
            manutencao.itens = await this.listarItens(id);
            return manutencao;
        }

        return null;
    }

    // -------------------- LISTAR --------------------
    async listar() {
    const sql = `
        SELECT
            ma.*,
            v.veiculo_placa,
            u.usuario_nome
        FROM tb_manutencao ma
        LEFT JOIN tb_veiculos v ON ma.manutencao_veiculo_id = v.veiculo_id
        LEFT JOIN tb_usuario u ON ma.manutencao_usuario_id = u.usuario_id
        ORDER BY ma.manutencao_data DESC
    `;

    const rows = await this.#banco.ExecutaComando(sql);
    const lista = [];

    for (const row of rows) {
        let manutencao = this.toMap(row);
        manutencao.itens = await this.listarItens(manutencao.id); // 👈 isso estava faltando
        lista.push(manutencao);
    }

    return lista;
}
    // -------------------- LISTAR POR VEÍCULO --------------------
    async listarPorVeiculo(veiculoId) {
        const sql = `
            SELECT
                ma.*,
                v.veiculo_placa,
                u.usuario_nome
            FROM tb_manutencao ma
            LEFT JOIN tb_veiculos v ON ma.manutencao_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario u ON ma.manutencao_usuario_id = u.usuario_id
            WHERE ma.manutencao_veiculo_id = ?
            ORDER BY ma.manutencao_data DESC
        `;

        const rows = await this.#banco.ExecutaComando(sql, [veiculoId]);
        const lista = [];

        for (const row of rows) {
            let manutencao = this.toMap(row);
            manutencao.itens = await this.listarItens(manutencao.id);
            lista.push(manutencao);
        }

        return lista;
    }

    // -------------------- LISTAR ITENS --------------------
    async listarItens(manutencaoId) {
        const sql = `
            SELECT
                i.*,
                s.servico_nome,
                o.oficina_nome
            FROM tb_manutencao_item i
            LEFT JOIN tb_servico s ON i.item_servico_id = s.servico_id
            LEFT JOIN tb_oficina o ON i.item_oficina_id = o.oficina_id
            WHERE i.item_manutencao_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [manutencaoId]);
        return rows.map(r => this.toMapItem(r));
    }

    // -------------------- ALTERAR --------------------
    async alterar(manutencao) {
        const sql = `
            UPDATE tb_manutencao SET
                manutencao_tipo = ?,
                manutencao_data = ?,
                manutencao_descricao = ?,
                manutencao_status = ?,
                manutencao_km = ?,
                manutencao_veiculo_id = ?,
                manutencao_usuario_id = ?,
                manutencao_data_conclusao = ?,
                manutencao_forma_pagamento = ?
            WHERE manutencao_id = ?
        `;

        const valores = [
            manutencao.tipo,
            manutencao.data,
            manutencao.descricao,
            manutencao.status,
            manutencao.km,
            manutencao.veiculo?.id ?? manutencao.veiculo ?? null,
            manutencao.usuario?.id ?? manutencao.usuario ?? null,
            manutencao.dataConclusao ?? null,
            manutencao.formaPagamento ?? null,
            manutencao.id
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    // -------------------- CONCLUIR (status + data + pagamento) --------------------
    async concluir(id, dataConclusao, formaPagamento) {
        const sql = `
            UPDATE tb_manutencao SET
                manutencao_status = 'CONCLUIDA',
                manutencao_data_conclusao = ?,
                manutencao_forma_pagamento = ?
            WHERE manutencao_id = ?
        `;
        return await this.#banco.ExecutaComandoNonQuery(sql, [dataConclusao, formaPagamento, id]);
    }

    // -------------------- ATUALIZAR STATUS --------------------
    async atualizarStatus(id, status) {
        const sql = `UPDATE tb_manutencao SET manutencao_status = ? WHERE manutencao_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [status, id]);
    }

    // -------------------- DELETAR --------------------
    async deletarItens(manutencaoId) {
        const sql = `DELETE FROM tb_manutencao_item WHERE item_manutencao_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [manutencaoId]);
    }

    async deletar(id) {
        await this.deletarItens(id);
        const sql = `DELETE FROM tb_manutencao WHERE manutencao_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    // -------------------- MAPEAMENTOS --------------------
    toMap(row) {
        let manutencao = new Manutencao();

        manutencao.id = row["manutencao_id"];
        manutencao.tipo = row["manutencao_tipo"];
        manutencao.data = row["manutencao_data"];
        manutencao.descricao = row["manutencao_descricao"];
        manutencao.status = row["manutencao_status"];
        manutencao.km = row["manutencao_km"];
        manutencao.dataConclusao = row["manutencao_data_conclusao"] ?? null;
        manutencao.formaPagamento = row["manutencao_forma_pagamento"] ?? null;

        if (row["manutencao_veiculo_id"]) {
            let v = new Veiculo(row["manutencao_veiculo_id"]);
            v.placa = row["veiculo_placa"] || null;
            manutencao.veiculo = v;
        }

        if (row["manutencao_usuario_id"]) {
            let u = new Usuario(row["manutencao_usuario_id"]);
            u.nome = row["usuario_nome"] || null;
            manutencao.usuario = u;
        }

        manutencao.itens = [];
        return manutencao;
    }

    toMapItem(row) {
        let item = new ManutencaoItem();

        item.id = row["item_id"];
        item.descricao = row["item_descricao"];
        item.valor = row["item_valor"];

        if (row["item_servico_id"]) {
            let s = new Servico(row["item_servico_id"]);
            s.nome = row["servico_nome"] || null;
            item.servico = s;
        }

        if (row["item_oficina_id"]) {
            let o = new Oficina(row["item_oficina_id"]);
            o.nome = row["oficina_nome"] || null;
            item.oficina = o;
        }

        return item;
    }
}