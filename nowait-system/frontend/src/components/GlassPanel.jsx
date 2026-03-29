export default function GlassPanel({
  eyebrow,
  title,
  description,
  className = "",
  children,
}) {
  return (
    <section className={`glass-card ${className}`}>
      {(eyebrow || title || description) && (
        <div className="px-6 pt-6 sm:px-8 sm:pt-8">
          {eyebrow ? <div className="section-label">{eyebrow}</div> : null}
          {title ? (
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      )}
      <div className={eyebrow || title || description ? "px-6 pb-6 pt-6 sm:px-8 sm:pb-8" : "p-6 sm:p-8"}>
        {children}
      </div>
    </section>
  );
}
