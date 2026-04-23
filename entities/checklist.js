import Base from "./base.js";

export default class Checklist extends Base {

    #id;
    #data;
    #km;
    #observacoes;
    #veiculo;
    #usuario;
    #itens;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get data() { return this.#data; }
    set data(value) { this.#data = value; }

    get km() { return this.#km; }
    set km(value) { this.#km = value; }

    get observacoes() { return this.#observacoes; }
    set observacoes(value) { this.#observacoes = value; }

    get veiculo() { return this.#veiculo; }
    set veiculo(value) { this.#veiculo = value; }

    get usuario() { return this.#usuario; }
    set usuario(value) { this.#usuario = value; }

    get itens() { return this.#itens; }
    set itens(value) { this.#itens = value; }

    constructor(id, data, km, observacoes, veiculo, usuario) {
        super();
        this.#id          = id;
        this.#data        = data;
        this.#km          = km;
        this.#observacoes = observacoes;
        this.#veiculo     = veiculo;
        this.#usuario     = usuario;
        this.#itens       = [];
    }
}