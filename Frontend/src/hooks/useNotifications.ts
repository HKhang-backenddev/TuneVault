import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export const useNotifications = (hubUrl: string): string[] => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveNotification', (message: string) => {
      setMessages((prev) => [...prev, message]);
    });

    connection.start().catch((err) => console.error('SignalR connection error:', err));

    return () => {
      connection.stop();
    };
  }, [hubUrl]);

  return messages;
};