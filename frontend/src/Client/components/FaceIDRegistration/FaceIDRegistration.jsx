import { loadFaceModels, captureFaceDescriptor, registerFaceDescriptorMultiple, detectFaceRealTime } from '../../../services/faceService';
import './FaceIDRegistration.css';
import { useTranslation } from "react-i18next";
import { useRef, useState, useCallback, useEffect } from 'react';

import { Camera, CheckCircle, X, AlertCircle } from 'lucide-react';
const FaceIDRegistration = ({ userId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const autoCaptureTriggeredRef = useRef(false);

  // Real-time face detection for visualization
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isModelsLoaded) return;

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    detectionIntervalRef.current = setInterval(async () => {
      if (!video || video.readyState < 2) return;

      const detection = await detectFaceRealTime(video);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detection) {
        setFaceDetected(true);

        const box = detection.detection?.box || detection.box;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      } else {
        setFaceDetected(false);
      }
    }, 250);
  }, [isModelsLoaded]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        setMessage({ type: 'info', text: t('Loading face recognition models...') });
        await loadFaceModels();
        setIsModelsLoaded(true);
        setMessage({ type: 'info', text: t('Models loaded. Starting camera...') });

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user' 
          }
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            startFaceDetection();
          };
        }
        setMessage({ type: 'success', text: t('Camera ready. Position your face in the frame.') 
        });
      } catch (error) {
        console.error('Error initializing camera:', error);
        setMessage({ 
          type: 'error', 
          text: error.message || t('Failed to access camera. Please allow camera permissions.') 
        });
    }
  };
    initCamera();

    return () => {
      stopCamera();
    };
  }, [startFaceDetection]);
  

  const stopDetection = () => {
  if (detectionIntervalRef.current) {
    clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = null;
    }
  };

  const stopCamera = () => {
    stopDetection();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCapture = async () => {
    if (!userId) {
      setMessage({ type: 'error', text: t('User ID not found. Please login again.') });
      return;
    }

    if (!videoRef.current || !isModelsLoaded) {
      setMessage({ type: 'error', text: t('Camera or models not ready') });
      return;
    }

    if (!faceDetected) {
      setMessage({ type: 'error', text: t('Please position your face in the frame first') });
      autoCaptureTriggeredRef.current = false;
      return;
    }

    setIsCapturing(true);
    setCaptureProgress(0);
    setMessage({
      type: 'info',
      text: t('Capturing face... Please stay still.')
    });

    stopDetection();

    try {
      const descriptors = [];
      const numSamples = 2;

      for (let i = 0; i < numSamples; i++) {
        setCaptureProgress(i + 1);
        setMessage({
          type: 'info',
          text: `Capturing sample ${i + 1} of ${numSamples}...`
        });

        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }

        const descriptor = await captureFaceDescriptor(videoRef.current, 2);
        descriptors.push(descriptor);
      }

      setMessage({ type: 'info', text: t('Processing and registering face...') });

      await registerFaceDescriptorMultiple(userId, descriptors);

      setMessage({ type: 'success', text: t('Face registered successfully!') });

      stopCamera();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error capturing face:', error);

      setMessage({
        type: 'error',
        text: error.message || t('Failed to register face. Please try again.')
      });

      autoCaptureTriggeredRef.current = false;
      setFaceDetected(false);

      if (videoRef.current && isModelsLoaded) {
        startFaceDetection();
      }
    } finally {
      setIsCapturing(false);
    }
  };
  useEffect(() => {
  if (
    faceDetected &&
    isModelsLoaded &&
    !isCapturing &&
    !autoCaptureTriggeredRef.current
  ) {
    autoCaptureTriggeredRef.current = true;

    const timer = setTimeout(() => {
      handleCapture();
    }, 500);

    return () => clearTimeout(timer);
  }

  if (!faceDetected && !isCapturing) {
    autoCaptureTriggeredRef.current = false;
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [faceDetected, isModelsLoaded, isCapturing]);
  const handleCancel = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="face-id-registration-overlay">
      <div className="face-id-registration-modal">
        <div className="face-id-registration-header">
          <h2>{t('Register Face ID')}</h2>
          <button className="close-btn" onClick={handleCancel}><X size={16} /></button>
        </div>

        <div className="face-id-registration-content">
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            <canvas
              ref={canvasRef}
              className="face-detection-canvas"
            />
            {!isModelsLoaded && (
              <div className="camera-overlay">
                <div className="loading-spinner"></div>
                <p>{t('Loading models...')}</p>
              </div>
            )}
            {isModelsLoaded && !faceDetected && (
              <div className="face-detection-hint">
                <p>Position your face in the frame</p>
              </div>
            )}
            {faceDetected && !isCapturing && (
              <div className="face-detected-indicator">
                <CheckCircle size={24} />
                <p>Face detected!</p>
              </div>
            )}
            {isCapturing && captureProgress > 0 && (
              <div className="capture-progress-indicator">
                <p>Capturing sample {captureProgress} of 3...</p>
              </div>
            )}
          </div>

          <div className="instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Position your face in the center of the frame</li>
              <li>Ensure good lighting</li>
              <li>Look directly at the camera</li>
              <li>Remove glasses or masks if possible</li>
              <li>Stay still when capturing</li>
            </ul>
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              <span>{message.text}</span>
            </div>
          )}

          <div className="face-id-registration-actions">
            <button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isCapturing}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceIDRegistration;
