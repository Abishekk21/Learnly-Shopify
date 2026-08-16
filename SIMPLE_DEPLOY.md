# Simple Deployment Guide - No Shopify Setup Required

Since you're using **demo Shopify credentials** for development/testing, you can deploy the app **without a real Shopify app**. Perfect for portfolio and demonstration purposes!

---

## 🎯 What You Have

✅ **MongoDB Atlas** - Already configured!
- Connection: `mongodb+srv://abishekkarunamoorthi_db_user:...@cluster0.adduhfk.mongodb.net/shopify-lms`
- This is your production database

✅ **Demo Shopify Credentials** - Already set!
- API Key: `demo_api_key`
- Shop Domain: `development-store.myshopify.com`

---

## 🚀 Deployment Steps

### Part 1: Deploy Backend to Render (5 minutes)

#### Step 1: Sign Up for Render
1. Go to https://render.com/
2. Click "Get Started for Free"
3. Sign in with GitHub

#### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Click "Connect account" to connect GitHub
3. Select repository: `Abishekk21/Learnly-Shopify`
4. Click "Connect"

#### Step 3: Configure Service

**Basic Settings:**
```
Name: learnly-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Instance Type:**
- Select **"Free"** (enough for demo/portfolio)

#### Step 4: Add Environment Variables

Click "Add Environment Variable" for each one:

```env
NODE_ENV=production

PORT=10000

MONGODB_URI=mongodb+srv://abishekkarunamoorthi_db_user:UDjH6gEFhIVfFM6I@cluster0.adduhfk.mongodb.net/shopify-lms?retryWrites=true&w=majority

SHOPIFY_API_KEY=demo_api_key

SHOPIFY_API_SECRET=demo_api_secret

SHOPIFY_SCOPES=read_products,write_products,read_customers

SHOPIFY_HOST=your-service-name.onrender.com

FRONTEND_URL=https://your-netlify-site.netlify.app

SESSION_SECRET=shopify_lms_secret_key_12345_production
```

**Important Notes:**
- `SHOPIFY_HOST` - Replace with your actual Render URL (we'll update this after deploy)
- `FRONTEND_URL` - Replace with your Netlify URL (we'll update this after frontend deploy)
- All other values can stay as shown above

#### Step 5: Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for first deployment
3. Once deployed, you'll see: ✅ "Live" with a green dot
4. **Copy your backend URL**, looks like: `https://learnly-backend.onrender.com`

#### Step 6: Update Backend Environment Variables
1. Go back to your service
2. Click "Environment" in left sidebar
3. Update these two variables:
   - `SHOPIFY_HOST` = `learnly-backend.onrender.com` (without https://)
   - Keep `FRONTEND_URL` as is for now (we'll update after Netlify)
4. Click "Save Changes"

#### Step 7: Test Backend
Visit: `https://your-backend-url.onrender.com/health`

Should see:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

✅ **Backend deployed!**

---

### Part 2: Deploy Frontend to Netlify (3 minutes)

#### Step 1: Sign Up for Netlify
1. Go to https://www.netlify.com/
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Netlify

#### Step 2: Import Project
1. Click "Add new site" → "Import an existing project"
2. Click "Deploy with GitHub"
3. Authorize Netlify to access your repos (if asked)
4. Select: `Abishekk21/Learnly-Shopify`

#### Step 3: Configure Build Settings

Netlify will auto-detect from `netlify.toml`:
```
Base directory: client
Build command: npm run build
Publish directory: client/dist
```

✅ This should be automatically filled. Just verify it's correct.

#### Step 4: Add Environment Variables

Click "Show advanced" → "Add environment variable":

```env
VITE_API_URL = https://your-backend-url.onrender.com

VITE_SHOPIFY_API_KEY = demo_api_key

VITE_SHOP_DOMAIN = development-store.myshopify.com
```

**Important:**
- Replace `your-backend-url.onrender.com` with YOUR actual Render URL from Part 1
- Example: `https://learnly-backend.onrender.com`

#### Step 5: Deploy
1. Click "Deploy site"
2. Wait 3-5 minutes
3. You'll see: ✅ "Published" with green checkmark
4. **Copy your frontend URL**, looks like: `https://flourishing-trifle-abc123.netlify.app`

#### Step 6: Customize Site Name (Optional)
1. Click "Site settings"
2. Click "Change site name"
3. Enter: `abishek-learnly` or `learnly-demo`
4. Your new URL: `https://abishek-learnly.netlify.app`

#### Step 7: Update Backend with Frontend URL
1. Go back to **Render dashboard**
2. Select your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://abishek-learnly.netlify.app
   ```
5. Click "Save Changes"
6. Render will redeploy automatically (1-2 minutes)

✅ **Frontend deployed!**

---

## 🎉 You're Live!

Your app is now deployed and accessible:

**Frontend:** https://abishek-learnly.netlify.app (or your custom name)  
**Backend:** https://learnly-backend.onrender.com (or your custom name)

---

## 🧪 Test Your Deployed App

### 1. Open Your Frontend URL
Visit your Netlify URL in browser

### 2. Check Browser Console
- Press F12
- Go to "Console" tab
- Should see no red errors

### 3. Test Features
- ✅ View Dashboard (should load)
- ✅ View Courses page (with KPI cards)
- ✅ Create a new course
- ✅ View Students page
- ✅ Add a new student
- ✅ Go to Enrollments
- ✅ Enroll a student in a course
- ✅ Check all KPI numbers update

### 4. If You See Errors

**"Failed to load data" or API errors:**
- Check Network tab (F12)
- Look for failed requests to your backend
- Verify `VITE_API_URL` in Netlify matches your Render URL exactly

**Blank page:**
- Check Console tab (F12) for errors
- Verify build was successful in Netlify

**CORS errors:**
- Verify `FRONTEND_URL` in Render matches your Netlify URL exactly
- Make sure both URLs include `https://`

---

## 🐌 Important: Free Tier Sleep Mode

**Render Free Tier:** Your backend will "sleep" after 15 minutes of inactivity.

**What this means:**
- First request after sleep takes 30-60 seconds to "wake up"
- Subsequent requests are normal speed
- This is expected behavior on free tier

**Solution for Production:**
- Upgrade to Render Starter plan ($7/month) for always-on service
- OR use Render Cron Jobs to ping your backend every 10 minutes

---

## 📊 What You Built

✅ **Full-Stack MERN Application**
- React frontend with Shopify Polaris
- Express backend with MongoDB
- 16 animated KPI cards
- Complete CRUD operations
- Production-ready deployment

✅ **Completely Free Hosting**
- Netlify: Free (100GB bandwidth)
- Render: Free (750 hours/month)
- MongoDB Atlas: Free (512MB storage)
- **Total Cost: $0/month**

---

## 🔗 Share Your Project

Add these to your portfolio/resume:

**Live Demo:** https://abishek-learnly.netlify.app  
**GitHub:** https://github.com/Abishekk21/Learnly-Shopify  
**Tech Stack:** React, Node.js, Express, MongoDB, Shopify Polaris

**Features to Highlight:**
- Animated KPI cards with count-up effects
- Real-time dashboard analytics
- Responsive design with Polaris components
- RESTful API with MongoDB
- Production deployment on cloud platforms

---

## 🔧 Troubleshooting

### Backend Not Responding
**Problem:** API calls timeout or fail

**Solutions:**
1. Check Render logs:
   - Go to Render dashboard
   - Click your service
   - Click "Logs" tab
   - Look for errors

2. Verify MongoDB connection:
   - Check if MongoDB Atlas cluster is running
   - Verify IP whitelist includes 0.0.0.0/0
   - Test connection string

3. Check environment variables:
   - All required env vars set
   - No typos in URLs
   - MongoDB URI includes password

### Frontend Not Loading
**Problem:** Blank page or build failed

**Solutions:**
1. Check Netlify build logs:
   - Go to Netlify dashboard
   - Click "Deploys"
   - Click latest deploy
   - Read "Deploy log"

2. Verify environment variables:
   - `VITE_API_URL` set correctly
   - Backend URL includes `https://`
   - No trailing slashes

3. Check browser console:
   - F12 → Console tab
   - Look for specific error messages

### CORS Errors
**Problem:** "CORS policy" errors in console

**Solutions:**
1. Verify `FRONTEND_URL` in Render exactly matches Netlify URL
2. Include `https://` in both URLs
3. No trailing slashes
4. Wait 2 minutes after updating env vars for redeploy

---

## 🎯 Next Steps

### For Portfolio
- [ ] Add screenshots to README
- [ ] Create demo video
- [ ] Add project to LinkedIn
- [ ] Share on GitHub profile
- [ ] Add live demo link

### For Production Use
- [ ] Get real Shopify Partner account
- [ ] Create Shopify app
- [ ] Update API credentials
- [ ] Configure OAuth flow
- [ ] Upgrade to paid hosting tiers
- [ ] Add custom domain

---

## 💡 Tips

**Keep Backend Awake (Free Tier):**
Use a service like UptimeRobot to ping your backend every 5 minutes:
- Sign up at https://uptimerobot.com/
- Add monitor: `https://your-backend.onrender.com/health`
- Set interval: 5 minutes

**Monitor Deployments:**
- Both Render and Netlify send email notifications
- Check dashboards for deployment status
- Review logs if anything fails

**Update Code:**
1. Make changes locally
2. Commit: `git add . && git commit -m "your message"`
3. Push: `git push origin main`
4. Both Render and Netlify auto-deploy from GitHub!

---

## ✅ Deployment Complete!

**Your URLs:**
- 🌐 Frontend: https://your-site.netlify.app
- 🔧 Backend: https://your-backend.onrender.com
- 💾 Database: MongoDB Atlas (production)

**Status:** 🟢 LIVE and ready to share!

Congratulations on deploying your full-stack application! 🎉
