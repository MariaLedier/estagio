import express from 'express'
// CHAMADA DAS ROTAS
import servicoRouter from './routes/servicoRoute.js'
import usuarioRouter from './routes/usuarioRoute.js'
import oficinaRouter from './routes/oficinaRoute.js'
import veiculoRouter from './routes/veiculoRoute.js'
import modeloRouter from './routes/modeloRoute.js'
import marcaRouter from './routes/marcaRoute.js'
import pneuRouter from './routes/pneuRoute.js'
import abastecimentoRouter from './routes/abastecimentoRoute.js'
import manutencaoRouter from './routes/manutencaoRoute.js'
import contaRouter from './routes/contaRoute.js'
import autenticacaoRouter from './routes/autenticacaoRoute.js'
import AuthMiddleware from './middlewares/authMiddleware.js';


import swaggerUi from 'swagger-ui-express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const outputJson = require("./swaggerOutput.json");
const server = express();
const auth = new AuthMiddleware();

server.use(cors({ credentials: true, origin: "http://localhost:3000" }));
server.use(express.json());
server.use(cookieParser());

server.use("/docs", swaggerUi.serve, swaggerUi.setup(outputJson));

const validar = (req, res, next) => auth.validarToken(req, res, next);
const apenasAdmin = (req, res, next) => auth.apenasAdmin(req, res, next);

// PÚBLICA
server.use("/autenticacao", autenticacaoRouter);

// ADMIN (tipo 2) e VENDEDOR (tipo 1)
server.use("/abastecimento", validar, abastecimentoRouter);
server.use("/manutencao", validar, manutencaoRouter);

// SÓ ADMIN (tipo 2)
server.use("/servico", validar, apenasAdmin, servicoRouter);
server.use("/usuario", validar, apenasAdmin, usuarioRouter);
server.use("/oficina", validar, apenasAdmin, oficinaRouter);
server.use("/veiculo", validar, apenasAdmin, veiculoRouter);
server.use("/modelo", validar, apenasAdmin, modeloRouter);
server.use("/marca", validar, apenasAdmin, marcaRouter);
server.use("/pneu", validar, apenasAdmin, pneuRouter);
server.use("/conta", validar, apenasAdmin, contaRouter);


server.listen(5000, function () {
    console.log("backend em funcionamento!");
})
