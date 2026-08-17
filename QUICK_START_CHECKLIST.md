# Quick Start Checklist

Use this checklist to get Learnly running with Shopify authentication.

## ☐ Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## ☐ Step 2: Set Up Environment Variables

### Backend (.env)
```bash
cd server
cp .env.example .env
# Edit .env with your actual values
```

**Required variables:**
- `MONGODB_URI` - Your MongoDB connection string
- `SHOPIFY_API_KEY` - From Partner Dashboard
- `SHOPIFY_API_SECRET` - From Partner Dashboard
- `SHOPIFY_SCOPES` - e.g., `read_products,write_products,read_customers`
- `SHOPIFY_HOST` - Your public backend URL (without https://)
- `FRONTEND_URL` - Your frontend URL

### Frontend (.env)
```bash
cd ../client
cp .env.example .env
# Edit .env with your actual values
```

**Required variables:**
- `VITE_API_URL` - Your backend URL
- `VITE_SHOPIFY_API_KEY` - Same as backend SHOPIFY_API_KEY

## ☐ Step 3: Set Up MongoDB

Choose one:

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
# Use: mongodb://localhost:27017/shopify-lms
```

**Option B: MongoDB Atlas (Free)**
1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to MONGODB_URI in .env

## ☐ Step 4: Set Up Public URL for Development

You need a public HTTPS URL for Shopify OAuth. Choose one:

**Option A: ngrok (Easiest)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 5000
# Copy the https URL (e.g., https://abc123.ngrok.io)
# Use this for SHOPIFY_HOST (without https://)
```

**Option B: Cloudflare Tunnel**
```bash
# Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
cloudflared tunnel --url http://localhost:5000
```

**Option C: localtunnel**
```bash
npm install -g localtunnel
lt --port 5000
```

## ☐ Step 5: Create Shopify App

1. Go to https://partners.shopify.com
2. Click **Apps** → **Create app**
3. Choose **Create app manually**
4. Name: **Learnly LMS**
5. Click **Create**

## ☐ Step 6: Configure App in Partner Dashboard

### Configuration → URLs

**App URL:**
```
https://your-ngrok-url/?shop={shop}
```

**Allowed redirection URL(s):**
```
https://your-ngrok-url/api/auth
https://your-ngrok-url/api/auth/callback
```

### Configuration → Embedded App

- ✓ Enable **Embedded in Shopify admin**

### Configuration → API Access

**Scopes** (add these):
- `read_products`
- `write_products`
- `read_customers`

### Configuration → App Credentials

1. Copy **Client ID** → This is your `SHOPIFY_API_KEY`
2. Copy **Client secret** → This is your `SHOPIFY_API_SECRET`
3. Add both to `server/.env`
4. Add Client ID to `client/.env` as `VITE_SHOPIFY_API_KEY`

## ☐ Step 7: Start Backend

```bash
cd server
npm run dev

# Should see:
# "Server running on port 5000"
# "Environment: development"
```

## ☐ Step 8: Build and Preview Frontend

```bash
cd ../client
npm run build
npm run preview

# Should see:
# "Local: http://localhost:4173"
```

**OR** run dev mode:
```bash
npm run dev
# "Local: http://localhost:5173"
```

## ☐ Step 9: Install App on Development Store

### Create Development Store (if needed)
1. Partner Dashboard → **Stores**
2. Click **Add store**
3. Choose **Development store**
4. Fill in details
5. Click **Save**

### Install App
1. Build installation URL:
   ```
   https://your-ngrok-url/api/auth?shop=your-dev-store.myshopify.com
   ```
2. Open URL in browser
3. You'll be redirected to Shopify
4. Click **Install app**
5. You should be redirected to Learnly dashboard

## ☐ Step 10: Verify Installation

### In Shopify Admin
- [ ] App appears in left sidebar under "Apps"
- [ ] Click app to open
- [ ] Learnly dashboard loads inside Shopify Admin
- [ ] Shop information displays (top right)

### In Browser DevTools
- [ ] Open Network tab
- [ ] Click around in Learnly (create course, etc.)
- [ ] Check API requests
- [ ] Should see: `Authorization: Bearer eyJh...` in request headers

### In MongoDB
- [ ] Check `stores` collection
- [ ] Should see your store document
- [ ] Has `shopDomain`, `accessToken`, `shopName`, etc.

### Test LMS Features
- [ ] Create a course
- [ ] Create a student
- [ ] Create an enrollment
- [ ] View dashboard statistics
- [ ] Refresh app - data persists

## ✓ Success!

If all checks pass, your Shopify authentication is working!

## 🔧 Troubleshooting

### Issue: "Missing or invalid authorization header"
**Fix**: Check that:
- `VITE_SHOPIFY_API_KEY` matches `SHOPIFY_API_KEY`
- URL has `?shop=` and `&host=` parameters
- App is loaded in embedded context (inside Shopify Admin)

### Issue: "Store not authenticated"
**Fix**: Reinstall the app:
```
https://your-ngrok-url/api/auth?shop=your-dev-store.myshopify.com
```

### Issue: App shows blank page
**Fix**: Check browser console for errors. Verify:
- Frontend built successfully
- Environment variables set correctly
- App Bridge initialized (check console logs)

### Issue: "Unable to fetch live data from Shopify"
**Fix**: Check:
- Access token is valid (check MongoDB)
- API scopes are sufficient
- Shopify API status: status.shopify.com

### Issue: ngrok URL keeps changing
**Fix**: Either:
- Get ngrok free account for persistent subdomain
- Update Partner Dashboard URLs each time ngrok restarts
- Use Cloudflare Tunnel (persistent URL)

## 📚 Next Steps

### For Development
- Keep ngrok/tunnel running while developing
- Backend restarts automatically with nodemon
- Frontend hot-reloads with Vite dev server
- Reinstall app if you change API scopes

### For Production
- See **SHOPIFY_APP_SETUP.md** for deployment guide
- Replace in-memory session storage with Redis
- Add webhook handlers
- Deploy to Railway/Render/Heroku
- Update Partner Dashboard with production URLs
- Test on development store before going live

## 📖 Full Documentation

- **SHOPIFY_APP_SETUP.md** - Complete setup and deployment guide
- **AUTHENTICATION_IMPLEMENTATION_REPORT.md** - Technical implementation details
- **AUTHENTICATION_FLOW.md** - Original authentication architecture (now updated)

## 🆘 Need Help?

1. Check browser console for errors
2. Check server terminal for errors
3. Check MongoDB connection
4. Check environment variables
5. Verify Partner Dashboard configuration
6. See troubleshooting in SHOPIFY_APP_SETUP.md
