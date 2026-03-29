import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useQueueSocket } from "../hooks/useQueueSocket";
import {
  bookToken as bookTokenRequest,
  getQueueStatus,
  nextToken as nextTokenRequest,
  resetQueue as resetQueueRequest,
  skipToken as skipTokenRequest,
} from "../services/queueService";

const TOKEN_STORAGE_KEY = "nowait-tracked-token";
const QueueContext = createContext(null);

function readTrackedTokenId() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
}

function persistTrackedTokenId(tokenId) {
  if (!tokenId) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, tokenId);
}

function buildCompletedState(token) {
  return {
    ...token,
    status: "completed",
    estimatedTime: 0,
    estimatedWaitingTime: 0,
    tokensAhead: 0,
    isCurrent: false,
  };
}

function findTrackedToken(snapshot, tokenId, previousToken) {
  if (!tokenId) {
    return null;
  }

  const directMatch =
    snapshot.myToken?.id === tokenId
      ? snapshot.myToken
      : [...snapshot.queue, ...snapshot.completedQueue].find(
          (token) => token.id === tokenId,
        );

  if (directMatch) {
    return directMatch;
  }

  if (!previousToken) {
    return null;
  }

  if (!snapshot.stats.totalTokens) {
    return null;
  }

  if (
    snapshot.currentServing &&
    previousToken.tokenNumber < snapshot.currentServing.tokenNumber
  ) {
    return buildCompletedState(previousToken);
  }

  return previousToken;
}

export function QueueProvider({ children }) {
  const { token: adminToken } = useAuth();
  const trackedTokenRef = useRef(
    typeof window !== "undefined" ? readTrackedTokenId() : null,
  );
  const [state, setState] = useState({
    snapshot: null,
    myToken: null,
    tokenId: trackedTokenRef.current,
    booking: false,
    busyAction: null,
    loading: true,
    refreshing: false,
    services: [],
    socketConnected: false,
  });

  const applySnapshot = useEffectEvent((snapshot, forcedTokenId) => {
    const activeTokenId = forcedTokenId ?? trackedTokenRef.current;

    startTransition(() => {
      setState((previous) => {
        const nextTrackedToken = findTrackedToken(
          snapshot,
          activeTokenId,
          previous.myToken,
        );

        if (
          nextTrackedToken?.status === "serving" &&
          previous.myToken?.status !== "serving"
        ) {
          toast.success(`Token ${nextTrackedToken.tokenNumber} is now being served.`);
        }

        return {
          ...previous,
          snapshot,
          myToken: nextTrackedToken,
          tokenId: activeTokenId,
          services: snapshot.services ?? previous.services,
          loading: false,
          refreshing: false,
        };
      });
    });
  });

  useQueueSocket({
    onConnectionChange: (connected) => {
      setState((previous) => ({
        ...previous,
        socketConnected: connected,
      }));
    },
    onQueueUpdated: (snapshot) => {
      applySnapshot(snapshot);
    },
  });

  async function refreshQueue({ silent = true, tokenId } = {}) {
    if (!silent) {
      setState((previous) => ({
        ...previous,
        loading: !previous.snapshot,
        refreshing: Boolean(previous.snapshot),
      }));
    }

    try {
      const snapshot = await getQueueStatus(tokenId ?? trackedTokenRef.current);
      applySnapshot(snapshot, tokenId ?? trackedTokenRef.current);
      return snapshot;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        loading: false,
        refreshing: false,
      }));
      toast.error(error.message);
      return null;
    }
  }

  useEffect(() => {
    refreshQueue({ silent: false }).catch(() => null);
  }, []);

  async function bookToken(payload) {
    setState((previous) => ({
      ...previous,
      booking: true,
    }));

    try {
      const response = await bookTokenRequest(payload);
      trackedTokenRef.current = response.token.id;
      persistTrackedTokenId(response.token.id);
      applySnapshot(response.snapshot, response.token.id);
      toast.success(`Token ${response.token.tokenNumber} booked successfully.`);
      return response.token;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setState((previous) => ({
        ...previous,
        booking: false,
      }));
    }
  }

  async function runAdminAction(actionName, request) {
    if (!adminToken) {
      toast.error("Please sign in as admin to manage the queue.");
      return null;
    }

    setState((previous) => ({
      ...previous,
      busyAction: actionName,
    }));

    try {
      const response = await request(adminToken);

      if (response.snapshot) {
        applySnapshot(response.snapshot);
      }

      toast.success(response.message);
      return response;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setState((previous) => ({
        ...previous,
        busyAction: null,
      }));
    }
  }

  function clearTrackedToken() {
    trackedTokenRef.current = null;
    persistTrackedTokenId(null);
    setState((previous) => ({
      ...previous,
      myToken: null,
      tokenId: null,
    }));
  }

  const snapshot = state.snapshot || {
    stats: {
      totalTokens: 0,
      activeQueue: 0,
      completedTokens: 0,
      waitingTokens: 0,
      avgServiceTime: 0,
    },
    currentServing: null,
    nextUp: null,
    queue: [],
    completedQueue: [],
    services: [],
  };

  return (
    <QueueContext.Provider
      value={{
        booking: state.booking,
        busyAction: state.busyAction,
        bookToken,
        clearTrackedToken,
        completedQueue: snapshot.completedQueue,
        currentServing: snapshot.currentServing,
        loading: state.loading,
        myToken: state.myToken,
        nextToken: () => runAdminAction("next", nextTokenRequest),
        nextUp: snapshot.nextUp,
        queue: snapshot.queue,
        refreshQueue,
        refreshing: state.refreshing,
        resetQueue: () => runAdminAction("reset", resetQueueRequest),
        services: state.services,
        skipToken: () => runAdminAction("skip", skipTokenRequest),
        socketConnected: state.socketConnected,
        stats: snapshot.stats,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error("useQueue must be used inside QueueProvider.");
  }

  return context;
}
