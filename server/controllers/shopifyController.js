import shopify from '../config/shopify.js';
import Store from '../models/Store.js';

export const getShopInfo = async (req, res, next) => {
  try {
    const store = req.store;

    // Fetch the store with accessToken explicitly (since it's select: false)
    const storeWithToken = await Store.findById(store._id).select('+accessToken');

    if (!storeWithToken || !storeWithToken.accessToken) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Store access token not found. Please reinstall the app.'
      });
    }

    // Create Shopify GraphQL client with authenticated session
    const client = new shopify.clients.Graphql({
      session: {
        shop: storeWithToken.shopDomain,
        accessToken: storeWithToken.accessToken
      }
    });

    // Query shop information from Shopify
    const response = await client.query({
      data: `{
        shop {
          name
          email
          myshopifyDomain
          plan {
            displayName
          }
          currencyCode
        }
      }`
    });

    const shopData = response.body.data.shop;

    res.json({
      name: shopData.name,
      email: shopData.email,
      domain: shopData.myshopifyDomain,
      plan: shopData.plan?.displayName || 'N/A',
      currency: shopData.currencyCode,
      connected: true
    });
  } catch (error) {
    console.error('Shopify API error:', error);
    
    // Fallback to stored data if API fails
    res.json({
      name: req.store.shopName,
      email: req.store.email,
      domain: req.store.shopDomain,
      connected: false,
      error: 'Unable to fetch live data from Shopify'
    });
  }
};
