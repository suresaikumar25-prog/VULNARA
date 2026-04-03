# 🚀 Vercel Deployment Guide for VULNARA

Follow these exact steps to deploy your TechFrontier VULNARA application from scratch on Vercel.

---

## Step 1: Connect to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **"Add New..."** button and select **"Project"**.
3. In the "Import Git Repository" section, locate your `suresaikumar25-prog/VULNARA` repository.
4. Click the **"Import"** button next to it.

> [!TIP] 
> If you don't see your repository, click "Adjust GitHub App Permissions" and give Vercel access to the `VULNARA` repo.

---

## Step 2: Configure the Project

1. **Project Name**: You can leave it as `vulnara` or rename it to whatever you prefer (e.g., `threatlens-app`).
2. **Framework Preset**: Vercel will automatically detect **Next.js**. Leave it as is.
3. **Root Directory**: Leave it as `./` (the root).
4. **Build and Output Settings**: Leave these as defaults. Vercel knows how to build a Next.js app natively.

---

## Step 3: Paste Environment Variables

Expand the **"Environment Variables"** dropdown area. You need to copy your specific keys from your local `.env.local` (and your Supabase/WhatsApp settings) and paste them here.

### **🟢 Core Required Variables**
*(You must add these for the app to function properly)*

| KEY | VALUE |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | *(Paste your Supabase Project URL)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Paste your Supabase anon/public key)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Paste your Supabase service role key)* |
| `NEXT_PUBLIC_APP_URL` | *(Leave blank for now, or put your Vercel production URL once generated)* |

---

### **🔵 Email Scanner Variables (Gmail)**
*(Add these if you are testing the automated email scanner function)*

| KEY | VALUE |
| --- | --- |
| `GMAIL_USER` | *(Your Gmail address)* |
| `GMAIL_APP_PASSWORD` | *(Your 16-character Google App Password)* |
| `EMAIL_SERVICE` | `gmail` (or `console` if you just want to log it) |

---

### **🟣 WhatsApp Service Variables (Optional)**
*(Depending on whether you use Twilio or Meta for WhatsApp tests)*

**If using Twilio:**
| KEY | VALUE |
| --- | --- |
| `WHATSAPP_SERVICE` | `twilio` |
| `TWILIO_ACCOUNT_SID` | *(Your Twilio Account SID)* |
| `TWILIO_AUTH_TOKEN` | *(Your Twilio Auth Token)* |
| `TWILIO_WHATSAPP_NUMBER` | *(Your Twilio Sandbox number, e.g. +14155238886)* |

**If using Meta Direct API:**
| KEY | VALUE |
| --- | --- |
| `WHATSAPP_SERVICE` | `business` |
| `WHATSAPP_PHONE_NUMBER_ID` | *(Your Meta Phone Number ID)* |
| `WHATSAPP_ACCESS_TOKEN` | *(Your Meta temporary or permanent access token)* |
| `WHATSAPP_VERIFY_TOKEN` | *(A custom string you make up for Webhook verification)* |
| `META_APP_SECRET` | *(Your Meta App Secret)* |

---

## Step 4: Deploy!

1. Once your variables are pasted in, click the big **Deploy** button.
2. Vercel will now install your dependencies, build the project, and assign you a live `.vercel.app` URL.

> [!IMPORTANT]
> **Post-Deployment Step:** After deployment is successful, copy your new live Vercel URL (e.g., `https://vulnara.vercel.app`).
> 
> Go back to your **Vercel Dashboard → Project Settings → Environment Variables**, and update the `NEXT_PUBLIC_APP_URL` to match this live URL. (You may need to quickly redeploy after changing it).
