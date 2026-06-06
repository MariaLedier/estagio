import Veiculo from "../entities/veiculo.js";
import VeiculoRepository from "../repositories/veiculosRepository.js";

export default class VeiculoController {

    #VeiculoRepositorio;

    constructor() {
        this.#VeiculoRepositorio = new VeiculoRepository();
    }

    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {
            let lista = await this.#VeiculoRepositorio.listar();
            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum veículo cadastrado!" });
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {
            // ✅ 1. Desestrutura PRIMEIRO
            let { placa, ano, renavam, cor, kmatual, status, modelo, tanque, pneus } = req.body;

            // ✅ 2. Valida ANTES de criar a entidade
            if (!placa || !ano || !renavam || !cor || !kmatual || !status || !modelo || !tanque) {
                return res.status(400).json({ msg: "Preencha todos os dados do veículo!" });
            }

            if (!pneus || !Array.isArray(pneus) || pneus.length === 0) {
                return res.status(400).json({ msg: "É obrigatório cadastrar todos os pneus do veículo!" });
            }

            const posicoesObrigatorias = [
                "Dianteiro Esquerdo",
                "Dianteiro Direito",
                "Traseiro Esquerdo",
                "Traseiro Direito",
                "Estepe"
            ];

            for (const posicao of posicoesObrigatorias) {
                const pneu = pneus.find(p => p.posicao === posicao);

                if (!pneu)
                    return res.status(400).json({ msg: `Pneu ausente: ${posicao}` });

                if (!pneu.marca || !pneu.medida || !pneu.dataaquisicao || (!pneu.valor && pneu.valor !== 0))
                    return res.status(400).json({ msg: `Dados incompletos para o pneu: ${posicao}` });
            }

            let placaExistente = await this.#VeiculoRepositorio.obterPorPlaca(placa);
            if (placaExistente)
                return res.status(400).json({ msg: "Já existe um veículo cadastrado com esta placa!" });

            // ✅ 3. Cria a entidade UMA vez, com Number(kmatual)
            let entidade = new Veiculo(0, placa, ano, renavam, cor, Number(kmatual), status, modelo, tanque);
            let veiculoId = await this.#VeiculoRepositorio.gravar(entidade);

            if (!veiculoId)
                throw new Error("Não foi possível salvar o veículo no banco de dados");

            return res.status(200).json({
                msg: "Veículo cadastrado com sucesso",
                veiculo: veiculoId
            });

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- DELETAR ------------------------ */
    async deletar(req, res) {
        try {
            let { id } = req.params;

            if (await this.#VeiculoRepositorio.obter(id)) {
                if (await this.#VeiculoRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Veículo inativado com sucesso!" });
                else
                    throw new Error("Erro ao inativar veículo no banco de dados");
            } else {
                return res.status(404).json({ msg: "Veículo não encontrado para exclusão" });
            }

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- ATUALIZAR ------------------------ */
    async atualizar(req, res) {
        try {
            // ✅ 1. Desestrutura PRIMEIRO
            let { id, placa, ano, renavam, cor, kmatual, status, modelo, tanque } = req.body;

            // ✅ 2. Valida ANTES de criar a entidade
            if (!id || !placa || !ano || !renavam || !cor || !kmatual || !status || !modelo || !tanque)
                return res.status(400).json({ msg: "As informações do veículo não estão completas!" });

            let veiculoAtual = await this.#VeiculoRepositorio.obter(id);
            if (!veiculoAtual)
                return res.status(404).json({ msg: "Veículo não encontrado para alteração" });

            if (veiculoAtual.status === "Inativo")
                return res.status(400).json({ msg: "Não é possível alterar um veículo inativo!" });

            let placaExistente = await this.#VeiculoRepositorio.obterPorPlaca(placa);
            if (placaExistente && placaExistente.id != id)
                return res.status(400).json({ msg: "Já existe outro veículo cadastrado com esta placa!" });

            // ✅ 3. Cria a entidade UMA vez, com Number(kmatual)
            let entidade = new Veiculo(id, placa, ano, renavam, cor, Number(kmatual), status, modelo, tanque);

            if (await this.#VeiculoRepositorio.alterar(entidade))
                res.status(200).json({ msg: "Veículo alterado com sucesso!" });
            else
                throw new Error("Erro ao alterar veículo no banco de dados");

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- OBTER POR ID ------------------------ */
    async obterPorId(req, res) {
        try {
            let { id } = req.params;
            let veiculo = await this.#VeiculoRepositorio.obter(id);
            if (veiculo)
                return res.status(200).json(veiculo);
            else
                return res.status(404).json({ msg: "Veículo não encontrado!" });
        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}