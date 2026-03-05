import express from 'express'
// import AuthMiddleware from '../middlewares/authMiddleware.js';
import ServicoController from '../controllers/servicoController.js';

const router = express.Router();

let ctrl = new ServicoController();
// let auth = new AuthMiddleware();
router.get("/",  (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Serviço']
    // #swagger.summary = 'Listar todos os serviços'

    /* #swagger.responses[404] = {
        description: 'Nenhum serviço encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listar(req, res)
});

router.post("/",  (req, res) => {

    // #swagger.tags = ['Serviço']
    // #swagger.summary = 'Cadastra um novo serviço'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/servico'
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});

router.put("/", (req, res) => {
  
    // #swagger.tags = ['Serviço']
    // #swagger.summary = 'Altera um serviço existente'
        /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/servico'
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
    // #swagger.tags = ['Serviço']
    // #swagger.summary = 'Deleta permanentemente um serviço'
    ctrl.deletar(req, res);
});
// router.get("/:id", auth.validarToken, (req, res) => {
//     /* #swagger.security = [{
//         "bearerAuth": []
//     }]
//     */
//     // #swagger.tags = ['Usuário']
//     // #swagger.summary = 'Recupera um usuário através de um ID'
//     ctrl.obterPorId(req, res);
// });


export default router;