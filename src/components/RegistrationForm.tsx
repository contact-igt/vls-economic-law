"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Popup } from "./ui/Popup";
import { PaymentTrust } from "./PaymentTrust";
import { useCourse } from "@/components/CourseProvider";
import { UTM_KEYS, getUtm } from "@/lib/getUtm";
import { clearDraft, readDraft, saveDraft, saveProof } from "@/lib/paymentStorage";
import { setCheckoutOpen } from "@/lib/checkoutState";
import { resolveCtaSource } from "@/lib/ctaSource";

type RazorpayResponse = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};
type OrderData = { orderId: string; amount: number; currency: string; keyId: string };
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: RazorpayResponse) => void;
};
type RazorpayInstance = { open: () => void; on: (event: string, cb: () => void) => void };

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name required").matches(/^[^\d<>@]+$/, "Enter a valid name"),
  email: Yup.string().trim().required("Email required").email("Enter a valid email"),
  mobile: Yup.string().required("Mobile required").matches(/^[0-9]{10}$/, "Enter a 10-digit mobile number"),
});

type FormValues = { name: string; email: string; mobile: string };
type Notice = "failed" | "dismissed" | null;

export function RegistrationForm({ formId, submitLabel }: { formId: string; submitLabel?: string }) {
  const course = useCourse();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  // Synchronous guard: state updates are async, so rapid taps could otherwise create several orders.
  const locked = useRef(false);

  // The browser never sends an amount: the server prices the order from the central course config.
  async function createOrder(values: FormValues): Promise<OrderData | null> {
    const utm = Object.fromEntries(UTM_KEYS.map((key) => [key, getUtm(key)]));
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...utm, cta_source: resolveCtaSource(formId) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormError(
          response.status === 403
            ? "Registration for this session is closed."
            : typeof data?.error === "string" ? data.error : "Payment could not be started. Please try again.",
        );
        return null;
      }
      return data as OrderData;
    } catch {
      setFormError("Payment could not be started. Check your connection and try again.");
      return null;
    }
  }

  // The checkout callback only proves a payment attempt. A seat is confirmed by the Thank You page,
  // which has the SERVER verify the signature and the captured payment before showing success.
  function handleCheckoutSuccess(response: RazorpayResponse) {
    setVerifying(true);
    if (response.razorpay_order_id && response.razorpay_payment_id && response.razorpay_signature) {
      saveProof({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      clearDraft();
      router.push("/thank-you");
    } else {
      router.replace("/error?reason=unconfirmed");
    }
  }

  async function startPayment(values: FormValues) {
    setFormError("");
    setNotice(null);
    setCreating(true);
    setCheckoutOpen(true);
    saveDraft(values);
    const order = await createOrder(values);
    setCreating(false);
    if (!order || !window.Razorpay) {
      if (order) setFormError("Payment gateway did not load. Please refresh and try again.");
      setCheckoutOpen(false);
      locked.current = false;
      return;
    }
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "VLS Law Academy",
      order_id: order.orderId,
      description: `${course.name} — ${course.feeText}`,
      prefill: { name: values.name, email: values.email, contact: values.mobile },
      theme: { color: "#a51f24" },
      modal: {
        ondismiss: () => {
          setCheckoutOpen(false);
          locked.current = false;
          setNotice((current) => current ?? "dismissed");
        },
      },
      handler: handleCheckoutSuccess,
    });
    // Razorpay keeps its own retry UI open after a failure, so the page stays put.
    rzp.on("payment.failed", () => setNotice("failed"));
    rzp.open();
  }

  const formik = useFormik<FormValues>({
    initialValues: { name: "", email: "", mobile: "" },
    validationSchema,
    onSubmit: async (values) => {
      if (locked.current) return;
      locked.current = true;
      setCreating(true);
      if (!course.isPaid) {
        locked.current = false;
        setCreating(false);
        setFormError("Registration for this session is closed.");
        return;
      }
      await startPayment({ ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() });
    },
  });

  // Restore details typed before a failed/abandoned payment (same tab only).
  const { setValues } = formik;
  useEffect(() => {
    const draft = readDraft();
    if (draft) void setValues(draft, false);
  }, [setValues]);

  const busy = creating || verifying || formik.isSubmitting;
  const label = verifying
    ? "Confirming Payment…"
    : busy
    ? "Opening Secure Payment…"
    : notice && course.isPaid ? `Try Payment Again — ${course.feeText}` : submitLabel || course.formSubmitLabel;

  return (
    <>
      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <p role="alert" className="text-[13px] text-vls-red">
            {formError}
          </p>
        )}
        {notice && (
          <div role="alert" className="border border-vls-border bg-vls-card p-4 text-[13px] leading-relaxed text-vls-black">
            <p className="font-extrabold uppercase tracking-[1.2px] text-vls-red">
              {notice === "failed" ? "Payment not completed" : "Checkout closed"}
            </p>
            <p className="mt-1.5">
              {notice === "failed"
                ? "Your registration has not been confirmed. You can try the payment again."
                : "Your seat is not confirmed until the payment is completed."}
            </p>
            <p className="mt-1.5 text-vls-muted">
              Need help?{" "}
              <a href={`tel:${course.phone}`} className="font-bold text-vls-red underline underline-offset-2">
                {course.phoneDisplay}
              </a>
            </p>
          </div>
        )}
        <Field
          id={`${formId}-name`}
          name="name"
          label="Full Name"
          placeholder="Your full name"
          autoComplete="name"
          formik={formik}
        />
        <Field
          id={`${formId}-email`}
          name="email"
          type="email"
          inputMode="email"
          label="Email Address"
          placeholder="you@example.com"
          autoComplete="email"
          formik={formik}
        />
        <div>
          <label htmlFor={`${formId}-mobile`} className="eyebrow mb-2 block !text-vls-muted">
            Mobile Number
          </label>
          <div className="flex">
            <span className="flex h-12 items-center border border-r-0 border-vls-border bg-vls-card px-3 text-[16px] text-vls-muted">
              +91
            </span>
            <input
              id={`${formId}-mobile`}
              name="mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="98765 43210"
              value={formik.values.mobile}
              onChange={(e) => {
                // Autofill may add +91 or spaces; keep the last 10 digits.
                formik.setFieldValue("mobile", e.target.value.replace(/\D/g, "").slice(-10));
              }}
              onBlur={formik.handleBlur}
              aria-invalid={Boolean(formik.touched.mobile && formik.errors.mobile)}
              aria-describedby={formik.touched.mobile && formik.errors.mobile ? `${formId}-mobile-error` : undefined}
              className="h-12 w-full border border-vls-border bg-[var(--vls-input-bg)] px-3 text-[16px] text-vls-black transition-colors duration-150 ease-out placeholder:text-vls-muted focus:border-vls-red aria-[invalid=true]:border-vls-red"
            />
          </div>
          {formik.touched.mobile && formik.errors.mobile && (
            <p id={`${formId}-mobile-error`} className="mt-1 text-[13px] text-vls-red">{formik.errors.mobile}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={busy || !course.isPaid}
          aria-busy={busy}
          className="mt-2 min-h-[52px] w-full bg-vls-red px-4 text-[14px] font-bold text-vls-white transition-[background-color,transform] duration-150 ease-out hover:bg-vls-red-dark motion-safe:hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {label}
        </button>
        <PaymentTrust />
      </form>

      <Popup open={verifying} onClose={() => {}} dismissable={false}>
        <h3 className="font-serif text-[20px] font-medium text-vls-black">Confirming your payment…</h3>
        <p className="mt-2 text-[14px] text-vls-muted">Please do not close or refresh this page.</p>
      </Popup>
    </>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  formik,
}: {
  id: string;
  name: "name" | "email" | "mobile";
  label: string;
  placeholder: string;
  type?: string;
  inputMode?: "email";
  autoComplete: string;
  formik: ReturnType<typeof useFormik<FormValues>>;
}) {
  const error = formik.touched[name] && formik.errors[name];
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block !text-vls-muted">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoCapitalize={type === "email" ? "none" : undefined}
        spellCheck={type === "email" ? false : undefined}
        placeholder={placeholder}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 w-full border border-vls-border bg-[var(--vls-input-bg)] px-3 text-[16px] text-vls-black transition-colors duration-150 ease-out placeholder:text-vls-muted focus:border-vls-red aria-[invalid=true]:border-vls-red"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[13px] text-vls-red">
          {error}
        </p>
      )}
    </div>
  );
}
