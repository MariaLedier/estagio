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


    // *--------------------------- LISTAR POR VEICULO ---------------*
    async listarPorVeiculo(req, res) {
        try {

            const veiculoId = req.params.veiculoId;

            let lista = await this.#PneuRepositorio.listarPorVeiculo(veiculoId);

            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum Pneu encontrado para este veículo!" });

        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    // *--------------------------- LISTAR PNEUS EM ESTOQUE ---------------*
    async listarEstoque(req, res) {
        try {

            let lista = await this.#PneuRepositorio.listarEstoque();

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


    // ---------------------------- TROCAR PNEU -------------------------
    async trocarPneu(req, res) {
        try {
            let {
                pneuSaidaId,
                pneuEntradaId,     // null se for pneu novo
                posicao,
                veiculoId,
                kmAtual,
                usuario,
                // dados do pneu novo (se não vier do estoque)
                novoPneu,          // { marca, medida, dataaquisicao, valor, estado }
                // dados da manutenção
                descricaoManutencao,
                oficina,
                valorServico
            } = req.body;

            if (!pneuSaidaId || !posicao || !veiculoId || !usuario)
                return res.status(400).json({ msg: "Preencha todos os campos obrigatórios!" });

            const hoje = new Date().toISOString().split("T")[0];

            // BUSCA PNEU QUE SAI
            const pneuSaida = await this.#PneuRepositorio.obter(pneuSaidaId);
            if (!pneuSaida)
                return res.status(404).json({ msg: "Pneu de saída não encontrado!" });

            // CALCULA USO
            let kmUso = null;
            let diasUso = null;
            let kmEntrada = null;

            if (pneuSaida.dataaquisicao) {
                const dataEntrada = new Date(pneuSaida.dataaquisicao);
                const dataSaida = new Date(hoje);
                diasUso = Math.floor((dataSaida - dataEntrada) / (1000 * 60 * 60 * 24));
            }

            if (kmAtual) {
                kmUso = Number(kmAtual);
            }

            // GRAVA NO DESCARTE
            const DescartePneuRepository = (await import("../repositories/descartePneuRepository.js")).default;
            const descarteRepo = new DescartePneuRepository();

            await descarteRepo.gravar({
                pneuId: pneuSaidaId,
                veiculoId,
                posicao,
                dataEntrada: pneuSaida.dataaquisicao || null,
                dataSaida: hoje,
                kmEntrada: kmEntrada,
                kmSaida: kmAtual || null,
                kmUso: kmUso,
                diasUso: diasUso,
                marca: pneuSaida.marca,
                medida: pneuSaida.medida
            });

            // DESCARTA PNEU QUE SAI
            const sqlDescarta = `
            UPDATE tb_pneus SET
                pneus_status = 'DESCARTADO',
                pneus_posicao = NULL,
                pneus_veiculo_id = NULL
            WHERE pneus_id = ?
        `;
            await this.#PneuRepositorio.executarSQL(sqlDescarta, [pneuSaidaId]);

            // SE FOR PNEU NOVO — cadastra primeiro
            let pneuEntradaFinal = pneuEntradaId;

            if (!pneuEntradaId && novoPneu) {
                const Pneu = (await import("../entities/pneus.js")).default;
                const statusNovo = posicao?.toLowerCase() === "estepe" ? "EM_ESTOQUE" : "EM_USO";

                const entidade = new Pneu(
                    0,
                    novoPneu.marca,
                    novoPneu.medida,
                    novoPneu.dataaquisicao || hoje,
                    novoPneu.valor || 0,
                    novoPneu.estado || "Bom",
                    statusNovo,
                    posicao,
                    veiculoId
                );

                pneuEntradaFinal = await this.#PneuRepositorio.gravar(entidade);
            } else if (pneuEntradaId) {
                // VINCULA PNEU DO ESTOQUE
                const statusNovo = posicao?.toLowerCase() === "estepe" ? "EM_ESTOQUE" : "EM_USO";
                const sqlVincula = `
                UPDATE tb_pneus SET
                    pneus_status = ?,
                    pneus_posicao = ?,
                    pneus_veiculo_id = ?
                WHERE pneus_id = ?
            `;
                await this.#PneuRepositorio.executarSQL(sqlVincula, [statusNovo, posicao, veiculoId, pneuEntradaId]);
            }

            // CRIA MANUTENÇÃO
            const ManutencaoRepository = (await import("../repositories/manutencaoRepository.js")).default;
            const Manutencao = (await import("../entities/manutencao.js")).default;


            const manutencaoRepo = new ManutencaoRepository();

            const entidadeManutencao = new Manutencao(
                0, "CORRETIVA",
                hoje,
                descricaoManutencao || `Troca de pneu — Posição: ${posicao}`,
                "CONCLUIDA",
                kmAtual || null,
                veiculoId,
                usuario
            );

            const manutencaoId = await manutencaoRepo.gravar(entidadeManutencao);

            // ITEM DA MANUTENÇÃO
            if (oficina && valorServico) {
                const ManutencaoItem = (await import("../entities/manutencaoItem.js")).default;
                const itemEntidade = new ManutencaoItem(
                    0,
                    `Troca de pneu — ${posicao}`,
                    valorServico,
                    manutencaoId,
                    null,
                    oficina
                );
                await manutencaoRepo.gravarItem(itemEntidade);
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