import express from 'express'
import ManutencaoController from '../controllers/manutencaoController.js';

const router = express.Router();

let ctrl = new ManutencaoController();

router.get("/", (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Listar todas as manutenções'

    /* #swagger.responses[404] = {
      description: 'Nenhum serviço encontrado na consulta',
      schema: { $ref: '#/components/schemas/erro' }
  }
  */
    ctrl.listar(req, res)
});

router.get("/veiculo/:veiculoId", (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Listar manutenções por veículo'

      /* #swagger.responses[404] = {
        description: 'Nenhum serviço encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
    ctrl.listarPorVeiculo(req, res)
});

router.post("/", (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Cadastra uma nova manutenção'

    
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/manutencao'
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});

router.put("/", (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Altera uma manutenção existente'

      /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/manutencao'
                }
            }
        }
    }
    */
    ctrl.atualizar(req, res);
});

router.delete("/:id", (req, res) => {
    // #swagger.tags = ['Manutenção']
    // #swagger.summary = 'Deleta uma manutenção'
    ctrl.deletar(req, res);
});

export default router;