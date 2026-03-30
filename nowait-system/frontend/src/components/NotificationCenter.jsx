import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
import { playNotificationTone } from "../utils/notificationAudio";
import { BellIcon } from "./user/UserIcons";

function CloseIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function getToneClassName(type) {
  if (type === "arrived") {
    return "border-violet-300/22 shadow-[0_22px_54px_rgba(139,92,246,0.28)]";
  }

  if (type === "next") {
    return "border-sky-300/22 shadow-[0_22px_54px_rgba(56,189,248,0.24)]";
  }

  return "border-cyan-300/22 shadow-[0_22px_54px_rgba(34,211,238,0.22)]";
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const lastPlayedNotificationIdRef = useRef(null);
  const {
    dismissNotification,
    notificationSoundEnabled,
    notifications,
  } = useQueue();

  useEffect(() => {
    if (user?.role !== "user" || !notificationSoundEnabled || !notifications.length) {
      return;
    }

    const latestNotification = notifications[0];

    if (!latestNotification || latestNotification.id === lastPlayedNotificationIdRef.current) {
      return;
    }

    lastPlayedNotificationIdRef.current = latestNotification.id;
    void playNotificationTone(latestNotification.type);
  }, [notificationSoundEnabled, notifications, user?.role]);

  if (user?.role !== "user" || !notifications.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col gap-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[min(24rem,calc(100vw-2rem))]">
      {notifications.map((notification) => (
        <section
          key={notification.id}
          aria-live="polite"
          className={`queue-notification-card queue-notification-enter pointer-events-auto ${getToneClassName(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sky-100">
              <BellIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {notification.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-200">
                    {notification.message}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dismissNotification(notification.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              {notification.detail ? (
                <div className="mt-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                  {notification.detail}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
