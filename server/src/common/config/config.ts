import * as dotenv from 'dotenv';

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env'
      : `.env.${process.env.NODE_ENV}`,
});

const port = process.env.PORT || '4000';

export const config = {
  // Environment and Port
  envName: process.env.NODE_ENV,
  port,

  // JWT Secrets
  privateKeySecret:
    process.env.JWT_SECRET_KEY ||
    '6f763f8afb21d463a3ef831b6f83780409ec5e182982811dd19a73f92e8d734ffde7a5949a90d9d5c72ab9c8e2349ee8c704d28795672525059c0a1d363a2e30e934f469a051688b7bddd34f836b39b776bff9c9b977281fcb3158450f269d0e5128279db96fa3627026c1c13c39e7986d40de4bf35e049d5f26a0a80b90faab259ba56906ca50be37c2996daac250339119c5e7e6f3ad67daa57becbd03aeb5563906fc7cdc430ccdef2e7fe8c48b16e7b68fb336e556311c24d272e9ed701b828e6a2a0fe1786bfad8b0086f68d2bdfe45e0c890de3c1a4a09f5e52a105911c0a2904986b1f18ed61bc32a6b3623256d67b05b575473e98498d825e8168193',
  refreshKeySecret:
    process.env.JWT_REFRESH_SECRET_KEY ||
    '6f763f8afb21d463a3ef831b6f83780409ec5e182982811dd19a73f92e8d734ffde7a5949a90d9d5c72ab9c8e2349ee8c704d28795672525059c0a1d363a2e30e934f469a051688b7bddd34f836b39b776bff9c9b977281fcb3158450f269d0e5128279db96fa3627026c1c13c39e7986d40de4bf35e049d5f26a0a80b90faab259ba56906ca50be37c2996daac250339119c5e7e6f3ad67daa57becbd03aeb5563906fc7cdc430ccdef2e7fe8c48b16e7b68fb336e556311c24d272e9ed701b828e6a2a0fe1786bfad8b0086f68d2bdfe45e0c890de3c1a4a09f5e52a105911c0a2904986b1f18ed61bc32a6b3623256d67b05b575473e98498d825e8168193',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  // Redis URL
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // File Upload Configuration
  upload: {
    // The directory where files will be uploaded
    path: process.env.UPLOAD_DIR || 'uploads',

    // The base URL for accessing uploaded files
    cdn: process.env.CDN_URL || `http://localhost:${port}/uploads`,
  },

  // Base URL for the application (API)
  baseUrl: process.env.API_URL || 'http://localhost:4000',

  // Database configuration (if needed)
  db: {
    name: process.env.DB_NAME || 'your_db_name',
    username: process.env.DB_USERNAME || 'your_db_username',
    password: process.env.DB_PASSWORD || 'your_db_password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
  },
};
