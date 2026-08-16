import shopify from '../config/shopify.js';

export const getShopInfo = async (req, res, next) => {
  try {
    const store = req.store;

    // Create Shopify GraphQL client
    const client = new shopify.clients.Graphql({
      session: {
        shop: store.shopDomain,
        accessToken: store.accessToken
      }
    });

    // Query shop information
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
