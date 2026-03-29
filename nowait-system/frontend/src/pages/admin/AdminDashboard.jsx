import socket from "../../services/socket";

export default function AdminDashboard() {

  const next = () => {
    socket.emit("nextToken");
  };

  return (
    <div>
      <h1>NoWait - Admin</h1>

      <button onClick={next}>Next Token</button>
    </div>
  );
}