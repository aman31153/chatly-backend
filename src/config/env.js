const path = require('path');
const dotenv = require('dotenv');

const nodeEnv = process.env.NODE_ENV || 'development';
const rootDir = path.resolve(__dirname, '../../');

let envFile = `.env.${nodeEnv}`;
let result = dotenv.config({ path: path.join(rootDir, envFile) });

if (result.error) {
  // Fallback to standard .env file if environment specific file is not found
  dotenv.config({ path: path.join(rootDir, '.env') });
  envFile = '.env (default fallback)';
}

console.log(`[Environment] Node Mode: ${nodeEnv.toUpperCase()} | Config Loaded from: ${envFile}`);
console.log(`[Environment] Target Firebase Project: ${process.env.FIRESTORE_PROJECT_ID || 'Not Configured'}`);

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isDevelopment: nodeEnv === 'development',
};
