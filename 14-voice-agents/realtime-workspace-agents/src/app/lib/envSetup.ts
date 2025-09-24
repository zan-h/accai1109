import dotenv from 'dotenv';

// Load env vars in common Next.js conventions
// 1) .env.local (highest precedence)
dotenv.config({ path: '.env.local' });
// 2) .env (fallback)
dotenv.config();
// 3) legacy ./env file (backward compatibility)
dotenv.config({ path: './env' });

if (!process.env.OPENAI_API_KEY) {
  // Surface a visible warning in dev so setup issues are obvious
  // Do not throw; let the API route return a clear error instead
  console.warn('[envSetup] OPENAI_API_KEY is not set. Place it in .env.local as OPENAI_API_KEY=...');
}