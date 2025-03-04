import * as faceapi from "face-api.js"

export async function initFaceDetection() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models")
}

export async function checkFacePosition(videoElement: HTMLVideoElement) {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()

  if (!detection) {
    return {
      isCentered: false,
      message: "Nenhum rosto detectado",
    }
  }

  const { width, height } = videoElement
  const face = detection.detection.box
  const centerX = width / 2
  const centerY = height / 2

  const faceX = face.x + face.width / 2
  const faceY = face.y + face.height / 2

  const tolerance = 50 // pixels

  const isHorizontallyCentered = Math.abs(faceX - centerX) < tolerance
  const isVerticallyCentered = Math.abs(faceY - centerY) < tolerance

  if (!isHorizontallyCentered) {
    return {
      isCentered: false,
      message: faceX < centerX ? "Mova para a direita" : "Mova para a esquerda",
    }
  }

  if (!isVerticallyCentered) {
    return {
      isCentered: false,
      message: faceY < centerY ? "Mova para baixo" : "Mova para cima",
    }
  }

  return {
    isCentered: true,
    message: "Rosto centralizado!",
  }
}
