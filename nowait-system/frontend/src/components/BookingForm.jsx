import { useState } from "react";
import GlassPanel from "./GlassPanel";

export default function BookingForm({
  services,
  onBookToken,
  booking,
  socketConnected,
  hasActiveToken = false,
}) {
  const [serviceType, setServiceType] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const activeServiceType = serviceType || services[0]?.id || "";

  async function handleSubmit(event) {
    event.preventDefault();

    const bookedToken = await onBookToken({
      serviceType: activeServiceType,
      timeSlot,
    });

    if (bookedToken) {
      setTimeSlot("");
    }
  }

  return (
    <GlassPanel
      className="animated-border p-6 sm:p-8"
      eyebrow="Book Instantly"
      title="Reserve your token"
      description="Choose a service, optionally add a preferred time, and we will keep your live position updated automatically."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <label className="text-sm font-semibold text-slate-200">
            Choose a service <span className="text-rose-400">*</span>
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            {services.map((service) => {
              const active = activeServiceType === service.id;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setServiceType(service.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-cyan-400/50 bg-cyan-400/10 shadow-lg shadow-cyan-400/10"
                      : "border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-slate-950/50"
                  }`}
                >
                  <div className="font-semibold text-white">
                    {service.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {service.description}
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    ~{service.duration} min
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-200">
              Preferred time slot <span className="text-slate-500">(optional)</span>
            </span>
            <input
              className="input-field text-sm"
              type="time"
              value={timeSlot}
              onChange={(event) => setTimeSlot(event.target.value)}
            />
          </label>

          <div className="flex items-center justify-center gap-2 rounded-lg border border-white/8 bg-slate-950/40 px-4 py-3">
            <span
              className={`h-2 w-2 rounded-full ${
                socketConnected
                  ? "bg-emerald-400"
                  : "bg-slate-600"
              }`}
            />
            <span className="text-xs font-medium text-slate-300">
              {socketConnected ? "Live queue sync" : "Reconnecting"}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary btn-block h-11 text-sm"
          disabled={booking || !activeServiceType || hasActiveToken}
        >
          {booking
            ? "Booking..."
            : hasActiveToken
              ? "You already have an active token"
              : "Book token"}
        </button>
      </form>
    </GlassPanel>
  );
}
