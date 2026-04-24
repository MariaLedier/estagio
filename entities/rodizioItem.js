import Base from "./base.js";

export default class RodizioItem extends Base {

    #id;
    #pneu;
    #posicaoAnterior;
    #posicaoNova;
    #rodizio;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get pneu() { return this.#pneu; }
    set pneu(value) { this.#pneu = value; }

    get posicaoAnterior() { return this.#posicaoAnterior; }
    set posicaoAnterior(value) { this.#posicaoAnterior = value; }

    get posicaoNova() { return this.#posicaoNova; }
    set posicaoNova(value) { this.#posicaoNova = value; }

    get rodizio() { return this.#rodizio; }
    set rodizio(value) { this.#rodizio = value; }

    constructor(id, pneu, posicaoAnterior, posicaoNova, rodizio) {
        super();
        this.#id              = id;
        this.#pneu            = pneu;
        this.#posicaoAnterior = posicaoAnterior;
        this.#posicaoNova     = posicaoNova;
        this.#rodizio         = rodizio;
    }
}