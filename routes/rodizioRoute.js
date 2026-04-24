import express from 'express'
import RodizioController from '../controllers/rodizioController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

let auth = new AuthMiddleware();
let ctrl = new RodizioController();

router.get("/veiculo/:veiculoId", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Rodízio']
    // #swagger.summary = 'Listar rodízios de um veículo'
    ctrl.listarPorVeiculo(req, res);
});

router.get("/:id", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Rodízio']
    // #swagger.summary = 'Obter rodízio por ID'
    ctrl.obter(req, res);
});

router.post("/", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Rodízio']
    // #swagger.summary = 'Cadastrar novo rodízio'

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
                        observacoes: { type: "string",  example: "Rodízio preventivo" },
                        itens: {
                            type: "array",
                            example: [
                                { pneuId: 1, posicaoAnterior: "Dianteiro Esquerdo", posicaoNova: "Traseiro Esquerdo" },
                                { pneuId: 2, posicaoAnterior: "Traseiro Esquerdo",  posicaoNova: "Dianteiro Esquerdo" }
                            ]
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
    // #swagger.tags = ['Rodízio']
    // #swagger.summary = 'Deletar um rodízio'
    ctrl.deletar(req, res);
});

export default router;