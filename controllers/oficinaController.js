
import Oficina from "../entities/oficina.js";
import OficinaRepository from "../repositories/oficinaRepository.js";

export default class OficinaController {

    #OficinaRepositorio;

    constructor() {
        this.#OficinaRepositorio = new OficinaRepository();

    }


    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {
            let lista = await this.#OficinaRepositorio.listar();
            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhuma oficina cadastrada !" });
        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }



    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {

            let { nome, datacadastro, cidade } = req.body;
            if (nome && datacadastro && cidade) {

                let entidade = new Oficina(0, nome, datacadastro, cidade);
                let inseriu = await this.#OficinaRepositorio.gravar(entidade);
                if (inseriu == true) {
                    return res.status(200).json({ msg: "Oficina cadastrada com sucesso" });
                }
                else {
                    //não inseriu no bd
                    throw new Error("Erro ao cadastrar Oficina. Não foi possível persisti-lo no banco de dados");
                }

            }
            else {
                return res.status(400).json({ msg: "A Oficina precisa ter os dados definido!" })
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
            if (await this.#OficinaRepositorio.obter(id)) {

                if (await this.#OficinaRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Oficina excluída com sucesso!" });
                else
                    throw new Error("Erro ao deletar oficina no banco de dados")
            }
            else {
                //usuario para deleção não existe;
                return res.status(404).json({ msg: "Oficina não encontrado para deleção" });
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
            let { id, nome, datacadastro, cidade} = req.body;

            if (id && nome && datacadastro && cidade ) {
                if (await this.#OficinaRepositorio.obter(id)) {
                    let entidade = new Oficina(id, nome, datacadastro, cidade);
                    if (await this.#OficinaRepositorio.alterar(entidade))
                        res.status(200).json({ msg: "Oficina alterada !" });
                    else
                        throw new Error("Erro ao alterar serviço no banco de dados");
                }
                else {
                    res.status(404).json({ msg: "Oficina não encontrada para alteração" });
                }
            }
            else {
                res.status(400).json({ msg: "As informações da oficina não estão corretas!" })
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