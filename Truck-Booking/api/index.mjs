let app;
let initError = null;

try {
  const appModule = await import('../backend/src/app.js');
  app = appModule.default;
} catch (err) {
  console.error('CRITICAL: Failed to load app module:', err);
  initError = err;
}

let dbModule;
try {
  dbModule = await import('../backend/src/config/db.js');
} catch (err) {
  console.error('CRITICAL: Failed to load db module:', err);
  initError = initError || err;
}

function getMongoURI() {
  return process.env.MONGODB_URI || process.env.MONGODB_ATLAS || process.env.MONGODB_LOCAL;
}

export default async function handler(req, res) {
  if (initError || !app) {
    console.error('Server initialization failed:', initError);
    return res.status(500).json({
      message: 'Server initialization failed',
      error: initError?.message || 'App module failed to load'
    });
  }

  const mongoURI = getMongoURI();

  if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGODB_URI is missing in Vercel Environment Variables');
    return res.status(500).json({
      message: 'Server Configuration Error: Database connection string is missing.',
      hint: 'Please add MONGODB_URI or MONGODB_ATLAS to Vercel Environment Variables.'
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET is missing in Vercel Environment Variables');
  }

  try {
    await dbModule.connectDB(mongoURI);
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  return app(req, res);
}
