import Database from "../db/database.js";

export default class DescartePneuRepository {

    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async gravar(descarte) {
        const sql = `
            INSERT INTO tb_descarte_pneu
                (descarte_pneu_id, descarte_veiculo_id, descarte_posicao,
                 descarte_data_entrada, descarte_data_saida,
                 descarte_km_entrada, descarte_km_saida, descarte_km_uso,
                 descarte_dias_uso, descarte_marca, descarte_medida)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            descarte.pneuId,
            descarte.veiculoId,
            descarte.posicao,
            descarte.dataEntrada,
            descarte.dataSaida,
            descarte.kmEntrada,
            descarte.kmSaida,
            descarte.kmUso,
            descarte.diasUso,
            descarte.marca,
            descarte.medida
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    async listar() {
        const sql = `
            SELECT d.*, v.veiculo_placa
            FROM tb_descarte_pneu d
            LEFT JOIN tb_veiculos v ON d.descarte_veiculo_id = v.veiculo_id
            ORDER BY d.descarte_data_saida DESC
        `;
        const rows = await this.#banco.ExecutaComando(sql);
        return rows;
    }
}