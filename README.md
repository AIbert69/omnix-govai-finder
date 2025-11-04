# Omnix | GovAI — Hosted SAM.gov Finder (No CORS)

This project deploys a **static frontend** + **serverless proxy** (Vercel Functions) so you can search SAM.gov without CORS issues. Your API key stays on the server.

## 🚀 Deploy on Vercel

1) Install Vercel CLI (or use the dashboard + GitHub):
   ```bash
   npm i -g vercel
   ```
2) Deploy:
   ```bash
   vercel
   ```
   - Framework: **Other**
3) In Project → Settings → Environment Variables, add:
   - Key: `SAM_API_KEY`
   - Value: your real SAM.gov API key
   - Scope: Production + Preview
   - Save, then **Redeploy**.

Open your site:
- `/` → Finder UI (with "Fill Singh NAICS" button)
- `/codes.html` → full list of Singh NAICS + copy CSV/JSON
- `/key.html` → masked preview of your server-stored key
