# Guardian Angel Rounds

Fast mobile PWA for nursing assistant resident rounds.

## Google Sheets + Apps Script

1. Create a new Google Sheet.
2. Rename the first tab to `Rounds`.
3. Open `Extensions` > `Apps Script`.
4. Paste the complete code from `google-apps-script/Code.gs`.
5. Click `Deploy` > `New deployment`.
6. Choose `Web app`.
7. Set `Execute as` to `Me`.
8. Set `Who has access` to `Anyone`.
9. Deploy, authorize, and copy the Web App URL ending in `/exec`.
10. Create `.env.local` from `.env.example` and set `VITE_GOOGLE_SCRIPT_URL` to that URL.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Vercel

1. Push this repository to GitHub.
2. In Vercel, click `Add New` > `Project`.
3. Import the GitHub repo.
4. Framework preset: `Vite`.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Add environment variable `VITE_GOOGLE_SCRIPT_URL` with the Apps Script Web App URL.
8. Deploy.

`vercel.json` is included for SPA routing and service worker headers.
