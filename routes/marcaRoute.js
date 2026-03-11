import express from 'express'
// import AuthMiddleware from '../middlewares/authMiddleware.js';
import MarcaController from '../controllers/marcaContoller.js';

const router = express.Router();

let ctrl = new MarcaController();
// let auth = new AuthMiddleware();
router.get("/",  (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Marca']
    // #swagger.summary = 'Listar todas as marcas'

    /* #swagger.responses[404] = {
        description: 'Nenhum serviço encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listar(req, res)
});



export default router;