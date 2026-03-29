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

            let { manutencaoId, formaPagamento, valorEntrada, numeroParcelas, vencimentoPrimeira } = req.body;

            if (!manutencaoId || !formaPagamento || !vencimentoPrimeira)
                return res.status(400).json({ msg: "Dados incompletos para gerar contas!" });

            // BUSCA MANUTENÇÃO
            let manutencao = await this.#ManutencaoRepositorio.obter(manutencaoId);
            if (!manutencao)
                return res.status(404).json({ msg: "Manutenção não encontrada!" });

            if (manutencao.status === "CONCLUIDA")
                return res.status(400).json({ msg: "Manutenção já foi concluída!" });

            // CALCULA TOTAL DOS ITENS
            let totalManutencao = 0;
            for (let i = 0; i < manutencao.itens.length; i++) {
                totalManutencao += Number(manutencao.itens[i].valor || 0);
            }

            const entrada = Number(valorEntrada || 0);
            const restante = totalManutencao - entrada;
            const parcelas = Number(numeroParcelas || 1);
            const veiculoId = manutencao.veiculo?.id ?? manutencao.veiculo;
            const descricaoBase = `Manutenção #${manutencaoId} - ${manutencao.tipo}`;

            // GERA CONTA DA ENTRADA SE HOUVER
            if (entrada > 0) {
                let contaEntrada = new Conta(
                    0,
                    descricaoBase + " (Entrada)",
                    entrada,
                    entrada,
                    formaPagamento,
                    "PAGO",
                    vencimentoPrimeira,
                    0,
                    parcelas,
                    manutencaoId,
                    veiculoId
                );
                await this.#ContaRepositorio.gravar(contaEntrada);
            }

            // GERA PARCELAS DO RESTANTE
            if (restante > 0) {
                const valorParcela = parseFloat((restante / parcelas).toFixed(2));

                for (let i = 1; i <= parcelas; i++) {
                    // CALCULA VENCIMENTO DE CADA PARCELA (+30 dias por parcela)
                    const dataVenc = new Date(vencimentoPrimeira);
                    dataVenc.setMonth(dataVenc.getMonth() + (i - 1));
                    const vencimento = dataVenc.toISOString().split("T")[0];

                    let conta = new Conta(
                        0,
                        descricaoBase + ` (${i}/${parcelas})`,
                        valorParcela,
                        0,
                        formaPagamento,
                        "PENDENTE",
                        vencimento,
                        i,
                        parcelas,
                        manutencaoId,
                        veiculoId
                    );

                    await this.#ContaRepositorio.gravar(conta);
                }
            }

            // ATUALIZA STATUS DA MANUTENÇÃO PARA CONCLUIDA
            await this.#ManutencaoRepositorio.atualizarStatus(manutencaoId, "CONCLUIDA");

            return res.status(200).json({ msg: "Contas geradas e manutenção concluída com sucesso!" });

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- EFETUAR PAGAMENTO ------------------------ */
    async pagar(req, res) {
        try {

            let { id, valorPago } = req.body;

            if (!id || !valorPago)
                return res.status(400).json({ msg: "Informe o ID e o valor pago!" });

            let conta = await this.#ContaRepositorio.obter(id);
            if (!conta)
                return res.status(404).json({ msg: "Conta não encontrada!" });

            if (conta.status === "PAGO")
                return res.status(400).json({ msg: "Esta conta já foi paga!" });

            const pago = Number(valorPago);
            const status = pago >= Number(conta.valor) ? "PAGO" : "PARCIAL";

            await this.#ContaRepositorio.pagar(id, pago, status);

            return res.status(200).json({ msg: "Pagamento registrado com sucesso!", status });

        } catch (exception) {
            console.log(exception);
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