import { useEffect, useState } from "react";
import socket from "../../services/socket";

export default function UserHome() {
  const [myToken, setMyToken] = useState(null);
  const [current, setCurrent] = useState(0);
  const [serving, setServing] = useState(0);

  const getToken = () => {
    socket.emit("getToken");
  };

  useEffect(() => {
    socket.on("tokenGenerated", (token) => {
      setMyToken(token);
    });

    socket.on("queueUpdate", (data) => {
      setCurrent(data.currentToken);
      setServing(data.servingToken);
    });
  }, []);

  return (
    <div>
      <h1>NoWait - User</h1>

      <button onClick={getToken}>Get Token</button>

      {myToken && <h2>Your Token: {myToken}</h2>}
      <h3>Now Serving: {serving}</h3>
      <h3>Total Tokens: {current}</h3>
    </div>
  );
}