#!/usr/bin/env bash
# Production gate for the Economic Laws & Practice landing page.
set -euo pipefail
cd "$(dirname "$0")/.."

node scripts/verify-economic-laws.mjs
node --experimental-strip-types scripts/check-program-status.mjs
npm run --silent test:create-order-guard
npm run --silent test:payment-flow
npm run --silent test:calendar
npx tsc --noEmit
npm run lint
npm run build
node scripts/check-client-bundle.mjs

echo "VERIFY: ALL ECONOMIC LAWS CHECKS PASSED"
