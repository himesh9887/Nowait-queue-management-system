import toast from "react-hot-toast";
import { Outlet } from "react-router-dom";
import Button from "../components/common/Button";
import {
  SpeakerOffIcon,
  SpeakerWaveIcon,
  SparkWaveIcon,
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
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-5 lg:px-8 lg:py-6">
        <header className="user-dashboard-card user-layout-header mb-6 p-5 sm:p-6">
          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <div className="section-label">User Queue Portal</div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Hello, {user?.displayName || user?.username}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                    Check your token, live wait time, and next step from one clear
                    mobile-friendly screen.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="user-hero-metric">
                    <div className="user-dashboard-label">Connection</div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          socketConnected
                            ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                            : "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.6)]"
                        }`}
                      />
                      <span>{socketConnected ? "Live updates active" : "Reconnecting live data"}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Queue status refreshes automatically while you keep this page open.
                    </p>
                  </div>

                  <div className="user-hero-metric">
                    <div className="user-dashboard-label">Alerts</div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                      {notificationSoundEnabled ? (
                        <SpeakerWaveIcon className="h-4 w-4 text-sky-200" />
                      ) : (
                        <SpeakerOffIcon className="h-4 w-4 text-slate-300" />
                      )}
                      <span>{notificationSoundEnabled ? "Sound enabled" : "Sound muted"}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Turn sound on if you want an extra alert when your turn gets close.
                    </p>
                  </div>

                  <div className="user-hero-metric sm:col-span-2 xl:col-span-1">
                    <div className="user-dashboard-label">Session</div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                      <SparkWaveIcon className="h-4 w-4 text-violet-200" />
                      <span>Signed in as user</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      One active token at a time keeps the queue fair and easy to manage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-65 xl:grid-cols-1">
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

            <div className="flex flex-wrap gap-2">
              <div className="user-dashboard-chip">
                <SparkWaveIcon className="h-4 w-4 text-sky-200" />
                <span>{socketConnected ? "Live queue connected" : "Queue connection retrying"}</span>
              </div>
              <div className="user-dashboard-chip">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Tip
                </span>
                <span>Keep this page open when your token is close.</span>
              </div>
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
