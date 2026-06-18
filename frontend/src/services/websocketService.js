import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WS_URL = 'http://localhost:8080/ws';

let stompClient = null;
let subscriptions = new Map();
let isConnecting = false;
let currentUserId = null;

let onConnectCallbacks = [];
let onDisconnectCallbacks = [];

export function connectWebSocket(userId) {
  if (!userId) return;

  if (stompClient?.connected || isConnecting) {
    return;
  }

  currentUserId = userId;
  isConnecting = true;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),

    reconnectDelay: 5000,

    onConnect: () => {
      console.log('[WebSocket] Connected as user:', userId);

      isConnecting = false;

      onConnectCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('[WebSocket] onConnect callback error:', error);
        }
      });
    },

    onDisconnect: () => {
      console.log('[WebSocket] Disconnected');

      onDisconnectCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('[WebSocket] onDisconnect callback error:', error);
        }
      });
    },

    onStompError: (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers?.message);
      console.error('[WebSocket] STOMP detail:', frame.body);
      isConnecting = false;
    },

    onWebSocketError: (event) => {
      console.warn('[WebSocket] Connection failed. Backend may be offline.', event);
      isConnecting = false;
    },

    onWebSocketClose: () => {
      console.warn('[WebSocket] Connection closed');
      isConnecting = false;

      onDisconnectCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('[WebSocket] onDisconnect callback error:', error);
        }
      });
    }
  });

  stompClient.activate();
}

export function disconnectWebSocket() {
  subscriptions.forEach((subscription) => {
    try {
      subscription.unsubscribe();
    } catch (_) {
      // ignore unsubscribe error
    }
  });

  subscriptions.clear();

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }

  currentUserId = null;
  isConnecting = false;
  onConnectCallbacks = [];
  onDisconnectCallbacks = [];
}

export function subscribe(destination, callback) {
  const doSubscribe = () => {
    if (!stompClient || !stompClient.connected) {
      return;
    }

    if (subscriptions.has(destination)) {
      try {
        subscriptions.get(destination).unsubscribe();
      } catch (_) {
        // ignore unsubscribe error
      }

      subscriptions.delete(destination);
    }

    const subscription = stompClient.subscribe(destination, (message) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch (_) {
        callback(message.body);
      }
    });

    subscriptions.set(destination, subscription);
  };

  if (stompClient?.connected) {
    doSubscribe();
  } else {
    onConnectCallbacks.push(doSubscribe);
  }

  return () => {
    const subscription = subscriptions.get(destination);

    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (_) {
        // ignore unsubscribe error
      }

      subscriptions.delete(destination);
    }
  };
}

export function subscribeToSeatUpdates(showtimeId, callback) {
  if (!showtimeId) return () => { };

  return subscribe(`/topic/seats/${showtimeId}`, callback);
}

export function subscribeToNotifications(userId, callback) {
  if (!userId) return () => { };

  return subscribe(`/user/${userId}/queue/notifications`, callback);
}

export function onConnect(callback) {
  onConnectCallbacks.push(callback);

  return () => {
    onConnectCallbacks = onConnectCallbacks.filter((cb) => cb !== callback);
  };
}

export function onDisconnect(callback) {
  onDisconnectCallbacks.push(callback);

  return () => {
    onDisconnectCallbacks = onDisconnectCallbacks.filter((cb) => cb !== callback);
  };
}

export function isConnected() {
  return !!stompClient?.connected;
}

export function getCurrentUserId() {
  return currentUserId;
}