
import { useEffect } from 'react';
import * as signalR from "@microsoft/signalr";

export const useSignalR = () => {
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7001/notificationHub") // Cần khớp với backend [cite: 141]
            .build();

        connection.on("ReceiveNotification", (message) => {
            alert("Thông báo mới: " + message); // Xử lý logic hiển thị
        });

        connection.start();
    }, []);
};