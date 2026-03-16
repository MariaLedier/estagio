import express from 'express'
// import AuthMiddleware from '../middlewares/authMiddleware.js';
import AbastecimentoController from '../controllers/abastecimentoController.js';

const router = express.Router();

let ctrl = new AbastecimentoController();
// let auth = new AuthMiddleware();

router.get("/", (req, res) => {
    // #swagger.tags = ['Abastecimento']
    // #swagger.summary = 'Listar todos os abastecimentos'

    /* #swagger.responses[404] = {
        description: 'Nenhum abastecimento encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listar(req, res)
});

router.get("/veiculo/:veiculoId", (req, res) => {
    // #swagger.tags = ['Abastecimento']
    // #swagger.summary = 'Listar abastecimentos por veículo'

    /* #swagger.responses[404] = {
        description: 'Nenhum abastecimento encontrado para este veículo',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listarPorVeiculo(req, res)
});

router.post("/", (req, res) => {
    // #swagger.tags = ['Abastecimento']
    // #swagger.summary = 'Cadastra um novo abastecimento'

    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/abastecimento'
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});

router.put("/", (req, res) => {
    // #swagger.tags = ['Abastecimento']
    // #swagger.summary = 'Altera um abastecimento existente'

    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/abastecimento'
                }
            }
        }
    }
    */
    ctrl.atualizar(req, res);
});

router.delete("/:id", (req, res) => {
    // #swagger.tags = ['Abastecimento']
    // #swagger.summary = 'Deleta um abastecimento'
    ctrl.deletar(req, res);
});

export default router;
