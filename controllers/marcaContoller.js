
import Marca from "../entities/marca.js";
import MarcaRepository from "../repositories/marcaRepository.js";

export default class MarcaController {

    #MarcaRepositorio;

    constructor() {
        this.#MarcaRepositorio = new MarcaRepository();

    }



    async listar(req, res) {
        try {

            let lista = await this.#MarcaRepositorio.listar();
            if (lista.length > 0)
                res.status(200).json(lista);
            else
                res.status(404).json({ msg: "Nenhuma Marca para o modelo cadastrado !" });
        }
        catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }
}