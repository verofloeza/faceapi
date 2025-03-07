"use client";

import { FormDataTable } from "@/components/pedidos/form-data-table";
import { useAuth } from "@/context/AuthContext";
import { Button } from "antd";
import { LogOut } from "lucide-react";
import Image from "next/image";
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
      <div className="dark">
      <main className="container mx-auto py-8 px-4 transition-colors duration-200 ease-in-out dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <Button 
              variant="outlined" 
              onClick={logout} 
              className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
          
          <div className="flex-1 flex justify-center">
            <Image
              className="w-full max-w-[200px] xs:max-w-[200px]"
              src="/logo.png"
              alt="Look Lens"
              width={140} 
              height={20}
            />
          </div>
          
          <div className="flex-1"></div>
        </div>
        
        <h1 className="text-2xl font-bold mb-8 text-center dark:text-white">
          Gestión de Formularios
        </h1>
        
        <div className="dark:bg-gray-800 rounded-lg p-6">
          <FormDataTable />
        </div>
      </main>
    </div>
      )
}

export default Pedidos;