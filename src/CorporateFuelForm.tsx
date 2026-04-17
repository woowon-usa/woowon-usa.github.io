function getControlValues() {
  const ss = SpreadsheetApp.openById('1Tj89JvAp9iC4E2Uwi9-WB_pgJCIilN8fi_tFXMfHQlU');
  const sheet = ss.getSheetByName('Control');

  const lastRow = sheet.getLastRow();
  const numRows = lastRow - 1;
  if (numRows <= 0) return { drivers: [], vehicles: [], destinations: [], purpose: [] };

  const data = sheet.getRange(2, 1, numRows, 4).getDisplayValues();

  const drivers      = [];
  const vehicles     = [];
  const destinations = [];
  const purpose      = [];

  for (let i = 0; i < data.length; i++) {
    const [a, b, c, d] = data[i].map(v => (v || '').trim());
    if (a) drivers.push(a);
    if (b) vehicles.push(b);
    if (c) destinations.push(c);
    if (d) purpose.push(d);
  }

  return { drivers, vehicles, destinations, purpose };
}

function doGet(e) { 
  const json = JSON.stringify(getControlValues());
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById('1Tj89JvAp9iC4E2Uwi9-WB_pgJCIilN8fi_tFXMfHQlU');

  try {
    const data = JSON.parse(e.postData.contents);

    const serverDateTime = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );

    if (data['type'] == 'corporate') {
      const sheet = ss.getSheetByName('Corporate Log');
      const [datePart, timePart] = data.datetime.split("T");

      sheet.appendRow([
        serverDateTime,
        datePart,
        timePart,
        data.destination,
        data.driver,
        data.vehicle,
        data.mileage
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON); 

    } else if (data['type'] == 'personal') {
      const sheet = ss.getSheetByName('Personal Log');
      const [datePart, timePart] = data.datetime.split("T");

      sheet.appendRow([
        serverDateTime,
        datePart,
        timePart,
        data.destination,
        data.purpose,
        data.driver,
        data.mileage
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON); 

    } else if (data['type'] == 'corporateFuel') {
      const sheet = ss.getSheetByName('Corporate Fuel Log');
      const [datePart, timePart] = data.datetime.split("T");

      sheet.appendRow([
        serverDateTime,
        datePart,
        timePart,
        data.driver,
        data.vehicle,
        data.mileage,
        data.fuelCost
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON); 
    }

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
