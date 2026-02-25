# Code till Sehri by GDG Live Pakistan

A simple site for **Code till Sehri**: submit projects and vote on them (1–5). One vote per person per project; score cannot be changed after voting.

## Features

- **Google Sign In** for auth
- **Submit a project**: title, what it does, motivation, live URL, image, video link (e.g. Loom)
- **Vote**: rate each project 1–5; each project shows average score and vote count

## Setup

1. **Firebase** (auth + Firestore)
   - [Firebase Console](https://console.firebase.google.com/) → create a project.
   - Enable **Authentication** → **Sign-in method** → **Google**.
   - Create a **Firestore Database** (test mode for dev; lock down rules for production).

2. **Supabase** (storage only, for project images)
   - [Supabase Dashboard](https://supabase.com/dashboard) → create a project.
   - Go to **Storage** → create a bucket named `project-images` → set it to **Public**.
   - In the bucket’s **Policies**, add a policy that allows **INSERT** (e.g. allow uploads for all so the app can upload with the anon key).
   - Copy **Project URL** and **anon public** key from Project Settings → API.

3. **Env**
   - Copy `.env.local.example` to `.env.local`.
   - Fill in Firebase config and Supabase URL + anon key.

4. **Logo (optional)**  
   Add your GDG Live Pakistan logo as `public/gdg-logo.png` (or `.svg`). If missing, a small “GDG” badge is shown instead.

5. **Install and run**
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Firestore rules (required)

You must set these rules or you’ll get **“Missing or insufficient permissions”** when submitting or voting.

1. Open [Firebase Console](https://console.firebase.google.com/) → your project → **Firestore Database** → **Rules**.
2. Replace the rules with the contents of `firestore.rules` in this repo (or the block below).
3. Click **Publish**.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{id} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }
    match /votes/{id} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

You do not need Firebase Storage; project images are stored in Supabase.

## Deploy on Vercel

1. **Push your code to GitHub** (if you haven’t already).

2. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).

3. Click **Add New…** → **Project**, then **Import** your repo.

4. **Environment variables:** In the project settings (or during import), add the same vars you use in `.env.local`:
   - All `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_SUPABASE_*` keys.

5. Click **Deploy**. Vercel will build and host the app and give you a URL.

6. **Firebase auth (required for Sign in with Google):** In [Firebase Console](https://console.firebase.google.com/) → your project → **Authentication** → **Settings** (tab) → **Authorized domains**. Click **Add domain** and add:
   - Your Vercel URL **without** `https://`, e.g. `your-app.vercel.app`
   - Also add `vercel.app` if you use preview deployments (e.g. `your-app-xxx.vercel.app`)
   Without this, "Sign in with Google" will not work in production.
