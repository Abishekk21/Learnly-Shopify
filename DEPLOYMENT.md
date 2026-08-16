# Deployment Guide

## Prerequisites

- MongoDB Atlas account (or MongoDB server)
- Hosting platform account (Render, Railway, Vercel, etc.)
- Shopify Partner account
- Shopify Development Store

## Step 1: Prepare MongoDB

### Option A: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create database user with password
4. Whitelist IP addresses (or allow from anywhere: `0.0.0.0/0`)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/shopify-lms
   ```

### Option B: Self-hosted MongoDB

Set up MongoDB on your server and get connection string:
```
mongodb://<host>:<port>/shopify-lms
```

## Step 2: Deploy Backend

### Using Render

1. Go to [Render Dashboard](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure:
   - **Name:** `shopify-lms-api`
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free or Starter

5. Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your_mongodb_connection_string>
   SHOPIFY_API_KEY=<your_shopify_api_key>
   SHOPIFY_API_SECRET=<your_shopify_api_secret>
   SHOPIFY_SCOPES=read_products,write_products,read_customers
   SHOPIFY_HOST=<your_backend_url>
   FRONTEND_URL=<your_frontend_url>
   SESSION_SECRET=<generate_random_string>
   ```

6. Deploy

7. Note your backend URL (e.g., `https://shopify-lms-api.onrender.com`)

### Using Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select repository and configure:
   - **Root Directory:** `server`
   - **Start Command:** `npm start`

4. Add environment variables (same as Render)
5. Deploy

### Using Heroku

```bash
cd server
heroku create shopify-lms-api
heroku config:set MONGODB_URI=<connection_string>
heroku config:set SHOPIFY_API_KEY=<key>
# ... set other env vars
git push heroku main
```

## Step 3: Deploy Frontend

### Using Vercel (Recommended for Vite)

1. Go to [Vercel Dashboard](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=<your_backend_url>
   VITE_SHOPIFY_API_KEY=<your_shopify_api_key>
   VITE_SHOP_DOMAIN=<your_shopify_store>.myshopify.com
   ```

6. Deploy

7. Note your frontend URL (e.g., `https://shopify-lms.vercel.app`)

### Using Netlify

1. Go to [Netlify](https://netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Configure:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`

4. Add environment variables (same as Vercel)
5. Deploy

## Step 4: Configure Shopify App

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Navigate to your app (or create new one)
3. Update App URLs:
   ```
   App URL: <your_frontend_url>
   Allowed redirection URL(s): <your_frontend_url>/auth/callback
   ```

4. Update API scopes if needed
5. Copy API credentials to environment variables

## Step 5: Update Backend CORS

Update `server/server.js` CORS configuration:

```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://your-shopify-store.myshopify.com'
  ],
  credentials: true
}));
```

## Step 6: Seed Production Data (Optional)

```bash
# SSH into your backend server or run locally with production DB
cd server
npm run seed
```

Or create data through the UI after deployment.

## Step 7: Test Deployment

1. Visit your frontend URL
2. Check that it loads without errors
3. Test all CRUD operations:
   - Create course
   - Create student
   - Create enrollment
   - View dashboard statistics
   - Test Shopify integration

4. Check backend health:
   ```
   GET https://your-backend-url.com/health
   ```

5. Test API endpoints with shop parameter:
   ```
   GET https://your-backend-url.com/api/courses?shop=your-store.myshopify.com
   ```

## Troubleshooting

### CORS Errors
- Verify CORS origin in backend matches frontend URL
- Check that credentials are enabled
- Ensure HTTPS is used in production

### MongoDB Connection
- Verify connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Shopify Authentication
- Verify API keys are correct
- Check app URLs in Shopify Partners dashboard
- Ensure scopes are properly configured

### Environment Variables
- Double-check all env vars are set correctly
- Restart services after changing env vars
- Check for typos in variable names

### Build Errors
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Review build logs for specific errors

## Security Checklist

- [ ] All environment variables set correctly
- [ ] MongoDB connection uses authentication
- [ ] IP whitelist configured (if applicable)
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Session secret is strong and random
- [ ] No secrets committed to Git
- [ ] Error messages don't expose system details

## Performance Optimization

1. **Database Indexes:** Ensure all indexes are created (happens automatically with Mongoose)
2. **Caching:** Consider Redis for session storage at scale
3. **CDN:** Use CDN for frontend assets
4. **Compression:** Enable gzip compression on backend
5. **Rate Limiting:** Add rate limiting for API endpoints

## Monitoring (Recommended)

1. **Error Tracking:** Sentry, Rollbar, or similar
2. **Performance Monitoring:** New Relic, DataDog
3. **Uptime Monitoring:** UptimeRobot, Pingdom
4. **Log Aggregation:** Papertrail, Loggly

## Backup Strategy

1. **MongoDB Atlas:** Enable automated backups
2. **Self-hosted:** Set up regular backup cron jobs
3. **Code:** Push to Git regularly
4. **Environment Variables:** Store securely in password manager

## Scaling Considerations

- Use horizontal scaling for backend (load balancer)
- Implement caching layer (Redis)
- Use connection pooling for MongoDB
- Consider serverless functions for specific operations
- Implement job queue for background tasks

## Cost Estimates

**Free Tier:**
- MongoDB Atlas: 512MB storage
- Render: 750 hours/month
- Vercel: Unlimited bandwidth for personal projects

**Production:**
- MongoDB Atlas: $9+/month
- Render Standard: $7+/month
- Vercel Pro: $20/month
- Total: ~$36+/month

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Shopify App Documentation](https://shopify.dev/docs/apps)
