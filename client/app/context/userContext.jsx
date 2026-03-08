// 'use client'

// import { apiClient } from "@/utils/apiClient.js";

// const { useContext, useState, createContext, useEffect } = require("react");

// const UserContext = createContext();

// export const UserProvider = ({children}) => {

//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     async function carregarUsuario() {
//         let response = await apiClient.get("/autenticacao/usuario")
//         if(response) {
//             setUser(response);
//         }

//         setLoading(false);
//     }

//     useEffect(() => {
//         carregarUsuario();
//     }, [])

//     return <UserContext.Provider value={{user, setUser}}>
//             {
//                 loading ? 
//                     <html>
//                         <body>
//                             <h1>Carregando</h1>
//                         </body>
//                     </html> 
//                     : 
//                     children
//             }
//            </UserContext.Provider>
// }

// export default UserContext;