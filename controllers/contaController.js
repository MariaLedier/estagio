import Conta from "../entities/conta.js";
import ContaRepository from "../repositories/contaRepository.js";
import ManutencaoRepository from "../repositories/manutencaoRepository.js";

export default class ContaController {

    #ContaRepositorio;
    #ManutencaoRepositorio;

    constructor() {
        this.#ContaRepositorio = new ContaRepository();
        this.#ManutencaoRepositorio = new ManutencaoRepository();
    }

    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {
            let lista = await this.#ContaRepositorio.listar();
            res.status(200).json(lista);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- LISTAR POR MANUTENÇÃO ------------------------ */
    async listarPorManutencao(req, res) {
        try {
            const manutencaoId = req.params.manutencaoId;
            let lista = await this.#ContaRepositorio.listarPorManutencao(manutencaoId);
            res.status(200).json(lista);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- CONCLUIR MANUTENÇÃO E GERAR CONTAS ------------------------ */
    async gerarContas(req, res) {
        try {
            let { manutencaoId, formaPagamento } = req.body;

            if (!manutencaoId || !formaPagamento)
                return res.status(400).json({ msg: "Dados incompletos!" });

            // BUSCA MANUTENÇÃO
            let manutencao = await this.#ManutencaoRepositorio.obter(manutencaoId);

            if (!manutencao || manutencao.status === "CONCLUIDA")
                return res.status(400).json({ msg: "Manutenção não encontrada ou já concluída!" });

            // CALCULA TOTAL DOS ITENS
            const itens = Array.isArray(manutencao.itens) ? manutencao.itens : [];
            let totalManutencao = itens.reduce((acc, item) => acc + Number(item.valor || 0), 0);

            if (totalManutencao <= 0)
                return res.status(400).json({ msg: "O valor total deve ser maior que zero!" });

            // RESOLVE VEICULO
            let veiculoId = manutencao.veiculo?.id ?? manutencao.veiculo;

            // CRIA A CONTA ÚNICA
            await this.#ContaRepositorio.gravar({
                descricao: `Manutenção #${manutencaoId} - ${manutencao.tipo || 'Geral'}`,
                valor: totalManutencao,
                valorPago: 0, // Inicia como não pago
                formaPagamento: formaPagamento,
                status: "PENDENTE",
                manutencao: manutencaoId,
                veiculo: veiculoId
            });

            // ATUALIZA STATUS DA MANUTENÇÃO
            await this.#ManutencaoRepositorio.atualizarStatus(manutencaoId, "CONCLUIDA");

            return res.status(200).json({ msg: "Gasto registrado e manutenção concluída!" });

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- DELETAR ------------------------ */
    async deletar(req, res) {
        try {

            let { id } = req.params;

            let conta = await this.#ContaRepositorio.obter(id);
            if (!conta)
                return res.status(404).json({ msg: "Conta não encontrada!" });

            if (conta.status === "PAGO")
                return res.status(400).json({ msg: "Conta já paga não pode ser excluída!" });

            await this.#ContaRepositorio.deletar(id);
            return res.status(200).json({ msg: "Conta excluída com sucesso!" });

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}