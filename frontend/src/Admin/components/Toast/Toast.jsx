import './Toast.css';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const onCloseRef = useRef(onClose);
  const remainingRef = useRef(duration);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    let lastTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      if (isPausedRef.current) return;

      remainingRef.current = Math.max(0, remainingRef.current - delta);
      const progressPercent = (remainingRef.current / duration) * 100;

      setProgress(progressPercent);

      if (remainingRef.current <= 0) {
        clearInterval(interval);
        setIsVisible(false);
        setTimeout(() => {
          if (onCloseRef.current) onCloseRef.current();
        }, 300);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onCloseRef.current) onCloseRef.current();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon" size={20} />;
      case 'error':
        return <XCircle className="toast-icon" size={20} />;
      case 'warning':
        return <AlertCircle className="toast-icon" size={20} />;
      case 'info':
      default:
        return <Info className="toast-icon" size={20} />;
    }
  };

  return (
    <div
      className={`toast ${type} ${isVisible ? 'show' : 'hide'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="toast-content">
        {getIcon()}
        <div className="toast-message">
          {message}
        </div>
        <button className="toast-close" onClick={handleClose}>
          <X size={16} />
        </button>
      </div>
      <div className="toast-progress">
        <div
          className="toast-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast;
