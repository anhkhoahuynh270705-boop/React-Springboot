import * as faceapi from 'face-api.js';
import { API_BASE_URL, authFetch, getAuthToken, parseAuthResponse, publicFetch, saveUserSession } from './apiClient';

// Load face-api models
let modelsLoaded = false;

export const loadFaceModels = async () => {
  if (modelsLoaded) return;

  try {
    // Try loading from CDN first
    const MODEL_URL = '/models';

    console.log('Loading face recognition models from CDN...');
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face models loaded successfully from CDN');
  } catch (error) {
    console.error('Error loading face models from CDN:', error);
    try {
      const LOCAL_MODEL_URL = '/models';
      console.log('Trying to load models from local folder...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL),
      ]);
      modelsLoaded = true;
      console.log('Face models loaded from local folder');
    } catch (localError) {
      console.error('Error loading face models from local folder:', localError);
      throw new Error('Failed to load face recognition models. Please check your internet connection.');
    }
  }
};

// Check if video is ready
const isVideoReady = (videoElement) => {
  return (
    videoElement &&
    videoElement.readyState >= 2 && // HAVE_CURRENT_DATA
    videoElement.videoWidth > 0 &&
    videoElement.videoHeight > 0
  );
};

// Wait for video to be ready
const waitForVideoReady = (videoElement, maxWait = 5000) => {
  return new Promise((resolve, reject) => {
    if (isVideoReady(videoElement)) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isVideoReady(videoElement)) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > maxWait) {
        clearInterval(checkInterval);
        reject(new Error('Video not ready after waiting'));
      }
    }, 100);
  });
};

// Capture face descriptor from video element with retry
export const captureFaceDescriptor = async (videoElement, retries = 5) => {
  if (!modelsLoaded) {
    await loadFaceModels();
  }
  await waitForVideoReady(videoElement);
  const detectionOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.4
  });

  let lastError = null;

  for (let i = 0; i < retries; i++) {
    try {
      // Wait a bit between retries to allow video frame to update
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const detection = await faceapi
        .detectSingleFace(videoElement, detectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const descriptor = Array.from(detection.descriptor);
        // Normalize descriptor before returning
        return normalizeDescriptor(descriptor);
      }
    } catch (error) {
      console.warn(`Face detection attempt ${i + 1} failed:`, error);
      lastError = error;
    }
  }

  // If all retries failed, throw error
  throw new Error(
    lastError?.message ||
    'No face detected after multiple attempts. Please ensure:\n' +
    '- Your face is clearly visible in the frame\n' +
    '- There is good lighting\n' +
    '- You are looking directly at the camera\n' +
    '- No objects are blocking your face'
  );
};

// Detect face in real-time (for visualization)
export const detectFaceRealTime = async (videoElement) => {
  if (!modelsLoaded) {
    await loadFaceModels();
  }

  if (!isVideoReady(videoElement)) {
    return null;
  }

  try {
    const detectionOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.4
    });

    const detection = await faceapi
      .detectSingleFace(videoElement, detectionOptions)
      .withFaceLandmarks();

    return detection;
  } catch {
    return null;
  }
};

// Normalize face descriptor to unit vector
const normalizeDescriptor = (descriptor) => {
  if (!descriptor || descriptor.length === 0) {
    return descriptor;
  }

  // Calculate norm
  let norm = 0;
  for (let i = 0; i < descriptor.length; i++) {
    norm += descriptor[i] * descriptor[i];
  }
  norm = Math.sqrt(norm);

  if (norm === 0) {
    return descriptor;
  }

  // Normalize
  const normalized = new Array(descriptor.length);
  for (let i = 0; i < descriptor.length; i++) {
    normalized[i] = descriptor[i] / norm;
  }

  return normalized;
};

// Average multiple face descriptors for better accuracy
export const averageFaceDescriptors = (descriptors) => {
  if (!descriptors || descriptors.length === 0) {
    return null;
  }

  if (descriptors.length === 1) {
    return normalizeDescriptor(descriptors[0]);
  }

  const length = descriptors[0].length;
  const averaged = new Array(length).fill(0);

  // Normalize each descriptor before averaging
  const normalizedDescriptors = descriptors.map(d => normalizeDescriptor(d));

  for (const descriptor of normalizedDescriptors) {
    for (let i = 0; i < length; i++) {
      averaged[i] += descriptor[i];
    }
  }

  // Average
  for (let i = 0; i < length; i++) {
    averaged[i] /= normalizedDescriptors.length;
  }

  // Normalize the averaged result
  return normalizeDescriptor(averaged);
};

// Register face descriptor for a user
export const registerFaceDescriptor = async (userId, descriptor) => {
  try {
    const response = await authFetch(`/users/${userId}/register-face`, {
      method: 'POST',
      body: JSON.stringify({ faceDescriptor: descriptor }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to register face';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response doesn't have JSON body, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Check if response has content before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && text.trim().length > 0) {
        return JSON.parse(text);
      }
    }

    // Return success object if no body
    return { success: true, message: 'Face registered successfully' };
  } catch (error) {
    console.error('Error registering face descriptor:', error);
    throw error;
  }
};

// Register multiple face descriptors (capture multiple times and average)
export const registerFaceDescriptorMultiple = async (userId, descriptors) => {
  try {
    // Average the descriptors
    const averagedDescriptor = averageFaceDescriptors(descriptors);

    if (!averagedDescriptor) {
      throw new Error('No valid descriptors to register');
    }

    return await registerFaceDescriptor(userId, averagedDescriptor);
  } catch (error) {
    console.error('Error registering multiple face descriptors:', error);
    throw error;
  }
};

// Verify face descriptor for login
export const verifyFaceDescriptor = async (descriptor) => {
  try {
    const response = await publicFetch('/users/verify-face', {
      method: 'POST',
      body: JSON.stringify({ faceDescriptor: descriptor }),
    });

    const text = await response.text();

    let data = null;
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No matching face found. Please register your face first.');
      }

      if (response.status === 401) {
        let errorMsg = 'Face does not match. ';

        if (data?.bestSimilarity !== undefined && data?.threshold !== undefined) {
          errorMsg += `Similarity: ${(data.bestSimilarity * 100).toFixed(1)}% `;
          errorMsg += `(required: ${(data.threshold * 100).toFixed(1)}%). `;
        }

        errorMsg += 'Please try again or use password login instead.';
        throw new Error(errorMsg);
      }

      throw new Error(
        data?.message ||
        `Face verification failed. Server error: ${response.status}`
      );
    }

    if (!data) {
      throw new Error('Server returned empty response.');
    }

    const { token, user } = parseAuthResponse(data);
    saveUserSession(token, user);
    return user;
  } catch (error) {
    console.error('Error verifying face descriptor:', error);
    throw error;
  }
};

// Check if user has registered face

export const checkFaceRegistered = async (userId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/${userId}/has-face`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.hasFace || false;
  } catch (error) {
    console.error('Error checking face registration:', error);
    return false;
  }
};

// Delete/disable Face ID for a user
export const deleteFaceDescriptor = async (userId) => {
  try {
    const response = await authFetch(`/users/${userId}/delete-face`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to delete face');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text && text.trim().length > 0) {
        return JSON.parse(text);
      }
    }

    return { success: true, message: 'Face ID disabled successfully' };
  } catch (error) {
    console.error('Error deleting face descriptor:', error);
    throw error;
  }
};
