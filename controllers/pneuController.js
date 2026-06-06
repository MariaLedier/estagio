import Pneu from "../entities/pneus.js";
import PneusRepository from "../repositories/pneusRepository.js";
import VeiculoRepository from "../repositories/veiculosRepository.js";
import DescartePneuRepository from "../repositories/descartePneuRepository.js";
import ManutencaoRepository from "../repositories/manutencaoRepository.js";
import Manutencao from "../entities/manutencao.js";
import ManutencaoItem from "../entities/manutencaoItem.js";

export default class PneuController {

    #PneuRepositorio;
    #VeiculoRepositorio;
    #DescarteRepositorio;
    #ManutencaoRepositorio;

    constructor() {
        this.#PneuRepositorio = new PneusRepository();
        this.#VeiculoRepositorio = new VeiculoRepository();
        this.#DescarteRepositorio = new DescartePneuRepository();
        this.#ManutencaoRepositorio = new ManutencaoRepository();
    }

    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {
            let lista = await this.#PneuRepositorio.listar();

            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum pneu cadastrado!" });

        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- LISTAR POR VEÍCULO ------------------------ */
    async listarPorVeiculo(req, res) {
        try {
            const veiculoId = req.params.veiculoId;
            let lista = await this.#PneuRepositorio.listarPorVeiculo(veiculoId);

            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum Pneu encontrado para este veículo!" });

        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- LISTAR ESTOQUE ------------------------ */
    async listarEstoque(req, res) {
        try {
            let lista = await this.#PneuRepositorio.listarEstoque();

            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum pneu em estoque!" });

        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- LISTAR DESCARTES ------------------------ */
    async listarDescartes(req, res) {
        try {
            const lista = await this.#DescarteRepositorio.listar();
            res.status(200).json(lista);

        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {
            let { marca, medida, dataaquisicao, valor, estado, posicao, veiculo, kmEntrada } = req.body;

            if (marca && medida && estado) {

                if (veiculo) {
                    let veiculoAtual = await this.#VeiculoRepositorio.obter(veiculo);

                    if (!veiculoAtual)
                        return res.status(404).json({ msg: "Veículo não encontrado!" });

                    if (veiculoAtual.status === "Inativo")
                        return res.status(400).json({ msg: "Não é possível vincular pneu a um veículo inativo!" });
                }

                let status = "EM_ESTOQUE";
                if (veiculo && posicao && posicao.toLowerCase() !== "estepe") {
                    status = "EM_USO";
                }

                let entidade = new Pneu(
                    0, marca, medida, dataaquisicao, valor,
                    estado, status, posicao || null, veiculo || null,
                    kmEntrada ?? null
                );

                let inseriu = await this.#PneuRepositorio.gravar(entidade);

                if (inseriu)
                    return res.status(200).json({ msg: "Pneu cadastrado com sucesso!" });
                else
                    throw new Error("Erro ao cadastrar pneu no banco de dados");

            } else {
                return res.status(400).json({ msg: "As informações do pneu não estão corretas!" });
            }

        } catch (exception) {
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

                if (pneuAtual.status === "DESCARTADO")
                    return res.status(400).json({ msg: "Pneu descartado não pode ser alterado" });

                let entidade = new Pneu(
                    id, marca, medida, dataaquisicao, valor,
                    estado,
                    pneuAtual.status,
                    pneuAtual.posicao,
                    pneuAtual.veiculo,
                    pneuAtual.kmEntrada
                );

                if (await this.#PneuRepositorio.alterar(entidade))
                    return res.status(200).json({ msg: "Pneu alterado com sucesso!" });
                else
                    throw new Error("Erro ao alterar pneu no banco de dados");

            } else {
                return res.status(400).json({ msg: "As informações do pneu não estão corretas!" });
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

            if (await this.#PneuRepositorio.obter(id)) {

                if (await this.#PneuRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Pneu excluído com sucesso!" });
                else
                    throw new Error("Erro ao deletar pneu no banco de dados");

            } else {
                return res.status(404).json({ msg: "Pneu não encontrado para deleção" });
            }

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- TROCAR PNEU ------------------------ */
    async trocarPneu(req, res) {
        try {
            let {
                pneuSaidaId, pneuEntradaId,
                posicao, veiculoId, kmAtual, usuario,
                novoPneu, descricaoManutencao, oficina, valorServico
            } = req.body;

            if (!pneuSaidaId || !posicao || !veiculoId || !usuario)
                return res.status(400).json({ msg: "Preencha todos os campos obrigatórios!" });

            const hoje = new Date().toISOString().split("T")[0];

            // BUSCA PNEU QUE SAI
            const pneuSaida = await this.#PneuRepositorio.obter(pneuSaidaId);
            if (!pneuSaida)
                return res.status(404).json({ msg: "Pneu de saída não encontrado!" });

            // CALCULA USO
            let diasUso = null;
            if (pneuSaida.dataaquisicao) {
                const dataEntrada = new Date(pneuSaida.dataaquisicao);
                const dataSaida = new Date(hoje);
                diasUso = Math.floor((dataSaida - dataEntrada) / (1000 * 60 * 60 * 24));
            }

            const veiculo = await this.#VeiculoRepositorio.obter(veiculoId);
            const kmEntradaPneu = pneuSaida.kmEntrada ? Number(pneuSaida.kmEntrada) : null;
            const kmSaida = kmAtual ? Number(kmAtual) : null;

            // KM QUE O PNEU RODOU = diferença entre km da troca e km quando foi montado
            const kmUso = kmEntradaPneu !== null && kmSaida !== null ? kmSaida - kmEntradaPneu : null;

            // GRAVA NO DESCARTE — lógica de negócio no repositório
            await this.#DescarteRepositorio.gravar({
                pneuId: pneuSaidaId,
                veiculoId,
                posicao,
                dataEntrada: pneuSaida.dataaquisicao || null,
                dataSaida: hoje,
                kmEntrada: kmEntradaPneu,
                kmSaida: kmSaida || null,
                kmUso,
                diasUso,
                marca: pneuSaida.marca,
                medida: pneuSaida.medida
            });

            // DESCARTA PNEU QUE SAI
            await this.#PneuRepositorio.descartar(pneuSaidaId);

            // PNEU QUE ENTRA
            if (!pneuEntradaId && novoPneu) {
                const statusNovo = posicao?.toLowerCase() === "estepe" ? "EM_ESTOQUE" : "EM_USO";
                const entidade = new Pneu(
                    0,
                    novoPneu.marca, novoPneu.medida,
                    novoPneu.dataaquisicao || hoje,
                    novoPneu.valor || 0,
                    novoPneu.estado || "Bom",
                    statusNovo, posicao, veiculoId,
                    kmSaida
                );
                await this.#PneuRepositorio.gravar(entidade);

            } else if (pneuEntradaId) {
                const statusNovo = posicao?.toLowerCase() === "estepe" ? "EM_ESTOQUE" : "EM_USO";
                await this.#PneuRepositorio.vincular(pneuEntradaId, statusNovo, posicao, veiculoId, kmSaida);
            }

            // CRIA MANUTENÇÃO
            const entidadeManutencao = new Manutencao(
                0, "CORRETIVA", hoje,
                descricaoManutencao || `Troca de pneu — Posição: ${posicao}`,
                "CONCLUIDA", kmAtual || null, veiculoId, usuario
            );

            const manutencaoId = await this.#ManutencaoRepositorio.gravar(entidadeManutencao);

            // ITEM DA MANUTENÇÃO
            if (oficina && valorServico) {
                const itemEntidade = new ManutencaoItem(
                    0,
                    `Troca de pneu — ${posicao}`,
                    valorServico,
                    manutencaoId,
                    1,
                    oficina
                );
                await this.#ManutencaoRepositorio.gravarItem(itemEntidade);
            }

            return res.status(200).json({
                msg: "Troca de pneu realizada com sucesso!",
                manutencao: manutencaoId
            });

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}