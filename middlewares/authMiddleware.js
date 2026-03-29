import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuarioRepository.js';

const SECRET = "PF$2@@@2$FP";

export default class AuthMiddleware {

    gerarToken(id, nome, tipo) {
        return jwt.sign(
            { id, nome, tipo },
            SECRET,
            { expiresIn: "8h" }
        )
    }

    async validarToken(req, res, next) {
        if (req.cookies?.token) {
            let token = req.cookies.token;
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                let usuario = await usuarioRepository.buscarPorId(payload.id);

                if (usuario) {
                    if (usuario.ativo) {
                        req.usuarioLogado = usuario;
                        next();
                    } else {
                        return res.status(401).json({ msg: "Usuário inativo" });
                    }
                } else {
                    return res.status(404).json({ msg: "Usuário não encontrado" });
                }
            }
            catch (ex) {
                console.log(ex)
                return res.status(401).json({ msg: "Token inválido!" });
            }
        } else {
            return res.status(401).json({ msg: "Token não encontrado!" });
        }
    }

    // SÓ ADMIN (tipo 2)
    apenasAdmin(req, res, next) {
        if (req.usuarioLogado?.tipo !== 2)
            return res.status(403).json({ msg: "Acesso negado! Apenas administradores." });
        next();
    }
}