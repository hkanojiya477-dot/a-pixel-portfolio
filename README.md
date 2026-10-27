# A PIXEL — Portfolio Website

A portfolio website plus a private admin dashboard for **A PIXEL**.
Built with Next.js, TypeScript, Tailwind CSS and Supabase.

> **Status:** this runs on your own computer (locally). It is **not deployed** to the internet yet.

---

## How it works (plain language)

| Piece | What it does |
|---|---|
| **Next.js** | Builds the website pages and the admin dashboard. |
| **Tailwind CSS** | Handles the styling: black, white and electric lime `#D5FF3F`. |
| **Supabase Database** | Stores your projects and contact-form messages. |
| **Supabase Auth** | Handles the admin login (email + password). |
| **Supabase Storage** | Stores the images you upload. |
| **Row Level Security** | Database rules. Visitors can only *read published* projects. Only your admin account can add, edit or delete anything. |

**About the keys:** the two keys in `.env.local` (URL + anon/publishable key) are *public* keys.
Supabase built them to be visible in a browser. The security rules in `supabase/schema.sql`
protect your data. The **secret / service_role key is never used** in this project.
Never paste it into any file here.

---

## Step 1: Install Node.js (one time)

1. Go to **https://nodejs.org** and download the **LTS** version for Windows.
2. Run the installer and accept the defaults.
3. Open a new **PowerShell** window and check it worked:
   ```
   node -v
   ```
   You should see a version number like `v22.x.x`.

## Step 2: Create your Supabase project (one time)

1. Go to **https://supabase.com**, sign up, and click **New project**.
   Choose a name, a strong database password (save it somewhere safe), and a region near you.
2. Wait about 2 minutes while it sets up.
3. Open **SQL Editor → New query**. Paste in **everything** from `supabase/schema.sql` and click **Run**.
   You should see "Success".
4. Create your admin login: **Authentication → Users → Add user → Create new user**.
   Enter your email and a strong password, and tick **Auto Confirm User**.
5. Make that user an admin: open a new SQL query and paste `supabase/make-admin.sql`.
   Replace `YOUR-EMAIL@example.com` with your email and click **Run**. You should see one row with your email.
6. **Turn off public sign-ups** (important): **Authentication → Sign In / Providers**
   (called "Settings" in some versions) → turn **off** "Allow new users to sign up" → Save.

## Step 3: Connect the website to Supabase

1. In Supabase, open **Project Settings → API** (or **API Keys**).
2. In the project folder, make a copy of `.env.example` and name it **`.env.local`**.
3. Open `.env.local` and paste in:
   - `NEXT_PUBLIC_SUPABASE_URL`: your **Project URL**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the **anon public** key (or the **publishable** key starting `sb_publishable_`)

   ❌ Do **not** use the `service_role` or `secret` key.

## Step 4: Run the website on your computer

Open PowerShell **inside the project folder** (the one containing `package.json`) and run:

```
npm install
```
(First time only. It downloads everything the site needs and takes 1–3 minutes.)

```
npm run dev
```

Then open:
- Website: **http://localhost:3000**
- Admin: **http://localhost:3000/admin**

To stop the site, press **Ctrl + C** in PowerShell.

> If you change `.env.local`, stop the site (Ctrl + C) and run `npm run dev` again.

---

## Using the admin dashboard

1. Go to `/admin` and sign in with the email and password from Step 2.
2. Click **+ New project** and fill in the title, summary and description.
3. **Upload a cover image.** This is required before publishing.
4. Add **gallery images**. You can select several at once, reorder them with the ← → buttons, or set one as the cover.
5. Paste a **YouTube / Vimeo / .mp4 link** if you have a video.
6. Choose **categories**. These match your 9 services.
7. Tick **Featured** to show the project on the home page.
8. Click **Save draft** (private) or **Publish** (live).

From the project list you can also **Publish / Unpublish**, **Feature / Unfeature** and **Delete**.
Deleting a project also deletes its images. Messages from the contact form appear under **Messages**.

---

## Editing your text

| What | File |
|---|---|
| Email, location, social links, tagline | `src/lib/site.ts` |
| Service names & descriptions | `src/lib/services.ts` |
| Home page | `src/app/(site)/page.tsx` |
| About page story | `src/app/(site)/about/page.tsx` |
| Colours & fonts | `src/app/globals.css`, `src/app/layout.tsx` |

Look for **`CHANGE ME`** comments. Those are placeholders for you to replace.

---

## Project structure

```
a-pixel-21/
├── .env.example            ← template for your keys (copy to .env.local)
├── package.json            ← list of tools the site uses
├── next.config.ts          ← image + security-header settings
├── supabase/
│   ├── schema.sql          ← run once: tables, security rules, image bucket
│   └── make-admin.sql      ← run once: make your account the admin
└── src/
    ├── middleware.ts       ← blocks /admin for anyone not logged in as admin
    ├── lib/                ← shared logic (site info, services, Supabase, validation)
    ├── components/
    │   ├── site/           ← header, footer, project cards, video player…
    │   └── admin/          ← project form, row buttons
    └── app/
        ├── (site)/         ← public pages: home, work, work/[slug], services, about, contact
        └── admin/          ← login, projects list, new/edit project, messages
```

---

## Security summary

- Only users listed in the `admins` table can change anything. This is enforced **by the database itself**,
  so it can't be bypassed from the browser.
- Drafts are never visible to visitors.
- No secret keys are in the code. `.env.local` is excluded from Git by `.gitignore`.
- Uploads are limited to images (no SVG) up to 10 MB, and only admins can upload.
- The contact form has length limits and a hidden spam trap.
- Supabase Auth rate-limits login attempts.

## Known limits

- If you upload an image and leave without saving, that image stays in Storage unused.
  You can delete it in Supabase → Storage.
- The contact form saves messages to the dashboard but doesn't email you yet.
  An email notification (e.g. with Resend) can be added later.

## Deploying (not done yet)

When you're ready to publish online, the usual route is **Vercel** (made by the Next.js team):
push this folder to GitHub, import it on vercel.com, add the same 3 environment variables,
and set `NEXT_PUBLIC_SITE_URL` to your real domain. Ask for step-by-step help when you get there.
