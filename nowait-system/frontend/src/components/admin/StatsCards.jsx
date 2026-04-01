export default function StatsCards({ cards }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.label} className="admin-stat-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-300">{card.label}</div>
                <div className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  {card.value}
                </div>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.iconClassName}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-start gap-2 text-xs uppercase tracking-[0.24em] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-slate-500">{card.meta}</span>
              <span className={card.accentClassName}>{card.badge}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
