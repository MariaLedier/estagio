import Base from "./base.js";

export default class Manutencao extends Base {

    #id;
    #tipo;
    #data;
    #descricao;
    #status;
    #km;
    #veiculo;
    #usuario;
    #itens;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get tipo() { return this.#tipo; }
    set tipo(value) { this.#tipo = value; }

    get data() { return this.#data; }
    set data(value) { this.#data = value; }

    get descricao() { return this.#descricao; }
    set descricao(value) { this.#descricao = value; }

    get status() { return this.#status; }
    set status(value) { this.#status = value; }

    get km() { return this.#km; }
    set km(value) { this.#km = value; }

    get veiculo() { return this.#veiculo; }
    set veiculo(value) { this.#veiculo = value; }

    get usuario() { return this.#usuario; }
    set usuario(value) { this.#usuario = value; }

    get itens() { return this.#itens; }
    set itens(value) { this.#itens = value; }

    constructor(id, tipo, data, descricao, status, km, veiculo, usuario) {
        super();
        this.#id = id;
        this.#tipo = tipo;
        this.#data = data;
        this.#descricao = descricao;
        this.#status = status;
        this.#km = km;
        this.#veiculo = veiculo;
        this.#usuario = usuario;
        this.#itens = [];
    }

}