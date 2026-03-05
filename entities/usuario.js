import Base from "./base.js";


export default class Usuario extends Base {

    #id;
    #nome;
    #tipo;

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
    
    constructor(id, nome, tipo) {
        super();
        this.#id = id;
        this.#nome = nome;
        this.#tipo = tipo;
    }
}