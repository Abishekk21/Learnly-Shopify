# Complete Deployment Guide - Learnly Shopify LMS

This guide will walk you through deploying your application to production using Netlify (Frontend) and Render (Backend).

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ Code pushed to GitHub: https://github.com/Abishekk21/Learnly-Shopify
- ✅ MongoDB Atlas account (free tier available)
- ✅ Netlify account (free tier available)
- ✅ Render account (free tier available) OR Railway account
- ✅ Shopify Partner account with app credentials

---

## Part 1: Deploy Backend to Render

### Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign in or create a free account
3. Click "Build a Database"
4. Choose "FREE" tier (M0)
5. Select your preferred region (choose closest to your users)
6. Click "Create Cluster"

**Configure Database Access:**
7. Go to "Database Access" in left sidebar
8. Click "Add New Database User"
9. Choose "Password" authentication
10. Username: `learnly-admin`
11. Password: Generate a secure password (save it!)
12. Database User Privileges: "Atlas admin"
13. Click "Add User"

**Configure Network Access:**
14. Go to "Network Access" in left sidebar
15. Click "Add IP Address"
16. Click "Allow Access from Anywhere" (for now - 0.0.0.0/0)
17. Click "Confirm"

**Get Connection String:**
18. Go to "Database" in left sidebar
19. Click "Connect" on your cluster
20. Choose "Connect your application"
21. Copy the connection string (looks like):
    ```
    mongodb+srv://learnly-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
22. Replace `<password>` with your actual password
23. Add database name before `?`: `/shopify-lms?retryWrites=true&w=majority`

**Final connection string example:**
```
mongodb+srv://learnly-admin:yourPassword123@cluster0.xxxxx.mongodb.net/shopify-lms?retryWrites=true&w=majority
```

---

### Step 2: Deploy Backend to Render

1. Go to https://render.com/
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository: `Abishekk21/Learnly-Shopify`
5. Configure the service:

**Basic Settings:**
- **Name:** `learnly-backend` (or your choice)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `server`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select "Free" tier (enough for testing/demo)

**Environment Variables** (Click "Add Environment Variable" for each):

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://learnly-admin:yourPassword@cluster0.xxxxx.mongodb.net/shopify-lms?retryWrites=true&w=majority
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_customers
SHOPIFY_HOST=learnly-backend.onrender.com
FRONTEND_URL=https://your-app-name.netlify.app
SESSION_SECRET=generate-random-32-character-string-here
```

**Important Notes:**
- Replace MongoDB URI with YOUR actual connection string
- Get Shopify API Key/Secret from Shopify Partner Dashboard
- `FRONTEND_URL` will be your Netlify URL (we'll update this after frontend deployment)
- For `SESSION_SECRET`, use a random 32+ character string

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes for first deploy)
8. Once deployed, copy your backend URL: `https://learnly-backend.onrender.com`

**Test Backend:**
Visit: `https://learnly-backend.onrender.com/health`

You should see: `{ "status": "ok", "message": "Server is running" }`

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Prepare for Deployment

Your repository already has `netlify.toml` configuration file that tells Netlify:
- Build directory: `client/`
- Build command: `npm run build`
- Output directory: `dist/`
- SPA redirect rules

### Step 2: Deploy to Netlify

1. Go to https://www.netlify.com/
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose "Deploy with GitHub"
5. Authorize Netlify to access your repositories
6. Select repository: `Abishekk21/Learnly-Shopify`

**Configure Build Settings:**

Netlify should auto-detect the settings from `netlify.toml`, but verify:
- **Base directory:** `client`
- **Build command:** `npm run build`
- **Publish directory:** `client/dist`

**Environment Variables:**

Click "Show advanced" → "Add environment variable" for each:

```env
VITE_API_URL=https://learnly-backend.onrender.com
VITE_SHOPIFY_API_KEY=your_shopify_api_key
VITE_SHOP_DOMAIN=your-development-store.myshopify.com
```

**Important:**
- Use your ACTUAL Render backend URL (from Part 1)
- Use your Shopify API key
- Use your Shopify development store domain

7. Click "Deploy site"
8. Wait for deployment (3-5 minutes)
9. Once deployed, Netlify will give you a URL like: `https://random-name-123.netlify.app`

### Step 3: Customize Netlify Domain (Optional)

1. In Netlify dashboard, go to "Site settings"
2. Click "Change site name"
3. Choose a name like: `learnly-shopify` or `abishek-learnly`
4. Your URL will become: `https://learnly-shopify.netlify.app`

### Step 4: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://learnly-shopify.netlify.app
   ```
5. Click "Save Changes"
6. Render will automatically redeploy with new settings

---

## Part 3: Configure Shopify App

### Update App URLs in Shopify Partner Dashboard

1. Go to https://partners.shopify.com/
2. Go to "Apps" → Select your app
3. Click "Configuration"

**Update URLs:**
- **App URL:** `https://learnly-shopify.netlify.app`
- **Allowed redirection URL(s):** 
  ```
  https://learnly-shopify.netlify.app/auth/callback
  https://learnly-shopify.netlify.app
  ```

4. Click "Save"

---

## Part 4: Test Your Deployed Application

### 1. Test Backend API

Visit: `https://learnly-backend.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2. Test Frontend

Visit: `https://learnly-shopify.netlify.app`

You should see the Learnly dashboard loading.

### 3. Test Full Integration

1. Open browser console (F12)
2. Check for any API errors
3. Try creating a course
4. Try adding a student
5. Try enrolling a student in a course
6. Verify all KPI cards show correct data

---

## Part 5: Seed Demo Data (Optional)

If you want to add demo data to your production database:

1. Clone your repository locally (if not already)
2. Update `server/.env` with production MongoDB URI
3. Run:
   ```bash
   cd server
   npm install
   node scripts/seed.js
   ```

**OR** use Render Shell:
1. In Render dashboard, click on your service
2. Click "Shell" tab
3. Run:
   ```bash
   node scripts/seed.js
   ```

---

## 🎯 Deployment Checklist

### Backend (Render)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied
- [ ] Render web service created
- [ ] All environment variables set
- [ ] Service deployed successfully
- [ ] Health check endpoint working
- [ ] Backend URL saved

### Frontend (Netlify)
- [ ] netlify.toml file in repository
- [ ] Site created on Netlify
- [ ] Build settings configured
- [ ] Environment variables set (with backend URL)
- [ ] Site deployed successfully
- [ ] Custom domain set (optional)
- [ ] Frontend URL saved
- [ ] Backend updated with frontend URL

### Shopify Integration
- [ ] App URLs updated in Partner Dashboard
- [ ] Redirect URLs configured
- [ ] API credentials in environment variables
- [ ] OAuth flow tested

### Testing
- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] API calls work (check browser console)
- [ ] Create course works
- [ ] Create student works
- [ ] Create enrollment works
- [ ] KPI cards display data
- [ ] Dashboard shows statistics

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** Health check returns 404
- **Solution:** Check if `Start Command` is `npm start` in Render
- **Solution:** Verify `server/package.json` has correct start script

**Problem:** MongoDB connection fails
- **Solution:** Check MongoDB URI is correct
- **Solution:** Verify IP whitelist includes 0.0.0.0/0
- **Solution:** Check username/password are correct

**Problem:** CORS errors
- **Solution:** Verify `FRONTEND_URL` in backend env matches Netlify URL exactly
- **Solution:** Check if CORS is properly configured in `server/server.js`

### Frontend Issues

**Problem:** Build fails on Netlify
- **Solution:** Check build logs in Netlify dashboard
- **Solution:** Verify `client/package.json` has correct dependencies
- **Solution:** Check Node version (should be 18+)

**Problem:** Blank page after deployment
- **Solution:** Check browser console for errors
- **Solution:** Verify `VITE_API_URL` is set correctly
- **Solution:** Check if backend is running

**Problem:** API calls fail (CORS errors)
- **Solution:** Verify backend `FRONTEND_URL` matches Netlify URL
- **Solution:** Check browser console for exact error
- **Solution:** Verify backend is deployed and running

### Integration Issues

**Problem:** "Failed to load dashboard data"
- **Solution:** Check if backend is running
- **Solution:** Verify API URL in frontend env
- **Solution:** Check browser Network tab for failed requests
- **Solution:** Verify MongoDB connection is active

---

## 📊 Monitoring & Logs

### View Backend Logs (Render)
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Watch for errors

### View Frontend Logs (Netlify)
1. Go to Netlify dashboard
2. Select your site
3. Click "Deploys"
4. Click latest deploy → "Deploy log"

### View Frontend Runtime Errors
- Open browser console (F12)
- Check "Console" tab for JavaScript errors
- Check "Network" tab for failed API calls

---

## 🚀 Post-Deployment

### Custom Domain (Optional)

**For Netlify:**
1. Buy domain from Namecheap, Google Domains, etc.
2. In Netlify: Site settings → Domain management → Add custom domain
3. Follow DNS configuration instructions

**For Render:**
1. In Render: Service → Settings → Custom domains
2. Add your custom domain
3. Update DNS records with your domain provider

### SSL Certificates
- Both Netlify and Render provide free SSL automatically
- Your sites will be HTTPS by default

### Performance Monitoring
- Use Netlify Analytics (paid)
- Use Google Analytics (free)
- Monitor Render metrics in dashboard

---

## 💰 Cost Estimate

**Free Tier (For Testing/Demo):**
- MongoDB Atlas: FREE (512 MB storage)
- Render: FREE (750 hours/month, sleeps after 15 min inactivity)
- Netlify: FREE (100 GB bandwidth/month)

**Total: $0/month** for testing and demos!

**Production Tier (For Real Users):**
- MongoDB Atlas: ~$57/month (M10 cluster)
- Render: ~$7/month (Starter plan, always running)
- Netlify: FREE or ~$19/month (Pro for custom domain/analytics)

**Total: ~$64-83/month** for production

---

## 🎉 You're Done!

Your Learnly Shopify LMS is now deployed and accessible at:

**Frontend:** https://learnly-shopify.netlify.app  
**Backend:** https://learnly-backend.onrender.com

Share your app URL with others and start managing courses, students, and enrollments!

---

## 📞 Need Help?

**Common Resources:**
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com/
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- Shopify App Docs: https://shopify.dev/docs/apps

**Check Logs First:**
- Backend logs in Render dashboard
- Frontend build logs in Netlify
- Browser console (F12) for frontend errors
- Network tab (F12) for API call failures
