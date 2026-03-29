import Pneu from "../entities/pneus.js";
import PneusRepository from "../repositories/pneusRepository.js";
import VeiculoRepository from "../repositories/veiculosRepository.js";
export default class PneuController {

    #PneuRepositorio;
    #VeiculoRepositorio;

    constructor() {
        this.#PneuRepositorio = new PneusRepository();
        this.#VeiculoRepositorio = new VeiculoRepository();
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
            let { marca, medida, dataaquisicao, valor, estado, posicao, veiculo } = req.body;

            if (marca && medida && estado) {

                // VERIFICA SE VEÍCULO ESTÁ ATIVO QUANDO VINCULADO
                if (veiculo) {
                    let veiculoAtual = await this.#VeiculoRepositorio.obter(veiculo)

                    if (!veiculoAtual)
                        return res.status(404).json({ msg: "Veículo não encontrado!" })

                    if (veiculoAtual.status === "Inativo")
                        return res.status(400).json({ msg: "Não é possível vincular pneu a um veículo inativo!" })
                }

                let status = "EM_ESTOQUE"

                if (veiculo && posicao && posicao.toLowerCase() !== "estepe") {
                    status = "EM_USO"
                }

                let entidade = new Pneu(
                    0, marca, medida, dataaquisicao, valor,
                    estado, status, posicao || null, veiculo || null
                )

                let inseriu = await this.#PneuRepositorio.gravar(entidade)

                if (inseriu)
                    return res.status(200).json({ msg: "Pneu cadastrado com sucesso!" })
                else
                    throw new Error("Erro ao cadastrar pneu no banco de dados")

            } else {
                return res.status(400).json({ msg: "As informações do pneu não estão corretas!" })
            }

        } catch (exception) {
            console.log(exception)
            return res.status(500).json({ msg: exception.message })
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

            let { id, marca, medida, dataaquisicao, valor, estado } = req.body;

            if (id && marca && medida && estado) {

                let pneuAtual = await this.#PneuRepositorio.obter(id);

                if (!pneuAtual)
                    return res.status(404).json({ msg: "Pneu não encontrado para alteração" });


                // se estiver descartado não altera nada
                if (pneuAtual.status === "DESCARTADO")
                    return res.status(400).json({ msg: "Pneu descartado não pode ser alterado" });


                let entidade = new Pneu(
                    id,
                    marca,
                    medida,
                    dataaquisicao,
                    valor,
                    estado,
                    pneuAtual.status,   // mantém status atual
                    pneuAtual.posicao,  // mantém posição
                    pneuAtual.veiculo   // mantém veículo
                );


                if (await this.#PneuRepositorio.alterar(entidade))
                    return res.status(200).json({ msg: "Pneu alterado com sucesso!" });
                else
                    throw new Error("Erro ao alterar pneu no banco de dados");

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

}