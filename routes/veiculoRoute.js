import express from 'express'
// import AuthMiddleware from '../middlewares/authMiddleware.js';
import VeiculoController from '../controllers/veiculoController.js';

const router = express.Router();

let ctrl = new VeiculoController();
// let auth = new AuthMiddleware();
router.get("/",  (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Veiculo']
    // #swagger.summary = 'Listar todos os veículos'

    /* #swagger.responses[404] = {
        description: 'Nenhum veiculo encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listar(req, res)
});

router.post("/",  (req, res) => {

    // #swagger.tags = ['Veiculo']
    // #swagger.summary = 'Cadastra um novo veiculo'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/veiculo'
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});

router.put("/", (req, res) => {
  
    // #swagger.tags = ['Veiculo']
    // #swagger.summary = 'Altera um veiculo existente'
        /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/veiculo'
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
    // #swagger.tags = ['Veiculo']
    // #swagger.summary = 'Deleta lógicamente um veiculo'
    ctrl.deletar(req, res);
});

router.get("/:id", (req, res) => {
    // #swagger.tags = ['Veiculo']
    // #swagger.summary = 'Recupera um veículo pelo ID'
    ctrl.obterPorId(req, res);
});

export default router;