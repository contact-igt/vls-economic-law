export function NumberedRow({
  number,
  title,
  children,
  dark = false,
}: {
  number: string;
  title: string;
  children?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex gap-5 border-t py-6 first:border-t-0 md:first:border-t ${
        dark ? "border-white/10" : "border-vls-border"
      }`}
    >
      <span
        className={`font-serif text-[20px] font-medium ${
          dark ? "text-vls-gold" : "text-vls-red"
        }`}
      >
        {number}
      </span>
      <div>
        <p
          className={`text-[16px] font-semibold ${
            dark ? "text-white" : "text-vls-black"
          }`}
        >
          {title}
        </p>
        {children && (
          <p
            className={`mt-1 text-[15px] leading-relaxed ${
              dark ? "text-[#c8c8c4]" : "text-vls-muted"
            }`}
          >
            {children}
          </p>
        )}
      </div>
    </div>
  );
}
