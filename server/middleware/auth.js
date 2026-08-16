import Store from '../models/Store.js';

// Middleware to verify authenticated Shopify store
export const verifyShopifyAuth = async (req, res, next) => {
  try {
    // Get shop from query/headers/session
    const shop = req.query.shop || req.headers['x-shopify-shop'] || req.session?.shop;

    if (!shop) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No shop domain provided' 
      });
    }

    // Find store in database
    const store = await Store.findOne({ shopDomain: shop, isActive: true });

    if (!store) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Store not found or not authenticated' 
      });
    }

    // Attach store to request for downstream use
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

// Simplified auth for development/testing
export const verifyShopifyAuthSimple = async (req, res, next) => {
  try {
    const shop = req.query.shop || req.headers['x-shopify-shop'] || 'development-store.myshopify.com';
    
    let store = await Store.findOne({ shopDomain: shop });
    
    // Auto-create development store if not exists
    if (!store && process.env.NODE_ENV === 'development') {
      store = await Store.create({
        shopDomain: shop,
        shopName: 'Development Store',
        email: 'dev@example.com',
        accessToken: 'dev_token_' + Date.now(),
        isActive: true
      });
      console.log('Created development store:', shop);
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
