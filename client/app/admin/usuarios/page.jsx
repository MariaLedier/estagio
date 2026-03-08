'use client'

import { apiClient, ApiClient } from "@/utils/apiClient.js";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PageUsuarios() {

    const [lista, setLista] = useState([]);

    useEffect(() => {
        carregarUsuarios();
    }, [])

    async function carregarUsuarios() {

        let usuarios = await apiClient.get("/usuario");
        setLista(usuarios);
    }

    async function excluir(idUsuario) {

        if(confirm("Tem certeza que deseja excluir?")) {
            let response = await apiClient.delete("/usuario/" + idUsuario);

            if(response) {
                toast.success(response.msg);
                carregarUsuarios();
            }
        }

    }

    return (
        <div>
            <h1>Usuários</h1>
            <div>
                <Link className="btn btn-primary" href="/admin/usuarios/cadastrar">
                    <i className="fas fa-plus"></i>
                     Novo Usuário
                </Link>
            </div>
            <br></br>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Ativo</th>
                        <th>Perfil</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                {
                    lista.map((value, index) => {
                        return <tr key={index}>
                                    <td>{value.id}</td>
                                    <td>{value.nome}</td>
                                    <td>{value.email}</td>                                
                                    <td>{value.ativo == 1 ? "Sim" : "Não"}</td>
                                    <td>{value.perfil.id}</td>
                                    <td>
                                        <Link href={"/admin/usuarios/alterar/" + value.id} style={{marginRight: '5px'}} className="btn btn-primary"><i className="fas fa-pen"></i>Editar</Link>
                                        <button onClick={() => excluir(value.id)} className="btn btn-danger"><i className="fas fa-trash"></i>Excluir</button>
                                    </td>
                                </tr>
                    })
                }
                </tbody>

            </table>
        </div>
    )
}