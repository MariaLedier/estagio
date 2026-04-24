import express from 'express'
import AuthMiddleware from '../middlewares/authMiddleware.js';
import PneuController from '../controllers/pneuController.js';

const router = express.Router();

let ctrl = new PneuController();
let auth = new AuthMiddleware();
router.get("/", auth.validarToken, auth.apenasAdmin, auth.validarToken, (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Pneus']
    // #swagger.summary = 'Listar todos os Pneus cadastrados'

    /* #swagger.responses[404] = {
        description: 'Nenhum serviço encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listar(req, res)
});

router.post("/", auth.validarToken, auth.apenasAdmin, (req, res) => {

    // #swagger.tags = ['Pneus']
    // #swagger.summary = 'Cadastra um novo pneu'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/pneus'
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});

router.put("/", auth.validarToken, auth.apenasAdmin, (req, res) => {

    // #swagger.tags = ['Pneus']
    // #swagger.summary = 'Altera um Pneus existente'
    /* #swagger.requestBody = {
    required: true,
    content: {
        "application/json": {
            schema: {
                $ref: '#/components/schemas/pneus'
            }
        }
    }
}
*/
    ctrl.atualizar(req, res);
});

router.delete("/:id", auth.validarToken, auth.apenasAdmin, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pneus']
    // #swagger.summary = 'Deleta lógicamente um pneu'
    ctrl.deletar(req, res);
});

router.post("/trocar", auth.validarToken, (req, res) => {
    ctrl.trocarPneu(req, res);
});

router.get("/estoque", auth.validarToken, (req, res) => {
    ctrl.listarEstoque(req, res);
});
router.get("/descartes", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Pneus']
    // #swagger.summary = 'Listar histórico de descartes de pneus'
    ctrl.listarDescartes(req, res);
});


router.get("/veiculo/:veiculoId", auth.validarToken, (req, res) => {
    ctrl.listarPorVeiculo(req, res);
});



export default router;