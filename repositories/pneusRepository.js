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

        const valores = [pneu.marca, pneu.medida, pneu.dataaquisicao, pneu.valor, pneu.estado, pneu.status, pneu.posicao, pneu.veiculo];

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

        const sql = "select * from tb_pneus";
        const rows = await this.#banco.ExecutaComando(sql);
        let pneu = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            pneu.push(this.toMap(row));
        }

        return pneu;
    }

    async deletar(id) {
        const sql = "update tb_pneus set pneus_status = 'Inativo' where pneu_id = ?"
        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `update tb_usuario set pneus_marca= ?,
                                           pneus_medida= ?,
                                           pneus_data_aquisicao = ?,
                                           pneus_valor = ?,
                                           pneus_estado = ?,
                                           pneus_status = ?,
                                           pneus_posicao = ?,
                                           pneus_veiculo_id = ?
                    where pneus_id = ?`

        const valores = [entidadeAtualizada.marca, entidadeAtualizada.medida, entidadeAtualizada.dataaquisicao, entidadeAtualizada.valor, entidadeAtualizada.estado, entidadeAtualizada.status, entidadeAtualizada.posicao, entidadeAtualizada.veiculo, entidadeAtualizada.veiculo.id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }


    async verificarPneuVeiculo(id) {

        const sql = "SELECT COUNT(*) as total FROM tb_pneus WHERE veiculo_id = ?";

        const valores = [id];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let pneu = null;
        if (rows.length > 0) {
            pneu = this.toMap(rows[0]);
        }

        return pneu;
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
        pneu.veiculo = new Veiculo(row["veiculo_id"]);
        if (row["veiculo_placa"]) {
            pneu.veiculo.placa = row["veiculo_placa"];
        }

        return pneu;
    }

}