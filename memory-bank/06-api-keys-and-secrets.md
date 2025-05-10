# API Keys & Secret Management Reference

## Current API Key/Secret Locations

| File/Path                              | Contains                        | Used By                        | Notes                                 |
|----------------------------------------|---------------------------------|--------------------------------|---------------------------------------|
| `/.env`                               | Firebase public config          | generate-firebase-config.js    | For static frontend, public only      |
| `/backend/.env`                       | OPENAI_API_KEY                  | Backend Node.js code           | Backend-only, never exposed to client |
| `/frontend/.env.local`                | OAuth client secrets, NextAuth  | Next.js frontend (server-side) | Never exposed to browser              |
| `/backend/public/firebase-config.js`   | Firebase public config (generated) | Static frontend                | Generated, safe for client            |

---

## How to Add New API Keys/Sensitive Config

1. **Decide Scope:**
   - **Backend-only?** Add to `/backend/.env`
   - **Frontend (public, non-secret)?** Add to `/.env` (and update config generation if needed)
   - **Frontend (Next.js, server-side only)?** Add to `/frontend/.env.local`
   - **Shared across services?** Add to `/.env` and reference from scripts as needed

2. **Update .gitignore:**
   - Ensure any new `.env` or secret files are listed in `.gitignore` to prevent accidental commits.

3. **Document the Addition:**
   - Add a new entry to this file with:
     - File/path
     - Variable name(s)
     - What it's for / which service uses it

4. **(If needed) Update Config Generation:**
   - If the new key needs to be exposed to the frontend (and is safe to do so), update your config generation script (e.g., `generate-firebase-config.js`) to include it.

5. **Access in Code:**
   - **Node.js:** Use `process.env.MY_API_KEY`
   - **Frontend (Next.js):** Use `process.env.NEXT_PUBLIC_MY_API_KEY` (for public), or just `process.env.MY_API_KEY` for server-only
   - **Static frontend:** Use the generated config file (e.g., `window.FIREBASE_CONFIG`)

---

## Best Practices
- **Never** hardcode secrets in HTML, JS, or source files.
- **Never** commit secrets to version control.
- Use environment variables and config generation scripts for all secret/public config.
- Keep this documentation up to date as you add/remove keys.

---

## Example: Adding a New API Key
Suppose you add a new third-party API for video analysis, with a key `VIDEO_API_KEY`:

1. Add `VIDEO_API_KEY=your_key_here` to `/backend/.env`
2. Add `/backend/.env` to `.gitignore` if not already present.
3. Add to this doc:
   | `/backend/.env` | VIDEO_API_KEY | Backend Node.js code | For video analysis API |
4. In your backend code, access with `process.env.VIDEO_API_KEY`

---

**This file is the single source of truth for all API key and secret management in this project. Update it with every change!** 