const SHEET_NAME = 'Rounds';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet_();
    const headers = buildHeaders_(payload);
    ensureHeaders_(sheet, headers);

    const row = headers.map((header) => valueForHeader_(payload, header));
    sheet.appendRow(row);

    return jsonResponse_({
      ok: true,
      message: 'Round saved',
      row: sheet.getLastRow()
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : String(error)
    });
  }
}

function doGet() {
  return jsonResponse_({
    ok: true,
    message: 'Guardian Angel Rounds endpoint is live.'
  });
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function buildHeaders_(payload) {
  const baseHeaders = ['Timestamp', 'Room / Resident', 'Rounder Name'];
  const answerHeaders = (payload.items || []).flatMap((item, index) => [
    `Q${index + 1} Question`,
    `Q${index + 1} Answer`,
    `Q${index + 1} Note`
  ]);
  return baseHeaders.concat(answerHeaders);
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  const needsUpdate = headers.some((header, index) => currentHeaders[index] !== header);

  if (needsUpdate) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function valueForHeader_(payload, header) {
  if (header === 'Timestamp') return payload.timestamp || new Date().toISOString();
  if (header === 'Room / Resident') return payload.roomOrResident || '';
  if (header === 'Rounder Name') return payload.rounderName || '';

  const match = header.match(/^Q(\d+) (Question|Answer|Note)$/);
  if (!match) return '';

  const item = (payload.items || [])[Number(match[1]) - 1] || {};
  if (match[2] === 'Question') return item.question || '';
  if (match[2] === 'Answer') return item.answer || '';
  if (match[2] === 'Note') return item.note || '';
  return '';
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
