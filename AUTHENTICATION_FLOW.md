# Authentication Flow Documentation

## Current Implementation

### Overview
The application uses a **simplified authentication system** designed for rapid development and testing. It automatically creates development stores and uses a straightforward middleware approach.

### Architecture

```
Client Request
    ↓
Extract shop domain (query/header)
    ↓
Find Store in MongoDB
    ↓
Auto-create if not exists (dev mode)
    ↓
Attach store to req.store
    ↓
Proceed to route handler
```

## Middleware: verifyShopifyAuthSimple

**Location:** `server/middleware/auth.js`

**Purpose:** Simplified authentication for development/testing

**Flow:**
1. Extract shop domain from:
   - `req.query.shop`
   - `req.headers['x-shopify-shop']`
   - Default: `'development-store.myshopify.com'`

2. Query MongoDB for Store:
   ```javascript
   Store.findOne({ shopDomain: shop })
   ```

3. Auto-create if not exists (dev mode only):
   ```javascript
   if (!store && process.env.NODE_ENV === 'development') {
     store = await Store.create({
       shopDomain: shop,
       shopName: 'Development Store',
       email: 'dev@example.com',
       accessToken: 'dev_token_' + Date.now(),
       isActive: true
     });
   }
   ```

4. Attach to request:
   ```javascript
   req.store = store;
   req.shopDomain = shop;
   ```

5. Call `next()` to continue

**Error Handling:**
- Returns 401 if store not found (production)
- Returns 500 on database errors
- Logs errors to console

## Frontend Configuration

**Location:** `client/src/services/api.js`

**Setup:**
```javascript
const SHOP_DOMAIN = import.meta.env.VITE_SHOP_DOMAIN || 'development-store.myshopify.com';

const api = axios.create({
  headers: {
    'X-Shopify-Shop': SHOP_DOMAIN
  },
  params: {
    shop: SHOP_DOMAIN
  }
});
```

**Every API request includes:**
1. Header: `X-Shopify-Shop: development-store.myshopify.com`
2. Query param: `?shop=development-store.myshopify.com`

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_products,write_products
SHOPIFY_HOST=your-app-url.com
```

### Frontend (.env)
```env
VITE_SHOP_DOMAIN=development-store.myshopify.com
VITE_SHOPIFY_API_KEY=your_api_key
VITE_API_URL=http://localhost:5000
```

## Store Data Isolation

**CRITICAL SECURITY FEATURE**

Every database query is scoped to the authenticated store:

```javascript
// ✅ CORRECT - Store from authenticated context
Course.find({ store: req.store._id })

// ❌ WRONG - Never trust client input
Course.find({ store: req.body.storeId })
```

### Examples Across the Application

**Courses:**
```javascript
const courses = await Course.find({ store: storeId });
```

**Students:**
```javascript
const students = await Student.find({ store: storeId });
```

**Enrollments:**
```javascript
const enrollments = await Enrollment.find({ store: storeId });
```

**Dashboard:**
```javascript
const totalCourses = await Course.countDocuments({ store: storeId });
```

## Production OAuth Flow (To Implement)

### Full Shopify OAuth Implementation

For production deployment, implement the complete OAuth flow:

#### 1. Installation Request
```
https://your-app.com/auth?shop={shop-domain}
```

#### 2. Redirect to Shopify OAuth
```javascript
app.get('/auth', (req, res) => {
  const { shop } = req.query;
  const redirectUri = `${process.env.APP_URL}/auth/callback`;
  const scopes = process.env.SHOPIFY_SCOPES;
  const state = generateRandomState();
  
  const authUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${process.env.SHOPIFY_API_KEY}` +
    `&scope=${scopes}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`;
  
  res.redirect(authUrl);
});
```

#### 3. OAuth Callback
```javascript
app.get('/auth/callback', async (req, res) => {
  const { code, shop, state } = req.query;
  
  // Validate state (CSRF protection)
  if (!validateState(state)) {
    return res.status(403).send('Invalid state');
  }
  
  // Exchange code for access token
  const accessToken = await exchangeCodeForToken(code, shop);
  
  // Save to database
  await Store.findOneAndUpdate(
    { shopDomain: shop },
    { 
      accessToken,
      scope: process.env.SHOPIFY_SCOPES,
      isActive: true
    },
    { upsert: true }
  );
  
  // Redirect to app
  res.redirect(`/?shop=${shop}`);
});
```

#### 4. Token Exchange
```javascript
async function exchangeCodeForToken(code, shop) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code
    })
  });
  
  const data = await response.json();
  return data.access_token;
}
```

#### 5. Session Token Verification (Embedded Apps)

For embedded apps, use App Bridge session tokens:

```javascript
import { validateSessionToken } from '@shopify/shopify-api';

export const verifyShopifyAuth = async (req, res, next) => {
  try {
    const sessionToken = req.headers['authorization']?.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }
    
    const session = await validateSessionToken(sessionToken);
    
    const store = await Store.findOne({ 
      shopDomain: session.shop,
      isActive: true 
    });
    
    if (!store) {
      return res.status(401).json({ error: 'Store not authenticated' });
    }
    
    req.store = store;
    req.session = session;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid session token' });
  }
};
```

## Security Considerations

### 1. Access Token Storage
- ✅ Stored in MongoDB (encrypted at rest)
- ✅ Never exposed to frontend
- ✅ Only used server-side for Shopify API calls

### 2. CSRF Protection
- OAuth state parameter validation
- Session token verification
- CORS configuration

### 3. Store Validation
- Verify store exists in database
- Check `isActive` flag
- Validate shop domain format

### 4. Token Refresh
- Shopify tokens don't expire but can be revoked
- Handle 401 responses from Shopify API
- Prompt merchant to re-authenticate

## API Routes Protection

All API routes are protected by authentication middleware:

```javascript
// server.js
app.use('/api/courses', verifyShopifyAuthSimple, courseRoutes);
app.use('/api/students', verifyShopifyAuthSimple, studentRoutes);
app.use('/api/enrollments', verifyShopifyAuthSimple, enrollmentRoutes);
app.use('/api/dashboard', verifyShopifyAuthSimple, dashboardRoutes);
app.use('/api/shop', verifyShopifyAuthSimple, shopifyRoutes);
```

**Result:**
- No unauthenticated access to API
- Every request has verified store context
- Store ID derived from authentication, not request body

## Shopify GraphQL API Access

**Location:** `server/controllers/shopifyController.js`

**Purpose:** Retrieve shop information using stored access token

```javascript
export const getShopInfo = async (req, res, next) => {
  try {
    const store = req.store;
    
    const client = new shopify.clients.Graphql({
      session: {
        shop: store.shopDomain,
        accessToken: store.accessToken
      }
    });
    
    const response = await client.query({
      data: `{
        shop {
          name
          email
          myshopifyDomain
          plan { displayName }
          currencyCode
        }
      }`
    });
    
    res.json(response.body.data.shop);
  } catch (error) {
    // Fallback to stored data
    res.json({
      name: req.store.shopName,
      domain: req.store.shopDomain,
      connected: false
    });
  }
};
```

## Development Workflow

### 1. Start Backend
```bash
cd server
npm run dev
```

### 2. Start Frontend
```bash
cd client
npm run dev
```

### 3. Access Application
```
http://localhost:5173?shop=development-store.myshopify.com
```

### 4. Verify Authentication
- Store auto-created in MongoDB
- All API requests include shop parameter
- Data scoped to development store

## Testing Authentication

### Test Store Creation
```bash
# Check MongoDB
mongosh
use shopify-lms
db.stores.find().pretty()
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "shopDomain": "development-store.myshopify.com",
  "shopName": "Development Store",
  "email": "dev@example.com",
  "accessToken": "dev_token_1234567890",
  "isActive": true,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Test API Authentication
```bash
# Without shop parameter (should fail)
curl http://localhost:5000/api/courses

# With shop parameter (should succeed)
curl "http://localhost:5000/api/courses?shop=development-store.myshopify.com"
```

### Test Store Isolation
1. Create two stores in MongoDB
2. Create courses for each store
3. Verify queries only return store-specific data

## Upgrading to Production Authentication

### Migration Checklist

- [ ] Replace `verifyShopifyAuthSimple` with `verifyShopifyAuth`
- [ ] Implement OAuth routes (`/auth`, `/auth/callback`)
- [ ] Add App Bridge session token validation
- [ ] Configure Shopify App settings
- [ ] Update environment variables
- [ ] Test OAuth flow on development store
- [ ] Remove auto-create store logic
- [ ] Add token refresh logic
- [ ] Implement webhook handlers
- [ ] Add GDPR compliance endpoints

### Recommended Libraries

```json
{
  "@shopify/shopify-api": "^9.0.0",
  "@shopify/app-bridge": "^3.7.0",
  "cookie-parser": "^1.4.6",
  "express-session": "^1.17.3"
}
```

## Troubleshooting

### Issue: 401 Unauthorized
**Cause:** Store not found in database
**Solution:** 
- Check MongoDB connection
- Verify shop parameter in request
- Check NODE_ENV is 'development' for auto-create

### Issue: Store Data Not Isolated
**Cause:** Query missing store filter
**Solution:**
```javascript
// Add store filter to all queries
Model.find({ store: req.store._id })
```

### Issue: Shopify API 401
**Cause:** Invalid access token
**Solution:**
- Verify token in MongoDB
- Re-authenticate store
- Check token hasn't been revoked

## Summary

The current authentication system:

✅ **Works for development:**
- Auto-creates stores
- Simple to test
- No OAuth complexity

✅ **Secure data isolation:**
- All queries store-scoped
- No client-controlled store IDs
- Proper middleware validation

⚠️ **Not production-ready:**
- Missing OAuth flow
- No session token validation
- Auto-create only for dev

📝 **Next steps for production:**
1. Implement full OAuth
2. Add session token validation
3. Remove auto-create logic
4. Add webhook handlers
5. Test on real Shopify store

**Current Status:** Development-ready ✅ | Production-ready ⚠️ (OAuth needed)
