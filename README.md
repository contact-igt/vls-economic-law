# Economic Laws & Practice — VLS Law Academy

Landing page and paid-registration experience for the **Economic Laws & Practice** foundation course by
[VLS Law Academy](https://www.vlslawacademy.com/) — a 3-hour live session on Saturday, 10 October 2026, 6:00 PM – 9:00 PM IST.
Course content is limited to Module 11 of the VLS curriculum.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Formik + Yup · Razorpay Checkout

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your own TEST keys
npm run dev                  # http://localhost:3000
```

## Environment variables

Names only — see [`.env.example`](.env.example). All of these are **server-side**; never prefix them with `NEXT_PUBLIC_`.

| Variable | Purpose |
| --- | --- |
| `RAZORPAY_KEY_ID` | Razorpay key id (returned to the browser by `/api/create-order`) |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret — signature and capture verification |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret |
| `GOOGLE_SHEET_WEBAPP_URL` | Registration sheet web app (`scripts/google-sheet-webapp.gs`) |
| `GOOGLE_SHEET_TOKEN` | Optional shared secret matching the sheet script's `TOKEN` property |
| `NEXT_PUBLIC_API_SERVER`, `NEXT_PUBLIC_*_API_URL`, `NEXT_PUBLIC_CLIENT_KEY` | Optional lead-backend forwarding (server-side only) |

## Payment flow

| Step | Route | Rule |
| --- | --- | --- |
| Order | `POST /api/create-order` | Open only before the class starts. The amount comes from `programConfig.fee` on the server; any client amount is ignored. |
| Verify | `POST /api/verify-payment` | Checks the Razorpay checkout signature, then confirms with Razorpay that the payment is captured, belongs to this programme's order and matches the fee. Only then is the registration written. The Thank You page calls this; nothing in the URL can show "confirmed". |
| Webhook | `POST /api/razorpay-webhook` | `payment.captured` / `order.paid`, HMAC-verified and idempotent per payment id. |

Configure the Razorpay webhook to `https://<your-domain>/api/razorpay-webhook`.
The registration sheet upserts on `razorpay_payment_id`, so retries never create duplicate rows.

## Build and verify

```bash
npm run build         # next build --webpack
npm run lint
npx tsc --noEmit
./scripts/verify.sh   # content + payment verifiers, unit/flow tests, tsc, lint, build, client-bundle secret scan
```

All commercial values (date, time, duration, fee, deadline) live in `src/lib/course.ts`.

## Third-party assets

`public/brands/razorpay/badge-light.png` is Razorpay's official merchant badge (from Razorpay's merchant-badge programme), used unmodified.
The Razorpay name and badge are trademarks of Razorpay and subject to Razorpay's brand terms.
