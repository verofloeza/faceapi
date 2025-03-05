'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Moon, Sun, Info } from 'lucide-react'
import Image from 'next/image'
import Page from '@/components/selfie/page'
import { firestore } from '@/config/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'


export default function Component() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    telefono: '',
    ciudad: '',
    comentarios: '',
    selfie: '',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }
  const handleSelfieCapture = useCallback((previewUrl: string, file: File, fbUrl: string) => {
    setSelfiePreview(previewUrl)
    
    setFormData(prevData => ({
      ...prevData,
      selfie: fbUrl
    }))
    setIsModalOpen(false)
  }, [])

  const openCamera = useCallback(async () => {
    setIsModalOpen(true)
    
  }, [])


  const nextStep = () => {
    setStep(prevStep => {
      if (prevStep === 1 && !formData.selfie) {
        alert('Debes subir una selfie antes de continuar.');
        return prevStep; 
      }
      return Math.min(prevStep + 1, 2);
    });
  };
  const prevStep = () => setStep(prevStep => Math.max(prevStep - 1, 1))

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <div className="space-y-6">
              <div>
                <Label htmlFor="selfie">Tomar Selfie</Label>
                <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Guía para tomar una buena selfie:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Asegúrate de estar en un lugar bien iluminado</li>
                    <li>Mantén la cámara a la altura de los ojos</li>
                    <li>Mira directamente a la cámara</li>
                    <li>Sonríe de forma natural</li>
                    <li>Evita fondos desordenados o distractores</li>
                    <li>Asegúrate de que tu rostro esté completamente visible</li>
                  </ul>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Button type="button" variant="outline" onClick={openCamera}>
                    <Camera className="mr-2 h-4 w-4" /> Tomar Selfie
                  </Button>
                </div>
                {formData.selfie && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Selfie capturado
                  </p>
                )}
              </div>
              <div>
                <Label>Información Importante</Label>
                <div className="mt-2 relative">
                  {selfiePreview ? (
                    <Image
                      src={selfiePreview || "/placeholder.svg"}
                      alt="Selfie capturado"
                      width={400}
                      height={300}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-[300px] flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No se ha tomado ninguna selfie aún</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2">
                    <Info className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </>
          
        )
      case 2:
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="comentarios">Comentarios adicionales</Label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  className="w-full h-32 px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Escribe tus comentarios aquí..."
                />
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.telefono || !formData.ciudad) {
      alert('Por favor, completa el email, teléfono y ciudad antes de enviar.');
      return;
    }
    try {

      await addDoc(collection(firestore, 'formularios'), {
        ...formData,
        createdAt: serverTimestamp() 
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al guardar el formulario:', error);
      alert('Hubo un error al enviar el formulario.');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="container mx-auto py-8 px-4 transition-colors duration-200 ease-in-out dark:bg-gray-900">
        <Card className="w-full max-w-lg mx-auto">
          {isSubmitted ? (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold">¡Gracias por enviar el formulario!</h2>
              <p className="text-muted-foreground mt-2">
                Hemos recibido tu información y nos pondremos en contacto contigo pronto.
              </p>
            </div>
          ) : ( 
            <>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                {`PASO ${step}`}
              </CardTitle>
              <p className="text-muted-foreground">
                {step === 1 ? 'Tomar Selfie' : 'Información de Contacto'}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </CardHeader>
          <CardContent>
            <Progress value={(step / 2) * 100} className="mt-2 mb-4" />
            <form onSubmit={handleSubmit} className="mt-4">
              {renderStep()}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            )}
            {step < 2 ? (
              <Button type="button" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" onClick={handleSubmit}>
                Enviar
              </Button>
            )}
          </CardFooter>
          </>
        )}
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-3xl w-full h-auto max-h-screen md:h-[100vh] sm:h-[90vh]">
            <DialogHeader>
              <DialogTitle>Tomar Selfie</DialogTitle>
            </DialogHeader>
            <Page handleSelfieCapture={handleSelfieCapture} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}