'use client'

import { useState, useCallback} from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera } from 'lucide-react'
import Image from 'next/image'
import Page from '@/components/selfie/page'
import { firestore } from '@/config/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'


export default function Component() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nombre:'',
    email: '',
    telefono: '',
    ciudad: '',
    orden:'',
    comentarios: '',
    selfie: '',
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    setStep(2)
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
      return Math.min(prevStep + 1, 3);
    });
  };
  const prevStep = () => setStep(prevStep => Math.max(prevStep - 1, 1))

  // const toggleDarkMode = () => {
  //   setIsDarkMode(prevMode => !prevMode)
  // }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <>
            <div className="space-y-6">
              <div>
                <Label htmlFor="selfie">Medición de distancia pupilar</Label>
                <div className="mt-2 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Indicaciones a considerar para realizar la medición pupilar:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xl">
                    <li>Cámara a la altura de los ojos</li>
                    <li>Buena iluminación</li>
                    <li>Cámara frente al rostro</li>
                    <li>Mira directamente a la cámara</li>
                    <li>Rostro completamente visible</li>
                  </ul>
                </div>
                <div className="flex justify-center mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={openCamera}
                    className="w-full max-w-xs py-9 text-lg bg-[#39A132] text-white hover:bg-[#1DA851] transition-all text-xl"
                  >
                   <div className="flex items-center justify-center">
                      <Camera style={{width: '24px', height: '24px', minWidth: '24px', minHeight: '24px'}} className="mr-2" />
                      <span>Comenzar</span>
                    </div>
                  </Button>
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
                <Label>Tu Selfie</Label>
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
                    <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg w-full h-[300px] flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No se ha tomado ninguna selfie aún</p>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-center text-xl">¿Estás conforme con esta selfie? Si no, puedes volver atrás y tomar otra.</p>
              </div>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label className='text-lg'>Información de Contacto</Label>
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-lg">
                    Por favor completa la siguiente información para continuar.
                  </p>
                </div>
              </div>
              <div>
                <Input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} required className='text-lg' placeholder='Nombre' />
              </div>
              <div>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className='text-lg' placeholder='Email' />
              </div>
              <div>
                <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} required className='text-lg' placeholder='Teléfono' />
              </div>
              <div>
                <Input id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleInputChange} required className='text-lg' placeholder='Ciudad' />
              </div>
              <div>
                <Input id="orden" name="orden" type="text" value={formData.orden} onChange={handleInputChange} required className='text-lg' placeholder='Número de orden' />
              </div>
              <div>
                <Label htmlFor="comentarios" className='text-lg'>Comentarios adicionales</Label>
                <textarea
                  id="comentarios"
                  name="comentarios"
                  value={formData.comentarios}
                  onChange={handleInputChange}
                  className="w-full h-32 px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-neutral-700 text-lg"
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
        createdAt: serverTimestamp(),
        active: true 
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al guardar el formulario:', error);
      alert('Hubo un error al enviar el formulario.');
    }
  };

  return (
    <div  className="min-h-screen bg-neutral-700 dark">
      <div className="container mx-auto py-4 px-4 transition-colors duration-200 ease-in-out dark:bg-neutral-700">
        <div className="flex justify-center mb-8">
          <Image
            className="w-full max-w-[200px] xs:max-w-[200px]"
            src="/logo.png"
            alt="Look Lens"
            width={140} 
            height={20}
          />
        </div>
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
                    {`PASO ${step} DE 3`}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {step === 1 ? 'Tomar Selfie' : 
                     step === 2 ? 'Revisar Selfie' : 
                     'Información de Contacto'}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={(step / 3) * 100} className="mb-2" />
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
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={step === 1 && !formData.selfie}
                  >
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