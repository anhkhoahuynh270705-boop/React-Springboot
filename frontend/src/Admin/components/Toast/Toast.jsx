import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const pausedTimeRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) return;
      
      const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setIsVisible(false);
        setTimeout(() => onClose(), 500); 
      }
    }, 16); 

    return () => clearInterval(interval);
  }, [duration, onClose, isPaused]);

  useEffect(() => {
    if (isPaused) {
      pausedTimeRef.current += Date.now() - startTimeRef.current;
    } else {
      startTimeRef.current = Date.now();
    }
  }, [isPaused]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  return (
    <div 
      className={`toast ${type} ${isVisible ? 'show' : 'hide'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
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
