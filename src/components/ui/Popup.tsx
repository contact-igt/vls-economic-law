"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * Minimal modal built on the native <dialog> element — no dependency, keyboard
 * accessible (Esc to close, focus trap handled by the browser). Sharp corners,
 * VLS tokens.
 */
export function Popup({
  open,
  onClose,
  children,
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissable?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissable) onClose();
      }}
      onClick={(e) => {
        if (dismissable && e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(460px,calc(100vw-2rem))] border border-vls-border bg-vls-white p-0 text-vls-black backdrop:bg-black/50"
    >
      <div className="p-6 sm:p-7">{children}</div>
    </dialog>
  );
}
