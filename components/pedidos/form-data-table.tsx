"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { collection, getDocs, updateDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore"
import Image from "next/image"
import { firestore } from "@/config/firebase"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"

interface FormData {
  id: string
  nombre: string
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
    const formCollectionRef = collection(firestore, "formularios")
    // const q = query(formCollectionRef, orderBy("createdAt", "desc"))
    const q = query(formCollectionRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formDataList: FormData[] = []
      snapshot.forEach((doc) => {
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
    })

    return () => unsubscribe()
  }, [])

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
    const q = query(formCollectionRef, orderBy("createdAt", "desc"))
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Datos de Formularios</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando datos...</span>
        </div>
      ) : formData.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground">No hay datos de formularios disponibles.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Comentarios</TableHead>
                <TableHead>Selfie</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.email}</TableCell>
                  <TableCell>{item.ciudad}</TableCell>
                  <TableCell>{item.telefono}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{item.comentarios}</TableCell>
                  <TableCell>
                    {item.selfie ? (
                      <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative h-12 w-12 rounded-md overflow-hidden cursor-pointer">
                          <Image
                            src={item.selfie || "/placeholder.svg"}
                            alt={`Selfie de ${item.email}`}
                            fill
                            className="object-cover hover:scale-110 transition-transform"
                          />
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg p-4">
                        <DialogTitle className="sr-only">Selfie de {item.email}</DialogTitle>
                        <div className="relative w-full max-w-[500px] mx-auto">
                            <Image
                            src={item.selfie}
                            alt={`Selfie de ${item.email}`}
                            width={500}
                            height={500}
                            quality={100} // Aumenta la calidad de la imagen
                            className="rounded-lg object-cover"
                            />
                        </div>
                      </DialogContent>
                    </Dialog>
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        No imagen
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <select
                        value={item.estado}
                        onChange={(e) => toggleEstado(item.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        {estados.map((estado) => (
                        <option key={estado} value={estado}>
                            {estado}
                        </option>
                        ))}
                    </select>
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

