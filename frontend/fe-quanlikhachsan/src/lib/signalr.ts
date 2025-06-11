import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './config';

// Singleton instance
let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = () => {
  if (!connection) {
    // Lấy base URL không bao gồm phần /api
    const baseUrl = API_BASE_URL.replace('/api', '');
    
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/notificationHub`, {
        skipNegotiation: false, // Cho phép negotiation để tăng độ tin cậy
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Thử kết nối lại với thời gian chờ tăng dần
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }
  return connection;
};

export const startSignalRConnection = async () => {
  try {
    const connection = getSignalRConnection();
    if (connection.state === signalR.HubConnectionState.Disconnected) {
      await connection.start();
      console.log('SignalR Connected!');
      return true;
    }
    return true;
  } catch (err) {
    console.error('SignalR Connection Error: ', err);
    return false;
  }
};

export const stopSignalRConnection = async () => {
  try {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      await connection.stop();
      console.log('SignalR Disconnected!');
    }
  } catch (err) {
    console.error('SignalR Disconnection Error: ', err);
  }
};

export const joinGroup = async (groupName: string) => {
  try {
    const connection = getSignalRConnection();
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('JoinGroup', groupName);
      console.log(`Joined group: ${groupName}`);
    }
  } catch (err) {
    console.error(`Error joining group ${groupName}: `, err);
  }
};

export const leaveGroup = async (groupName: string) => {
  try {
    const connection = getSignalRConnection();
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('LeaveGroup', groupName);
      console.log(`Left group: ${groupName}`);
    }
  } catch (err) {
    console.error(`Error leaving group ${groupName}: `, err);
  }
};

export const subscribeToNotifications = (callback: (notification: any) => void) => {
  const connection = getSignalRConnection();
  connection.on('ReceiveNotification', (notification) => {
    callback(notification);
  });
};

export const unsubscribeFromNotifications = () => {
  const connection = getSignalRConnection();
  connection.off('ReceiveNotification');
};