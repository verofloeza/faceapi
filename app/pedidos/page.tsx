import { FormDataTable } from "@/components/pedidos/form-data-table";

const Pedidos = () =>{
    return (
        <main className="container mx-auto py-10 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Gestión de Formularios</h1>
          <FormDataTable />
        </main>
      )
}

export default Pedidos;