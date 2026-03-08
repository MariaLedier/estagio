import express from 'express'
// import AuthMiddleware from '../middlewares/authMiddleware.js';
import OficinaController from '../controllers/oficinaController.js';

const router = express.Router();

let ctrl = new OficinaController();
// let auth = new AuthMiddleware();
router.get("/",  (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Oficina']
    // #swagger.summary = 'Listar todas as Oficinas'

    /* #swagger.responses[404] = {
        description: 'Nenhum serviço encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listar(req, res)
});

router.post("/",  (req, res) => {

    // #swagger.tags = ['Oficina']
    // #swagger.summary = 'Cadastra uma nova oficina'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/oficina'
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});

router.put("/", (req, res) => {
  
    // #swagger.tags = ['Oficina']
    // #swagger.summary = 'Altera uma oficina existente'
        /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/oficina'
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
    // #swagger.tags = ['Oficina']
    // #swagger.summary = 'Deleta permanentemente uma oficina'
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