import express from 'express'
import ContaController from '../controllers/contaController.js';

const router = express.Router();

let ctrl = new ContaController();

router.get("/", (req, res) => {
    // #swagger.tags = ['Conta']
    // #swagger.summary = 'Listar todas as contas'

    
    /* #swagger.responses[404] = {
      description: 'Nenhum serviço encontrado na consulta',
      schema: { $ref: '#/components/schemas/erro' }
  }
  */
    ctrl.listar(req, res)
});

router.get("/manutencao/:manutencaoId", (req, res) => {
    // #swagger.tags = ['Conta']
    // #swagger.summary = 'Listar contas por manutenção'
    ctrl.listarPorManutencao(req, res)

         /* #swagger.responses[404] = {
        description: 'Nenhum serviço encontrado na consulta',
        schema: { $ref: '#/components/schemas/erro' }
    }
    */
});

router.post("/gerar", (req, res) => {
    // #swagger.tags = ['Conta']
    // #swagger.summary = 'Gerar contas ao concluir manutenção'
    ctrl.gerarContas(req, res)

       /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/gerar'
                }
            }
        }
    }
    */
});

router.post("/pagar", (req, res) => {
    // #swagger.tags = ['Conta']
    // #swagger.summary = 'Efetuar pagamento de uma conta'
    ctrl.pagar(req, res)

       /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/pagar'
                }
            }
        }
    }
    */
});

router.delete("/:id", (req, res) => {
    // #swagger.tags = ['Conta']
    // #swagger.summary = 'Deletar uma conta'
    ctrl.deletar(req, res)
});

export default router;