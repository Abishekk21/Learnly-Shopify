import express from 'express';
import { getShopify, sessionStorage } from '../config/shopify.js';
import Store from '../models/Store.js';

const router = express.Router();

/**
 * GET /api/auth
 * Initiates the OAuth flow for app installation
 */
router.get('/auth', async (req, res) => {
  try {
    const shopify = getShopify();
    const shop = shopify.utils.sanitizeShop(req.query.shop);

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop parameter' });
    }

    // Begin OAuth
    await shopify.auth.begin({
      shop,
      callbackPath: '/api/auth/callback',
      isOnline: false, // Offline access for long-term API access
      rawRequest: req,
      rawResponse: res,
    });

  } catch (error) {
    console.error('Auth begin error:', error);
    res.status(500).json({ 
      error: 'Authentication initialization failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/auth/callback
 * Handles OAuth callback from Shopify
 */
router.get('/auth/callback', async (req, res) => {
  try {
    const shopify = getShopify();

    // Complete OAuth and get session
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = callback;

    // Store session
    await sessionStorage.storeSession(session);

    // Update or create Store record in database
    const storeData = {
      shopDomain: session.shop,
      accessToken: session.accessToken,
      scope: session.scope,
      isActive: true,
    };

    // Get shop info to populate name and email
    try {
      const client = new shopify.clients.Graphql({ session });
      const response = await client.query({
        data: `{
          shop {
            name
            email
            myshopifyDomain
          }
        }`
      });

      const shopData = response.body.data.shop;
      storeData.shopName = shopData.name;
      storeData.email = shopData.email;
    } catch (apiError) {
      console.error('Failed to fetch shop details:', apiError);
      // Use fallback values
      storeData.shopName = session.shop;
      storeData.email = `admin@${session.shop}`;
    }

    // Upsert store record (need to explicitly handle accessToken since it's select: false)
    await Store.findOneAndUpdate(
      { shopDomain: session.shop },
      { $set: storeData },
      { upsert: true, new: true }
    );

    console.log(`✓ Store authenticated: ${session.shop}`);

    // Redirect to frontend app with embedded parameters
    const host = req.query.host;
    const frontendUrl = process.env.FRONTEND_URL || 'https://learnly-lms.netlify.app';
    const redirectUrl = `${frontendUrl}/?shop=${session.shop}&host=${host}`;
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ 
      error: 'Authentication callback failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/auth/status
 * Check authentication status (for debugging)
 */
router.get('/auth/status', async (req, res) => {
  const shop = req.query.shop;
  
  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }

  try {
    const store = await Store.findOne({ shopDomain: shop, isActive: true });
    const sessions = await sessionStorage.findSessionsByShop(shop);

    res.json({
      authenticated: !!store,
      shop,
      hasStore: !!store,
      hasSessions: sessions.length > 0,
      sessionCount: sessions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
