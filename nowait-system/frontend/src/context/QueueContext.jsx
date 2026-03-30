import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useQueueSocket } from "../hooks/useQueueSocket";
import {
  bookToken as bookTokenRequest,
  getQueueStatus,
  getBookings,
  nextToken as nextTokenRequest,
  resetQueue as resetQueueRequest,
  startServing as startServingRequest,
  skipToken as skipTokenRequest,
} from "../services/queueService";

const QueueContext = createContext(null);

function buildEmptyDay(relativeLabel) {
  return {
    key: relativeLabel,
    relativeLabel,
    label: relativeLabel === "today" ? "Today" : "Tomorrow",
    displayDate: "--",
    fullDate: "--",
    isToday: relativeLabel === "today",
    canServe: relativeLabel === "today",
    totalTokens: 0,
    activeQueue: 0,
    completedTokens: 0,
    waitingTokens: 0,
    avgServiceTime: 0,
    queueForecast: 0,
    currentServingToken: null,
    nextUpToken: null,
  };
}

function getEmptySnapshot(selectedDay = "today") {
  return {
    stats: {
      totalTokens: 0,
      dayTokens: 0,
      todayTokens: 0,
      tomorrowTokens: 0,
      totalTrackedTokens: 0,
      activeQueue: 0,
      completedTokens: 0,
      waitingTokens: 0,
      avgServiceTime: 0,
      queueForecast: 0,
    },
    selectedDay: buildEmptyDay(selectedDay),
    days: [buildEmptyDay("today"), buildEmptyDay("tomorrow")],
    currentServing: null,
    nextUp: null,
    queue: [],
    completedQueue: [],
    userHistory: [],
    services: [],
    myToken: null,
    generatedAt: null,
  };
}

function getNotificationEta(token, snapshot) {
  const avgServiceTime = snapshot?.stats?.avgServiceTime || 0;

  if (typeof token?.estimatedWaitingTime === "number") {
    return Math.max(token.estimatedWaitingTime, 0);
  }

  if (typeof token?.tokensAhead === "number") {
    return Math.max(token.tokensAhead * avgServiceTime, 0);
  }

  return 0;
}

function buildSoonNotification(token, snapshot, currentServingToken) {
  const eta = getNotificationEta(token, snapshot);

  return {
    id: `soon-${token.id}-${Date.now()}`,
    key: `soon:${token.id}:serving:${currentServingToken || "none"}`,
    type: "soon",
    title: "You are coming soon.",
    message: "Please stay ready for your turn.",
    detail: `Approx ${eta} minute${eta === 1 ? "" : "s"} remaining`,
  };
}

function buildNextNotification(token, snapshot, currentServingToken) {
  const eta = getNotificationEta(token, snapshot);

  return {
    id: `next-${token.id}-${Date.now()}`,
    key: `next:${token.id}:serving:${currentServingToken || "none"}`,
    type: "next",
    title: "Your turn is next. Please get ready.",
    message: `Token ${token.tokenNumber} will be called after the current service finishes.`,
    detail: `Approx ${eta} minute${eta === 1 ? "" : "s"} remaining`,
  };
}

function buildArrivedNotification(token, currentServingToken = token?.tokenNumber) {
  return {
    id: `arrived-${token.id}-${Date.now()}`,
    key: `arrived:${token.id}:serving:${currentServingToken || "none"}`,
    type: "arrived",
    title: "It's your turn now!",
    message: `Token ${token.tokenNumber} is now being served.`,
    detail: "Please head to the service desk.",
  };
}

function resolveQueueNotification(previousMyToken, nextMyToken, snapshot) {
  if (!nextMyToken) {
    return null;
  }

  const currentServingToken = snapshot?.currentServing?.tokenNumber || null;

  if (
    nextMyToken.status === "serving" &&
    previousMyToken?.status !== "serving" &&
    currentServingToken === nextMyToken.tokenNumber
  ) {
    return buildArrivedNotification(nextMyToken, currentServingToken);
  }

  if (nextMyToken.status !== "waiting" || !currentServingToken) {
    return null;
  }

  if (nextMyToken.tokensAhead === 1) {
    return buildNextNotification(nextMyToken, snapshot, currentServingToken);
  }

  if (nextMyToken.tokensAhead === 2) {
    return buildSoonNotification(nextMyToken, snapshot, currentServingToken);
  }

  return null;
}

function resolveSocketNotification(signal, userTokens) {
  if (!signal || !Array.isArray(userTokens) || !userTokens.length) {
    return null;
  }

  const activeToken = userTokens.find(
    (token) =>
      token.bookingDayKey === signal.dayKey &&
      [ "waiting", "serving" ].includes(token.status),
  );

  if (!activeToken) {
    return null;
  }

  if (
    activeToken.status === "serving" &&
    signal.currentServingToken &&
    activeToken.tokenNumber === signal.currentServingToken
  ) {
    return buildArrivedNotification(activeToken, signal.currentServingToken);
  }

  if (activeToken.status !== "waiting") {
    return null;
  }

  if (
    signal.nextTokenNumber &&
    activeToken.tokenNumber === signal.nextTokenNumber
  ) {
    return buildNextNotification(
      activeToken,
      { stats: { avgServiceTime: signal.avgServiceTime } },
      signal.currentServingToken,
    );
  }

  if (
    signal.soonTokenNumber &&
    activeToken.tokenNumber === signal.soonTokenNumber
  ) {
    return buildSoonNotification(
      activeToken,
      { stats: { avgServiceTime: signal.avgServiceTime } },
      signal.currentServingToken,
    );
  }

  return null;
}

export function QueueProvider({ children }) {
  const { token, user } = useAuth();
  const lastUserTokenRef = useRef(null);
  const latestUserTokensRef = useRef([]);
  const notificationTimeoutsRef = useRef(new Map());
  const seenNotificationKeysRef = useRef(new Set());
  const [selectedDay, setSelectedDay] = useState("today");
  const [state, setState] = useState({
    snapshot: null,
    bookings: [],
    booking: false,
    busyAction: null,
    loading: true,
    bookingsLoading: false,
    refreshing: false,
    socketConnected: false,
    notifications: [],
  });

  const dismissNotification = useCallback((notificationId) => {
    const timeoutId = notificationTimeoutsRef.current.get(notificationId);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      notificationTimeoutsRef.current.delete(notificationId);
    }

    setState((previous) => ({
      ...previous,
      notifications: previous.notifications.filter(
        (notification) => notification.id !== notificationId,
      ),
    }));
  }, []);

  const enqueueNotification = useCallback((notification) => {
    if (!notification?.key || seenNotificationKeysRef.current.has(notification.key)) {
      return;
    }

    seenNotificationKeysRef.current.add(notification.key);
    setState((previous) => {
      if (
        previous.notifications.some(
          (item) => item.key === notification.key || item.id === notification.id,
        )
      ) {
        return previous;
      }

      return {
        ...previous,
        notifications: [notification, ...previous.notifications].slice(0, 3),
      };
    });

    const timeoutId = window.setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);

    notificationTimeoutsRef.current.set(notification.id, timeoutId);
  }, [dismissNotification]);

  useEffect(() => {
    const notificationTimeouts = notificationTimeoutsRef.current;

    return () => {
      notificationTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      notificationTimeouts.clear();
    };
  }, []);

  useEffect(() => {
    lastUserTokenRef.current = null;
    latestUserTokensRef.current = [];
    seenNotificationKeysRef.current.clear();
    notificationTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    notificationTimeoutsRef.current.clear();
    setState((previous) => ({
      ...previous,
      notifications: [],
    }));
  }, [user?.id, user?.role]);

  const applySnapshot = useCallback((snapshot) => {
    const nextMyToken = user?.role === "user" ? snapshot.myToken || null : null;
    const previousMyToken = user?.role === "user" ? lastUserTokenRef.current : null;
    const nextUserTokens = user?.role === "user" ? snapshot.userHistory || [] : [];
    const queueNotification =
      user?.role === "user"
        ? resolveQueueNotification(previousMyToken, nextMyToken, snapshot)
        : null;

    lastUserTokenRef.current = nextMyToken;
    latestUserTokensRef.current = nextUserTokens;

    startTransition(() => {
      setState((previous) => {
        return {
          ...previous,
          snapshot: {
            ...snapshot,
            myToken: nextMyToken,
            userHistory:
              user?.role === "user" ? snapshot.userHistory || [] : snapshot.userHistory,
          },
          loading: false,
          refreshing: false,
        };
      });
    });

    if (queueNotification) {
      enqueueNotification(queueNotification);
    }
  }, [enqueueNotification, user?.role]);

  const refreshQueue = useCallback(async ({ silent = true, day = selectedDay } = {}) => {
    if (!silent) {
      setState((previous) => ({
        ...previous,
        loading: !previous.snapshot,
        refreshing: Boolean(previous.snapshot),
      }));
    }

    try {
      const snapshot = await getQueueStatus(token, day);
      applySnapshot(snapshot);
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
  }, [applySnapshot, selectedDay, token]);

  const refreshBookings = useCallback(async (day = selectedDay) => {
    if (user?.role !== "admin" || !token) {
      setState((previous) => ({
        ...previous,
        bookings: [],
        bookingsLoading: false,
      }));
      return [];
    }

    setState((previous) => ({
      ...previous,
      bookingsLoading: true,
    }));

    try {
      const response = await getBookings(token, day);
      setState((previous) => ({
        ...previous,
        bookings: response.bookings,
        bookingsLoading: false,
      }));
      return response.bookings;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        bookingsLoading: false,
      }));
      toast.error(error.message);
      return [];
    }
  }, [selectedDay, token, user?.role]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setState((previous) => ({
        ...previous,
        loading: true,
        refreshing: Boolean(previous.snapshot),
      }));

      const snapshot = await getQueueStatus(token, selectedDay).catch((error) => {
        if (!cancelled) {
          toast.error(error.message);
        }
        return null;
      });

      if (!cancelled) {
        applySnapshot(snapshot || getEmptySnapshot(selectedDay));
      }

      if (!cancelled && user?.role === "admin") {
        await refreshBookings(selectedDay);
      } else if (!cancelled) {
        setState((previous) => ({
          ...previous,
          bookings: [],
          bookingsLoading: false,
        }));
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [applySnapshot, refreshBookings, selectedDay, token, user?.id, user?.role]);

  useQueueSocket({
    onConnectionChange: (connected) => {
      setState((previous) => ({
        ...previous,
        socketConnected: connected,
      }));
    },
    onNotifyNextUser: (signal) => {
      if (user?.role !== "user") {
        return;
      }

      const notification = resolveSocketNotification(
        signal,
        latestUserTokensRef.current,
      );

      if (notification) {
        enqueueNotification(notification);
      }
    },
    onQueueUpdated: () => {
      void refreshQueue();

      if (user?.role === "admin" && token) {
        void refreshBookings();
      }
    },
  });

  async function bookToken(payload) {
    if (user?.role !== "user" || !token) {
      toast.error("Please sign in as a user to book a token.");
      return null;
    }

    const bookingDay = payload?.bookingDay || selectedDay;

    setState((previous) => ({
      ...previous,
      booking: true,
    }));

    try {
      const response = await bookTokenRequest(
        {
          bookingDay,
        },
        token,
      );

      if (response.snapshot?.selectedDay?.relativeLabel) {
        setSelectedDay(response.snapshot.selectedDay.relativeLabel);
      }

      applySnapshot(response.snapshot);
      toast.success(response.message);
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
    if (user?.role !== "admin" || !token) {
      toast.error("Please sign in as an admin to manage the queue.");
      return null;
    }

    setState((previous) => ({
      ...previous,
      busyAction: actionName,
    }));

    try {
      const response = await request(token, selectedDay);

      if (response.snapshot) {
        applySnapshot(response.snapshot);
      }

      await refreshBookings(selectedDay);
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

  const snapshot = state.snapshot || getEmptySnapshot(selectedDay);

  return (
    <QueueContext.Provider
      value={{
        booking: state.booking,
        bookings: state.bookings,
        bookingsLoading: state.bookingsLoading,
        bookToken,
        busyAction: state.busyAction,
        completedQueue: snapshot.completedQueue,
        currentServing: snapshot.currentServing,
        daySummaries: snapshot.days || [],
        dismissNotification,
        generatedAt: snapshot.generatedAt,
        loading: state.loading,
        myToken: snapshot.myToken,
        nextToken: () => runAdminAction("next", nextTokenRequest),
        nextUp: snapshot.nextUp,
        notifications: state.notifications,
        queue: snapshot.queue,
        refreshBookings: (day) => refreshBookings(day || selectedDay),
        refreshQueue,
        refreshing: state.refreshing,
        resetQueue: () => runAdminAction("reset", resetQueueRequest),
        selectedDay,
        selectedDayInfo: snapshot.selectedDay,
        setSelectedDay,
        services: snapshot.services,
        skipToken: () => runAdminAction("skip", skipTokenRequest),
        socketConnected: state.socketConnected,
        startServing: () => runAdminAction("start", startServingRequest),
        stats: snapshot.stats,
        userHistory: snapshot.userHistory || [],
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
