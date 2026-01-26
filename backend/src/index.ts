import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { createApp } from './interfaces/http/app';

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🚀 ECX Forms Backend API                         ║
║   Running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                    ║
║   API Base URL: http://localhost:${PORT}/api/v1      ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

