'use client'
import FormUsuario from "@/app/components/formUsuario";
import { apiClient } from "@/utils/apiClient";
import { use, useEffect, useState } from "react";


export default function PageAlterarUsuario({params}) {

    const [usuario, setUsuario] = useState(null);
    const {id} = use(params);

    useEffect(() => {
        console.log(id);
        carregarUsuario();
    }, []);

    async function carregarUsuario() {
        let response = await apiClient.get("/usuario/" + id);
        if(response) {
            console.log(response);
            setUsuario(response);
        }
    }

    return (

        <div>
            <h1>Alterar Usuário</h1>
            {
                usuario == null ?
                <p>Carregado...</p>
                :
                <FormUsuario usuario={usuario}></FormUsuario>
            }   
            
        </div>
    )
}