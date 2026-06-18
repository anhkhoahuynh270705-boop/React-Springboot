import { useState, useRef, useCallback } from 'react';

export const useHoneypot = () => {
  const [honeypotValue, setHoneypotValue] = useState('');
  const [honeypotUrl, setHoneypotUrl] = useState('');
  const formStartTime = useRef(Date.now());
  const [isValid, setIsValid] = useState(true);

  // Reset form start time when form is opened/reset
  const resetTimer = useCallback(() => {
    formStartTime.current = Date.now();
    setHoneypotValue('');
    setHoneypotUrl('');
    setIsValid(true);
  }, []);

  // Check if form submission is valid
  const validateSubmission = useCallback(() => {
    const fillTime = Date.now() - formStartTime.current;
    
    // Check 1: Hidden field should be empty
    if (honeypotValue.trim() !== '') {
      console.warn('Honeypot: Hidden field was filled');
      setIsValid(false);
      return false;
    }

    // Check 2: Honeypot URL should be empty
    if (honeypotUrl.trim() !== '') {
      console.warn('Honeypot: Honeypot URL was filled');
      setIsValid(false);
      return false;
    }

    // Check 3: Form fill time should be reasonable (at least 2 seconds, max 1 hour)
    const minTime = 2000;
    const maxTime = 3600000;
    
    if (fillTime < minTime) {
      console.warn('Honeypot: Form filled too quickly');
      setIsValid(false);
      return false;
    }

    if (fillTime > maxTime) {
      console.warn('Honeypot: Form took too long to fill');
      setIsValid(false);
      return false;
    }
    
    setIsValid(true);
    return true;
  }, [honeypotValue, honeypotUrl]);

  return {
    honeypotValue,
    setHoneypotValue,
    honeypotUrl,
    setHoneypotUrl,
    formStartTime: formStartTime.current,
    resetTimer,
    validateSubmission,
    isValid
  };
};

export { HoneypotLink, HoneypotButton, HoneypotField, HoneypotUrlField } from '../Client/components/utils/Honeypot';
