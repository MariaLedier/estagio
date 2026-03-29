import express from 'express';
import AutenticacaoController from '../controllers/autenticacaoController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

let ctrl = new AutenticacaoController();
let auth = new AuthMiddleware();

router.get("/usuario", (req, res, next) => auth.validarToken(req, res, next), (req, res) => {
    // #swagger.tags = ['Autenticação']
    // #swagger.summary = 'Retorna o usuário logado via cookie'
    ctrl.usuario(req, res);
});

router.post("/token", (req, res) => {
    // #swagger.tags = ['Autenticação']
    // #swagger.summary = 'Gera token via nome e senha'
    ctrl.token(req, res);
});

router.post("/logout", (req, res) => {
    // #swagger.tags = ['Autenticação']
    // #swagger.summary = 'Logout — limpa o cookie'
    ctrl.logout(req, res);
});

export default router;