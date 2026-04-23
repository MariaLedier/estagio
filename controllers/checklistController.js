import Checklist from "../entities/checklist.js";
import ChecklistItem from "../entities/checklistItem.js";
import ChecklistRepository from "../repositories/checklistRepository.js";
import VeiculoRepository from "../repositories/veiculosRepository.js";

// Todos os 33 campos válidos do checklist
// O controller usa essa lista para garantir que só campos válidos sejam salvos
const CAMPOS_VALIDOS = [
    "oleo", "agua", "fluido_freio", "fluido_direcao", "arrefecimento", "correia",
    "freio_dianteiro", "freio_traseiro", "disco_dianteiro", "disco_traseiro", "freio_mao",
    "pneu_dianteiro_esq", "pneu_dianteiro_dir", "pneu_traseiro_esq", "pneu_traseiro_dir",
    "estepe", "calibragem",
    "bateria", "farol_dianteiro", "farol_traseiro", "setas", "luz_re", "painel",
    "para_brisa", "limpador", "portas", "espelhos", "cinto", "extintor", "triangulo",
    "amortecedor_diant", "amortecedor_tras", "alinhamento", "barra_direcao",
];

const STATUS_VALIDOS = ["Bom", "Regular", "Ruim", "Não verificado"];

export default class ChecklistController {

    #ChecklistRepositorio;
    #VeiculoRepositorio;

    constructor() {
        this.#ChecklistRepositorio = new ChecklistRepository();
        this.#VeiculoRepositorio   = new VeiculoRepository();
    }

    /*----------------------- LISTAR POR VEÍCULO ------------------------ */
    async listarPorVeiculo(req, res) {
        try {
            const veiculoId = req.params.veiculoId;
            let lista = await this.#ChecklistRepositorio.listarPorVeiculo(veiculoId);
            res.status(200).json(lista);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- OBTER POR ID ------------------------ */
    async obter(req, res) {
        try {
            const { id } = req.params;
            let checklist = await this.#ChecklistRepositorio.obter(id);

            if (!checklist)
                return res.status(404).json({ msg: "Checklist não encontrado!" });

            res.status(200).json(checklist);
        } catch (exception) {
            console.log(exception);
            res.status(500).json({ msg: "Erro ao processar requisição" });
        }
    }

    /*----------------------- CADASTRAR ------------------------ */
    async cadastrar(req, res) {
        try {
            let { veiculo, usuario, data, km, observacoes, itens } = req.body;

            if (!veiculo || !usuario || !data)
                return res.status(400).json({ msg: "Campos obrigatórios: veiculo, usuario, data" });

            // Valida veículo
            let veiculoAtual = await this.#VeiculoRepositorio.obter(veiculo);
            if (!veiculoAtual)
                return res.status(404).json({ msg: "Veículo não encontrado!" });

            if (veiculoAtual.status === "Inativo")
                return res.status(400).json({ msg: "Não é possível criar checklist para um veículo inativo!" });

            // Valida KM
            if (km && km < veiculoAtual.kmatual)
                return res.status(400).json({
                    msg: `KM informada (${km}) não pode ser menor que a KM atual do veículo (${veiculoAtual.kmatual})!`
                });

            // 1. Grava o cabeçalho
            let entidade = new Checklist(0, data, km || null, observacoes || null, veiculo, usuario);
            let checklistId = await this.#ChecklistRepositorio.gravar(entidade);

            if (!checklistId)
                throw new Error("Erro ao gravar checklist no banco de dados");

            // 2. Grava TODOS os itens válidos em tb_checklist_item
            //    itens = { oleo: "Bom", freio_dianteiro: "Ruim", pneu_traseiro_esq: "Regular", ... }
            if (itens && typeof itens === "object") {
                for (let campo of CAMPOS_VALIDOS) {
                    const statusRecebido = itens[campo];
                    const status = STATUS_VALIDOS.includes(statusRecebido)
                        ? statusRecebido
                        : "Não verificado";

                    let itemEntidade = new ChecklistItem(0, campo, status, checklistId);
                    await this.#ChecklistRepositorio.gravarItem(itemEntidade);
                }
            }

            // 3. Sincroniza pneu_estado em tb_pneu APENAS para os 5 campos de pneu
            //    (freio, oleo, bateria etc. ficam só no histórico do checklist)
            if (itens && typeof itens === "object") {
                await this.#ChecklistRepositorio.sincronizarPneus(veiculo, itens);
            }

            return res.status(200).json({
                msg: "Checklist cadastrado com sucesso!",
                checklist: checklistId
            });

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }

    /*----------------------- DELETAR ------------------------ */
    async deletar(req, res) {
        try {
            const { id } = req.params;

            let atual = await this.#ChecklistRepositorio.obter(id);
            if (!atual)
                return res.status(404).json({ msg: "Checklist não encontrado para deleção!" });

            if (await this.#ChecklistRepositorio.deletar(id))
                return res.status(200).json({ msg: "Checklist excluído com sucesso!" });
            else
                throw new Error("Erro ao deletar checklist no banco de dados");

        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: exception.message });
        }
    }
}