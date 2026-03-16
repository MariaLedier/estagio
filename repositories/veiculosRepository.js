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
        veiculo_modelo_id
    )
    values (?, ?, ?, ?, ?, ?, ?)
    `;

        const valores = [
            veiculo.placa,
            veiculo.ano,
            veiculo.renavam,
            veiculo.cor,
            veiculo.kmatual,
            veiculo.status,
            veiculo.modelo
        ];

        const id = await this.#banco.ExecutaComandoLastInserted(sql, valores);

        return id;
    }

    async obter(id) {

        const sql = "select * from tb_veiculos where veiculo_id = ?";

        const valores = [id];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let veiculo = null;
        if (rows.length > 0) {
            veiculo = this.toMap(rows[0]);
        }

        return veiculo;
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

        const sql = "select * from tb_veiculos";
        const rows = await this.#banco.ExecutaComando(sql);
        let veiculo = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            veiculo.push(this.toMap(row));
        }

        return veiculo;
    }

    // INATIVAÇÃO 
    async deletar(id) {
        const sql = "update tb_veiculos set veiculo_status = 'Inativo' where veiculo_id = ?"
        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `update tb_veiculos set 
                    veiculo_placa = ?,
                    veiculo_modelo_id = ?,
                    veiculo_marca = ?,
                    veiculo_ano = ?,
                    veiculo_renavam = ?,
                    veiculo_cor = ?,
                    veiculo_kmatual = ?,
                    veiculo_status = ?
                    where veiculo_id = ?`
        const valores = [entidadeAtualizada.placa, entidadeAtualizada.veiculomodelo, entidadeAtualizada.ano, entidadeAtualizada.renavam, entidadeAtualizada.cor, entidadeAtualizada.kmatual, entidadeAtualizada.status, entidadeAtualizada.id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }



    toMap(row) {
        let veiculo = new Veiculo();
        veiculo.id = row["veiculo_id"];
        veiculo.placa = row["veiculo_placa"];
        veiculo.modelo = row["veiculo_modelo_id"];
        veiculo.ano = row["veiculo_ano"];
        veiculo.renavam = row["veiculo_renavam"];
        veiculo.cor = row["veiculo_cor"];
        veiculo.kmatual = row["veiculo_kmatual"];
        veiculo.status = row["veiculo_status"]


        return veiculo;
    }

}