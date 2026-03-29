import Base from "./base.js";

export default class ManutencaoItem extends Base {

    #id;
    #descricao;
    #valor;
    #manutencao;
    #servico;
    #oficina;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get descricao() { return this.#descricao; }
    set descricao(value) { this.#descricao = value; }

    get valor() { return this.#valor; }
    set valor(value) { this.#valor = value; }

    get manutencao() { return this.#manutencao; }
    set manutencao(value) { this.#manutencao = value; }

    get servico() { return this.#servico; }
    set servico(value) { this.#servico = value; }

    get oficina() { return this.#oficina; }
    set oficina(value) { this.#oficina = value; }

    constructor(id, descricao, valor, manutencao, servico, oficina) {
        super();
        this.#id = id;
        this.#descricao = descricao;
        this.#valor = valor;
        this.#manutencao = manutencao;
        this.#servico = servico;
        this.#oficina = oficina;
    }

}