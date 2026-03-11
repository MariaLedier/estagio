import express from 'express'
// import AuthMiddleware from '../middlewares/authMiddleware.js';
import ModeloController from '../controllers/modeloController.js';

const router = express.Router();

let ctrl = new ModeloController();
// let auth = new AuthMiddleware();
router.get("/:marcaId",  (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Modelo']
    // #swagger.summary = 'Listar todos os modelos das marcas'

    /* #swagger.responses[404] = {
        description: 'Nenhum serviço encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listarPorMarca(req, res)
});



export default router;