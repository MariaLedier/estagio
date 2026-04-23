import Base from "./base.js";

export default class ChecklistItem extends Base {

    #id;
    #campo;
    #status;
    #checklist;

    get id() { return this.#id; }
    set id(value) { this.#id = value; }

    get campo() { return this.#campo; }
    set campo(value) { this.#campo = value; }

    get status() { return this.#status; }
    set status(value) { this.#status = value; }

    get checklist() { return this.#checklist; }
    set checklist(value) { this.#checklist = value; }

    constructor(id, campo, status, checklist) {
        super();
        this.#id        = id;
        this.#campo     = campo;
        this.#status    = status;
        this.#checklist = checklist;
    }
}