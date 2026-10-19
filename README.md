# ChefKeshav × ZWILLING Cash on Delivery Funnel

A production-oriented Next.js sales funnel for the ZWILLING Twin Signature 2-Piece Knife Set. It includes:

- Product landing page with a responsive image carousel, quantity selection, delivery-area pricing, benefits, sample testimonial placeholders, FAQ, and repeated CTAs
- Checkout page with client and server validation, loading state, duplicate-click prevention, and server-authoritative pricing
- Thank-you page with the completed order summary
- `POST /api/order` integration for Google Sheets, business notification email, and customer confirmation email
- Retry-safe order handling: the Sheet tracks whether each notification was sent so retrying a partial failure does not append another order row

The checkout accepts **Cash on Delivery only**. eSewa has not been added because no online payment integration was requested.

The order backend automatically creates the configured `Orders` tab when it is missing. It applies a frozen dark header, filters, hidden gridlines, alternating row colors, typed date and NPR currency formats, practical column widths, an Order Status dropdown, and color-coded order and email-delivery statuses. Other spreadsheet tabs are left unchanged.

## Recommended stack

- Next.js App Router and TypeScript
- Tailwind CSS for styling
- Google Sheets API through a Google service account
- Nodemailer with Gmail SMTP (or another compatible SMTP provider)
- Vercel for deployment

All Google and email credentials are read only inside server code. They are never sent to the browser.

## How the order flow works

1. The customer chooses quantity and delivery area on the landing page.
2. Those selections are passed to `/checkout` through URL parameters.
3. The checkout recalculates the price as the customer makes changes.
4. On submission, the browser sends customer details and the selected order to `POST /api/order`.
5. The server validates every field and recalculates product price, delivery fee, and total from trusted constants. Client-provided totals cannot change the charged amount.
6. The server generates a stable unique order ID from the browser request ID.
7. The order is appended to Google Sheets with status **New Order** and payment method **Cash On Delivery**.
8. The server sends a professional HTML order notification to the business email.
9. The server sends a professional HTML confirmation to the customer.
10. Only after the required steps succeed does the API return success and the customer is redirected to `/thank-you`.

If an email fails after the Sheet row is created, the API returns a clear error and keeps the customer on checkout. Retrying uses the same order ID, finds the existing Sheet row, and retries only the notification that is not marked `Sent`.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Do not commit `.env.local`. It is already ignored.

## Environment variables

Copy `.env.example` to `.env.local`, then configure:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public website URL, such as `https://your-domain.com` |
| `FRONTEND_URL` | Allowed frontend origin for API requests |
| `BUSINESS_EMAIL` | Receives new order notifications |
| `EMAIL_FROM` | Verified SMTP sender and customer reply-to address |
| `BRAND_NAME` | Brand used in emails |
| `GOOGLE_SHEET_ID` | ID between `/d/` and `/edit` in the Google Sheet URL |
| `GOOGLE_SHEET_TAB_NAME` | Orders tab name, for example `Orders` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account email |
| `GOOGLE_PRIVATE_KEY` | Service account private key, including escaped `\n` line breaks |
| `SMTP_HOST` | `smtp.gmail.com` for Gmail |
| `SMTP_PORT` | `465` for secure Gmail SMTP |
| `SMTP_USER` | Gmail/Google Workspace SMTP user |
| `SMTP_PASS` | Google App Password, not the account password |
| `EMAIL_SERVICE_API_KEY` | Reserved for a future Resend/Brevo/SendGrid implementation |
| `ORDER_SUBMISSION_MODE` | `live` for real orders; `mock` only for local UI testing |

The provided business and sender address is already present in `.env.example`; no password or private key is stored in the repository.

## Google Spreadsheet setup

### 1. Create the Sheet and tab

Create a Google Spreadsheet and rename the order tab to `Orders`, or another name you will place in `GOOGLE_SHEET_TAB_NAME`.

If row 1 is blank, the API automatically creates these headers on the first live order:

1. Order ID
2. Date & Time
3. Customer Name
4. Phone Number
5. Email Address
6. Exact Location
7. Product Name
8. Quantity
9. Price Per Piece
10. Subtotal
11. Delivery Zone
12. Delivery Fee
13. Total Price
14. Payment Method
15. Order Status
16. Notes
17. Request ID
18. Business Email Status
19. Customer Email Status

If you add the headers yourself, use these exact names and order. A mismatch is rejected to prevent data from entering the wrong columns.

### 2. Add filters

Select row 1 and choose **Data → Create a filter**. Freeze it with **View → Freeze → 1 row**. Useful filters include Order Status, Delivery Zone, Date & Time, and Payment Method.

### 3. Add the Order Status dropdown

Select column O from row 2 downward, then choose **Insert → Dropdown** (or **Data → Data validation**) and add:

- New Order
- Order Confirmed
- Order Ongoing
- Delivered
- Cancelled

The API writes `New Order` for every new submission.

### 4. Get the Sheet ID

For a URL shaped like:

```text
https://docs.google.com/spreadsheets/d/1AbC...xyz/edit
```

the Sheet ID is `1AbC...xyz`.

### 5. Create Google credentials

1. Open Google Cloud Console and create or select a project.
2. Enable the **Google Sheets API**.
3. Go to **IAM & Admin → Service Accounts** and create a service account.
4. Create a JSON key for that service account.
5. Put the JSON file's `client_email` in `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
6. Put `private_key` in `GOOGLE_PRIVATE_KEY`. In Vercel, paste it with the BEGIN/END lines; the code supports both real and escaped newline characters.

### 6. Share the Sheet

Open the Google Sheet, click **Share**, add the service-account email, and grant **Editor** access. The service account cannot append orders until the Sheet is shared with it.

## Gmail notification setup

1. Enable 2-Step Verification on the sender Google account.
2. Create a Google **App Password**.
3. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, and `SMTP_USER` to the Gmail address.
4. Put the 16-character App Password in `SMTP_PASS`.
5. Set `EMAIL_FROM` to the same Gmail address unless the account is authorized to send from another address.
6. Set `BUSINESS_EMAIL` to the inbox that should receive new-order notifications.

The business email uses the customer's address as `replyTo`, making it easy to reply. Customer mail uses `EMAIL_FROM` as the reply-to address.

## Testing

### UI-only test without credentials

Set:

```env
ORDER_SUBMISSION_MODE=mock
```

Submit an order and confirm that loading, duplicate-click prevention, and the thank-you redirect work. Mock mode does **not** save to Google Sheets or send email and must never be used for production orders.

### End-to-end live test

1. Complete every Google and SMTP variable.
2. Set `ORDER_SUBMISSION_MODE=live`.
3. Submit with an email inbox you can access.
4. Confirm a new Sheet row appears with both email-status columns set to `Sent`.
5. Confirm the business inbox receives **New Product Order Received - [Order ID]**.
6. Confirm the customer inbox receives **Your Order Has Been Received - ChefKeshav**.
7. Confirm the browser reaches the thank-you page only after all three external actions succeed.

If the form stays on checkout, read the visible error and inspect the Vercel Function logs. Frequent causes are an unshared Sheet, a misspelled tab name, private-key formatting, or using a Gmail password instead of an App Password.

## Deploying to Vercel

1. Push the project to a Git repository.
2. Import the repository in Vercel as a Next.js project.
3. Add every variable from `.env.example` under **Project Settings → Environment Variables**.
4. Use the deployed production URL for both `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL`.
5. Keep `ORDER_SUBMISSION_MODE=live` in Production.
6. Deploy, submit one live test order, and verify the Sheet plus both inboxes.

No separate backend or CORS service is needed; `/api/order` is a same-origin Next.js route and runs as a Node.js Vercel Function.

## Editing product details

Update pricing, delivery fees, and product names in `lib/product.ts`. The server and browser import the same source, so totals remain consistent. Replace the clearly labeled sample testimonials in `app/page.tsx` with verified feedback before public launch.
