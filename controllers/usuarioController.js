
import Usuario from "../entities/usuario.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";

export default class UsuarioController {

    #UsuarioRepositorio;

    constructor() {
        this.#UsuarioRepositorio = new UsuarioRepository();

    }


    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {
            let lista = await this.#UsuarioRepositorio.listar();
            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum usuário cadastrado !" });
        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }



    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {

            let { nome, tipo, senha} = req.body;
            if (nome && tipo && senha) {

                let entidade = new Usuario(0, nome, tipo, senha);
                let inseriu = await this.#UsuarioRepositorio.gravar(entidade);
                if (inseriu == true) {
                    return res.status(200).json({ msg: "Usuário cadastro com sucesso" });
                }
                else {
                    //não inseriu no bd
                    throw new Error("Erro ao cadastrar serviço. Não foi possível persisti-lo no banco de dados");
                }

            }
            else {
                return res.status(400).json({ msg: "O Usuário precisa ter nome e tipo definidos!" })
            }
        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }




    /*----------------------- DELETAR ------------------------ */
    // SE O SERVIÇO ESTIVER ATRELADO A ALGUMA MANUTENÇÃO ELE NÃO PODE SER EXLCUIDO

    async deletar(req, res) {
        try {
            let { id } = req.params;
            if (await this.#UsuarioRepositorio.obter(id)) {

                if (await this.#UsuarioRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Usuário excluído com sucesso!" });
                else
                    throw new Error("Erro ao deletar usuário no banco de dados")
            }
            else {
                //usuario para deleção não existe;
                return res.status(404).json({ msg: "Usuário não encontrado para deleção" });
            }

        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }


    /*----------------------- ATUALIZAR ------------------------ */

    async atualizar(req, res) {
        try {
            let { id, nome, tipo, senha } = req.body;

            if (id && nome && tipo && senha ) {
                if (await this.#UsuarioRepositorio.obter(id)) {
                    let entidade = new Usuario(id, nome, tipo, senha);
                    if (await this.#UsuarioRepositorio.alterar(entidade))
                        res.status(200).json({ msg: "Usuário alterado!" });
                    else
                        throw new Error("Erro ao alterar usuário no banco de dados");
                }
                else {
                    res.status(404).json({ msg: "Usuário não encontrado para alteração" });
                }
            }
            else {
                res.status(400).json({ msg: "As informações do usuário não estão corretas!" })
            }

        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- OBTER POR ID ------------------------ */

    // async obterPorId(req, res) {
    //     try{
    //         let {id} = req.params;
    //         let usuario = await this.#repositorio.buscarPorId(id);
    //         if(usuario) {
    //             return res.status(200).json(usuario);
    //         }
    //         else
    //             return res.status(404).json({msg: "Usuário não encontrado!"});
    //     }
    //     catch(exception) {
    //         console.log(exception);
    //         return res.status(500).json({msg: exception.message});
    //     }
    // }
}