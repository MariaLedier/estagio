import '../public/template/css/sb-admin-2.min.css';
import '../public/template/css/fontawesome-free/css/all.min.css'
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/userContext';

const nunito = Nunito({subsets: ['latin']})

export const metadata = {
  title: "CarControl",
  description: "Controle de Frotas",
};

export default function RootLayout({ children }) {
  return (
    // <UserProvider>
      <html lang="en">
        <head>
          <script src="/template/js/jquery.min.js"></script>
          <script src="/template/js/bootstrap.bundle.min.js"></script>
          <script src="/template/js/sb-admin-2.min.js"></script>
        </head>
        <body className={nunito.className}>
          <Toaster/>
          {children}
        </body>
      </html>
    // </UserProvider>
  );
}
