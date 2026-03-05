import express from 'express'
import servicoRouter from './routes/servicoRoute.js'
import usuarioRouter from './routes/usuarioRoute.js'
import swaggerUi from 'swagger-ui-express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const outputJson = require("./swaggerOutput.json");
const server = express();

server.use(cors({credentials: true, origin: "http://localhost:3000"}));
server.use(express.json());
server.use(cookieParser());

server.use("/docs", swaggerUi.serve, swaggerUi.setup(outputJson));
server.use("/servico", servicoRouter);
server.use("/usuario", usuarioRouter)

server.listen(5000, function() {
    console.log("backend em funcionamento!");
})
