import AuthTabs from "./AuthTabs";
import {
  BrandMark,
  ClockIcon,
  QueueIcon,
  ShieldIcon,
  SparkIcon,
} from "./AuthIcons";

const previewRows = [
  { token: "A-108", label: "Now serving", tone: "auth-preview-chip-live" },
  { token: "A-109", label: "Up next", tone: "auth-preview-chip-next" },
  { token: "A-110", label: "Estimated 6 min", tone: "auth-preview-chip-eta" },
];

export default function AuthLayout({
  activeTab,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb-cyan" />
      <div className="auth-orb auth-orb-violet" />
      <div className="auth-orb auth-orb-indigo" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-7xl items-start py-1 sm:min-h-[calc(100dvh-2rem)] sm:items-center sm:py-0">
        <div className="grid w-full gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <section className="order-2 hidden lg:flex auth-desktop-brand auth-brand-enter">
            <div className="auth-desktop-brand-glow" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between gap-4">
                <div className="auth-logo-chip">
                  <BrandMark className="h-11 w-11" />
                  <div>
                    <div className="text-base font-semibold tracking-[0.22em] text-white">
                      NOWAIT
                    </div>
                    <div className="text-xs text-slate-400">
                      Smart Queue System
                    </div>
                  </div>
                </div>

                <div className="auth-kicker">
                  <SparkIcon className="h-4 w-4" />
                  <span>Premium Access</span>
                </div>
              </div>

              <div className="mt-14 max-w-2xl">
                <div className="section-label">Queue Experience</div>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white xl:text-6xl">
                  Skip the Line. Save Your Time.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  Smart queue &amp; booking system for modern services
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="auth-stat-chip">
                  <ClockIcon className="h-4 w-4" />
                  <span>Fast booking</span>
                </div>
                <div className="auth-stat-chip">
                  <QueueIcon className="h-4 w-4" />
                  <span>Live queue sync</span>
                </div>
                <div className="auth-stat-chip">
                  <ShieldIcon className="h-4 w-4" />
                  <span>Role-based access</span>
                </div>
              </div>

              <div className="mt-10 auth-preview-panel">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                      Live queue preview
                    </div>
                    <div className="mt-3 text-5xl font-semibold tracking-tight text-white">
                      A-108
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-300">
                      Queue movement and waiting time stay in sync across all screens.
                    </div>
                  </div>

                  <div className="auth-signal-pill">
                    <span className="auth-signal-dot" />
                    <span>Live</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {previewRows.map((row) => (
                    <div key={row.token} className="auth-queue-row">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          Token
                        </div>
                        <div className="mt-1 text-xl font-semibold text-white">
                          {row.token}
                        </div>
                      </div>

                      <div className={`auth-preview-chip ${row.tone}`}>{row.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="order-1 flex items-center lg:order-2">
            <div className="w-full auth-card-enter">
              <div className="lg:hidden auth-mobile-brand">
                <div className="auth-logo-chip auth-logo-chip-mobile">
                  <BrandMark className="h-10 w-10" />
                  <div>
                    <div className="text-sm font-semibold tracking-[0.22em] text-white">
                      NOWAIT
                    </div>
                    <div className="text-xs text-slate-400">
                      Smart Queue System
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="section-label">Queue Experience</div>
                  <h1 className="mt-3 text-[1.9rem] font-semibold tracking-tight text-white sm:text-3xl">
                    Skip the Line. Save Your Time.
                  </h1>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
                    Mobile-first access to smart booking, live queue updates, and faster service flow.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <div className="auth-mobile-pill">
                    <ClockIcon className="h-4 w-4" />
                    <span>Book fast</span>
                  </div>
                  <div className="auth-mobile-pill">
                    <QueueIcon className="h-4 w-4" />
                    <span>Track live</span>
                  </div>
                </div>
              </div>

              <div className="auth-form-card">
                <div className="auth-form-header">
                  <div className="section-label">{eyebrow}</div>
                  <h2 className="mt-4 text-[1.9rem] font-semibold tracking-tight text-white sm:text-[2.15rem]">
                    {title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    {description}
                  </p>
                </div>

                <div className="auth-form-body">
                  <AuthTabs active={activeTab} />
                  <div className="mt-6">{children}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
