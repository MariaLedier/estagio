import Base from "./base.js";


export default class Usuario extends Base {

    #id;
    #nome;
    #tipo;
    #senha;

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

    get tipo() {
        return this.#tipo;
    }

    set tipo(value) {
        this.#tipo = value;
    }

    get senha() {
        return this.#senha;
    }

    set senha(value) {
        this.#senha = value;
    }
    
    constructor(id, nome, tipo, senha) {
        super();
        this.#id = id;
        this.#nome = nome;
        this.#tipo = tipo;
        this.#senha = senha;
    }
}