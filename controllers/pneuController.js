import Pneu from "../entities/pneus.js";
import PneusRepository from "../repositories/pneusRepository.js";

export default class PneuController {

    #PneuRepositorio;

    constructor() {
        this.#PneuRepositorio = new PneusRepository();
    }


    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {

            let lista = await this.#PneuRepositorio.listar();

            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum pneu cadastrado!" });

        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }



    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {

        try {
            console.log(req.body)
            let { marca, medida, dataaquisicao, valor, estado, status, posicao, veiculo } = req.body;

            if (marca && medida && estado && status && posicao && veiculo) {

                let entidade = new Pneu(
                    0,
                    marca,
                    medida,
                    dataaquisicao,
                    valor,
                    estado,
                    status,
                    posicao,
                    veiculo
                );

                let inseriu = await this.#PneuRepositorio.gravar(entidade);

                if (inseriu == true) {
                    return res.status(200).json({ msg: "Pneu cadastrado com sucesso!" });
                }
                else {
                    throw new Error("Erro ao cadastrar pneu no banco de dados");
                }

            }
            else {
                return res.status(400).json({ msg: "As informações do pneu não estão corretas!" });
            }

        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }



    /*----------------------- DELETAR ------------------------ */

    async deletar(req, res) {

        try {

            let { id } = req.params;

            if (await this.#PneuRepositorio.obter(id)) {

                if (await this.#PneuRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Pneu excluído com sucesso!" });
                else
                    throw new Error("Erro ao deletar pneu no banco de dados");

            }
            else {

                return res.status(404).json({ msg: "Pneu não encontrado para deleção" });

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

            let { id, marca, medida, dataaquisicao, valor, estado, status, posicao } = req.body;

            if (id && marca && medida && estado && status && posicao) {

                if (await this.#PneuRepositorio.obter(id)) {

                    let entidade = new Pneu(
                        id,
                        marca,
                        medida,
                        dataaquisicao,
                        valor,
                        estado,
                        status,
                        posicao
                    );

                    if (await this.#PneuRepositorio.alterar(entidade))
                        res.status(200).json({ msg: "Pneu alterado com sucesso!" });
                    else
                        throw new Error("Erro ao alterar pneu no banco de dados");

                }
                else {

                    res.status(404).json({ msg: "Pneu não encontrado para alteração" });

                }

            }
            else {

                res.status(400).json({ msg: "As informações do pneu não estão corretas!" });

            }

        }
        catch (exception) {

            console.log(exception);
            return res.status(500).json({ msg: exception.message });

        }

    }

}