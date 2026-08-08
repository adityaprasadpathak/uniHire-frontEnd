import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const createStompClient = () => {
  const token = localStorage.getItem('token');
  
  const client = new Client({
    // If you want to use native websockets, use brokerURL
    // But since backend uses withSockJS(), we'll provide webSocketFactory
    webSocketFactory: () => {
      // The API base URL is usually handled by axios interceptors, but for SockJS we need the full URL
      // We assume backend is at http://localhost:8080/ws
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      return new SockJS(`${baseUrl}/ws`);
    },
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    debug: function (str) {
      console.log('STOMP: ' + str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  return client;
};
