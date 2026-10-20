# Google Apps Script backend

`Code.gs` is the whole backend. The full, beginner-friendly walkthrough is in the main `README.md`, section 4. Short version:

1. New Google Sheet -> **Extensions > Apps Script** -> paste `Code.gs` -> Save.
2. Run `setup` once and approve permissions (creates the `Registrations` and `Feedback` tabs).
3. **Deploy > New deployment > Web app**: *Execute as: Me*, *Who has access: Anyone*. Copy the `/exec` URL.
4. Put the URL in `VITE_APPS_SCRIPT_URL` (local `.env` and Vercel).
5. After any change to `Code.gs`: **Manage deployments > Edit > New version > Deploy**.

## Sheet columns

**Registrations:** Timestamp, Full name, Year of study, Course / specialization, Phone, Email, Preferred contact, Areas of interest, Heard about us via, Suggestions, Consent given, Confirmation email requested, Request ID, Content hash, Email notification.

**Feedback:** Timestamp, Name, Year of study, Topic, Feedback, Contact, Consent given, Request ID, Content hash, Email notification.

`Request ID` and `Content hash` are technical columns used to stop accidental double-saves. `Email notification` shows `sent` or `FAILED: ...` so you can see if Gmail's daily quota was hit (the registration is still saved).

## Test the endpoint without the website

Replace the URL with yours (macOS/Linux/Git Bash):

```
curl -L -X POST 'https://script.google.com/macros/s/XXXX/exec' \
  -H 'Content-Type: text/plain;charset=utf-8' \
  -d '{"type":"registration","requestId":"test-1","fullName":"Test Student","year":"Year 1","consent":true}'
```

Expected: `{"ok":true,"duplicate":false}` and a new row. Run it again with the same `requestId` -> `"duplicate":true` and no new row. Delete the test row afterward.

## Behaviour summary

- Validates every field again on the server; rejects unknown dropdown values, long text, missing consent.
- Saves first, **then** emails. An email failure never undoes or fails a saved registration.
- Emails the campaign only the fields the student provided. The optional student confirmation is sent only if they ticked the box and gave an email.
- Cells starting with `= + - @` are neutralised to stop spreadsheet formula injection.
- Honeypot field, 30 requests/minute global limit, 20 KB request cap.
- No personal data in logs. No secrets in the file. `doGet` returns only a health message.
- `notifyWhatsAppAutomation_` is a disabled placeholder: **NOT CONFIGURED**.
