export function Eyebrow({
  children,
  light = false,
  className = "",
}: {
  children: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`eyebrow ${light ? "!text-vls-gold" : ""} ${className}`}
    >
      {children}
    </p>
  );
}
