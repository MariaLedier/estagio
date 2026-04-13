import Database from "../db/database.js"
import Veiculo from "../entities/veiculo.js";





export default class VeiculoRepository {


    #banco;

    //para transações
    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(veiculo) {

        const sql = `
    insert into tb_veiculos
    (
        veiculo_placa,
        veiculo_ano,
        veiculo_renavam,
        veiculo_cor,
        veiculo_kmatual,
        veiculo_status,
        veiculo_modelo_id,
        veiculo_tanque
    )
    values (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const valores = [
            veiculo.placa,
            veiculo.ano,
            veiculo.renavam,
            veiculo.cor,
            veiculo.kmatual,
            veiculo.status,
            veiculo.modelo,
            veiculo.tanque
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, valores);

        return id;
    }

    async obterPorPlaca(placa) {
        const sql = `SELECT * FROM tb_veiculos WHERE veiculo_placa = ?`
        const rows = await this.#banco.ExecutaComando(sql, [placa])

        if (rows.length > 0)
            return this.toMap(rows[0])

        return null
    }


    async obter(id) {
        const sql = `
        SELECT 
            v.*, 
            m.modelo_nome AS modeloNome,
            ma.marca_nome AS marcaNome,
            ma.marca_id AS marca
        FROM tb_veiculos v
        LEFT JOIN tb_modelo m ON v.veiculo_modelo_id = m.modelo_id
        LEFT JOIN tb_marca ma ON m.modelo_marca_id = ma.marca_id
        WHERE v.veiculo_id = ?
    `;

        const rows = await this.#banco.ExecutaComando(sql, [id]);

        if (rows.length > 0)
            return this.toMap(rows[0]);

        return null;
    }
    async atualizarKm(veiculoId, kmNova) {
        const sql = `
        UPDATE tb_veiculos 
        SET veiculo_kmatual = ?
        WHERE veiculo_id = ?
    `;
        return await this.#banco.ExecutaComandoNonQuery(sql, [kmNova, veiculoId]);
    }

    async listar() {
        const sql = `
        SELECT 
            v.*,
            m.modelo_nome AS modeloNome,
            ma.marca_nome AS marcaNome,
            ma.marca_id AS marca
        FROM tb_veiculos v
        LEFT JOIN tb_modelo m ON v.veiculo_modelo_id = m.modelo_id
        LEFT JOIN tb_marca ma ON m.modelo_marca_id = ma.marca_id
    `;

        const rows = await this.#banco.ExecutaComando(sql);
        let veiculos = [];

        for (let i = 0; i < rows.length; i++) {
            veiculos.push(this.toMap(rows[i]));
        }

        return veiculos;
    }



    // INATIVAÇÃO 
    async deletar(id) {
        const sql = "update tb_veiculos set veiculo_status = 'Inativo' where veiculo_id = ?"
        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `
        UPDATE tb_veiculos SET
            veiculo_placa = ?,
            veiculo_modelo_id = ?,
            veiculo_ano = ?,
            veiculo_renavam = ?,
            veiculo_cor = ?,
            veiculo_kmatual = ?,
            veiculo_status = ?,
            veiculo_tanque = ?
        WHERE veiculo_id = ?
    `;

        const valores = [
            entidadeAtualizada.placa,
            entidadeAtualizada.modelo,
            entidadeAtualizada.ano,
            entidadeAtualizada.renavam,
            entidadeAtualizada.cor,
            entidadeAtualizada.kmatual,
            entidadeAtualizada.status,
            entidadeAtualizada.tanque,
            entidadeAtualizada.id
        ];

        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }
    toMap(row) {
        let veiculo = new Veiculo();
        console.log("ROW COMPLETO:", row)
        veiculo.id = row["veiculo_id"];
        veiculo.placa = row["veiculo_placa"];
        veiculo.modelo = row["veiculo_modelo_id"];


        veiculo.modeloNome = row["modeloNome"];
        veiculo.marcaNome = row["marcaNome"];

        // importante pro editar
        veiculo.marca = row["marca"];

        veiculo.ano = row["veiculo_ano"];
        veiculo.renavam = row["veiculo_renavam"];
        veiculo.cor = row["veiculo_cor"];
        veiculo.kmatual = row["veiculo_kmatual"];
        veiculo.status = row["veiculo_status"];
        veiculo.tanque = row["veiculo_tanque"];

        return veiculo;
    }
}