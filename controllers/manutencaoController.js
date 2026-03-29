import Manutencao from "../entities/manutencao.js";
import ManutencaoItem from "../entities/manutencaoItem.js";
import ManutencaoRepository from "../repositories/manutencaoRepository.js";
import VeiculoRepository from "../repositories/veiculosRepository.js";

export default class ManutencaoController {

    #ManutencaoRepositorio;
    #VeiculoRepositorio;

    constructor() {
        this.#ManutencaoRepositorio = new ManutencaoRepository();
        this.#VeiculoRepositorio = new VeiculoRepository();
    }

    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {
            let lista = await this.#ManutencaoRepositorio.listar();
            res.status(200).json(lista);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- LISTAR POR VEICULO ------------------------ */
    async listarPorVeiculo(req, res) {
        try {
            const veiculoId = req.params.veiculoId;
            let lista = await this.#ManutencaoRepositorio.listarPorVeiculo(veiculoId);
            res.status(200).json(lista);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {

            let { tipo, data, descricao, status, km, veiculo, usuario, itens } = req.body;

            if (tipo && data && veiculo && usuario) {

                // VALIDA VEÍCULO
                let veiculoAtual = await this.#VeiculoRepositorio.obter(veiculo)
                if (!veiculoAtual)
                    return res.status(404).json({ msg: "Veículo não encontrado!" })

                if (veiculoAtual.status === "Inativo")
                    return res.status(400).json({ msg: "Não é possível criar manutenção para um veículo inativo!" })

                // VALIDA KM
                if (km && km < veiculoAtual.kmatual)
                    return res.status(400).json({
                        msg: `KM informada (${km}) não pode ser menor que a KM atual do veículo (${veiculoAtual.kmatual})!`
                    })

                let entidade = new Manutencao(
                    0, tipo, data, descricao,
                    status || "AGENDADA", km, veiculo, usuario
                );

                let manutencaoId = await this.#ManutencaoRepositorio.gravar(entidade);

                if (!manutencaoId)
                    throw new Error("Erro ao cadastrar manutenção no banco de dados");

                // GRAVA OS ITENS
                if (itens && itens.length > 0) {
                    for (let i = 0; i < itens.length; i++) {
                        let itemEntidade = new ManutencaoItem(
                            0,
                            itens[i].descricao,
                            itens[i].valor,
                            manutencaoId,
                            itens[i].servico,
                            itens[i].oficina
                        );
                        await this.#ManutencaoRepositorio.gravarItem(itemEntidade);
                    }
                }

                return res.status(200).json({
                    msg: "Manutenção cadastrada com sucesso!",
                    manutencao: manutencaoId
                });

            } else {
                return res.status(400).json({ msg: "As informações da manutenção não estão corretas!" });
            }

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- ATUALIZAR ------------------------ */
    async atualizar(req, res) {
        try {

            let { id, tipo, data, descricao, status, km, veiculo, usuario, itens } = req.body;

            if (id && tipo && data && veiculo && usuario) {

                let atual = await this.#ManutencaoRepositorio.obter(id);
                if (!atual)
                    return res.status(404).json({ msg: "Manutenção não encontrada para alteração!" });

                if (atual.status === "CONCLUIDA")
                    return res.status(400).json({ msg: "Manutenção concluída não pode ser alterada!" });

                let entidade = new Manutencao(
                    id, tipo, data, descricao, status, km, veiculo, usuario
                );

                await this.#ManutencaoRepositorio.alterar(entidade);

                // REGRAVA OS ITENS
                if (itens && itens.length > 0) {
                    await this.#ManutencaoRepositorio.deletarItens(id);

                    for (let i = 0; i < itens.length; i++) {
                        let itemEntidade = new ManutencaoItem(
                            0,
                            itens[i].descricao,
                            itens[i].valor,
                            id,
                            itens[i].servico,
                            itens[i].oficina
                        );
                        await this.#ManutencaoRepositorio.gravarItem(itemEntidade);
                    }
                }

                return res.status(200).json({ msg: "Manutenção alterada com sucesso!" });

            } else {
                return res.status(400).json({ msg: "As informações da manutenção não estão corretas!" });
            }

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- DELETAR ------------------------ */
    async deletar(req, res) {
        try {

            let { id } = req.params;

            let atual = await this.#ManutencaoRepositorio.obter(id);
            if (!atual)
                return res.status(404).json({ msg: "Manutenção não encontrada para deleção!" });

            if (atual.status === "CONCLUIDA")
                return res.status(400).json({ msg: "Manutenção concluída não pode ser excluída!" });

            if (await this.#ManutencaoRepositorio.deletar(id))
                return res.status(200).json({ msg: "Manutenção excluída com sucesso!" });
            else
                throw new Error("Erro ao deletar manutenção no banco de dados");

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}