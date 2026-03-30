function Svg({ children, className = "h-5 w-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 13.2c0-2.3 0-3.45.52-4.4s1.47-1.55 3.37-2.75l1.2-.76c1.92-1.2 2.88-1.8 3.91-1.8s1.99.6 3.91 1.8l1.2.76c1.9 1.2 2.85 1.8 3.37 2.75s.52 2.1.52 4.4V15c0 2.83 0 4.24-.88 5.12S18.83 21 16 21H8c-2.83 0-4.24 0-5.12-.88S2 17.83 2 15v-1.8Z" />
      <path d="M9 21v-6h6v6" />
    </Svg>
  );
}

export function QueueIcon(props) {
  return (
    <Svg {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </Svg>
  );
}

export function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
    </Svg>
  );
}

export function ChartIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20v-4" />
    </Svg>
  );
}

export function LogoutIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h3" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  );
}

export function BellIcon(props) {
  return (
    <Svg {...props}>
      <path d="M10.27 21a2 2 0 0 0 3.46 0" />
      <path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.42 13.87 19 11.73 19 9a7 7 0 1 0-14 0c0 2.73-.42 4.87-1.74 6.33Z" />
    </Svg>
  );
}

export function MenuIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <Svg {...props}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

export function TicketIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v2a2 2 0 0 0 0 4v2a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-2a2 2 0 0 0 0-4v-2Z" />
      <path d="M9 6v13" />
    </Svg>
  );
}

export function ClockIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </Svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function SkipIcon(props) {
  return (
    <Svg {...props}>
      <path d="m5 5 8 7-8 7V5Z" />
      <path d="M18 5v14" />
    </Svg>
  );
}

export function ResetIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.71" />
      <path d="M3 4v5h5" />
    </Svg>
  );
}

export function SparkIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M5.64 5.64 8.46 8.46" />
      <path d="M15.54 15.54 18.36 18.36" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m5.64 18.36 2.82-2.82" />
      <path d="m15.54 8.46 2.82-2.82" />
    </Svg>
  );
}

export function PulseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 12h4l2.5-5 5 10 2.5-5H21" />
    </Svg>
  );
}
