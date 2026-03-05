import Base from "./base.js";


export default class Servico extends Base {

    #id;
    #nome;
    #valor;

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    get nome(){
        return this.#nome;
    }

    set nome(value) {
        this.#nome = value;
    }

    get valor() {
        return this.#valor;
    }

    set valor(value) {
        this.#valor = value;
    }
    
    constructor(id, nome, valor) {
        super();
        this.#id = id;
        this.#nome = nome;
        this.#valor = valor;
    }
}