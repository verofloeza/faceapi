"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Trash } from "lucide-react"
import { collection, getDocs, updateDoc, doc, onSnapshot, query, orderBy, where } from "firebase/firestore"
import Image from "next/image"
import { firestore } from "@/config/firebase"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"

interface FormData {
  id: string
  email: string
  ciudad: string
  telefono: string
  comentarios: string
  selfie: string
  estado: string
  createdAt: Date
}

export function FormDataTable() {
  const [formData, setFormData] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)
  const estados = ["Nueva Solicitud", "Iniciado", "Terminado", "Entregado", "Cancelado"];

  useEffect(() => {
    const formCollectionRef = collection(firestore, "formularios");
    const q = query(
      formCollectionRef,
      where("active", "!=", false), 
      orderBy("createdAt", "desc")
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formDataList: FormData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || "",
        ciudad: doc.data().ciudad || "",
        telefono: doc.data().telefono || "",
        comentarios: doc.data().comentarios || "",
        selfie: doc.data().selfie || "",
        estado: doc.data().estado || "",
        createdAt: doc.data().createdAt,
      }));
      
      setFormData(formDataList);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const toggleEstado = async (id: string, nuevoEstado: string) => {
    try {
      const formRef = doc(firestore, "formularios", id);
      await updateDoc(formRef, { estado: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const refreshData = async () => {
    setLoading(true)
    const formCollectionRef = collection(firestore, "formularios")
    const q = query(formCollectionRef, where('active', '!=', false), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const formDataList: FormData[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      formDataList.push({
        id: doc.id,
        email: data.email || "",
        ciudad: data.ciudad || "",
        telefono: data.telefono || "",
        comentarios: data.comentarios || "",
        selfie: data.selfie || "",
        estado: data.estado || "",
        createdAt: data.createdAt,
      })
    })

    setFormData(formDataList)
    setLoading(false)
  }

  const handleDelete = async (itemId: string) => {
    const isConfirmed = window.confirm("¿Seguro que quieres borrar este elemento?");
    if (!isConfirmed) return;
  
    try {
      const formRef = doc(firestore, "formularios", itemId);
      await updateDoc(formRef, { active: false });
      console.log("Elemento eliminado:", itemId);
      alert("Elemento eliminado correctamente"); // Opcional: Feedback para el usuario
    } catch (error) {
      console.error("Error al eliminar el elemento:", error);
      alert("Ocurrió un error al eliminar el elemento"); // Opcional: Notificar al usuario
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Datos de Formularios</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData} 
            disabled={loading}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 dark:text-white">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando datos...</span>
        </div>
      ) : formData.length === 0 ? (
        <div className="text-center py-10 border rounded-lg dark:border-gray-700 dark:text-gray-400">
          <p className="text-muted-foreground">No hay datos de formularios disponibles.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden dark:border-gray-700">
          <Table>
            <TableHeader className="dark:bg-gray-800">
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-300">Email</TableHead>
                <TableHead className="dark:text-gray-300">Ciudad</TableHead>
                <TableHead className="dark:text-gray-300">Teléfono</TableHead>
                <TableHead className="dark:text-gray-300">Comentarios</TableHead>
                <TableHead className="dark:text-gray-300">Selfie</TableHead>
                <TableHead className="dark:text-gray-300">Estado</TableHead>
                <TableHead className="dark:text-gray-300 text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.map((item) => (
                <TableRow key={item.id} className="dark:border-gray-700">
                  <TableCell className="font-medium dark:text-white">{item.email}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.ciudad}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.telefono}</TableCell>
                  <TableCell className="max-w-[200px] truncate dark:text-gray-300">{item.comentarios}</TableCell>
                  <TableCell>
                    {item.selfie ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative h-12 w-12 rounded-md overflow-hidden cursor-pointer border dark:border-gray-600">
                            <Image
                              src={item.selfie || "/placeholder.svg"}
                              alt={`Selfie de ${item.email}`}
                              fill
                              className="object-cover hover:scale-110 transition-transform"
                            />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg p-4 dark:bg-gray-800 dark:border-gray-700">
                          <DialogTitle className="sr-only">Selfie de {item.email}</DialogTitle>
                          <div className="relative w-full max-w-[500px] mx-auto">
                            <Image
                              src={item.selfie}
                              alt={`Selfie de ${item.email}`}
                              width={500}
                              height={500}
                              quality={100}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="h-12 w-12 bg-muted dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-muted-foreground dark:text-gray-400">
                        No imagen
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <select
                      value={item.estado}
                      onChange={(e) => toggleEstado(item.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {estados.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash className="w-4 h-4 mr-1" /> Borrar
                  </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

