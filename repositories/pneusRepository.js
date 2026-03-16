import Database from "../db/database.js"
import Pneus from "../entities/pneus.js";
import Veiculo from "../entities/veiculo.js";


export default class PneusRepository {


    #banco;

    //para transações
    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(pneu) {

        const sql = "insert into tb_pneus (pneus_marca, pneus_medida, pneus_data_aquisicao, pneus_valor, pneus_estado, pneus_status, pneus_posicao, pneus_veiculo_id) values ( ?, ?, ?, ?, ?, ?, ?, ?)";

        const valores = [
            pneu.marca, pneu.medida, pneu.dataaquisicao, pneu.valor,
            pneu.estado, pneu.status, pneu.posicao,
            pneu.veiculo?.id ?? pneu.veiculo ?? null
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async obter(id) {

        const sql = "select * from tb_pneus where pneus_id = ?";

        const valores = [id];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let pneu = null;
        if (rows.length > 0) {
            pneu = this.toMap(rows[0]);
        }

        return pneu;
    }

    async listar() {
        const sql = `
        SELECT p.*, v.veiculo_placa 
        FROM tb_pneus p
        LEFT JOIN tb_veiculos v ON p.pneus_veiculo_id = v.veiculo_id
    `;
        const rows = await this.#banco.ExecutaComando(sql);
        let pneu = [];

        for (let i = 0; i < rows.length; i++) {
            pneu.push(this.toMap(rows[i]));
        }

        return pneu;
    }

    async deletar(id) {

        const sql = "update tb_pneus set pneus_status = 'DESCARTADO' where pneus_id = ?"

        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }
    async alterar(entidadeAtualizada) {

        const sql = `
        update tb_pneus set 
            pneus_marca = ?,
            pneus_medida = ?,
            pneus_data_aquisicao = ?,
            pneus_valor = ?,
            pneus_estado = ?,
            pneus_status = ?,
            pneus_posicao = ?,
            pneus_veiculo_id = ?
        where pneus_id = ?
    `;

        const valores = [
            entidadeAtualizada.marca,
            entidadeAtualizada.medida,
            entidadeAtualizada.dataaquisicao,
            entidadeAtualizada.valor,
            entidadeAtualizada.estado,
            entidadeAtualizada.status,
            entidadeAtualizada.posicao,
            entidadeAtualizada.veiculo?.id ?? entidadeAtualizada.veiculo ?? null,  // ← aqui
            entidadeAtualizada.id
        ];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async deletar(id) {

        const sql = "update tb_pneus set pneus_status = 'DESCARTADO' where pneus_id = ?"

        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }



    toMap(row) {
        let pneu = new Pneus();

        pneu.id = row["pneus_id"];
        pneu.marca = row["pneus_marca"];
        pneu.medida = row["pneus_medida"];
        pneu.dataaquisicao = row["pneus_data_aquisicao"];
        pneu.valor = row["pneus_valor"];
        pneu.estado = row["pneus_estado"];
        pneu.status = row["pneus_status"];
        pneu.posicao = row["pneus_posicao"];

        if (row["pneus_veiculo_id"]) {
            let v = new Veiculo(row["pneus_veiculo_id"]);
            v.placa = row["veiculo_placa"] || null; 
            pneu.veiculo = v;
        }

        return pneu;
    }

}