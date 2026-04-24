import express from 'express'
import ManutencaoController from '../controllers/manutencaoController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

let auth = new AuthMiddleware();
let ctrl = new ManutencaoController();

router.get("/", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Listar todas as manutenções'
    ctrl.listar(req, res);
});

router.get("/veiculo/:veiculoId", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Listar manutenções por veículo'
    ctrl.listarPorVeiculo(req, res);
});

router.post("/", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Cadastra uma nova manutenção'

    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: '#/components/schemas/manutencao' }
            }
        }
    } */
    ctrl.cadastrar(req, res);
});

router.patch("/concluir", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Conclui uma manutenção registrando data e forma de pagamento'

    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        id:             { type: "integer", example: 10 },
                        dataConclusao:  { type: "string", format: "date", example: "2025-04-24" },
                        formaPagamento: { type: "string", example: "PIX" }
                    },
                    required: ["id", "formaPagamento"]
                }
            }
        }
    } */
    ctrl.concluir(req, res);
});

router.put("/", auth.validarToken, auth.apenasAdmin, (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Altera uma manutenção existente'

    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: '#/components/schemas/manutencao' }
            }
        }
    } */
    ctrl.atualizar(req, res);
});

router.delete("/:id", auth.validarToken, auth.apenasAdmin, (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Deleta uma manutenção'
    ctrl.deletar(req, res);
});

export default router;