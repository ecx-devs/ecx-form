import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { createApp } from "./interfaces/http/app";
import { KeepAliveService } from "./infrastructure/services/KeepAliveService";

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   ECX Forms Backend API                            ║
║   Running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || "development"}                    ║
║                                                    ║
║   API Base URL: http://localhost:${PORT}/api/v1      ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);

      // Start keep-alive self-ping in production
      if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
        const keepAlive = new KeepAliveService(process.env.BACKEND_URL, 10);
        keepAlive.start();
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();

