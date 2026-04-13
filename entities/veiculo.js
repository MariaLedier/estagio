import Base from "./base.js";

export default class Veiculo extends Base {

    #id;
    #placa;
    #ano;
    #renavam;
    #cor;
    #kmatual;
    #status;
    #modelo;
    #marca;
    #modeloNome;
    #marcaNome;
    #tanque;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get placa() { return this.#placa; }
    set placa(value) { this.#placa = value; }

    get ano() { return this.#ano; }
    set ano(value) { this.#ano = value; }

    get renavam() { return this.#renavam; }
    set renavam(value) { this.#renavam = value; }

    get cor() { return this.#cor; }
    set cor(value) { this.#cor = value; }

    get kmatual() { return this.#kmatual; }
    set kmatual(value) { this.#kmatual = value; }

    get status() { return this.#status; }
    set status(value) { this.#status = value; }

    get modelo() { return this.#modelo; }
    set modelo(value) { this.#modelo = value; }

    get marca() { return this.#marca; }
    set marca(value) { this.#marca = value; }

    get modeloNome() { return this.#modeloNome; }
    set modeloNome(value) { this.#modeloNome = value; }

    get marcaNome() { return this.#marcaNome; }
    set marcaNome(value) { this.#marcaNome = value; }

    get tanque() { return this.#tanque; }
    set tanque(value) { this.#tanque = value; }


    // Altere para 9 parâmetros apenas
    constructor(id, placa, ano, renavam, cor, kmatual, status, modelo, tanque) {
        super();
        this.#id = id;
        this.#placa = placa;
        this.#ano = ano;
        this.#renavam = renavam;
        this.#cor = cor;
        this.#kmatual = kmatual;
        this.#status = status;
        this.#modelo = modelo;
        this.#tanque = tanque; // Agora o 9º valor cai aqui corretamente
        this.#marca = null;
    }

    toJSON() {
        return {
            id: this.#id,
            placa: this.#placa,
            ano: this.#ano,
            renavam: this.#renavam,
            cor: this.#cor,
            kmatual: this.#kmatual,
            status: this.#status,
            modelo: this.#modelo,
            marca: this.#marca,
            modeloNome: this.#modeloNome,
            marcaNome: this.#marcaNome,
            tanque: this.#tanque
        }
    }
}