import Database from "../db/database.js"
import Marca from "../entities/marca.js";



export default class MarcaRepository {


    #banco;

    //para transações
    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }


    async listar() {

        const sql = "select * from tb_marca";
        const rows = await this.#banco.ExecutaComando(sql);
        let marca = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            marca.push(this.toMap(row));
        }

        return marca;
    }


    toMap(row) {

        let marca = new Marca();

        marca.id = row["marca_id"];
        marca.nome = row["marca_nome"];

        return marca;
    }
}