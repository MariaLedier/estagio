import Database from "../db/database.js";
import Conta from "../entities/conta.js";
import Veiculo from "../entities/veiculo.js";
import Manutencao from "../entities/manutencao.js";

export default class ContaRepository {

    #banco;

    set banco(value) { this.#banco = value; }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(conta) {
        const sql = `
            INSERT INTO tb_conta
                (conta_descricao, conta_valor, conta_valor_pago, conta_forma_pagamento,
                 conta_status, conta_vencimento, conta_parcela, conta_total_parcelas,
                 conta_manutencao_id, conta_veiculo_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            conta.descricao,
            conta.valor,
            conta.valorPago || 0,
            conta.formaPagamento,
            conta.status,
            conta.vencimento,
            conta.parcela,
            conta.totalParcelas,
            conta.manutencao?.id ?? conta.manutencao ?? null,
            conta.veiculo?.id ?? conta.veiculo ?? null
        ];

        return await this.#banco.ExecutaComandoLastInserted(sql, valores);
    }

    async obter(id) {
        const sql = `
            SELECT c.*,
                   v.veiculo_placa,
                   v.veiculo_modelo_id
            FROM tb_conta c
            LEFT JOIN tb_veiculos v ON c.conta_veiculo_id = v.veiculo_id
            WHERE c.conta_id = ?
        `;

        const rows = await this.#banco.ExecutaComando(sql, [id]);

        if (rows.length > 0)
            return this.toMap(rows[0]);

        return null;
    }

    async listar() {
        const sql = `
            SELECT c.*,
                   v.veiculo_placa
            FROM tb_conta c
            LEFT JOIN tb_veiculos v ON c.conta_veiculo_id = v.veiculo_id
            ORDER BY c.conta_vencimento ASC
        `;

        const rows = await this.#banco.ExecutaComando(sql);
        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            lista.push(this.toMap(rows[i]));
        }

        return lista;
    }

    async listarPorManutencao(manutencaoId) {
        const sql = `
            SELECT c.*,
                   v.veiculo_placa
            FROM tb_conta c
            LEFT JOIN tb_veiculos v ON c.conta_veiculo_id = v.veiculo_id
            WHERE c.conta_manutencao_id = ?
            ORDER BY c.conta_parcela ASC
        `;

        const rows = await this.#banco.ExecutaComando(sql, [manutencaoId]);
        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            lista.push(this.toMap(rows[i]));
        }

        return lista;
    }

    async pagar(id, valorPago, status) {
        const sql = `
            UPDATE tb_conta SET
                conta_valor_pago = ?,
                conta_status = ?
            WHERE conta_id = ?
        `;

        return await this.#banco.ExecutaComandoNonQuery(sql, [valorPago, status, id]);
    }

    async alterar(conta) {
        const sql = `
            UPDATE tb_conta SET
                conta_descricao = ?,
                conta_valor = ?,
                conta_valor_pago = ?,
                conta_forma_pagamento = ?,
                conta_status = ?,
                conta_vencimento = ?
            WHERE conta_id = ?
        `;

        const valores = [
            conta.descricao,
            conta.valor,
            conta.valorPago,
            conta.formaPagamento,
            conta.status,
            conta.vencimento,
            conta.id
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    async deletar(id) {
        const sql = `DELETE FROM tb_conta WHERE conta_id = ?`;
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    toMap(row) {
        let conta = new Conta();

        conta.id = row["conta_id"];
        conta.descricao = row["conta_descricao"];
        conta.valor = row["conta_valor"];
        conta.valorPago = row["conta_valor_pago"];
        conta.formaPagamento = row["conta_forma_pagamento"];
        conta.status = row["conta_status"];
        conta.vencimento = row["conta_vencimento"];
        conta.parcela = row["conta_parcela"];
        conta.totalParcelas = row["conta_total_parcelas"];

        if (row["conta_manutencao_id"]) {
            let m = new Manutencao();
            m.id = row["conta_manutencao_id"];
            conta.manutencao = m;
        }

        if (row["conta_veiculo_id"]) {
            let v = new Veiculo(row["conta_veiculo_id"]);
            v.placa = row["veiculo_placa"] || null;
            conta.veiculo = v;
        }

        return conta;
    }
}