import { useEffect, useEffectEvent } from "react";
import socket from "../services/socket";

export function useQueueSocket({
  onConnectionChange,
  onQueueUpdated,
  onTokenBooked,
  onTokenCalled,
}) {
  const handleConnectionChange = useEffectEvent(onConnectionChange || (() => {}));
  const handleQueueUpdated = useEffectEvent(onQueueUpdated || (() => {}));
  const handleTokenBooked = useEffectEvent(onTokenBooked || (() => {}));
  const handleTokenCalled = useEffectEvent(onTokenCalled || (() => {}));

  useEffect(() => {
    function onConnect() {
      handleConnectionChange(true);
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

    socket.connect();
    handleConnectionChange(socket.connected);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("queueUpdated", onQueueUpdate);
    socket.on("tokenBooked", onBooked);
    socket.on("tokenCalled", onCalled);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("queueUpdated", onQueueUpdate);
      socket.off("tokenBooked", onBooked);
      socket.off("tokenCalled", onCalled);
    };
  }, [handleConnectionChange, handleQueueUpdated, handleTokenBooked, handleTokenCalled]);
}
