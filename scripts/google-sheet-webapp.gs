/**
 * Google Apps Script Web App for the Economic Laws & Practice registration sheet.
 *
 * Deploy: Apps Script editor → Deploy → New deployment → type "Web app",
 *   execute as "Me", access "Anyone". Copy the /exec URL into
 *   the GOOGLE_SHEET_WEBAPP_URL constant in src/lib/registrations.ts.
 *
 * The landing page POSTs application/x-www-form-urlencoded with these fields:
 *   name, email, mobile, amount, registered_date, programm_date,
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   payment_status, captured, page_name, ip_address,
 *   utm_source, utm_medium, utm_campaign, utm_term, utm_content,
 *   payment_method, currency, paid_at, course_name, cta_source, token
 *
 * Paid rows are written server-side by the landing page ONLY after Razorpay payment verification.
 * After the registration deadline the page writes waitlist leads instead: payment_status "waitlist",
 * amount 0 and empty razorpay_* / payment fields. Filter on payment_status to segment them.
 * razorpay_payment_id is the idempotency key for paid rows: a repeat of the same payment id (webhook retry,
 * verify + webhook race) returns {"result":"duplicate"} and appends nothing.
 *
 * Existing sheets: add the five trailing columns (payment_method, currency, paid_at, course_name, cta_source)
 * to row 1, in that order, after utm_content.
 */
var HEADERS = [
  'timestamp',
  'name',
  'email',
  'mobile',
  'amount',
  'registered_date',
  'programm_date',
  'razorpay_order_id',
  'razorpay_payment_id',
  'razorpay_signature',
  'payment_status',
  'captured',
  'page_name',
  'ip_address',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'payment_method',
  'currency',
  'paid_at',
  'course_name',
  'cta_source',
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registrations')
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Registrations');

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var params = (e && e.parameter) || {};
    // Optional shared secret: set Script property TOKEN and the same value as GOOGLE_SHEET_TOKEN on the server.
    var expected = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (expected && params.token !== expected) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: 'error', message: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var paymentId = params.razorpay_payment_id || '';
    if (paymentId && sheet.getLastRow() > 1) {
      var idCol = HEADERS.indexOf('razorpay_payment_id') + 1;
      var ids = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === paymentId) {
          return ContentService
            .createTextOutput(JSON.stringify({ result: 'duplicate' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    var row = HEADERS.map(function (key) {
      if (key === 'timestamp') return new Date();
      return params[key] !== undefined ? params[key] : '';
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
