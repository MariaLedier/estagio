import express from 'express'
import ChecklistController from '../controllers/checklistController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

let auth = new AuthMiddleware();
let ctrl = new ChecklistController();

router.get("/veiculo/:veiculoId", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Checklist']
    // #swagger.summary = 'Listar checklists de um veículo'

    /* #swagger.responses[200] = {
        description: 'Lista de checklists com todos os itens (oleo, freios, pneus, etc.)',
    }
    */
    ctrl.listarPorVeiculo(req, res);
});

router.get("/:id", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Checklist']
    // #swagger.summary = 'Obter checklist por ID'

    /* #swagger.responses[404] = {
        description: 'Checklist não encontrado',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.obter(req, res);
});

router.post("/", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Checklist']
    // #swagger.summary = 'Cadastrar novo checklist'

    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        veiculo:     { type: "integer", example: 1 },
                        usuario:     { type: "integer", example: 3 },
                        data:        { type: "string",  example: "2026-04-23" },
                        km:          { type: "integer", example: 85420 },
                        observacoes: { type: "string",  example: "Pneu traseiro com desgaste" },
                        itens: {
                            type: "object",
                            example: {
                                oleo:              "Bom",
                                agua:              "Bom",
                                fluido_freio:      "Regular",
                                freio_dianteiro:   "Bom",
                                freio_traseiro:    "Ruim",
                                pneu_traseiro_esq: "Ruim",
                                bateria:           "Bom",
                                para_brisa:        "Bom",
                                amortecedor_diant: "Regular"
                            }
                        }
                    }
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});

router.delete("/:id", auth.validarToken, auth.apenasAdmin, (req, res) => {
    // #swagger.tags = ['Checklist']
    // #swagger.summary = 'Deletar um checklist'
    ctrl.deletar(req, res);
});

export default router;