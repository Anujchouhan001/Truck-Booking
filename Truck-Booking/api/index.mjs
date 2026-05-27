let app;
let connectDB;

async function loadModules() {
  if (!app) {
    const appModule = await import('../backend/src/app.js');
    app = appModule.default || appModule;
    const dbModule = await import('../backend/src/config/db.js');
    connectDB = dbModule.connectDB;
  }
}

function getMongoURI() {
  return process.env.MONGODB_URI || process.env.MONGODB_ATLAS || process.env.MONGODB_LOCAL;
}

export default async function handler(req, res) {
  try {
    await loadModules();
  } catch (err) {
    console.error('Failed to load backend modules:', err);
    return res.status(500).json({ message: 'Server initialization failed', error: err.message });
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
    await connectDB(mongoURI);
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  return app(req, res);
}
