import { useEffect, useEffectEvent } from "react";
import socket from "../services/socket";

export function useQueueSocket({
  onConnectionChange,
  onNotifyNextUser,
  onQueueUpdated,
  onTokenBooked,
  onTokenCalled,
}) {
  const handleConnectionChange = useEffectEvent(onConnectionChange || (() => {}));
  const handleNotifyNextUser = useEffectEvent(onNotifyNextUser || (() => {}));
  const handleQueueUpdated = useEffectEvent(onQueueUpdated || (() => {}));
  const handleTokenBooked = useEffectEvent(onTokenBooked || (() => {}));
  const handleTokenCalled = useEffectEvent(onTokenCalled || (() => {}));

  useEffect(() => {
    function onConnect() {
      handleConnectionChange(true);
      socket.emit("getToken");
    }

    function onDisconnect() {
      handleConnectionChange(false);
    }

    function onQueueUpdate(snapshot) {
      handleQueueUpdated(snapshot);
    }

    function onBooked(token) {
      handleTokenBooked(token);
    }

    function onCalled(token) {
      handleTokenCalled(token);
    }

    function onNotify(signal) {
      handleNotifyNextUser(signal);
    }

    socket.connect();
    handleConnectionChange(socket.connected);
    if (socket.connected) {
      socket.emit("getToken");
    }
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("queueUpdated", onQueueUpdate);
    socket.on("queueUpdate", onQueueUpdate);
    socket.on("tokenBooked", onBooked);
    socket.on("tokenGenerated", onBooked);
    socket.on("tokenCalled", onCalled);
    socket.on("notifyNextUser", onNotify);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("queueUpdated", onQueueUpdate);
      socket.off("queueUpdate", onQueueUpdate);
      socket.off("tokenBooked", onBooked);
      socket.off("tokenGenerated", onBooked);
      socket.off("tokenCalled", onCalled);
      socket.off("notifyNextUser", onNotify);
    };
  }, []);
}
