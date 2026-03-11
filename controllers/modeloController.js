
import Modelo from "../entities/modelo.js";
import ModeloRepository from "../repositories/modeloRepository.js";

export default class ModeloController {

    #ModeloRepositorio;

    constructor() {
        this.#ModeloRepositorio = new ModeloRepository();

    }



    async listarPorMarca(req, res) {
        try {

            const marcaId = req.params.marcaId;
            let lista = await this.#ModeloRepositorio.listarPorMarca(marcaId);
            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhum modelo para a Marca cadastrado !" });
        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }
}