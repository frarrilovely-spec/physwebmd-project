# Deploying PsychWebMD to Netlify

This guide walks you through deploying your PsychWebMD application to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup) (free)
2. A [Neon account](https://neon.tech) for PostgreSQL database (free tier available)

## Step 1: Set Up Your Database (Neon)

Since Netlify uses serverless functions, you need an external PostgreSQL database.

1. **Create a Neon Account**
   - Go to [neon.tech](https://neon.tech) and sign up (free)
   - Create a new project

2. **Get Your Database Connection String**
   - In Neon dashboard, go to your project
   - Click on "Connection Details"
   - Copy the "Connection string" (it looks like: `postgresql://user:password@host/database`)

3. **Create Database Tables**
   - In Neon's SQL Editor, run this SQL to create your tables:

```sql
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR PRIMARY KEY,
  appointment_type TEXT NOT NULL,
  verification_method TEXT,
  verified_contact TEXT,
  seeking_help_for TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  cell_number TEXT NOT NULL,
  gender TEXT,
  street_name TEXT,
  apt_suite TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  how_heard_about_us TEXT,
  concerns TEXT[],
  other_concern_details TEXT,
  insurance_member_first_name TEXT,
  insurance_member_last_name TEXT,
  insurance_member_dob TEXT,
  insurance_name TEXT,
  insurance_member_id TEXT,
  policy_holder TEXT,
  policy_holder_other TEXT,
  mental_health_info_consent BOOLEAN,
  hospitalized_past_year BOOLEAN,
  self_harm_risk BOOLEAN,
  alcohol_relationship TEXT,
  drug_use BOOLEAN,
  drug_use_frequency TEXT,
  emergency_first_name TEXT,
  emergency_middle_name TEXT,
  emergency_last_name TEXT,
  emergency_relationship TEXT,
  emergency_relationship_other TEXT,
  emergency_phone TEXT,
  visit_type TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  preferred_provider TEXT,
  terms_agreed BOOLEAN,
  privacy_agreed BOOLEAN,
  reminder_consent BOOLEAN,
  email TEXT,
  phone TEXT,
  address TEXT,
  insurance_provider TEXT,
  insurance_group_number TEXT,
  medical_history TEXT,
  current_medications TEXT,
  allergies TEXT,
  reason_for_visit TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  preferred_location TEXT,
  appointment_mode TEXT,
  service_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  previous_therapy TEXT,
  symptoms TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Step 2: Deploy to Netlify

### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push this project to your repository

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository

3. **Configure Build Settings**
   Netlify should auto-detect these, but verify:
   - **Build command**: `npm install && npx vite build`
   - **Publish directory**: `dist/public`
   - **Functions directory**: `netlify/functions`

4. **Add Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add: `DATABASE_URL` = (your Neon connection string from Step 1)

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your site

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize your site**
   ```bash
   netlify init
   ```

4. **Set environment variables**
   ```bash
   netlify env:set DATABASE_URL "your-neon-connection-string"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Verify Deployment

1. Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
2. Test the appointment booking flow
3. Check that data is being saved to your Neon database

## Project Structure for Netlify

```
├── netlify/
│   └── functions/
│       └── api.ts          # Serverless API function
├── client/
│   ├── src/                # React frontend
│   ├── public/
│   │   └── _redirects      # SPA routing rules
│   └── index.html
├── netlify.toml            # Netlify configuration
└── dist/public/            # Built frontend (created during build)
```

## API Endpoints (After Deployment)

- `GET /api/` - API health check
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List appointments
- `GET /api/appointments/:id` - Get specific appointment
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - List contact submissions

## Troubleshooting

### "Function not found" errors
- Check that `netlify/functions/api.ts` exists
- Verify `netlify.toml` has correct functions directory

### Database connection errors
- Verify `DATABASE_URL` is set in Netlify environment variables
- Check that your Neon database is accessible
- Ensure tables were created correctly

### 404 errors on page refresh
- Verify `_redirects` file is in `client/public/`
- Check that redirects are in `netlify.toml`

### Build failures
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string from Neon |

## Free Tier Limits

**Netlify Free Tier:**
- 100GB bandwidth/month
- 300 build minutes/month
- 125k function invocations/month

**Neon Free Tier:**
- 0.5 GB storage
- 1 project
- Unlimited databases

Both are more than enough for a small to medium healthcare practice website!

---

## Need Help?

If you encounter issues:
1. Check [Netlify Docs](https://docs.netlify.com/)
2. Check [Neon Docs](https://neon.tech/docs)
3. Review build logs in Netlify dashboard
