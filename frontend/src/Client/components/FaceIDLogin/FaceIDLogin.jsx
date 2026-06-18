import { loadFaceModels, captureFaceDescriptor, verifyFaceDescriptor, detectFaceRealTime } from '../../../services/faceService';
import { Camera, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
import './FaceIDLogin.css';
import { useTranslation } from "react-i18next";

const FaceIDLogin = ({ onSuccess, onCancel, onSwitchToPassword }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const autoVerifyTriggeredRef = useRef(false);

  // Real-time face detection for visualization
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isModelsLoaded) return;

    stopDetection();

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

        const box = detection.detection.box;
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
        setIsLoading(true);
        setMessage({ type: 'info', text: t('Loading face recognition models...') });
        await loadFaceModels();
        setIsModelsLoaded(true);
        setMessage({ type: 'info', text: t('Models loaded. Starting camera...') });

        // Start with font camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user' 
          }
        });
        // Start camera
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            startFaceDetection();
          };
        }

        setMessage({ type: 'success', text: t('Camera ready. Position your face in the frame.') });
      } catch (error) {
        console.error('Error initializing camera:', error);
        setMessage({
          type: 'error',
          text: error.message || t('Failed to access camera. Please allow camera permissions.')
        });
      } finally {
        setIsLoading(false);
      }
    };

    initCamera();

    return () => {
      stopCamera();
        };
      }, [startFaceDetection]);

  // Auto-verify trigger - verify immediately when face detected
  useEffect(() => {
    if (faceDetected && !isVerifying && !autoVerifyTriggeredRef.current && isModelsLoaded) {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceDetected, isVerifying, isModelsLoaded]); 

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

    const handleVerify = async () => {
      if (!videoRef.current || !isModelsLoaded) {
        setMessage({ type: 'error', text: t('Camera or models not ready') });
        return;
      }

      if (!faceDetected && !autoVerifyTriggeredRef.current) {
        setMessage({ type: 'error', text: t('Please position your face in the frame first') });
        return;
      }

      setIsVerifying(true);
      setMessage({ type: 'info', text: t('Verifying face... Please stay still.') });
      autoVerifyTriggeredRef.current = true;

      stopDetection();

      try {
        console.time('capture face');
        const descriptor = await captureFaceDescriptor(videoRef.current, 1);
        console.timeEnd('capture face');

        console.time('verify api');
        const user = await verifyFaceDescriptor(descriptor);
        console.timeEnd('verify api');

        stopCamera();

        if (onSuccess) {
          onSuccess(user);
        }
      } catch (error) {
        console.error('Error verifying face:', error);

        setMessage({
          type: 'error',
          text: error.message || t('Face verification failed. Please try again or use password login.')
        });

        autoVerifyTriggeredRef.current = false;
        setFaceDetected(false);
        startFaceDetection();
      } finally {
        setIsVerifying(false);
      }
    };

  const handleCancel = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="face-id-login-overlay">
      <div className="face-id-login-modal">
        <div className="face-id-login-header">
          <h2>{t('Face ID Login')}</h2>
          <button className="close-btn" onClick={handleCancel}><X size={16} /></button>
        </div>

        <div className="face-id-login-content">
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

            {isModelsLoaded && !faceDetected && !message.text && (
              <div className="face-detection-hint">
                <p>{t('Position your face in the frame')}</p>
              </div>
            )}

            {faceDetected && !message.text && (
              <div className="face-detected-indicator">
                <CheckCircle size={24} />
                <p>Face detected!</p>
              </div>
            )}

            {message.text && (
              <div className={`camera-status ${message.type}`}>
                {message.type === 'success' ? (
                  <CheckCircle size={18} />
                ) : message.type === 'error' ? (
                  <span>−</span>
                ) : (
                  <span>+</span>
                )}

                <span>{message.text}</span>
              </div>
            )}
          </div>

          <div className="face-id-login-actions">
            <button
              className="btn-verify"
              onClick={handleVerify}
              disabled={isLoading || isVerifying || !isModelsLoaded}
              style={{ display: 'none' }}
            >
              {isVerifying ? (
                <>
                  <div className="loading-spinner-small"></div>
                  {t('Verifying...')}
                </>
              ) : (
                <>
                  {t('Verify Face')}
                </>
              )}
            </button>
            <button
              className="btn-switch"
              onClick={onSwitchToPassword}
              disabled={isVerifying}
            >
              {t('Use Password To Login')}
            </button>
            <button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isVerifying}
            >
              {t('Cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceIDLogin;
