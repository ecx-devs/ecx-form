import cron, { ScheduledTask } from "node-cron";

export class KeepAliveService {
  private task: ScheduledTask | null = null;
  private readonly url: string;
  private readonly intervalMinutes: number;

  constructor(backendUrl: string, intervalMinutes = 10) {
    this.url = backendUrl.replace(/\/$/, "") + "/health";
    this.intervalMinutes = intervalMinutes;
  }

  start(): void {
    if (!this.url || this.url === "/health") {
      console.log("[KeepAlive] No BACKEND_URL set, skipping self-ping.");
      return;
    }

    const cronExpression = `*/${this.intervalMinutes} * * * *`;

    this.task = cron.schedule(cronExpression, async () => {
      try {
        const response = await fetch(this.url);
        const data = (await response.json()) as {
          status: string;
          timestamp: string;
        };
        console.log(
          `[KeepAlive] Ping OK - ${data.status} at ${data.timestamp}`,
        );
      } catch (error) {
        console.error(
          `[KeepAlive] Ping failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    });

    console.log(
      `[KeepAlive] Self-ping scheduled every ${this.intervalMinutes}min -> ${this.url}`,
    );
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log("[KeepAlive] Self-ping stopped.");
    }
  }
}
