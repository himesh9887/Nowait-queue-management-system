import toast from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Button from "../components/common/Button";
import {
  SpeakerOffIcon,
  SpeakerWaveIcon,
} from "../components/user/UserIcons";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
import { primeNotificationAudio } from "../utils/notificationAudio";

export default function UserLayout() {
  const { logout, user } = useAuth();
  const {
    notificationSoundEnabled,
    setNotificationSoundEnabled,
    socketConnected,
  } = useQueue();

  async function handleToggleNotificationSound() {
    const nextValue = !notificationSoundEnabled;

    setNotificationSoundEnabled(nextValue);

    if (nextValue) {
      const enabled = await primeNotificationAudio().catch(() => false);

      toast.success(
        enabled
          ? "Notification sound enabled."
          : "Sound preference saved. Your browser may require another tap before audio can play.",
      );
      return;
    }

    toast.success("Notification sound muted.");
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6">
        <header className="user-dashboard-card user-layout-header mb-5 p-4 sm:mb-6 sm:p-5">
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="section-label">User Queue Portal</div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                  Hello, {user?.displayName || user?.username}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  Track your token, waiting time, and next step from one simple screen.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="user-dashboard-chip">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      socketConnected
                        ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                        : "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.6)]"
                    }`}
                  />
                  <span>{socketConnected ? "Live updates active" : "Reconnecting live data"}</span>
                </div>

                <div className="user-dashboard-chip">
                  {notificationSoundEnabled ? (
                    <SpeakerWaveIcon className="h-4 w-4 text-sky-200" />
                  ) : (
                    <SpeakerOffIcon className="h-4 w-4 text-slate-300" />
                  )}
                  <span>{notificationSoundEnabled ? "Alerts on" : "Alerts muted"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-70 lg:grid-cols-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={handleToggleNotificationSound}
                >
                  {notificationSoundEnabled ? (
                    <SpeakerWaveIcon className="h-4 w-4" />
                  ) : (
                    <SpeakerOffIcon className="h-4 w-4" />
                  )}
                  <span>{notificationSoundEnabled ? "Mute alerts" : "Enable alerts"}</span>
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  className="w-full justify-center"
                  onClick={logout}
                >
                  Logout
                </Button>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
