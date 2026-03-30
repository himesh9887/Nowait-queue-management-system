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

export function BrandMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="40" height="40" rx="14" fill="url(#brand-fill)" />
      <path
        d="M16 27.5C16 21.7 20.7 17 26.5 17H32V22H26.8C23.6 22 21 24.6 21 27.8V31H16V27.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M32 20.5C32 26.3 27.3 31 21.5 31H16V26H21.2C24.4 26 27 23.4 27 20.2V17H32V20.5Z"
        fill="#C4B5FD"
      />
      <defs>
        <linearGradient id="brand-fill" x1="6" y1="7" x2="42" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.52" stopColor="#818CF8" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function UserIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20.2a7 7 0 0 1 14 0" />
    </IconBase>
  );
}

export function LockIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <rect x="4.75" y="10.25" width="14.5" height="10" rx="2.5" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
      <path d="M12 14.5v2.8" />
    </IconBase>
  );
}

export function ShieldIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M12 3.75 5.75 6.3v5.95c0 4.27 2.65 7.98 6.25 9.5 3.6-1.52 6.25-5.23 6.25-9.5V6.3L12 3.75Z" />
      <path d="m9.5 12.25 1.75 1.75 3.25-3.5" />
    </IconBase>
  );
}

export function QueueIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M7 6.5h10" />
      <path d="M7 12h10" />
      <path d="M7 17.5h6.5" />
      <circle cx="5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="5" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function ClockIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5v4.9l3.1 1.9" />
    </IconBase>
  );
}

export function SparkIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="m12 3.5 1.55 4.03L17.5 9.1l-3.95 1.57L12 14.7l-1.55-4.03L6.5 9.1l3.95-1.57L12 3.5Z" />
      <path d="m18.5 14.5.8 2.1 2.2.88-2.2.87-.8 2.15-.8-2.15-2.2-.87 2.2-.88.8-2.1Z" />
    </IconBase>
  );
}

export function EyeIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="M2.75 12s3.2-5.5 9.25-5.5S21.25 12 21.25 12s-3.2 5.5-9.25 5.5S2.75 12 2.75 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </IconBase>
  );
}

export function EyeOffIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="m3.5 4 17 16" />
      <path d="M10.63 6.67A10.95 10.95 0 0 1 12 6.5c6.05 0 9.25 5.5 9.25 5.5a17.9 17.9 0 0 1-3.2 3.92" />
      <path d="M14.95 14.96A3.99 3.99 0 0 1 8.99 9" />
      <path d="M6.53 7.49A17.8 17.8 0 0 0 2.75 12s3.2 5.5 9.25 5.5c1.95 0 3.62-.57 5.03-1.38" />
    </IconBase>
  );
}

export function ChevronDownIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <path d="m7 10 5 5 5-5" />
    </IconBase>
  );
}

export function CheckCircleIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m8.75 12.1 2.05 2.05 4.45-4.6" />
    </IconBase>
  );
}

export function AlertCircleIcon({ className = "" }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8.5v4.3" />
      <circle cx="12" cy="16.2" r="0.7" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
