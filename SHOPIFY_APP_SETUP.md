# Shopify App Setup Guide

This guide explains how to configure Learnly as a Shopify embedded app with proper authentication.

## Prerequisites

1. **Shopify Partner Account**: [partners.shopify.com](https://partners.shopify.com)
2. **Development Store**: Create one in your Partner Dashboard
3. **Node.js**: v16 or higher
4. **MongoDB**: Local or Atlas instance

## Part 1: Create Shopify App

### 1.1 Create App in Partner Dashboard

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click **Apps** → **Create app**
3. Choose **Create app manually**
4. Enter app name: **Learnly LMS**
5. Click **Create**

### 1.2 Configure App URLs

You'll need a public HTTPS URL for your backend. Options:

**Development:**
- [ngrok](https://ngrok.com): `ngrok http 5000`
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [localtunnel](https://localtunnel.github.io/www/)

**Production:**
- Railway, Render, Heroku, etc.

Once you have your URL (e.g., `https://abc123.ngrok.io`):

1. In Shopify Partner Dashboard → Your App → **Configuration**
2. Set **App URL**: `https://abc123.ngrok.io/?shop={shop}`
3. Set **Allowed redirection URL(s)**:
   ```
   https://abc123.ngrok.io/api/auth
   https://abc123.ngrok.io/api/auth/callback
   ```

### 1.3 Get API Credentials

In **Configuration** tab:

1. Copy **Client ID** (this is your `SHOPIFY_API_KEY`)
2. Copy **Client secret** (this is your `SHOPIFY_API_SECRET`)

### 1.4 Configure App Embed

1. Go to **Configuration** → **Embedded app**
2. Enable **Embedded in Shopify admin**

### 1.5 Set API Scopes

1. Go to **Configuration** → **API access**
2. Add required scopes:
   - `read_products`
   - `write_products` (if you plan product integration)
   - `read_customers` (if you plan customer integration)

## Part 2: Backend Configuration

### 2.1 Environment Variables

Copy `server/.env.example` to `server/.env`:

```bash
cd server
cp .env.example .env
```

Update the values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/shopify-lms

# Shopify - FROM PARTNER DASHBOARD
SHOPIFY_API_KEY=your_client_id_here
SHOPIFY_API_SECRET=your_client_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_customers
SHOPIFY_HOST=abc123.ngrok.io

# Frontend
FRONTEND_URL=http://localhost:5173

# Session
SESSION_SECRET=generate_a_long_random_string_here
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Start Backend

```bash
npm run dev
```

Backend should run on `http://localhost:5000`

## Part 3: Frontend Configuration

### 3.1 Environment Variables

Copy `client/.env.example` to `client/.env`:

```bash
cd client
cp .env.example .env
```

Update the values:

```env
# Backend API
VITE_API_URL=http://localhost:5000

# Shopify - SAME API KEY AS BACKEND
VITE_SHOPIFY_API_KEY=your_client_id_here
```

**IMPORTANT**: Use the same `SHOPIFY_API_KEY` / `Client ID` for both backend and frontend.

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Build Frontend

```bash
npm run build
```

### 3.4 Serve Frontend

Development:
```bash
npm run dev
```

Production: Deploy the `dist` folder to:
- Vercel
- Netlify
- Cloudflare Pages
- Or serve via backend

## Part 4: Install App on Development Store

### 4.1 Get Installation URL

Your app installation URL format:
```
https://abc123.ngrok.io/api/auth?shop=your-dev-store.myshopify.com
```

Replace:
- `abc123.ngrok.io` with your actual public URL
- `your-dev-store` with your development store subdomain

### 4.2 Install App

1. Open installation URL in browser
2. You'll be redirected to Shopify authorization screen
3. Click **Install app**
4. You'll be redirected back to Learnly dashboard

### 4.3 Verify Installation

The app should:
- ✓ Load inside Shopify Admin
- ✓ Show Learnly dashboard
- ✓ Display shop information (top right)
- ✓ Allow creating courses, students, enrollments

## Part 5: Testing Authentication

### 5.1 Test Session Tokens

Open browser DevTools → Network tab:

1. Perform any action (create course, etc.)
2. Check API request headers
3. Should see: `Authorization: Bearer eyJh...` (session token)

### 5.2 Test Store Isolation

1. Install app on Store A
2. Create a course
3. Install app on Store B (different development store)
4. Verify Store B doesn't see Store A's course

### 5.3 Test Token Validation

Try accessing API without authentication:
```bash
curl http://localhost:5000/api/courses
```

Should return:
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```

## Part 6: Production Deployment

### 6.1 Backend Deployment

Recommended platforms:
- **Railway**: Easy Node.js + MongoDB deployment
- **Render**: Free tier available
- **Heroku**: Classic option
- **DigitalOcean App Platform**: Good performance

**Environment Variables to Set:**
```env
NODE_ENV=production
MONGODB_URI=<your_production_mongodb_uri>
SHOPIFY_API_KEY=<your_api_key>
SHOPIFY_API_SECRET=<your_api_secret>
SHOPIFY_SCOPES=read_products,write_products,read_customers
SHOPIFY_HOST=<your_production_backend_domain>
FRONTEND_URL=<your_production_frontend_url>
SESSION_SECRET=<strong_random_string>
```

### 6.2 Frontend Deployment

Update `client/.env.production`:
```env
VITE_API_URL=https://your-backend.railway.app
VITE_SHOPIFY_API_KEY=<your_api_key>
```

Deploy to:
- **Vercel**: `npm run build` then deploy `dist/`
- **Netlify**: Same process
- **Cloudflare Pages**: Same process

### 6.3 Update Shopify App URLs

In Partner Dashboard → Configuration:

1. **App URL**: `https://your-frontend.vercel.app/?shop={shop}`
2. **Allowed redirection URLs**:
   ```
   https://your-backend.railway.app/api/auth
   https://your-backend.railway.app/api/auth/callback
   ```

### 6.4 Production Session Storage

⚠️ **IMPORTANT**: The current implementation uses in-memory session storage.

For production, replace with Redis or database-backed storage:

**Option 1: Redis (Recommended)**
```javascript
// server/config/shopify.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const sessionStorage = {
  async storeSession(session) {
    await redis.set(`session:${session.id}`, JSON.stringify(session));
    return true;
  },
  async loadSession(id) {
    const data = await redis.get(`session:${id}`);
    return data ? JSON.parse(data) : null;
  },
  // ... implement other methods
};
```

**Option 2: MongoDB**
Create a Session model and store sessions in MongoDB.

## Troubleshooting

### Issue: "Missing or invalid authorization header"

**Cause**: Session token not being sent from frontend.

**Fix**:
1. Check browser console for App Bridge errors
2. Verify `VITE_SHOPIFY_API_KEY` matches backend `SHOPIFY_API_KEY`
3. Ensure `?host=` parameter is in URL
4. Check that app is loaded in embedded context

### Issue: "Invalid or expired session token"

**Cause**: Token validation failed.

**Fix**:
1. Verify `SHOPIFY_API_SECRET` is correct
2. Check system time is synchronized (JWT validation is time-sensitive)
3. Reinstall the app to get fresh credentials

### Issue: "Store not authenticated. Please reinstall the app."

**Cause**: Store not found in database.

**Fix**:
1. Reinstall app via `/api/auth?shop=your-store.myshopify.com`
2. Check MongoDB connection
3. Verify Store record was created in database

### Issue: App loads but shows blank page

**Cause**: App Bridge initialization failed.

**Fix**:
1. Check `?shop=` and `?host=` parameters in URL
2. Verify frontend is being served over HTTPS in production
3. Check browser console for errors

### Issue: "Unable to fetch live data from Shopify"

**Cause**: GraphQL API call failed.

**Fix**:
1. Check access token is valid
2. Verify API scopes are sufficient
3. Check Shopify API status

## Security Checklist

- ✓ `SHOPIFY_API_SECRET` never exposed to frontend
- ✓ `accessToken` marked as `select: false` in Store model
- ✓ Session tokens validated on every API request
- ✓ Store identity derived from validated Shopify context, not client input
- ✓ HTTPS used in production
- ✓ CORS configured to allow only your frontend domain
- ✓ MongoDB credentials never exposed to frontend

## Next Steps

1. **Test thoroughly** on development store
2. **Request production access** in Partner Dashboard
3. **Add webhooks** for app uninstall, shop update events
4. **Implement GDPR compliance** (customer data request/deletion webhooks)
5. **Add error tracking** (Sentry, Bugsnag)
6. **Set up monitoring** (UptimeRobot, etc.)
7. **Submit for app review** when ready for App Store

## Support

- Shopify API Docs: [shopify.dev](https://shopify.dev)
- App Bridge Docs: [shopify.dev/docs/apps/tools/app-bridge](https://shopify.dev/docs/apps/tools/app-bridge)
- Partner Support: [partners.shopify.com/support](https://partners.shopify.com/support)
