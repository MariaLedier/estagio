import Database from "../db/database.js"
import Usuario from "../entities/usuario.js";


export default class UsuarioRepository {


    #banco;

    //para transações
    set banco(value) {
        this.#banco = value;
    }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(usuario) {

        const sql = "insert into tb_usuario (usuario_nome, usuario_tipo, usuario_senha) values ( ?, ?, ?)";

        const valores = [usuario.nome, usuario.tipo, usuario.senha];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

    async obter(id) {

        const sql = "select * from tb_usuario where usuario_id = ?";

        const valores = [id];

        const rows = await this.#banco.ExecutaComando(sql, valores);

        let usuario = null;
        if (rows.length > 0) {
            usuario = this.toMap(rows[0]);
        }

        return usuario;
    }

    async listar() {

        const sql = "select * from tb_usuario";
        const rows = await this.#banco.ExecutaComando(sql);
        let usuario = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            usuario.push(this.toMap(row));
        }

        return usuario;
    }

    async deletar(id) {
        const sql = "delete from tb_usuario where usuario_id = ?";
        const params = [id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);

        return result;
    }

    async alterar(entidadeAtualizada) {
        const sql = `update tb_usuario set usuario_nome = ?,
                                           usuario_tipo = ?,
                                           usuario_senha = ?
                    where usuario_id = ?`

        const valores = [entidadeAtualizada.nome, entidadeAtualizada.tipo,entidadeAtualizada.senha, entidadeAtualizada.id];

        const result = await this.#banco.ExecutaComandoNonQuery(sql, valores);

        return result;
    }

   
    
    toMap(row) {
        let usuario = new Usuario();
        usuario.id = row["usuario_id"];
        usuario.nome = row["usuario_nome"];
        usuario.tipo = row["usuario_tipo"];
        usuario.senha = row["usuario_senha"];

        return usuario;
    }

}