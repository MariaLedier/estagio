import Base from "./base.js";


export default class Abastecimento extends Base {

    #id;
    #data;
    #km;
    #litros;
    #valor;
    #tipoCombustivel;
    #kmMedia;
    #veiculo;
    #usuario;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get data() { return this.#data; }
    set data(value) { this.#data = value; }

    get km() { return this.#km; }
    set km(value) { this.#km = value; }

    get litros() { return this.#litros; }
    set litros(value) { this.#litros = value; }

    get valor() { return this.#valor; }
    set valor(value) { this.#valor = value; }

    get tipoCombustivel() { return this.#tipoCombustivel; }
    set tipoCombustivel(value) { this.#tipoCombustivel = value; }

    get kmMedia() { return this.#kmMedia; }
    set kmMedia(value) { this.#kmMedia = value; }

    get veiculo() { return this.#veiculo; }
    set veiculo(value) { this.#veiculo = value; }

    get usuario() { return this.#usuario; }
    set usuario(value) { this.#usuario = value; }

    constructor(id, data, km, litros, valor, tipoCombustivel, kmMedia, veiculo, usuario) {
        super();
        this.#id = id;
        this.#data = data;
        this.#km = km;
        this.#litros = litros;
        this.#valor = valor;
        this.#tipoCombustivel = tipoCombustivel;
        this.#kmMedia = kmMedia;
        this.#veiculo = veiculo;
        this.#usuario = usuario;
    }
}