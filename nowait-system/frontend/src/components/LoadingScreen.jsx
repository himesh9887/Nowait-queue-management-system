export default function LoadingScreen({ label = "Loading NoWait..." }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="glass-card flex flex-col items-center gap-4 px-8 py-10">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300/90" />
        <div className="text-sm tracking-[0.24em] uppercase text-slate-300">
          {label}
        </div>
      </div>
    </div>
  );
}
