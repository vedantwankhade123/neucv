# Google Search Console Setup Guide for NeuCV

## 🎯 Deployment & SEO Sequence

### **IMPORTANT: Do This In Order!**

1. **Complete Page Integrations** (15-30 minutes)
2. **Deploy to Netlify** (5-10 minutes)
3. **Submit to Google Search Console** (30 minutes)
4. **Monitor & Optimize** (Ongoing)

---

## Step 1: Complete Page SEO Integrations

Before deploying, add the `useSEO` hook to these 4 pages:

### Landing Page (`src/pages/Landing.tsx`)

Add after line 15 (after existing imports):
```typescript
import { useSEO } from '@/hooks/useSEO';
import { webApplicationSchema, organizationSchema, howToResumeSchema, faqSchema } from '@/data/structuredData';
```

Add inside the component (after line 26, after `const [stats, setStats] = ...`):
```typescript
  // SEO Configuration
  useSEO({
    title: 'NeuCV - Free AI Resume Builder & Interview Coach | Create Professional Resumes',
    description: 'Build professional resumes with AI-powered templates and ace your interviews with our AI Interview Coach. Free resume builder with 10+ templates, real-time preview, and PDF export.',
    keywords: 'resume builder, AI resume, CV maker, interview coach, free resume templates, professional CV, ATS resume',
    canonical: 'https://neucv.netlify.app/',
    ogImage: 'https://neucv.netlify.app/neucv-logo.png',
    ogUrl: 'https://neucv.netlify.app/',
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [webApplicationSchema, organizationSchema, howToResumeSchema, faqSchema]
    }
  });
```

### Dashboard/Home Page (`src/pages/Dashboard.tsx` OR `src/pages/Home.tsx`)

Add at top with imports:
```typescript
import { useSEO } from '@/hooks/useSEO';
```

Add inside component:
```typescript
  useSEO({
    title: 'Dashboard - NeuCV Resume Builder',
    description: 'Manage your resumes and practice interviews from your personalized dashboard.',
    canonical: 'https://neucv.netlify.app/dashboard'
  });
```

### Interview Coach (`src/pages/InterviewSetupPage.tsx`)

Add at top with imports:
```typescript
import { useSEO } from '@/hooks/useSEO';
import { interviewCoachSchema } from '@/data/structuredData';
```

Add inside component (around line 18, after `const [isGenerating, setIsGenerating] = ...`):
```typescript
  useSEO({
    title: 'AI Interview Coach - Practice & Master Your Interviews | NeuCV',
    description: 'Practice interviews with AI-powered coach. Get real-time feedback, voice interaction, and personalized questions tailored to your resume.',
    keywords: 'AI interview coach, interview practice, mock interview, interview preparation',
    canonical: 'https://neucv.netlify.app/dashboard/interview',
    ogImage: 'https://neucv.netlify.app/neucv-logo.png',
    structuredData: interviewCoachSchema
  });
```

### Settings Page (`src/pages/Settings.tsx`)

Add at top with imports:
```typescript
import { useSEO } from '@/hooks/useSEO';
```

Add inside component (early in the function):
```typescript
  useSEO({
    title: 'Settings - NeuCV',
    description: 'Manage your API keys and account settings for NeuCV resume builder.',
    canonical: 'https://neucv.netlify.app/settings'
  });
```

---

## Step 2: Test Locally (Optional but Recommended)

Before deploying, test on your local development server:

```bash
# Your server runs on http://localhost:8081
npm run dev
```

**What to Check:**
1. Visit each page (Landing, Templates, Dashboard, Interview Coach, Settings)
2. Right-click → "View Page Source"
3. Look in `<head>` for:
   - `<title>` tags updating correctly
   - `<meta name="description">` present
   - Open Graph tags (`<meta property="og:...">`)
   - Structured data (`<script type="application/ld+json">`)

**Quick Test:**
- Navigate between pages
- Open browser DevTools (F12) → Elements tab
- Watch `<head>` section - meta tags should update dynamically

---

## Step 3: Deploy to Netlify

### Option A: Git Push (Recommended)

If your Netlify is connected to your Git repository:

```bash
# Commit SEO changes
git add .
git commit -m "Add comprehensive SEO optimization"
git push origin main
```

Netlify will automatically build and deploy. Watch the deployment:
- Go to https://app.netlify.com
- Find your site
- Check "Deploys" tab
- Wait for "Published" status (usually 2-5 minutes)

### Option B: Manual Deploy

If not connected to Git:

```bash
# Build for production
npm run build

# The build creates a 'dist' folder
# Drag and drop 'dist' folder to Netlify's deploy interface
```

**After Deployment:**
1. Visit https://neucv.netlify.app
2. Verify site loads correctly
3. Check a few pages to ensure no errors

---

## Step 4: Verify Deployment Success

Before submitting to Google, make sure these files are accessible:

### Test These URLs:

✅ **Sitemap**: https://neucv.netlify.app/sitemap.xml
   - Should show XML file with all your routes

✅ **Robots.txt**: https://neucv.netlify.app/robots.txt
   - Should show sitemap reference

✅ **Logo/Images**: https://neucv.netlify.app/neucv-logo.png
   - Should display your logo

✅ **Main Pages**:
   - https://neucv.netlify.app/
   - https://neucv.netlify.app/templates
   - https://neucv.netlify.app/dashboard/interview

**If any URL returns 404**: Check your `public` folder and Netlify build settings.

---

## Step 5: Google Search Console Setup

### 5.1 Create/Login to Google Account

1. Go to https://search.google.com/search-console
2. Sign in with your Google account

### 5.2 Add Your Property

1. Click **"Add Property"** (top left)
2. Choose **"URL prefix"** (NOT "Domain")
3. Enter: `https://neucv.netlify.app`
4. Click **"Continue"**

### 5.3 Verify Ownership

Google will show several verification methods. **Recommended: HTML meta tag**

**Steps:**
1. Google provides a meta tag like:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```

2. Add it to your `index.html` in the `<head>` section:
   ```html
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     
     <!-- Google Search Console Verification -->
     <meta name="google-site-verification" content="YOUR_CODE_HERE" />
     
     <!-- Rest of your meta tags... -->
   </head>
   ```

3. Commit and deploy:
   ```bash
   git add index.html
   git commit -m "Add Google Search Console verification"
   git push origin main
   ```

4. Wait 2-3 minutes for Netlify to deploy

5. Go back to Google Search Console → Click **"Verify"**

✅ **You should see**: "Ownership verified"

---

## Step 6: Submit Sitemap

**After verification successful:**

1. In Google Search Console, go to **"Sitemaps"** (left sidebar)
2. In "Add a new sitemap" field, enter: `sitemap.xml`
3. Click **"Submit"**

**What happens:**
- Google will start crawling your sitemap
- Status will show "Success" (may take a few hours)
- Pages will begin appearing in "Coverage" report

---

## Step 7: Initial Monitoring (First 48 Hours)

### Check Coverage (Day 1-2)

1. Go to **"Coverage"** in Search Console
2. Look for:
   - ✅ "Valid" pages (your pages are indexed)
   - ⚠️ "Excluded" pages (might be normal for login/settings)
   - ❌ "Error" pages (need attention)

### Check URL Inspection (Immediately)

1. Go to **"URL Inspection"** (top bar)
2. Test a URL: `https://neucv.netlify.app/`
3. Click **"Request Indexing"** to fast-track

**Do this for your top pages:**
- Landing page: `/`
- Templates: `/templates`
- Interview Coach: `/dashboard/interview`

---

## Step 8: Validate SEO Implementation

### Test Open Graph Tags

**Facebook Debugger:**
1. Go to https://developers.facebook.com/tools/debug/
2. Enter: `https://neucv.netlify.app`
3. Click "Debug"
4. Should show your title, description, and logo image

**Twitter Card Validator:**
1. Go to https://cards-dev.twitter.com/validator
2. Enter: `https://neucv.netlify.app`
3. Should show preview card with image

### Test Structured Data

**Google Rich Results Test:**
1. Go to https://search.google.com/test/rich-results
2. Enter: `https://neucv.netlify.app`
3. Should detect:
   - WebApplication schema
   - Organization schema
   - FAQPage schema
   - HowTo schema

✅ **All should show "No errors"**

---

## Timeline & Expectations

| Phase | Timeline | What to Expect |
|-------|----------|----------------|
| **Verification** | Immediate | Ownership confirmed |
| **Sitemap Processing** | 2-24 hours | Google discovers your pages |
| **First Indexing** | 1-7 days | Pages appear in search |
| **First Rankings** | 1-4 weeks | Start appearing for keywords |
| **Stable Rankings** | 2-3 months | Consistent search visibility |

---

## Common Issues & Solutions

### Issue: Sitemap 404 Error
**Solution:**
- Verify `sitemap.xml` is in `public/` folder
- Check Netlify build logs
- Visit https://neucv.netlify.app/sitemap.xml directly

### Issue: Robots.txt Not Found
**Solution:**
- Verify `robots.txt` is in `public/` folder
- Should be at root: https://neucv.netlify.app/robots.txt

### Issue: Pages Not Indexing
**Solution:**
- Check `robots.txt` isn't blocking pages
- Use URL Inspection → "Request Indexing"
- Verify no `noindex` meta tags

### Issue: Images Not Loading in Previews
**Solution:**
- Verify image exists: https://neucv.netlify.app/neucv-logo.png
- Check image is at least 200x200px
- Use absolute URLs (https://...)

---

## Quick Reference Commands

```bash
# Test locally
npm run dev
# Visit: http://localhost:8081

# Build for production
npm run build

# Commit SEO changes
git add .
git commit -m "SEO optimization complete"
git push origin main

# View deployment
https://app.netlify.com
```

---

## Next Steps for Better SEO

### Week 1:
- ✅ Complete setup (you're almost there!)
- Monitor Google Search Console daily
- Fix any indexing errors

### Week 2-4:
- Create blog content about resume tips
- Get backlinks from relevant sites
- Share on social media
- Encourage user reviews

### Month 2-3:
- Analyze search queries in GSC
- Optimize underperforming pages
- Add more structured data
- Update content based on user searches

---

## Support Resources

- **Google Search Console Help**: https://support.google.com/webmasters
- **Structured Data Testing**: https://search.google.com/test/rich-results
- **Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Netlify Docs**: https://docs.netlify.com/

---

**You're Ready! 🚀**

1. Complete page integrations (above)
2. Deploy to Netlify
3. Add Google verification meta tag
4. Submit sitemap
5. Monitor for 48 hours

Your site will start appearing in Google within a week!
