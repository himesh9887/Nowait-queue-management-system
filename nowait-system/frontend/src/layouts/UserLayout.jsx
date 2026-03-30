import toast from "react-hot-toast";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQueue } from "../context/QueueContext";
import {
  SpeakerOffIcon,
  SpeakerWaveIcon,
  SparkWaveIcon,
} from "../components/user/UserIcons";
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
    <div className="page-shell px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="glass-card user-layout-header mb-5 px-4 py-4 sm:mb-6 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="section-label">NoWait User Dashboard</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome, {user?.displayName || user?.username}
              </div>
              <div className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                Track your queue, booking, invoice, and live desk activity from one
                premium dashboard.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="user-dashboard-chip">
                <SparkWaveIcon className="h-4 w-4 text-violet-200" />
                <span>{socketConnected ? "Live queue online" : "Realtime reconnecting"}</span>
              </div>

              <button
                type="button"
                className="secondary-button inline-flex items-center gap-2"
                onClick={handleToggleNotificationSound}
              >
                {notificationSoundEnabled ? (
                  <SpeakerWaveIcon className="h-4 w-4" />
                ) : (
                  <SpeakerOffIcon className="h-4 w-4" />
                )}
                <span>{notificationSoundEnabled ? "Sound on" : "Sound off"}</span>
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={logout}
              >
                Logout
              </button>
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
