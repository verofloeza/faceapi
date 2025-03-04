import SelfieCaptureComponent from "./selfie-capture"

interface SelfieCaptureProps {
  handleSelfieCapture: (previewUrl: string, file: File, firebaseUrl: string) => void;
}

export default function Page({ handleSelfieCapture }: SelfieCaptureProps) {
  return <SelfieCaptureComponent handleSelfieCapture={handleSelfieCapture}/>
}