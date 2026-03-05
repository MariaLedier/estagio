import Base from "./base.js";


export default class Veiculo extends Base {

    #id;
    #placa;
    #modelo;
    #marca;
    #ano;
    #renavam;
    #cor;
    #kmatual;

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    get placa(){
        return this.#placa;
    }

    set placa(value) {
        this.#placa = value;
    }

    get modelo() {
        return this.#modelo;
    }

    set modelo(value) {
        this.#modelo = value;
    }

    get marca() {
        return this.#marca;
    }

    set marca(value) {
        this.#marca = value;
    }
    

    get ano() {
        return this.#ano;
    }

    set ano(value) {
        this.#ano = value;
    }

    
    get renavam() {
        return this.#renavam;
    }

    set renavam(value) {
        this.#renavam = value;
    }

    
    get cor() {
        return this.#cor;
    }

    set cor(value) {
        this.#cor = value;
    }
    
      
    get kmatual() {
        return this.#kmatual;
    }

    set kmatual(value) {
        this.#kmatual = value;
    }
    
    constructor(id, placa, modelo, marca, ano, renavam, cor, kmatual) {
        this.#id = id;
        this.#placa = placa;
        this.#modelo = modelo;
        this.#marca = marca;
        this.#ano = ano;
        this.#renavam = renavam;
        this.#cor = cor;
        this.#kmatual = kmatual;
        
    }
}