import AuthMiddleware from "../middlewares/authMiddleware.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";

export default class AutenticacaoController {

    #usuarioRepository;

    constructor() {
        this.#usuarioRepository = new UsuarioRepository();
    }

    async usuario(req, res) {
        try {
            if (req.usuarioLogado)
                return res.status(200).json(req.usuarioLogado);
            else
                throw new Error("Erro ao obter o usuário!");
        }
        catch (ex) {
            console.log(ex);
            return res.status(500).json({ msg: "Erro ao obter usuário" })
        }
    }

    async token(req, res) {
        try {
            let { nome, senha } = req.body;

            if (nome && senha) {
                let usuario = await this.#usuarioRepository.buscarPorLogin(nome, senha);

                if (usuario) {
                    let auth = new AuthMiddleware();
                    let token = auth.gerarToken(
                        usuario.id,
                        usuario.nome,
                        usuario.tipo  // 1=VENDEDOR, 2=ADMIN
                    );

                    res.cookie("token", token, {
                        httpOnly: true,
                        sameSite: "lax",
                        maxAge: 8 * 60 * 60 * 1000  // 8 horas
                    });

                    return res.status(200).json({
                        token: token,
                        usuario: {
                            id: usuario.id,
                            nome: usuario.nome,
                            tipo: usuario.tipo  // 1 ou 2
                        }
                    });
                } else {
                    return res.status(404).json({ msg: "Usuário não encontrado" });
                }
            } else {
                return res.status(400).json({ msg: "Informe nome e senha!" });
            }
        }
        catch (exception) {
            console.log(exception);
            return res.status(500).json({ msg: "Erro ao gerar token de acesso" })
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie("token");
            return res.status(200).json({ msg: "Logout realizado!" });
        } catch (ex) {
            console.log(ex);
            return res.status(500).json({ msg: ex.message });
        }
    }
}