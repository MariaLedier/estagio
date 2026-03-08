import Base from "./base.js";


export default class Servico extends Base {

    #id;
    #nome;

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

   
    
    constructor(id, nome) {
        super();
        this.#id = id;
        this.#nome = nome;
    }
}