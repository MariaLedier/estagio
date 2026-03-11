import Database from "../db/database.js"
import Modelo from "../entities/modelo.js";
import Marca from "../entities/marca.js";



export default class ModeloRepository {


    #banco;

    //para transações
    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(modelo) {

        const sql = "insert into tb_modelo (usuario_nome, usuario_tipo, usuario_senha) values ( ?, ?, ?)";

        const valores = [modelo.nome, modelo.marca];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async obter(id) {

        const sql = "select * from tb_modelo where modelo_id = ?";

        const valores = [id];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let modelo = null;
        if (rows.length > 0) {
            modelo = this.toMap(rows[0]);
        }

        return modelo;
    }

    async listar() {

        const sql = "select * from tb_modelo";
        const rows = await this.#banco.ExecutaComando(sql);
        let modelo = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            modelo.push(this.toMap(row));
        }

        return modelo;
    }




    async listarPorMarca(marcaId) {

        const sql = `
        SELECT 
            m.modelo_id,
            m.modelo_nome,
            ma.marca_id,
            ma.marca_nome
        FROM tb_modelo m
        INNER JOIN tb_marca ma 
            ON m.modelo_marca_id = ma.marca_id
        WHERE m.modelo_marca_id = ?
    `;

        const valores = [marcaId];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let lista = [];

        for (let i = 0; i < rows.length; i++) {
            lista.push(this.toMap(rows[i]));
        }

        return lista;
    }

    // async deletar(id) {
    //     const sql = "delete from tb_usuario where usuario_id = ?";
    //     const params = [id];

    //     const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

    //     return result;
    // }

    // async alterar(entidadeAtualizada) {
    //     const sql = `update tb_usuario set usuario_nome = ?,
    //                                        usuario_tipo = ?,
    //                                        usuario_senha = ?
    //                 where usuario_id = ?`

    //     const valores = [entidadeAtualizada.nome, entidadeAtualizada.tipo,entidadeAtualizada.senha, entidadeAtualizada.id];

    //     const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

    //     return result;
    // }



    toMap(row) {

        let modelo = new Modelo();

        modelo.id = row["modelo_id"];
        modelo.nome = row["modelo_nome"];

        modelo.marca = new Marca();
        modelo.marca.id = row["marca_id"];

        if (row["marca_nome"]) {
            modelo.marca.nome = row["marca_nome"];
        }

        return modelo;
    }
}