export type CloudSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type StatusListener = (status: CloudSaveStatus, error?: Error) => void;

interface PendingSave<T> {
  key: string;
  value: T;
}

export class LatestSaveQueue<T> {
  private desired: PendingSave<T> | null = null;
  private savedKey = "";
  private running = false;
  private disposed = false;
  private idleWaiters: Array<() => void> = [];

  constructor(
    private readonly save: (value: T) => Promise<void>,
    private readonly onStatus: StatusListener
  ) {}

  seed(key: string) {
    this.savedKey = key;
    this.desired = key ? { key, value: undefined as T } : null;
    this.onStatus(key ? "saved" : "idle");
  }

  enqueue(key: string, value: T) {
    if (this.disposed) return;
    this.desired = { key, value };
    if (key === this.savedKey && !this.running) {
      this.onStatus("saved");
      return;
    }
    this.onStatus("pending");
    void this.drain();
  }

  waitForIdle(): Promise<void> {
    if (!this.running) return Promise.resolve();
    return new Promise((resolve) => this.idleWaiters.push(resolve));
  }

  dispose() {
    this.disposed = true;
    this.desired = null;
  }

  private resolveIdle() {
    const waiters = this.idleWaiters.splice(0);
    waiters.forEach((resolve) => resolve());
  }

  private async drain() {
    if (this.running || this.disposed) return;
    this.running = true;

    try {
      while (!this.disposed && this.desired && this.desired.key !== this.savedKey) {
        const target = this.desired;
        this.onStatus("saving");

        try {
          await this.save(target.value);
          this.savedKey = target.key;
          if (this.desired?.key === target.key) this.onStatus("saved");
        } catch (cause) {
          if (this.desired?.key !== target.key) continue;
          const error = cause instanceof Error ? cause : new Error(String(cause));
          this.onStatus("error", error);
          break;
        }
      }
    } finally {
      this.running = false;
      this.resolveIdle();
    }
  }
}
