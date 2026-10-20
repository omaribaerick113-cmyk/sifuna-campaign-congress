# Faculty of Commerce Congress Representative - Campaign Website

Independent student campaign website for the **Egerton University Faculty of Commerce Congress Representative** election.
Slogan: *Your Voice. Your Faculty. Your Future.*

React + Vite front end, Google Sheets + Google Apps Script back end, WhatsApp click-to-chat, hosted free on Vercel.
This is **not** an official Egerton University website, and the site says so in its footer.

---

## 0. What has and has not been tested (read this first)

| Item | Status |
| --- | --- |
| WhatsApp number conversion (`0743929633` -> `254743929633`), URL encoding, `mailto:` link | **Tested** (`npm test`) |
| Client-side form validation rules | **Tested** (`npm test`) |
| Apps Script logic: validation, duplicate protection, formula-injection guard, honeypot, rate limit, email-failure handling, separate Feedback tab | **Tested** against an in-memory fake of Sheets/Gmail (`npm test`). Not yet run on real Google servers. |
| `manifesto.pdf` | A 3-page PDF is included and was checked visually. It is rebuilt automatically on every `npm run build`. |
| `npm install`, `npm run dev`, `npm run build`, Vercel deploy | **NOT tested.** The environment this was written in could not reach the npm registry. Run the steps in section 2 first; if anything fails, copy the error and ask for a fix. |
| Real submission to your Google Sheet, real email delivery, WhatsApp opening on a phone | **NOT tested.** Needs your Google account and phone. Follow section 4 and 7, then the checklist in section 11. |
| Visual layout on real phones | **NOT tested** in a browser. Check it on your own phone after deploying. |

Nothing here claims an integration is live. Until you finish section 4, the forms show a clear "not connected, nothing was saved" message instead of a fake success.

---

## 1. Project map (what each file does)

```
campaign-website/
  public/
    images/                  your photos (optimized .webp) + share-card.jpg
    favicon.svg
    manifesto.pdf            downloadable manifesto (auto-rebuilt on build)
  src/
    config/campaignConfig.js >>> THE FILE YOU EDIT: name, photos, contacts, manifestos, socials, team, switches
    services/
      whatsappService.js     number conversion, wa.me links, all prefilled messages
      googleSheetsService.js sends forms to Apps Script; only reports success when the backend confirms it
      validation.js          form rules (mirrored on the server)
      referral.js            reads ?ref=whatsapp etc. safely
    components/              Navbar, Hero, Footer, forms, cards, buttons
    pages/                   Home, About, Manifestos, Register, Team, Feedback, Contact, Privacy
    styles/                  global.css, responsive.css
  google-apps-script/
    Code.gs                  the whole backend (paste into Apps Script)
    README.md                backend-only setup notes
  scripts/generate-manifesto-pdf.mjs   builds public/manifesto.pdf from the config
  tests/run-tests.mjs        `npm test`
  vercel.json                makes /register, /contact ... work when typed directly
  .env.example               the one public setting (VITE_APPS_SCRIPT_URL)
  .gitignore                 keeps .env, node_modules, keys out of GitHub
```

**How it fits together:** visitor -> React site on Vercel -> (POST) Google Apps Script web app -> private Google Sheet -> email to the campaign.
WhatsApp is separate: buttons simply open `https://wa.me/254743929633?text=...` on the visitor's phone.

---

## 2. Run it on your computer

1. Install **Node.js LTS** from https://nodejs.org (accept the defaults).
2. Install **VS Code** from https://code.visualstudio.com.
3. Unzip the project. In VS Code choose **File > Open Folder** and pick `campaign-website`.
4. Open the terminal: **Terminal > New Terminal**.
5. Install dependencies (once): `npm install`
6. Run checks (optional but quick): `npm test`
7. Start the site: `npm run dev`
8. Open the address it prints, usually http://localhost:5173. Edits to files show up instantly.
9. To test the production build: `npm run build` then `npm run preview`.

**Common problems**
- `npm is not recognized` -> close and reopen VS Code after installing Node.
- `EACCES` / permission errors -> don't use `sudo`; reinstall Node using the official installer.
- Blank page -> open the browser console (F12) and read the first red error; share it.
- Port busy -> run `npm run dev -- --port 3000`.

---

## 3. Change the content (one file)

Edit **`src/config/campaignConfig.js`**. Save, and the site updates.

| To change | Edit |
| --- | --- |
| Candidate name (currently `[Your Campaign Name]`) | `candidate.name` |
| Official title | `candidate.position` |
| Intro / vision / mission | `candidate.intro`, `vision`, `mission` |
| WhatsApp number (updates **every** button) | `contact.whatsappNumber` (e.g. `0743929633`) |
| Email (updates links, contact page, privacy notice) | `contact.email` |
| Photos | replace the files in `public/images/` keeping the names, or change the paths in `images` |
| Manifestos | `manifestos` list (title + text) |
| Social links | `socials[].url` - leave `''` to hide; only paste real accounts |
| Team members | `team.members` (empty = a volunteer invitation is shown) |
| Hide Team page / PDF button | `features.campaignTeamPage`, `features.manifestoPdf` |
| WhatsApp prefilled wording | `src/services/whatsappService.js` -> `whatsappMessages` |

Your three photos are already in `public/images/` (hero = studio portrait, About = campus photo, plus a gallery portrait). Keep each image under ~300 KB. Do not add credentials to the config: it is public.

After changing manifestos, `npm run build` (and Vercel) regenerates the PDF automatically. To rebuild it by hand: `npm run manifesto`.

---

## 4. Connect Google Sheets + email (free)

You need a Google account (the campaign Gmail works).

1. Go to https://sheets.google.com and create a **blank spreadsheet**. Name it "Campaign Registrations". **Do not share or publish it.**
2. In the sheet: **Extensions > Apps Script**. A script editor opens (this makes the script "bound" to the sheet, so no spreadsheet ID is needed).
3. Delete the sample code, paste the whole of `google-apps-script/Code.gs`, click **Save**.
4. At the top of the code check `CAMPAIGN_EMAIL` (already `casifunamike@gmail.com`).
5. Choose the function **`setup`** in the dropdown and click **Run**. Google asks for permission: **Review permissions > pick your account > Advanced > Go to (project) > Allow**. (The "unverified" warning is normal for your own script.) This creates the `Registrations` and `Feedback` tabs and authorizes Gmail + Sheets. Never give anyone your password; this flow never needs it.
6. Optional: run **`testEmail`** - an email should reach the campaign inbox.
7. Click **Deploy > New deployment > (gear) Web app**.
   - Description: `v1`
   - **Execute as: Me** (so it can write to your private sheet)
   - **Who has access: Anyone** (the website's visitors are not logged in, so this is required)
   - Click **Deploy** and **copy the Web app URL** (ends in `/exec`).
8. Open that URL in your browser. You should see a small JSON "Backend is running" message and **no data**.
9. Give the URL to the website:
   - Local: copy `.env.example` to `.env`, then set `VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec`, restart `npm run dev`.
   - Vercel: add the same variable (section 6).
10. Submit a test registration on the site. A new row should appear in the `Registrations` tab and an email should arrive. Try Feedback too.
11. **Whenever you edit `Code.gs`:** Deploy > **Manage deployments** > pencil > Version: **New version** > Deploy. (The URL stays the same.)

**Security, honestly.** A public form needs a public endpoint, so anyone who learns the URL could try to post to it. Built-in controls: server-side validation and length limits, a hidden honeypot field, a global rate limit (30 requests/minute), duplicate protection, formula-injection protection in the sheet, size limit on requests, and no personal data in logs. These reduce abuse; they do not make a public endpoint "fully secure". The Sheet itself stays private; the endpoint can only **add** rows and never reads data back. If you ever see spam, change the deployment to a new URL (new deployment) and update the site.

**Email limits.** Free Gmail accounts can send only a limited number of emails per day via Apps Script (around 100 recipients; check Google's current "Apps Script quotas" page). If the quota is hit, the registration is still saved and the row's "Email notification" column says `FAILED`.

**If the browser reports a CORS or network error:** the site sends `Content-Type: text/plain` precisely to avoid CORS preflight, which normally works. If your deployment is restricted to a Google Workspace domain, redeploy with access **Anyone**. Open the browser console (F12 > Network) and note the failing request before asking for help. A real test on your account is the only way to confirm this works end to end.

---

## 5. Put it on GitHub

1. Create an account at https://github.com (free).
2. Click **New repository**, name it `campaign-website`, keep it **Private** (recommended) or Public, don't add a README, click **Create**.
3. In the VS Code terminal inside the project:
   ```
   git init
   git add .
   git commit -m "Initial campaign website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/campaign-website.git
   git push -u origin main
   ```
   (Install Git from https://git-scm.com if the command is missing. GitHub may ask you to sign in in a browser.)
4. **Secrets check:** `.gitignore` already excludes `.env`, `node_modules`, `dist`. Run `git status` before committing: `.env` must not appear. The Apps Script URL is not a password, but keep it in `.env`/Vercel anyway.
5. Later changes: `git add .` then `git commit -m "Describe change"` then `git push`.

No Git? On GitHub choose **Add file > Upload files** and drag the project folder contents in (leave out `node_modules`).

---

## 6. Deploy on Vercel (free)

1. Go to https://vercel.com and **Sign up with GitHub**.
2. **Add New > Project**, choose your `campaign-website` repository, **Import**.
3. Vercel detects Vite automatically (Build: `npm run build`, Output: `dist`).
4. Open **Environment Variables** and add: Name `VITE_APPS_SCRIPT_URL`, Value = your Apps Script `/exec` URL. Apply to Production, Preview and Development.
5. Click **Deploy**. You get a free address like `your-project.vercel.app`.
6. Open it, and test direct links such as `/register` and `/contact` (`vercel.json` makes these work).
7. Every `git push` to `main` redeploys automatically. After changing an environment variable, **redeploy** (Deployments > ... > Redeploy).
8. Free-tier note: Vercel's Hobby plan is for personal, non-commercial use and has usage limits; terms can change, so check https://vercel.com/pricing and the fair-use terms. A student campaign normally fits; a paid domain is optional and never required.

---

## 7. WhatsApp

- The number `0743929633` is converted to `254743929633` automatically. Confirm that number is registered on WhatsApp (open WhatsApp > New chat > search it).
- Test the link on your phone: `https://wa.me/254743929633?text=Hello` - the chat should open with "Hello" typed in.
- **Visitors must press Send.** A `wa.me` link only opens a chat with a ready-typed message. Submitting the registration form does **not** message you on WhatsApp. Registration is saved to Google Sheets and emailed whether or not the student opens WhatsApp. The "CONTINUE ON WHATSAPP" button is optional.
- "Share on WhatsApp" buttons on manifestos open WhatsApp's contact picker so a student can forward a manifesto to friends.

### Optional future: automatic WhatsApp alerts (NOT CONFIGURED)
The site does **not** do this today and shows no "automation enabled" indicator. A normal personal WhatsApp account cannot receive automated API messages. Doing it properly needs:
- a Meta business account and the official **WhatsApp Business Platform** (or an authorized provider),
- a supported business phone number (not one already used in the regular app, unless migrated per Meta's rules),
- business verification where Meta requires it,
- approved message templates for notifications you start,
- optionally a webhook for incoming events,
- possible per-conversation charges. **Check Meta's current pricing page and your provider's price list before activating anything.**

Where it would plug in: `notifyWhatsAppAutomation_()` in `Code.gs` is an empty, clearly labelled hook (disabled by `WHATSAPP_AUTOMATION_ENABLED: false`). A provider call and its credentials (stored in Apps Script **Script Properties**, never in the code or frontend) can be added there later without touching the React site.

---

## 8. Reading and exporting your data (free dashboard = Google Sheets)

Open the sheet. `Registrations` and `Feedback` tabs hold everything.
- **Search:** Ctrl/Cmd + F.
- **Filter by year / interest / referral:** Data > Create a filter, then use the dropdown on the column.
- **Count interests/referrals:** Data > Pivot table (rows = "Areas of interest" or "Heard about us via", values = COUNTA of "Full name").
- **Export:** File > Download > Microsoft Excel (.xlsx) or CSV.
- Don't share the sheet publicly. Share only with trusted helpers, with the lowest permission needed.
- A custom web dashboard would need sign-in and a stronger backend; it is intentionally left as a future option rather than weakening security.

---

## 9. Privacy and legal

`/privacy` explains who collects data, what, why, where it is stored, who can access it, retention, and how to request correction or deletion (via `casifunamike@gmail.com`). Registration is **not anonymous**. The site has no ad trackers or analytics. Review the text and the retention period in `campaignConfig.js` (`privacy.retention`) so it matches what you really do. A template cannot guarantee compliance with Kenya's Data Protection Act, 2019; compliance depends on how you actually handle the data (for example, you may need to register with the Office of the Data Protection Commissioner depending on your situation - consider asking the university or a legal adviser). Also confirm Egerton University's campaign rules before publishing: do not use the university logo, and don't imply endorsement.

---

## 10. Referral tracking

Share links like `https://your-site.vercel.app/?ref=whatsapp` (also `facebook`, `instagram`, `tiktok`, `x`, `telegram`, `youtube`, `friend`, `poster`, `class`). The value is checked against a fixed list, kept only in the visitor's browser tab (sessionStorage), pre-fills "How did you hear about the campaign?" and can be changed by the student. It is saved with the registration.

---

## 11. Final checklist on the live site

Registration
- [ ] Submit with name + year + consent only -> success message appears and a row is added.
- [ ] Submit with nothing -> clear errors, nothing saved.
- [ ] Double-click Submit -> only one row.
- [ ] Open `/?ref=poster` then Register -> "Poster" is pre-selected.
- [ ] Email arrives at the campaign inbox with only the filled-in fields.
- [ ] Temporarily set a wrong `VITE_APPS_SCRIPT_URL` -> an error is shown, not a success.

Feedback
- [ ] Short message rejected; a valid one appears in the `Feedback` tab.

Links
- [ ] Every WhatsApp button opens a chat with +254 743 929 633 and the right prefilled text (hero, About, Manifestos, Team, Contact, Footer, success pages).
- [ ] "EMAIL THE CAMPAIGN" opens your mail app addressed to the campaign email.
- [ ] "DOWNLOAD MANIFESTO (PDF)" downloads a PDF with all 20 manifestos.
- [ ] Menu items and the **JOIN THE CAMPAIGN** button go to the right pages; the hamburger menu works on a phone; `/register` works when typed directly.
- [ ] Privacy notice opens from the footer and forms.

Devices
- [ ] Android phone, iPhone, tablet, laptop - no sideways scrolling, text readable.

Security
- [ ] `git status` shows no `.env`; the Sheet is not shared publicly; opening the `/exec` URL shows no data.

---

## 12. Free-tier reminder

GitHub, Vercel (Hobby), Google Sheets, Google Apps Script, Gmail and WhatsApp click-to-chat are free for this use, but each has usage limits, policies and terms that can change. Nothing here promises unlimited usage. No domain or paid service is needed.
