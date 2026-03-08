import Base from "./base.js";


export default class Servico extends Base {

    #id;
    #nome;
    #datacadastro
    #cidade

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    get nome() {
        return this.#nome;
    }

    set nome(value) {
        this.#nome = value;
    }

    get datacadastro() {
        return this.#datacadastro;
    }

    set datacadastro(value) {
        this.#nome = value;
    }

    get cidade() {
        return this.#cidade;
    }

    set cidade(value) {
        this.#cidade = value;
    }





    constructor(id, nome, datacadastro, cidade) {
        super();
        this.#id = id;
        this.#nome = nome;
        this.#datacadastro = datacadastro;
        this.#cidade = cidade;
    }
}