import Database from "../db/database.js"
import Oficina from "../entities/oficina.js";




export default class OficinaRepository {


    #banco;

    //para transações
    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(oficina) {

        const sql = "insert into tb_oficina (oficina_nome, oficina_datacadastro, oficina_cidade) values ( ?, ?, ?)";

        const valores = [oficina.nome, oficina.datacadastro, oficina.cidade];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async obter(id) {

        const sql = "select * from tb_oficina where oficina_id = ?";

        const valores = [id];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let oficina = null;
        if (rows.length > 0) {
            oficina = this.toMap(rows[0]);
        }

        return oficina;
    }

    async listar() {

        const sql = "select * from tb_oficina";
        const rows = await this.#banco.ExecutaComando(sql);
        let oficina = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            oficina.push(this.toMap(row));
        }

        return oficina;
    }

    async deletar(id) {
        const sql = "delete from tb_oficina where oficina_id = ?";
        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `update tb_oficina set oficina_nome = ?,
                                            oficina_datacadastro = ?,
                                            oficina_cidade = ?
                    where oficina_id = ?`

        const valores = [entidadeAtualizada.nome, entidadeAtualizada.datacadastro, entidadeAtualizada.cidade, entidadeAtualizada.id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

   
    
    toMap(row) {
        let oficina = new Oficina();
        oficina.id = row["oficina_id"];
        oficina.nome = row["oficina_nome"];
        oficina.datacadastro = row ["oficina_datacadastro"];
        oficina.cidade = row ["oficina_cidade"]


        return oficina;
    }

}