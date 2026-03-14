import express from 'express'
// import AuthMiddleware from '../middlewares/authMiddleware.js';
import PneuController from '../controllers/pneuController.js';

const router = express.Router();

let ctrl = new PneuController();
// let auth = new AuthMiddleware();
router.get("/",  (req, res) => {
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

router.post("/",  (req, res) => {

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

router.put("/", (req, res) => {
  
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

router.delete("/:id", (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Pneus']
    // #swagger.summary = 'Deleta lógicamente um pneu'
    ctrl.deletar(req, res);
});

// router.get("/:id", auth.validarToken, (req, res) => {
//     /* #swagger.security = [{
//         "bearerAuth": []
//     }]
//     */
//     // #swagger.tags = ['Oficina']
//     // #swagger.summary = 'Recupera um usuário através de um ID'
//     ctrl.obterPorId(req, res);
// });


export default router;