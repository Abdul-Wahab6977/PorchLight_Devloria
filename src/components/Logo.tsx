export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
        <path
          d="M3 12.5L13 4l10 8.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 11v9.5a1 1 0 0 0 1 1H19.5a1 1 0 0 0 1-1V11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="16.5" r="1.6" fill="#E8A33D" />
      </svg>
      <span className="font-display text-lg tracking-tight text-ink-800">
        Porch<span className="italic text-amber-500">light</span>
      </span>
    </span>
  );
}
