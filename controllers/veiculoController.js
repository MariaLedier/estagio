
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

            let { placa, modelo , marca, ano, renavam, cor, kmatual, status } = req.body;
            if (placa && modelo && marca && ano && renavam && cor && kmatual && status) {

                let entidade = new Veiculo(0, placa, modelo , marca, ano, renavam, cor, kmatual, status);
                let inseriu = await this.#VeiculoRepositorio.gravar(entidade);
                if (inseriu == true) {
                    return res.status(200).json({ msg: "Veículo cadastrado com sucesso" });
                }
                else {
                    //não inseriu no bd
                    throw new Error("Erro ao cadastrar Veículo. Não foi possível persisti-lo no banco de dados");
                }

            }
            else {
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
            let { id, placa, modelo , marca, ano, renavam, cor, kmatual, status} = req.body;

            if (id && placa && modelo && marca && ano && renavam && cor && kmatual && status) {
                if (await this.#VeiculoRepositorio.obter(id)) {
                    let entidade = new Veiculo(id, placa, modelo , marca, ano, renavam, cor, kmatual, status);
                    if (await this.#VeiculoRepositorio.alterar(entidade))
                        res.status(200).json({ msg: "Veiculo alterado !" });
                    else
                        throw new Error("Erro ao alterar Veiculo no banco de dados");
                }
                else {
                    res.status(404).json({ msg: "Veiculo não encontrado para alteração" });
                }
            }
            else {
                res.status(400).json({ msg: "As informações do veículo não estão corretas!" })
            }

        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- OBTER POR ID ------------------------ */

    // async obterPorId(req, res) {
    //     try{
    //         let {id} = req.params;
    //         let usuario = await this.#repositorio.buscarPorId(id);
    //         if(usuario) {
    //             return res.status(200).json(usuario);
    //         }
    //         else
    //             return res.status(404).json({msg: "Usuário não encontrado!"});
    //     }
    //     catch(exception) {
    //         console.log(exception);
    //         return res.status(500).json({msg: exception.message});
    //     }
    // }
}