
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
                res.status(404).json({ msg: "Nenhum Veiculo cadastrado !" });
        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }



    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {
            let { placa, ano, renavam, cor, kmatual, status, modelo } = req.body;

            if (placa && ano && renavam && cor && kmatual && status && modelo) {

                // VERIFICA PLACA DUPLICADA
                let placaExistente = await this.#VeiculoRepositorio.obterPorPlaca(placa)
                if (placaExistente)
                    return res.status(400).json({ msg: "Já existe um veículo cadastrado com esta placa!" })

                let entidade = new Veiculo(0, placa, ano, renavam, cor, kmatual, status, modelo);
                let veiculoId = await this.#VeiculoRepositorio.gravar(entidade);

                if (veiculoId) {
                    return res.status(200).json({
                        msg: "Veículo cadastrado com sucesso",
                        veiculo: veiculoId
                    });
                } else {
                    throw new Error("Erro ao cadastrar Veículo. Não foi possível persisti-lo no banco de dados");
                }

            } else {
                return res.status(400).json({ msg: "O veículo precisa ter os dados definido!" })
            }
        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }




    /*----------------------- DELETAR ------------------------ */
    // SE O SERVIÇO ESTIVER ATRELADO A ALGUMA MANUTENÇÃO ELE NÃO PODE SER EXLCUIDO

    async deletar(req, res) {
        try {
            let { id } = req.params;
            if (await this.#VeiculoRepositorio.obter(id)) {

                if (await this.#VeiculoRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Veiculo Inativado com sucesso!" });
                else
                    throw new Error("Erro ao inativar veiculo no banco de dados")
            }
            else {
                //usuario para deleção não existe;
                return res.status(404).json({ msg: "Veiculo não encontrado para deleção" });
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
            let { id, placa, ano, renavam, cor, kmatual, status, modelo } = req.body;

            if (id && placa && ano && renavam && cor && kmatual && status && modelo) {

                let veiculoAtual = await this.#VeiculoRepositorio.obter(id)

                if (!veiculoAtual)
                    return res.status(404).json({ msg: "Veiculo não encontrado para alteração" })

                // BLOQUEIA ALTERAÇÃO DE VEÍCULO INATIVO
                if (veiculoAtual.status === "Inativo")
                    return res.status(400).json({ msg: "Não é possível alterar um veículo inativo!" })

                // VERIFICA PLACA DUPLICADA (ignora o próprio veículo)
                let placaExistente = await this.#VeiculoRepositorio.obterPorPlaca(placa)
                if (placaExistente && placaExistente.id != id)
                    return res.status(400).json({ msg: "Já existe outro veículo cadastrado com esta placa!" })

                let entidade = new Veiculo(id, placa, ano, renavam, cor, kmatual, status, modelo);

                if (await this.#VeiculoRepositorio.alterar(entidade))
                    res.status(200).json({ msg: "Veiculo alterado!" });
                else
                    throw new Error("Erro ao alterar Veiculo no banco de dados");

            } else {
                res.status(400).json({ msg: "As informações do veículo não estão corretas!" })
            }
        }
        catch (exception) {
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
        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}