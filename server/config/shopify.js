import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

let shopify;

export function getShopify() {
  if (!shopify) {
    shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY || 'demo_key',
      apiSecretKey: process.env.SHOPIFY_API_SECRET || 'demo_secret',
      scopes: process.env.SHOPIFY_SCOPES?.split(',') || ['read_products'],
      hostName: process.env.SHOPIFY_HOST?.replace(/https?:\/\//, '') || 'localhost',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true,
      isCustomStoreApp: false,
    });
  }
  return shopify;
}

export default getShopify();
