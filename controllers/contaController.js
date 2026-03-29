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

    /*----------------------- HELPER: monta entidade Conta com atribuição explícita ------------------------ */
    // Evita depender da ordem dos parâmetros do construtor da entidade
    #montarConta({ descricao, valor, valorPago, formaPagamento, status, vencimento, parcela, totalParcelas, manutencaoId, veiculoId }) {
        let conta = new Conta();
        conta.id = 0;
        conta.descricao = descricao;
        conta.valor = valor;
        conta.valorPago = valorPago ?? 0;
        conta.formaPagamento = formaPagamento;
        conta.status = status;
        conta.vencimento = vencimento;
        conta.parcela = parcela;
        conta.totalParcelas = totalParcelas;
        conta.manutencao = manutencaoId;   // repositório faz: conta.manutencao?.id ?? conta.manutencao
        conta.veiculo = veiculoId;          // repositório faz: conta.veiculo?.id ?? conta.veiculo
        return conta;
    }

    /*----------------------- CONCLUIR MANUTENÇÃO E GERAR CONTAS ------------------------ */
    async gerarContas(req, res) {
        try {

            let { manutencaoId, formaPagamento, valorEntrada, numeroParcelas, vencimentoPrimeira } = req.body;

            console.log("[gerarContas] body recebido:", req.body);

            if (!manutencaoId || !formaPagamento || !vencimentoPrimeira)
                return res.status(400).json({ msg: "Dados incompletos para gerar contas!" });

            // BUSCA MANUTENÇÃO COM ITENS
            let manutencao = await this.#ManutencaoRepositorio.obter(manutencaoId);

            console.log("[gerarContas] manutencao.status:", manutencao?.status);
            console.log("[gerarContas] manutencao.veiculo:", manutencao?.veiculo);
            console.log("[gerarContas] manutencao.itens:", manutencao?.itens);

            if (!manutencao)
                return res.status(404).json({ msg: "Manutenção não encontrada!" });

            if (manutencao.status === "CONCLUIDA")
                return res.status(400).json({ msg: "Manutenção já foi concluída!" });

            // GARANTE QUE ITENS É ARRAY VÁLIDO
            const itens = Array.isArray(manutencao.itens) ? manutencao.itens : [];

            if (itens.length === 0)
                return res.status(400).json({ msg: "Esta manutenção não possui itens cadastrados!" });

            // CALCULA TOTAL
            let totalManutencao = 0;
            for (let i = 0; i < itens.length; i++) {
                totalManutencao += Number(itens[i].valor || 0);
            }

            console.log("[gerarContas] totalManutencao:", totalManutencao);

            if (totalManutencao <= 0)
                return res.status(400).json({ msg: "O valor total da manutenção deve ser maior que zero!" });

            const entrada = Number(valorEntrada || 0);

            if (entrada > totalManutencao)
                return res.status(400).json({ msg: "O valor de entrada não pode ser maior que o total!" });

            const restante = parseFloat((totalManutencao - entrada).toFixed(2));
            const parcelas = Math.max(1, parseInt(numeroParcelas || 1));

            // EXTRAI veiculoId SEGURAMENTE do objeto retornado pelo repositório
            let veiculoId = null;
            if (manutencao.veiculo) {
                if (typeof manutencao.veiculo === "object" && manutencao.veiculo.id) {
                    veiculoId = manutencao.veiculo.id;
                } else if (typeof manutencao.veiculo === "number" || typeof manutencao.veiculo === "string") {
                    veiculoId = manutencao.veiculo;
                }
            }

            console.log("[gerarContas] veiculoId resolvido:", veiculoId);

            if (!veiculoId)
                return res.status(400).json({ msg: "Veículo da manutenção não identificado!" });

            const descricaoBase = `Manutenção #${manutencaoId} - ${manutencao.tipo}`;

            // HELPER: formata data sem bug de timezone
            // new Date("2024-01-15") = UTC midnight → vira 2024-01-14 em fuso UTC-3
            // T12:00:00 força meio-dia local e evita essa armadilha
            function formatarData(dataStr, mesesAdicionais) {
                const d = new Date(dataStr + "T12:00:00");
                d.setMonth(d.getMonth() + mesesAdicionais);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            }

            // GERA CONTA DE ENTRADA SE HOUVER
            if (entrada > 0) {
                let contaEntrada = this.#montarConta({
                    descricao: descricaoBase + " (Entrada)",
                    valor: entrada,
                    valorPago: entrada,       // entrada já é paga na hora
                    formaPagamento,
                    status: "PAGO",
                    vencimento: vencimentoPrimeira,
                    parcela: 0,              // 0 = entrada
                    totalParcelas: parcelas,
                    manutencaoId,
                    veiculoId
                });
                await this.#ContaRepositorio.gravar(contaEntrada);
            }

            // GERA PARCELAS DO RESTANTE
            if (restante > 0) {
                // Piso em cada parcela e joga a diferença de centavos na última
                const valorParcelaBase = Math.floor((restante / parcelas) * 100) / 100;
                const totalDistribuido = parseFloat((valorParcelaBase * parcelas).toFixed(2));
                const diferenca = parseFloat((restante - totalDistribuido).toFixed(2));

                for (let i = 1; i <= parcelas; i++) {
                    const valorParcela = i === parcelas
                        ? parseFloat((valorParcelaBase + diferenca).toFixed(2))
                        : valorParcelaBase;

                    const vencimento = formatarData(vencimentoPrimeira, i - 1);

                    let conta = this.#montarConta({
                        descricao: descricaoBase + ` (${i}/${parcelas})`,
                        valor: valorParcela,
                        valorPago: 0,
                        formaPagamento,
                        status: "PENDENTE",
                        vencimento,
                        parcela: i,
                        totalParcelas: parcelas,
                        manutencaoId,
                        veiculoId
                    });

                    await this.#ContaRepositorio.gravar(conta);
                }
            }

            // ATUALIZA STATUS DA MANUTENÇÃO
            await this.#ManutencaoRepositorio.atualizarStatus(manutencaoId, "CONCLUIDA");

            console.log("[gerarContas] concluído com sucesso!");
            return res.status(200).json({ msg: "Contas geradas e manutenção concluída com sucesso!" });

        } catch (exception) {
            console.log("[gerarContas] ERRO:", exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- EFETUAR PAGAMENTO ------------------------ */
    async pagar(req, res) {
        try {

            let { id, valorPago } = req.body;

            if (!id || valorPago === undefined || valorPago === null)
                return res.status(400).json({ msg: "Informe o ID e o valor pago!" });

            const pago = Number(valorPago);

            if (isNaN(pago) || pago <= 0)
                return res.status(400).json({ msg: "Valor pago inválido!" });

            let conta = await this.#ContaRepositorio.obter(id);
            if (!conta)
                return res.status(404).json({ msg: "Conta não encontrada!" });

            if (conta.status === "PAGO")
                return res.status(400).json({ msg: "Esta conta já foi paga!" });

            // Acumula pagamentos parciais anteriores
            const totalPagoAnteriormente = Number(conta.valorPago || 0);
            const totalPagoAgora = parseFloat((totalPagoAnteriormente + pago).toFixed(2));
            const valorTotal = Number(conta.valor);

            const status = totalPagoAgora >= valorTotal ? "PAGO" : "PARCIAL";

            await this.#ContaRepositorio.pagar(id, totalPagoAgora, status);

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