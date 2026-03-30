import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
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

export function QueueProvider({ children }) {
  const { token, user } = useAuth();
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
  });

  const applySnapshot = useCallback((snapshot) => {
    startTransition(() => {
      setState((previous) => {
        const nextMyToken = user?.role === "user" ? snapshot.myToken || null : null;
        const previousMyToken = previous.snapshot?.myToken || null;

        if (
          nextMyToken?.status === "serving" &&
          previousMyToken?.status !== "serving"
        ) {
          toast.success(`Token ${nextMyToken.tokenNumber} is now being served.`);
        }

        if (
          previousMyToken &&
          nextMyToken?.status === "waiting" &&
          previousMyToken.status === "waiting" &&
          previousMyToken.tokensAhead > 2 &&
          nextMyToken.tokensAhead <= 2
        ) {
          toast(
            nextMyToken.tokensAhead === 0
              ? "Your turn is near. Please stay ready."
              : `Your turn is near. ${nextMyToken.tokensAhead} people ahead.`,
          );
        }

        if (
          previousMyToken &&
          nextMyToken?.status === "completed" &&
          previousMyToken.status !== "completed"
        ) {
          toast.success(`Token ${nextMyToken.tokenNumber} has been completed.`);
        }

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
  }, [user?.role]);

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
        generatedAt: snapshot.generatedAt,
        loading: state.loading,
        myToken: snapshot.myToken,
        nextToken: () => runAdminAction("next", nextTokenRequest),
        nextUp: snapshot.nextUp,
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
