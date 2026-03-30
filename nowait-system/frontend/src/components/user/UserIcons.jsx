function IconBase({ children, className = "", ...props }) {
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
      {...props}
    >
      {children}
    </svg>
  );
}

export function TicketIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M4.5 8.25a2 2 0 0 0 0 4v3.25a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3.25a2 2 0 0 0 0-4V5a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 5v3.25Z" />
      <path d="M9 7.25v9.5" />
      <path d="M13.5 8.25h2.5" />
      <path d="M13.5 11.75h2.5" />
    </IconBase>
  );
}

export function TimerIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 13V9.5" />
      <path d="M12 13l2.7 1.7" />
      <path d="M9 2.75h6" />
    </IconBase>
  );
}

export function QueuePulseIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M4.5 16.5h3l1.8-4.2 3.2 7.2 2.1-4.2h4.9" />
      <path d="M4.5 7.5h15" />
    </IconBase>
  );
}

export function CalendarClockIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <rect x="4.25" y="5.25" width="15.5" height="14.5" rx="2.5" />
      <path d="M8 3.75v3" />
      <path d="M16 3.75v3" />
      <path d="M4.25 9.25h15.5" />
      <path d="M12.25 12.25v2.3l1.8 1" />
    </IconBase>
  );
}

export function HistoryIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 6.75v4h4" />
      <path d="M12 8.75v3.5l2.35 1.4" />
    </IconBase>
  );
}

export function BellIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M8.25 17.25h7.5" />
      <path d="M9 17.25v.35a3 3 0 0 0 6 0v-.35" />
      <path d="M6.75 14.75c.95-1.2 1.5-2.75 1.5-4.35V9.6a3.75 3.75 0 0 1 7.5 0v.8c0 1.6.55 3.15 1.5 4.35" />
    </IconBase>
  );
}

export function SpeakerWaveIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M11 6.5 7.75 9H5.5v6h2.25L11 17.5v-11Z" />
      <path d="M14.5 10.25a2.75 2.75 0 0 1 0 3.5" />
      <path d="M17 8.25a5.75 5.75 0 0 1 0 7.5" />
    </IconBase>
  );
}

export function SpeakerOffIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M11 6.5 7.75 9H5.5v6h2.25L11 17.5v-11Z" />
      <path d="m15.5 9.5 4 4" />
      <path d="m19.5 9.5-4 4" />
    </IconBase>
  );
}

export function ChartIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M5 18.5h14" />
      <path d="M7.5 15.5V11" />
      <path d="M12 15.5V7.5" />
      <path d="M16.5 15.5v-5" />
    </IconBase>
  );
}

export function SparkWaveIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="m12 3.75 1.45 3.7 3.8 1.55-3.8 1.5L12 14.25l-1.45-3.75-3.8-1.5 3.8-1.55L12 3.75Z" />
      <path d="M4.5 18.5c2-.95 4.2-1.45 6.6-1.45 3.05 0 5.9.8 8.4 2.2" />
    </IconBase>
  );
}

export function DownloadIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 4.5v9" />
      <path d="m8.75 10.75 3.25 3.25 3.25-3.25" />
      <path d="M5 18.5h14" />
    </IconBase>
  );
}
