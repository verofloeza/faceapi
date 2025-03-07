"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {  ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/firebase"

interface SelfieCaptureProps {
  handleSelfieCapture: (previewUrl: string, file: File, firebaseUrl: string) => void;
}

type FacePosition = {
  isCentered: boolean
  message: string
}

export default function SelfieCaptureComponent({ handleSelfieCapture }: SelfieCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCentered, setIsCentered] = useState(false)
  const [isWellLit, setIsWellLit] = useState(false)
  const [message, setMessage] = useState("Centra tu rostro")
  const [isChecking, setIsChecking] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const checkFacePosition = useCallback(async (videoElement: HTMLVideoElement): Promise<FacePosition> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(videoElement)
    const randomCheck = Math.random()
    if (randomCheck > 0.7) {
      return {
        isCentered: true,
        message: "¡Rostro centrado!",
      }
    }

    const positions = [
      "Muévete un poco a la izquierda",
      "Muévete un poco a la derecha",
      "Muévete un poco hacia arriba",
      "Muévete un poco hacia abajo",
      "Acércate a la cámara",
      "Aléjate un poco de la cámara",
    ]

    return {
      isCentered: false,
      message: positions[Math.floor(Math.random() * positions.length)],
    }
  }, [])

  const checkLighting = useCallback(() => {
    const video = webcamRef.current?.video
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let brightness = 0

    for (let i = 0; i < data.length; i += 4) {
      brightness += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
    }

    brightness /= data.length / 4
    const isWellLit = brightness > 0.4 && brightness < 0.7
    setIsWellLit(isWellLit)

    return isWellLit
  }, [])

  const checkPositionPeriodically = useCallback(async () => {
    if (!webcamRef.current?.video || isChecking) return

    setIsChecking(true)
    try {
      const result = await checkFacePosition(webcamRef.current.video)
      setIsCentered(result.isCentered)
      const lightingOk = checkLighting()
      if (result.isCentered && lightingOk) {
        setMessage("¡Posición e iluminación adecuadas!")
        if (countdown === null) {
          setCountdown(3)
        }
      } else if (result.isCentered) {
        setMessage("Posición adecuada, ajusta la iluminación")
        setCountdown(null)
      } else if (lightingOk) {
        setMessage(result.message + " (Iluminación adecuada)")
        setCountdown(null)
      } else {
        setMessage(result.message + " (Mejora la iluminación)")
        setCountdown(null)
      }
    } catch (error) {
      console.log(error)
      setMessage("Error al detectar el rostro")
      setIsCentered(false)
      setCountdown(null)
    }
    setIsChecking(false)
  }, [checkFacePosition, checkLighting, isChecking, countdown])

  useEffect(() => {
    const interval = setInterval(checkPositionPeriodically, 1500)
    return () => clearInterval(interval)
  }, [checkPositionPeriodically])

  const uploadToFirebase = async (file: File) => {
    try {

      // Puedes personalizar la ruta según tus necesidades
      const storageRef = ref(storage, `selfies/${Date.now()}-${file.name}`);
      
      // Subir el archivo a Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Archivo subido correctamente', snapshot);
      
      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('URL de descarga:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  };
  
  // Modificación de la función handleCapture para incluir la subida a Firebase
  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;
    const video = webcamRef.current.video;
      if (!video) return;

      const { videoWidth, videoHeight } = video;
  
    const imageSrc = webcamRef.current.getScreenshot({ width: videoWidth, height: videoHeight });
    if (!imageSrc) return;
  
    // Convertir la base64 a Blob
    const byteString = atob(imageSrc.split(',')[1]);
    const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
  
    // Crear URL para preview
    const previewUrl = URL.createObjectURL(blob);
    
    try {
      // Mostrar mensaje de carga
      setMessage("Subiendo imagen...");
      
      // Subir a Firebase y obtener URL
      const firebaseUrl = await uploadToFirebase(file);
      
      // Llamar a la función del componente padre con todos los parámetros
      handleSelfieCapture(previewUrl, file, firebaseUrl);
      
      setCountdown(null);
      setMessage("¡Foto capturada y subida correctamente!");
    } catch (error) {
      console.error("Error en el proceso:", error);
      setMessage("Error al subir la imagen");
    }
  }, [handleSelfieCapture]);

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      handleCapture()
    }
    return () => {
      clearTimeout(timer)
    }
  }, [countdown, handleCapture])

  const handleUserMedia = useCallback(
    (stream: MediaStream) => {
      console.log(stream)
      setMessage("Buscando rostro...")
      checkPositionPeriodically()
    },
    [checkPositionPeriodically],
  )

  return (
    <div className="fixed inset-0 bg-sky-100 flex items-center justify-center p-4">
      <Card className="relative w-full max-w-sm bg-white rounded-3xl p-4">
        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="relative">
            <div className="w-64 h-80 relative overflow-hidden rounded-[40px]">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                onUserMedia={handleUserMedia}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
                screenshotQuality={1}
                videoConstraints={{
                  facingMode: "user",
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }}
                mirrored={false}
              />
              {/* Superposición semitransparente con recorte ovalado */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <mask id="oval-mask">
                    <rect width="100" height="100" fill="white" />
                    <ellipse cx="50" cy="50" rx="35" ry="45" fill="black" />
                  </mask>
                </defs>
                <rect width="100" height="100" fill="rgba(255, 255, 255, 0.5)" mask="url(#oval-mask)" />
                <ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="white" strokeWidth="2" />
              </svg>
              {/* Temporizador */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white drop-shadow-lg">Mire a la cámara</span>
                  <span className="text-6xl font-bold text-white drop-shadow-lg">{countdown}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-700 font-medium min-h-[1.5rem]">{message}</p>
            <Button
              className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-full py-6"
              disabled={!isCentered || !isWellLit || countdown !== null}
              onClick={() => setCountdown(3)}
            >
              Tomar foto
            </Button>
          </div>
        </div>
      </Card>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}

