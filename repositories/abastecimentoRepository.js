import Database from "../db/database.js";
import Abastecimento from "../entities/abastecimento.js";
import Veiculo from "../entities/veiculo.js";
import Usuario from "../entities/usuario.js";

export default class AbastecimentoRepository {

    #banco;

    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(abastecimento) {
        const sql = `
        INSERT INTO tb_abastecimento 
            (abastecimento_data, abastecimento_km, abastecimento_litros, abastecimento_valor,
             abastecimento_tipo_combustivel, abastecimento_km_media,
             abastecimento_veiculo_id, abastecimento_usuario_id, abastecimento_pagamento) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const valores = [
            abastecimento.data,
            abastecimento.km,
            abastecimento.litros,
            abastecimento.valor,
            abastecimento.tipoCombustivel,
            abastecimento.kmMedia,
            abastecimento.veiculo?.id ?? abastecimento.veiculo ?? null,
            abastecimento.usuario?.id ?? abastecimento.usuario ?? null,
            abastecimento.pagamento
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    async obter(id) {

        const sql = `
            SELECT a.*, 
                   v.veiculo_placa, 
                   u.usuario_nome
            FROM tb_abastecimento a
            LEFT JOIN tb_veiculos v ON a.abastecimento_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario u ON a.abastecimento_usuario_id = u.usuario_id
            WHERE a.abastecimento_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [id]);

        if (rows.length > 0)
            return this.toMap(rows[0]);

        return null;
    }

    async listar() {

        const sql = `
            SELECT a.*, 
                   v.veiculo_placa, 
                   u.usuario_nome
            FROM tb_abastecimento a
            LEFT JOIN tb_veiculos v ON a.abastecimento_veiculo_id = v.veiculo_id
            LEFT JOIN tb_usuario u ON a.abastecimento_usuario_id = u.usuario_id
            ORDER BY a.abastecimento_data DESC
        `;

        const rows = await this.#banco.ExecutaComando(sql);
        const lista = [];

        for (let row of rows) {
            lista.push(this.toMap(row));
        }

        return lista;
    }

    async alterar(abastecimento) {
        const sql = `
        UPDATE tb_abastecimento SET
            abastecimento_data = ?,
            abastecimento_km = ?,
            abastecimento_litros = ?,
            abastecimento_valor = ?,
            abastecimento_tipo_combustivel = ?,
            abastecimento_km_media = ?,
            abastecimento_veiculo_id = ?,
            abastecimento_usuario_id = ?,
            abastecimento_pagamento = ?
        WHERE abastecimento_id = ?
    `;

        const valores = [
            abastecimento.data,
            abastecimento.km,
            abastecimento.litros,
            abastecimento.valor,
            abastecimento.tipoCombustivel,
            abastecimento.kmMedia,
            abastecimento.veiculo?.id ?? abastecimento.veiculo ?? null,
            abastecimento.usuario?.id ?? abastecimento.usuario ?? null,
            abastecimento.pagamento,
            abastecimento.id
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    async listarPorVeiculo(veiculoId) {

        const sql = `
        SELECT a.*, 
               v.veiculo_placa, 
               u.usuario_nome
        FROM tb_abastecimento a
        LEFT JOIN tb_veiculos v ON a.abastecimento_veiculo_id = v.veiculo_id
        LEFT JOIN tb_usuario u ON a.abastecimento_usuario_id = u.usuario_id
        WHERE a.abastecimento_veiculo_id = ?
       ORDER BY a.abastecimento_data ASC
    `;

        const rows = await this.#banco.ExecutaComando(sql, [veiculoId]);
        const lista = [];

        for (let row of rows) {
            lista.push(this.toMap(row));
        }

        return lista;
    }


    async deletar(id) {

        const sql = `DELETE FROM tb_abastecimento WHERE abastecimento_id = ?`;

        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    
    async obterUltimoPorVeiculo(veiculoId) {
        const sql = `
        SELECT * FROM tb_abastecimento 
        WHERE abastecimento_veiculo_id = ?
        ORDER BY abastecimento_km DESC
        LIMIT 1
    `;
        const rows = await this.#banco.ExecutaComando(sql, [veiculoId]);
        if (rows.length > 0) return this.toMap(rows[0]);
        return null;
    }

    toMap(row) {
    let abastecimento = new Abastecimento();

    abastecimento.id = row["abastecimento_id"];
    abastecimento.data = row["abastecimento_data"];
    abastecimento.km = row["abastecimento_km"];
    abastecimento.litros = row["abastecimento_litros"];
    abastecimento.valor = row["abastecimento_valor"];
    abastecimento.tipoCombustivel = row["abastecimento_tipo_combustivel"];
    abastecimento.kmMedia = row["abastecimento_km_media"];
    abastecimento.pagamento = row["abastecimento_pagamento"]; 

    if (row["abastecimento_veiculo_id"]) {
        let v = new Veiculo(row["abastecimento_veiculo_id"]);
        v.placa = row["veiculo_placa"] || null;
        abastecimento.veiculo = v;
    }

    if (row["abastecimento_usuario_id"]) {
        let u = new Usuario(row["abastecimento_usuario_id"]);
        u.nome = row["usuario_nome"] || null;
        abastecimento.usuario = u;
    }

    return abastecimento;
}
}