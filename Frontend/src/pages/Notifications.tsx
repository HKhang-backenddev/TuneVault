import { useNotifications } from '../hooks/useNotifications';

const Notifications = () => {
  // Thay URL này bằng địa chỉ Hub SignalR của Backend nhóm bạn
  const messages = useNotifications("https://localhost:7001/hubs/notificationHub");

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Thông báo của tôi</h2>
      {messages.map((msg: string, index: number) => (
        <div key={index} className="p-4 bg-neutral-800 mb-2 rounded border-l-4 border-green-500">
          {msg}
        </div>
      ))}
    </div>
  );
};
export default Notifications;