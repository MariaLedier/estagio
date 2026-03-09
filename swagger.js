import swaggerAutogen from "swagger-autogen";

const doc = {
    host: "localhost:5000",
    info: {
        title: "Documentação Estágio",
        description: "API REST para a construção do backend no estágio supervisionado"
    },
    components: {
        schemas: {
            
            erro: {
                msg: 'Mensagem de erro'
            },

            servico:{
                id: 1,
                nome:'Troca de óleo',
                valor:79.90

            },
            usuario:{
                id:1,
                nome:'Vinicio',
                tipo: 1
            },
            oficina:{
                id: 1,
                nome: 'Okubo',
                datacadastro: '2026-03-08',
                cidade: "Osvaldo Cruz",
            },
            veiculo:{
                id: 1,
                placa: 'ABC1D23',
                modelo: 'Fiorino',
                marca: "Fiat",
                ano: 2023,
                renavam: 1234567891011,
                cor: 'Branco', 
                kmatual: 30000,
                status: "Ativo",
            },
        },
        '@schemas': {
           
        },
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        }
    }
}

const routes = ['./server.js']
const outputJson = './swaggerOutput.json';
swaggerAutogen({openapi: '3.0.0'})(outputJson, routes, doc)
.then(async () => {
  await import("./server.js");
})
