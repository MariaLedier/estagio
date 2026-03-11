import Base from "./base.js";


export default class Modelo extends Base {

    #id;
    #nome;
    #marca;


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

    get marca() {
        return this.#marca;
    }

    set marca(value) {
        this.#marca = value;
    }

    constructor(id, nome, marca) {
        super();
        this.#id = id;
        this.#nome = nome;
        this.#marca = marca;
    }
}