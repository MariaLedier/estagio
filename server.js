import express from 'express'
import servicoRouter from './routes/servicoRoute.js'
import usuarioRouter from './routes/usuarioRoute.js'
import oficinaRouter from './routes/oficinaRoute.js'
import veiculoRouter from './routes/veiculoRoute.js'
import modeloRouter from './routes/modeloRoute.js'
import marcaRouter from './routes/marcaRoute.js'
import pneuRouter from './routes/pneuRoute.js'
import abastecimentoRouter from './routes/abastecimentoRoute.js'
import manutencaoRouter from './routes/manutencaoRoute.js'
import autenticacaoRouter from './routes/autenticacaoRoute.js'
import checklistRouter from './routes/checklistRoute.js'
import rodizioRouter from './routes/rodizioRoute.js'


import swaggerUi from 'swagger-ui-express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const outputJson = require("./swaggerOutput.json");
const server = express();

server.use(cors({ credentials: true, origin: "http://localhost:3000" }));
server.use(express.json());
server.use(cookieParser());
server.use("/docs", swaggerUi.serve, swaggerUi.setup(outputJson));

server.use("/autenticacao", autenticacaoRouter);
server.use("/servico",       servicoRouter);
server.use("/usuario",       usuarioRouter);
server.use("/oficina",       oficinaRouter);
server.use("/veiculo",       veiculoRouter);
server.use("/modelo",        modeloRouter);
server.use("/marca",         marcaRouter);
server.use("/pneu",          pneuRouter);
server.use("/abastecimento", abastecimentoRouter);
server.use("/manutencao",    manutencaoRouter);
server.use("/checklist",     checklistRouter)
server.use("/rodizio",     rodizioRouter)

server.listen(5000, function() {
    console.log("backend em funcionamento!");
})