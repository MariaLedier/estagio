import Base from "./base.js";

export default class Conta extends Base {

    #id;
    #descricao;
    #valor;
    #valorPago;
    #formaPagamento;
    #status;
    #vencimento;
    #parcela;
    #totalParcelas;
    #manutencao;
    #veiculo;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get descricao() { return this.#descricao; }
    set descricao(value) { this.#descricao = value; }

    get valor() { return this.#valor; }
    set valor(value) { this.#valor = value; }

    get valorPago() { return this.#valorPago; }
    set valorPago(value) { this.#valorPago = value; }

    get formaPagamento() { return this.#formaPagamento; }
    set formaPagamento(value) { this.#formaPagamento = value; }

    get status() { return this.#status; }
    set status(value) { this.#status = value; }

    get vencimento() { return this.#vencimento; }
    set vencimento(value) { this.#vencimento = value; }

    get parcela() { return this.#parcela; }
    set parcela(value) { this.#parcela = value; }

    get totalParcelas() { return this.#totalParcelas; }
    set totalParcelas(value) { this.#totalParcelas = value; }

    get manutencao() { return this.#manutencao; }
    set manutencao(value) { this.#manutencao = value; }

    get veiculo() { return this.#veiculo; }
    set veiculo(value) { this.#veiculo = value; }

    constructor(id, descricao, valor, valorPago, formaPagamento, status, vencimento, parcela, totalParcelas, manutencao, veiculo) {
        super();
        this.#id = id;
        this.#descricao = descricao;
        this.#valor = valor;
        this.#valorPago = valorPago;
        this.#formaPagamento = formaPagamento;
        this.#status = status;
        this.#vencimento = vencimento;
        this.#parcela = parcela;
        this.#totalParcelas = totalParcelas;
        this.#manutencao = manutencao;
        this.#veiculo = veiculo;
    }

}