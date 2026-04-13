import Abastecimento from "../entities/abastecimento.js";
import AbastecimentoRepository from "../repositories/abastecimentoRepository.js";
import VeiculoRepository from "../repositories/veiculosRepository.js";  // ← adicione

export default class AbastecimentoController {

    #AbastecimentoRepositorio;
    #VeiculoRepositorio;  // ← adicione

    constructor() {
        this.#AbastecimentoRepositorio = new AbastecimentoRepository();
        this.#VeiculoRepositorio = new VeiculoRepository();  // ← adicione
    }

    /*----------------------- LISTAR ------------------------ */
    async listar(req, res) {
        try {

            let lista = await this.#AbastecimentoRepositorio.listar();

            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum abastecimento cadastrado!" });

        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- LISTAR POR VEICULO ------------------------ */
    async listarPorVeiculo(req, res) {
        try {

            const veiculoId = req.params.veiculoId;

            let lista = await this.#AbastecimentoRepositorio.listarPorVeiculo(veiculoId);

            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum abastecimento encontrado para este veículo!" });

        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {
            let { data, km, litros, valor, tipoCombustivel, veiculo, usuario, pagamento } = req.body;

            const kmNumero = parseInt(km)
            const litrosNumero = parseFloat(litros)

            if (data && kmNumero && litrosNumero && valor && tipoCombustivel && veiculo && usuario && pagamento) {

                // VERIFICA SE VEÍCULO EXISTE E ESTÁ ATIVO
                let veiculoAtual = await this.#VeiculoRepositorio.obter(veiculo)
                if (!veiculoAtual)
                    return res.status(404).json({ msg: "Veículo não encontrado!" })

                if (veiculoAtual.status === "Inativo")
                    return res.status(400).json({ msg: "Não é possível abastecer um veículo inativo!" })

                // VALIDA KM — não pode ser menor que a KM atual
                if (kmNumero < veiculoAtual.kmatual)
                    return res.status(400).json({
                        msg: `KM informada (${kmNumero}) não pode ser menor que a KM atual do veículo (${veiculoAtual.kmatual})!`
                    })

                // BUSCA ÚLTIMO ABASTECIMENTO PARA CALCULAR KM MÉDIA
                let kmMedia = null;
                const ultimo = await this.#AbastecimentoRepositorio.obterUltimoPorVeiculo(veiculo);

                if (ultimo) {
                    const kmPercorrida = km - ultimo.km;
                    if (kmPercorrida > 0 && litros > 0) {
                        kmMedia = parseFloat((kmPercorrida / litros).toFixed(2));
                    }
                }

                let entidade = new Abastecimento(
                    0,
                    data,
                    km,
                    litros,
                    valor,
                    tipoCombustivel,
                    kmMedia,
                    veiculo,
                    usuario,
                    pagamento
                );

                let inseriu = await this.#AbastecimentoRepositorio.gravar(entidade);

                if (inseriu) {
                    // ATUALIZA KM ATUAL DO VEÍCULO AUTOMATICAMENTE
                    await this.#VeiculoRepositorio.atualizarKm(veiculo, km);

                    return res.status(200).json({
                        msg: "Abastecimento cadastrado com sucesso!",
                        kmMedia: kmMedia
                    });
                } else {
                    throw new Error("Erro ao cadastrar abastecimento no banco de dados");
                }

            } else {
                return res.status(400).json({ msg: "As informações do abastecimento não estão corretas!" });
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

            let { id, data, km, litros, valor, veiculo, usuario, pagamento } = req.body;

            if (id && data && km && litros && valor && veiculo && usuario && pagamento) {

                let atual = await this.#AbastecimentoRepositorio.obter(id);

                if (!atual)
                    return res.status(404).json({ msg: "Abastecimento não encontrado para alteração!" });

                let entidade = new Abastecimento(
                    id,
                    data,
                    km,
                    litros,
                    valor,
                    veiculo,
                    usuario,
                    pagamento
                );

                if (await this.#AbastecimentoRepositorio.alterar(entidade))
                    return res.status(200).json({ msg: "Abastecimento alterado com sucesso!" });
                else
                    throw new Error("Erro ao alterar abastecimento no banco de dados");

            } else {

                return res.status(400).json({ msg: "As informações do abastecimento não estão corretas!" });

            }

        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- DELETAR ------------------------ */
    async deletar(req, res) {
        try {

            let { id } = req.params;

            if (await this.#AbastecimentoRepositorio.obter(id)) {

                if (await this.#AbastecimentoRepositorio.deletar(id))
                    return res.status(200).json({ msg: "Abastecimento excluído com sucesso!" });
                else
                    throw new Error("Erro ao deletar abastecimento no banco de dados");

            } else {

                return res.status(404).json({ msg: "Abastecimento não encontrado para deleção!" });

            }

        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}