import { shopifyApi, LATEST_API_VERSION, ApiVersion } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

let shopify;

export function getShopify() {
  if (!shopify) {
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      throw new Error('SHOPIFY_API_KEY and SHOPIFY_API_SECRET must be set in environment variables');
    }

    shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      scopes: process.env.SHOPIFY_SCOPES?.split(',') || ['read_products', 'write_products'],
      hostName: process.env.SHOPIFY_HOST?.replace(/https?:\/\//, '') || 'localhost',
      hostScheme: process.env.NODE_ENV === 'production' ? 'https' : 'http',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true,
      // Session storage will be handled in routes
    });
  }
  return shopify;
}

// Session storage for OAuth flow
// In production, replace with Redis or database-backed storage
const sessions = new Map();

export const sessionStorage = {
  async storeSession(session) {
    sessions.set(session.id, session);
    return true;
  },
  async loadSession(id) {
    return sessions.get(id) || null;
  },
  async deleteSession(id) {
    sessions.delete(id);
    return true;
  },
  async deleteSessions(ids) {
    ids.forEach(id => sessions.delete(id));
    return true;
  },
  async findSessionsByShop(shop) {
    const shopSessions = [];
    for (const [id, session] of sessions.entries()) {
      if (session.shop === shop) {
        shopSessions.push(session);
      }
    }
    return shopSessions;
  }
};

export default getShopify();
