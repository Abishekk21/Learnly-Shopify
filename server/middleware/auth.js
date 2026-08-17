import { getShopify, sessionStorage } from '../config/shopify.js';
import Store from '../models/Store.js';

/**
 * Middleware to verify Shopify session token (JWT) from embedded app
 * This validates the Authorization header containing the session token
 */
export const verifyShopifyAuth = async (req, res, next) => {
  try {
    const shopify = getShopify();
    
    // Extract session token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid authorization header' 
      });
    }

    const sessionToken = authHeader.replace('Bearer ', '');

    // Validate the session token with Shopify
    let payload;
    try {
      payload = await shopify.session.decodeSessionToken(sessionToken);
    } catch (error) {
      console.error('Session token validation failed:', error);
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or expired session token' 
      });
    }

    // Extract shop domain from validated payload
    const shop = payload.dest.replace('https://', '');

    // Find store in database
    const store = await Store.findOne({ shopDomain: shop, isActive: true });

    if (!store) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Store not authenticated. Please reinstall the app.' 
      });
    }

    // Attach authenticated store and session info to request
    req.store = store;
    req.shopDomain = shop;
    req.sessionToken = payload;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Authentication verification failed' 
    });
  }
};

/**
 * Development-only fallback middleware
 * Allows testing without full Shopify embedded context
 * DO NOT USE IN PRODUCTION
 */
export const verifyShopifyAuthSimple = async (req, res, next) => {
  // In production, always use proper session token auth
  if (process.env.NODE_ENV === 'production') {
    return verifyShopifyAuth(req, res, next);
  }

  try {
    const shop = req.query.shop || req.headers['x-shopify-shop'];
    
    if (!shop) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No shop domain provided (dev mode)' 
      });
    }
    
    let store = await Store.findOne({ shopDomain: shop });
    
    // Auto-create development store if not exists (dev only)
    if (!store && process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Development mode: Auto-creating store for', shop);
      store = await Store.create({
        shopDomain: shop,
        shopName: 'Development Store',
        email: 'dev@example.com',
        accessToken: 'dev_token_' + Date.now(),
        isActive: true
      });
    }

    if (!store) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Store not found' 
      });
    }

    req.store = store;
    req.shopDomain = shop;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Authentication verification failed' 
    });
  }
};
