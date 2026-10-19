import "server-only";
import { google } from "googleapis";
import { deliveryLabel } from "@/lib/product";
import type { Order } from "@/lib/order";

export const SHEET_HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Subtotal",
  "Delivery Zone",
  "Delivery Fee",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
  "Request ID",
  "Business Email Status",
  "Customer Email Status",
] as const;

type ExistingOrder = {
  rowNumber: number;
  businessEmailStatus: string;
  customerEmailStatus: string;
};

type OrderSheet = {
  sheetId: number;
  bandedRangeId: number | null;
  hasOrderStatusRules: boolean;
  hasEmailStatusRules: boolean;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Server configuration is missing ${name}.`);
  return value;
}

function sheetsClient() {
  const email = requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const key = requiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function sheetDetails() {
  return {
    spreadsheetId: requiredEnv("GOOGLE_SHEET_ID"),
    tabName: requiredEnv("GOOGLE_SHEET_TAB_NAME"),
  };
}

function quotedTab(tabName: string) {
  return `'${tabName.replaceAll("'", "''")}'`;
}

async function ensureOrderTab(): Promise<OrderSheet> {
  const sheets = sheetsClient();
  const { spreadsheetId, tabName } = sheetDetails();
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title),bandedRanges,conditionalFormats)",
  });
  let sheet = metadata.data.sheets?.find((item) => item.properties?.title === tabName);

  if (!sheet) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: tabName,
              gridProperties: { rowCount: 2000, columnCount: SHEET_HEADERS.length },
              tabColorStyle: { rgbColor: { red: 0.89, green: 0.02, blue: 0.07 } },
            },
          },
        }],
      },
    });
    sheet = created.data.replies?.[0]?.addSheet;
  }

  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) {
    throw new Error(`The ${tabName} sheet tab could not be created or located.`);
  }

  const conditionalFormats = sheet?.conditionalFormats || [];
  return {
    sheetId,
    bandedRangeId: sheet?.bandedRanges?.[0]?.bandedRangeId ?? null,
    hasOrderStatusRules: conditionalFormats.some((rule) =>
      rule.ranges?.some((range) => range.startColumnIndex === 14),
    ),
    hasEmailStatusRules: conditionalFormats.some((rule) =>
      rule.ranges?.some((range) => range.startColumnIndex === 17),
    ),
  };
}

function statusRule(
  sheetId: number,
  startColumnIndex: number,
  endColumnIndex: number,
  value: string,
  background: { red: number; green: number; blue: number },
  foreground: { red: number; green: number; blue: number },
) {
  return {
    addConditionalFormatRule: {
      index: 0,
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex, endColumnIndex }],
        booleanRule: {
          condition: { type: "TEXT_EQ", values: [{ userEnteredValue: value }] },
          format: {
            backgroundColorStyle: { rgbColor: background },
            textFormat: { foregroundColorStyle: { rgbColor: foreground }, bold: true },
          },
        },
      },
    },
  };
}

async function styleOrderSheet(orderSheet: OrderSheet) {
  const sheets = sheetsClient();
  const { spreadsheetId } = sheetDetails();
  const { sheetId } = orderSheet;
  const requests: object[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          index: 0,
          gridProperties: { frozenRowCount: 1, frozenColumnCount: 1, hideGridlines: true },
          tabColorStyle: { rgbColor: { red: 0.89, green: 0.02, blue: 0.07 } },
        },
        fields: "index,gridProperties.frozenRowCount,gridProperties.frozenColumnCount,gridProperties.hideGridlines,tabColorStyle",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 19 },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: { red: 0.09, green: 0.09, blue: 0.09 } },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: {
              foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } },
              fontFamily: "Arial",
              fontSize: 10,
              bold: true,
            },
            borders: {
              bottom: {
                style: "SOLID_THICK",
                colorStyle: { rgbColor: { red: 0.89, green: 0.02, blue: 0.07 } },
              },
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 0, endColumnIndex: 19 },
        cell: {
          userEnteredFormat: {
            verticalAlignment: "MIDDLE",
            textFormat: {
              foregroundColorStyle: { rgbColor: { red: 0.12, green: 0.12, blue: 0.12 } },
              fontFamily: "Arial",
              fontSize: 10,
            },
          },
        },
        fields: "userEnteredFormat.verticalAlignment,userEnteredFormat.textFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 0, endColumnIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: "userEnteredFormat.textFormat.bold",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 2, endColumnIndex: 3 },
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: "userEnteredFormat.textFormat.bold",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 5, endColumnIndex: 7 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
        fields: "userEnteredFormat.wrapStrategy,userEnteredFormat.verticalAlignment",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 1, endColumnIndex: 2 },
        cell: { userEnteredFormat: { numberFormat: { type: "DATE_TIME", pattern: "dd mmm yyyy, hh:mm AM/PM" } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 8, endColumnIndex: 10 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: '"Rs" #,##0' } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 11, endColumnIndex: 13 },
        cell: { userEnteredFormat: { numberFormat: { type: "CURRENCY", pattern: '"Rs" #,##0' } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 7, endColumnIndex: 8 },
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: "0" }, horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 8, endColumnIndex: 13 },
        cell: { userEnteredFormat: { horizontalAlignment: "RIGHT" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 12, endColumnIndex: 13 },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: { red: 1, green: 0.94, blue: 0.94 } },
            textFormat: { bold: true, foregroundColorStyle: { rgbColor: { red: 0.62, green: 0.03, blue: 0.06 } } },
          },
        },
        fields: "userEnteredFormat.backgroundColorStyle,userEnteredFormat.textFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 3, endColumnIndex: 4 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 10, endColumnIndex: 11 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 13, endColumnIndex: 14 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 14, endColumnIndex: 19 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 14, endColumnIndex: 15 },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: ["New Order", "Order Confirmed", "Order Ongoing", "Delivered", "Cancelled"].map((userEnteredValue) => ({ userEnteredValue })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      setBasicFilter: {
        filter: { range: { sheetId, startRowIndex: 0, endRowIndex: 2000, startColumnIndex: 0, endColumnIndex: 19 } },
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 44 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2000 },
        properties: { pixelSize: 34 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: 16, endIndex: 17 },
        properties: { hiddenByUser: true },
        fields: "hiddenByUser",
      },
    },
  ];

  const widths = [160, 170, 170, 130, 220, 280, 260, 85, 125, 125, 190, 115, 125, 150, 150, 220, 250, 165, 165];
  widths.forEach((pixelSize, index) => {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: index, endIndex: index + 1 },
        properties: { pixelSize },
        fields: "pixelSize",
      },
    });
  });

  const bandedRange = {
    range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 0, endColumnIndex: 19 },
    rowProperties: {
      firstBandColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } },
      secondBandColorStyle: { rgbColor: { red: 0.97, green: 0.96, blue: 0.94 } },
    },
  };

  if (orderSheet.bandedRangeId === null) {
    requests.push({
      addBanding: {
        bandedRange,
      },
    });
  } else {
    requests.push({
      updateBanding: {
        bandedRange: { bandedRangeId: orderSheet.bandedRangeId, ...bandedRange },
        fields: "range,rowProperties.firstBandColorStyle,rowProperties.secondBandColorStyle",
      },
    });
  }

  if (!orderSheet.hasOrderStatusRules) {
    requests.push(
      statusRule(sheetId, 14, 15, "New Order", { red: 1, green: 0.92, blue: 0.76 }, { red: 0.45, green: 0.25, blue: 0.02 }),
      statusRule(sheetId, 14, 15, "Order Confirmed", { red: 0.84, green: 0.91, blue: 1 }, { red: 0.05, green: 0.25, blue: 0.55 }),
      statusRule(sheetId, 14, 15, "Order Ongoing", { red: 0.92, green: 0.86, blue: 1 }, { red: 0.3, green: 0.12, blue: 0.55 }),
      statusRule(sheetId, 14, 15, "Delivered", { red: 0.82, green: 0.94, blue: 0.84 }, { red: 0.05, green: 0.38, blue: 0.12 }),
      statusRule(sheetId, 14, 15, "Cancelled", { red: 1, green: 0.84, blue: 0.84 }, { red: 0.58, green: 0.05, blue: 0.05 }),
    );
  }

  if (!orderSheet.hasEmailStatusRules) {
    requests.push(
      statusRule(sheetId, 17, 19, "Sent", { red: 0.82, green: 0.94, blue: 0.84 }, { red: 0.05, green: 0.38, blue: 0.12 }),
      statusRule(sheetId, 17, 19, "Failed", { red: 1, green: 0.84, blue: 0.84 }, { red: 0.58, green: 0.05, blue: 0.05 }),
      statusRule(sheetId, 17, 19, "Pending", { red: 0.95, green: 0.95, blue: 0.95 }, { red: 0.35, green: 0.35, blue: 0.35 }),
    );
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
}

async function ensureHeaders() {
  const sheets = sheetsClient();
  const { spreadsheetId, tabName } = sheetDetails();
  const orderSheet = await ensureOrderTab();
  const tab = quotedTab(tabName);
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:S1`,
  });
  const current = response.data.values?.[0] || [];

  if (current.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1:S1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...SHEET_HEADERS]] },
    });
  } else if (SHEET_HEADERS.some((header, index) => current[index] !== header)) {
    throw new Error(
      `The Google Sheet header row does not match the required structure. Check the README and the ${tabName} tab.`,
    );
  }

  await styleOrderSheet(orderSheet);
}

export async function findOrder(orderId: string): Promise<ExistingOrder | null> {
  await ensureHeaders();
  const sheets = sheetsClient();
  const { spreadsheetId, tabName } = sheetDetails();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quotedTab(tabName)}!A2:S`,
  });
  const rows = response.data.values || [];
  const index = rows.findIndex((row) => row[0] === orderId);
  if (index === -1) return null;
  return {
    rowNumber: index + 2,
    businessEmailStatus: rows[index][17] || "Pending",
    customerEmailStatus: rows[index][18] || "Pending",
  };
}

export async function appendOrder(order: Order): Promise<ExistingOrder> {
  const sheets = sheetsClient();
  const { spreadsheetId, tabName } = sheetDetails();
  const result = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${quotedTab(tabName)}!A:S`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "OVERWRITE",
    requestBody: {
      values: [[
        order.orderId,
        Date.now() / 86_400_000 + 25_569,
        order.customerName,
        `'${order.phone}`,
        order.email,
        order.location,
        order.productName,
        order.quantity,
        order.pricePerPiece,
        order.subtotal,
        deliveryLabel(order.deliveryZone),
        order.deliveryFee,
        order.totalPrice,
        order.paymentMethod,
        order.orderStatus,
        order.notes,
        order.requestId,
        "Pending",
        "Pending",
      ]],
    },
  });

  const updatedRange = result.data.updates?.updatedRange || "";
  const rowMatch = updatedRange.match(/![A-Z]+(\d+):/);
  if (!rowMatch) throw new Error("The order was saved, but its spreadsheet row could not be confirmed.");
  return { rowNumber: Number(rowMatch[1]), businessEmailStatus: "Pending", customerEmailStatus: "Pending" };
}

export async function updateEmailStatus(
  rowNumber: number,
  type: "business" | "customer",
  status: "Sent" | "Failed",
) {
  const sheets = sheetsClient();
  const { spreadsheetId, tabName } = sheetDetails();
  const column = type === "business" ? "R" : "S";
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quotedTab(tabName)}!${column}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}
