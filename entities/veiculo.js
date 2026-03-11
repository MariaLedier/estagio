import Base from "./base.js";


export default class Veiculo extends Base {

    #id;
    #placa;
    #ano;
    #renavam;
    #cor;
    #kmatual;
    #status;
    #veiculomodelo;

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    get placa() {
        return this.#placa;
    }

    set placa(value) {
        this.#placa = value;
    }


    get ano() {
        return this.#ano;
    }

    set ano(value) {
        this.#ano = value;
    }


    get renavam() {
        return this.#renavam;
    }

    set renavam(value) {
        this.#renavam = value;
    }


    get cor() {
        return this.#cor;
    }

    set cor(value) {
        this.#cor = value;
    }


    get kmatual() {
        return this.#kmatual;
    }

    set kmatual(value) {
        this.#kmatual = value;
    }

    get status() {
        return this.#status;
    }

    set status(value) {
        this.#status = value;
    }

    get veiculomodelo(){
        return this.#veiculomodelo
    }

    set veiculomodelo(value){
        this.#veiculomodelo = value
    }
    constructor(id, placa, ano, renavam, cor, kmatual, status, veiculomodelo) {
        super();
        this.#id = id;
        this.#placa = placa;
        this.#ano = ano;
        this.#renavam = renavam;
        this.#cor = cor;
        this.#kmatual = kmatual;
        this.#status = status;
        this.#veiculomodelo = veiculomodelo

    }
}