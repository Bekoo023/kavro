export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true" className={`arrow ${className}`}>
      <path d="M0 5 H12 M8 1 L12 5 L8 9" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
