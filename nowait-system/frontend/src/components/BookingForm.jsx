import { useEffect, useState } from "react";
import GlassPanel from "./GlassPanel";

export default function BookingForm({
  services,
  onBookToken,
  booking,
  socketConnected,
}) {
  const [serviceType, setServiceType] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    if (!serviceType && services.length) {
      setServiceType(services[0].id);
    }
  }, [serviceType, services]);

  async function handleSubmit(event) {
    event.preventDefault();

    const bookedToken = await onBookToken({
      serviceType,
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
      title="Reserve your token before you reach the desk"
      description="Choose the service you need, optionally add a preferred slot, and we will keep your live position updated automatically."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <span className="text-sm font-medium text-slate-200">Choose a service</span>
          <div className="grid gap-3 md:grid-cols-3">
            {services.map((service) => {
              const active = serviceType === service.id;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setServiceType(service.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    active
                      ? "border-cyan-400/50 bg-cyan-400/[0.12] shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-slate-950/[0.55] hover:border-white/20 hover:bg-white/[0.08]"
                  }`}
                >
                  <div className="text-base font-semibold text-white">
                    {service.name}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {service.description}
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-[0.24em] text-cyan-200/[0.85]">
                    Avg {service.duration} min
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Optional time slot
            <input
              className="soft-input"
              type="time"
              value={timeSlot}
              onChange={(event) => setTimeSlot(event.target.value)}
            />
          </label>

          <div className="surface-muted flex items-center justify-center px-5 py-4 text-center text-sm text-slate-300">
            {socketConnected ? "Live queue sync is active" : "Reconnecting to live queue"}
          </div>
        </div>

        <button
          type="submit"
          className="primary-button h-12 w-full"
          disabled={booking || !serviceType}
        >
          {booking ? "Booking token..." : "Generate my token"}
        </button>
      </form>
    </GlassPanel>
  );
}
