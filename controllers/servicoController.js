
import Servico from "../entities/servico.js";
import ServicoRepository from "../repositories/servicoRepository.js";

export default class ServicoController {

    #ServicoRepositorio;

    constructor() {
        this.#ServicoRepositorio = new ServicoRepository();

    }


    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        console.log(req.query);
        try {
            let lista = await this.#ServicoRepositorio.listar();
            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum serviço cadastrado !" });
        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }



    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {

            let { nome, valor } = req.body;
            if (nome && valor) {

                let entidade = new Servico(0, nome, valor);
                let inseriu = await this.#ServicoRepositorio.gravar(entidade);
                if (inseriu == true) {
                    return res.status(200).json({ msg: "Serviço cadastro com sucesso" });
                }
                else {
                    //não inseriu no bd
                    throw new Error("Erro ao cadastrar serviço. Não foi possível persisti-lo no banco de dados");
                }

            }
            else {
                return res.status(400).json({ msg: "O serviço precisa ter nome e valor definidos!" })
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
            if (await this.#ServicoRepositorio.obter(id)) {

                if (await this.#ServicoRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Serviço excluído com sucesso!" });
                else
                    throw new Error("Erro ao deletar serviço no banco de dados")
            }
            else {
                //usuario para deleção não existe;
                return res.status(404).json({ msg: "Serviço não encontrado para deleção" });
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
            let { id, nome, valor } = req.body;

            if (id && nome && valor ) {
                if (await this.#ServicoRepositorio.obter(id)) {
                    let entidade = new Servico(id, nome, valor);
                    if (await this.#ServicoRepositorio.alterar(entidade))
                        res.status(200).json({ msg: "Serviço alterado!" });
                    else
                        throw new Error("Erro ao alterar serviço no banco de dados");
                }
                else {
                    res.status(404).json({ msg: "Serviço não encontrado para alteração" });
                }
            }
            else {
                res.status(400).json({ msg: "As informações do serviço não estão corretas!" })
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