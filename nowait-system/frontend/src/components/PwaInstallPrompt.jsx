import { useEffect, useState } from "react";
import { DownloadIcon, SparkWaveIcon } from "./user/UserIcons";

const STORAGE_KEY = "nowait-pwa-install-dismissed";

function readDismissedState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

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

function persistDismissedState(value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Ignore storage failures so install prompt can fail silently.
  }
}

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(readDismissedState);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDismissed(true);
      return undefined;
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();

      if (!dismissed) {
        setInstallPrompt(event);
      }
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setDismissed(true);
      persistDismissedState(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [dismissed]);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    setInstalling(true);

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;

      if (result.outcome !== "accepted") {
        setInstallPrompt(null);
      }
    } finally {
      setInstalling(false);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    setInstallPrompt(null);
    persistDismissedState(true);
  }

  if (!installPrompt || dismissed) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[75] flex justify-center sm:bottom-4 sm:inset-x-4 sm:justify-end">
      <section className="pointer-events-auto w-full max-w-xl rounded-[1.9rem] border border-white/10 bg-[linear-gradient(135deg,rgba(6,13,25,0.94),rgba(12,21,43,0.94),rgba(37,18,76,0.82))] p-4 shadow-[0_28px_60px_rgba(7,12,25,0.55)] backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sky-100">
            <SparkWaveIcon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200/85">
                  Install NoWait
                </div>
                <div className="mt-2 text-lg font-semibold text-white">
                  Keep the smart queue on your home screen
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                aria-label="Dismiss install prompt"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              Install the app for faster launch, standalone fullscreen access, and
              a more native queue experience on mobile and desktop.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex items-center gap-2 rounded-full border border-sky-300/24 bg-sky-400/[0.12] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-sky-300/36 hover:bg-sky-400/[0.18]"
              >
                <DownloadIcon className="h-4 w-4" />
                <span>{installing ? "Preparing install..." : "Install app"}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
