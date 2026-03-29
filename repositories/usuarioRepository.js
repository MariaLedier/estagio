import Database from "../db/database.js"
import Usuario from "../entities/usuario.js";

export default class UsuarioRepository {

    #banco;

    set banco(value) { this.#banco = value; }

    constructor() {
        this.#banco = new Database();
    }

    async gravar(usuario) {
        const sql = "INSERT INTO tb_usuario (usuario_nome, usuario_tipo, usuario_senha) VALUES (?, ?, ?)";
        const valores = [usuario.nome, usuario.tipo, usuario.senha];
        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    async obter(id) {
        const sql = "SELECT * FROM tb_usuario WHERE usuario_id = ?";
        const rows = await this.#banco.ExecutaComando(sql, [id]);
        return rows.length > 0 ? this.toMap(rows[0]) : null;
    }

    // USADO PELO MIDDLEWARE — busca por ID e valida se está ativo
    async buscarPorId(id) {
        const sql = "SELECT * FROM tb_usuario WHERE usuario_id = ?";
        const rows = await this.#banco.ExecutaComando(sql, [id]);
        return rows.length > 0 ? this.toMap(rows[0]) : null;
    }

    // USADO PELO LOGIN — busca por nome e senha
    async buscarPorLogin(nome, senha) {
        const sql = "SELECT * FROM tb_usuario WHERE usuario_nome = ? AND usuario_senha = ?";
        const rows = await this.#banco.ExecutaComando(sql, [nome, senha]);
        return rows.length > 0 ? this.toMap(rows[0]) : null;
    }

    async listar() {
        const sql = "SELECT usuario_id, usuario_nome, usuario_tipo FROM tb_usuario";
        const rows = await this.#banco.ExecutaComando(sql);
        return rows.map(row => this.toMap(row));
    }

    async alterar(entidadeAtualizada) {
        const sql = `UPDATE tb_usuario SET usuario_nome = ?, usuario_tipo = ?, usuario_senha = ? WHERE usuario_id = ?`;
        const valores = [entidadeAtualizada.nome, entidadeAtualizada.tipo, entidadeAtualizada.senha, entidadeAtualizada.id];
        return await this.#banco.ExecutaComandoNonQuery(sql, valores);
    }

    async deletar(id) {
        const sql = "DELETE FROM tb_usuario WHERE usuario_id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    toMap(row) {
        let usuario = new Usuario();
        usuario.id = row["usuario_id"];
        usuario.nome = row["usuario_nome"];
        usuario.tipo = row["usuario_tipo"];   // "ADMIN" ou "VENDEDOR"
        usuario.senha = row["usuario_senha"];
        // campo ativo: se não existir na tabela, assume true
        usuario.ativo = row["usuario_ativo"] !== undefined ? Boolean(row["usuario_ativo"]) : true;
        return usuario;
    }
}