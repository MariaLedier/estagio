import Database from "../db/database.js"
import Servico from "../entities/servico.js";




export default class ServicoRepository {


    #banco;

    //para transações
    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(servico) {

        const sql = "insert into tb_servico (servico_nome, servico_valor) values ( ?, ?)";

        const valores = [servico.nome, servico.valor];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async obter(id) {

        const sql = "select * from tb_servico where servico_id = ?";

        const valores = [id];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let servico = null;
        if (rows.length > 0) {
            servico = this.toMap(rows[0]);
        }

        return servico;
    }

    async listar() {

        const sql = "select * from tb_servico";
        const rows = await this.#banco.ExecutaComando(sql);
        let servico = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            servico.push(this.toMap(row));
        }

        return servico;
    }

    async deletar(id) {
        const sql = "delete from tb_servico where servico_id = ?";
        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `update tb_servico set servico_nome = ?,
                                           servico_valor = ?
                    where servico_id = ?`

        const valores = [entidadeAtualizada.nome, entidadeAtualizada.valor, entidadeAtualizada.id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

   
    
    toMap(row) {
        let servico = new Servico();
        servico.id = row["servico_id"];
        servico.nome = row["servico_nome"];
        servico.valor = row["servico_valor"];


        return servico;
    }

}