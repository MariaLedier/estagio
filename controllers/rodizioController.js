import Rodizio from "../entities/rodizio.js";
import RodizioItem from "../entities/rodizioItem.js";
import RodizioRepository from "../repositories/rodizioRepository.js";
import VeiculoRepository from "../repositories/veiculosRepository.js";

export default class RodizioController {

    #RodizioRepositorio;
    #VeiculoRepositorio;

    constructor() {
        this.#RodizioRepositorio = new RodizioRepository();
        this.#VeiculoRepositorio = new VeiculoRepository();
    }

    /*----------------------- LISTAR POR VEÍCULO ------------------------ */
    async listarPorVeiculo(req, res) {
        try {
            const veiculoId = req.params.veiculoId;
            let lista = await this.#RodizioRepositorio.listarPorVeiculo(veiculoId);
            res.status(200).json(lista);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- OBTER POR ID ------------------------ */
    async obter(req, res) {
        try {
            const { id } = req.params;
            let rodizio = await this.#RodizioRepositorio.obter(id);

            if (!rodizio)
                return res.status(404).json({ msg: "Rodízio não encontrado!" });

            res.status(200).json(rodizio);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {
            let { veiculo, usuario, data, km, observacoes, itens } = req.body;

            // itens = [{ pneuId, posicaoAnterior, posicaoNova }, ...]

            if (!veiculo || !usuario || !data)
                return res.status(400).json({ msg: "Campos obrigatórios: veiculo, usuario, data" });

            if (!itens || !Array.isArray(itens) || itens.length === 0)
                return res.status(400).json({ msg: "Informe ao menos um pneu para o rodízio" });

            // Valida veículo
            let veiculoAtual = await this.#VeiculoRepositorio.obter(veiculo);
            if (!veiculoAtual)
                return res.status(404).json({ msg: "Veículo não encontrado!" });

            if (veiculoAtual.status === "Inativo")
                return res.status(400).json({ msg: "Não é possível criar rodízio para um veículo inativo!" });

            // Valida KM
            if (km && km < veiculoAtual.kmatual)
                return res.status(400).json({
                    msg: `KM informada (${km}) não pode ser menor que a KM atual do veículo (${veiculoAtual.kmatual})!`
                });

            // Valida que não há posição nova duplicada
            const posicoesNovas = itens.map((i) => i.posicaoNova);
            const duplicadas = posicoesNovas.filter((p, idx) => posicoesNovas.indexOf(p) !== idx);
            if (duplicadas.length > 0)
                return res.status(400).json({ msg: `Posição duplicada no rodízio: ${duplicadas[0]}` });

            // 1. Grava cabeçalho
            let entidade = new Rodizio(0, data, km || null, observacoes || null, veiculo, usuario);
            let rodizioId = await this.#RodizioRepositorio.gravar(entidade);

            if (!rodizioId)
                throw new Error("Erro ao gravar rodízio no banco de dados");

            // 2. Grava cada item e atualiza posição do pneu em tb_pneus
            for (let i = 0; i < itens.length; i++) {
                const { pneuId, posicaoAnterior, posicaoNova } = itens[i];

                let itemEntidade = new RodizioItem(0, pneuId, posicaoAnterior, posicaoNova, rodizioId);
                await this.#RodizioRepositorio.gravarItem(itemEntidade);

                // Atualiza a posição do pneu na tabela tb_pneus
                await this.#RodizioRepositorio.atualizarPosicaoPneu(pneuId, posicaoNova);
            }

            return res.status(200).json({
                msg: "Rodízio realizado com sucesso!",
                rodizio: rodizioId
            });

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- DELETAR ------------------------ */
    async deletar(req, res) {
        try {
            const { id } = req.params;

            let atual = await this.#RodizioRepositorio.obter(id);
            if (!atual)
                return res.status(404).json({ msg: "Rodízio não encontrado para deleção!" });

            if (await this.#RodizioRepositorio.deletar(id))
                return res.status(200).json({ msg: "Rodízio excluído com sucesso!" });
            else
                throw new Error("Erro ao deletar rodízio no banco de dados");

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}