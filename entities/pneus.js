import Base from "./base.js";


export default class Pneus extends Base {

    #id;
    #marca
    #medida
    #dataaquisicao
    #valor
    #estado
    #status
    #posicao
    #veiculo

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    get marca() {
        return this.#marca;
    }

    set marca(value) {
        this.#marca = value;
    }

    get medida() {
        return this.#medida;
    }

    set medida(value) {
        this.#medida = value;
    }
    get dataaquisicao() {
        return this.#dataaquisicao;
    }

    set dataaquisicao(value) {
        this.#dataaquisicao = value;
    }

    get valor() {
        return this.#valor;
    }

    set valor(value) {
        this.#valor = value;
    }

    get estado() {
        return this.#estado;
    }

    set estado(value) {
        this.#estado = value;
    }

    get status() {
        return this.#status;
    }

    set status(value) {
        this.#status = value;
    }

    get posicao() {
        return this.#posicao;
    }

    set posicao(value) {
        this.#posicao = value;
    }

    get veiculo() {
        return this.#veiculo;
    }

    set veiculo(value) {
        this.#veiculo = value;
    }




    constructor(id, marca, medida, dataaquisicao, valor, estado, status, posicao, veiculo) {
        super();
        this.#id = id;

        this.#marca = marca;
        this.#medida = medida;
        this.#dataaquisicao = dataaquisicao;
        this.#valor = valor;
        this.#estado = estado;
        this.#status = status;
        this.#posicao = posicao;
        this.#veiculo = veiculo;
    }
}