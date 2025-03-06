"use client";

import { FormDataTable } from "@/components/pedidos/form-data-table";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

const Pedidos = () =>{
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (!user) {
          router.push("/login");
        }
        setIsChecking(false);
      }, 500);

      return () => clearTimeout(timer);
    }, [user, router]);
  
    if (isChecking) return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    
    if (!user) return null;

    return (
        <main className="container mx-auto py-10 px-4">
          <button onClick={logout}>Cerrar Sesión</button>
          <h1 className="text-3xl font-bold mb-8 text-center">Gestión de Formularios</h1>
          <FormDataTable />
        </main>
      )
}

export default Pedidos;