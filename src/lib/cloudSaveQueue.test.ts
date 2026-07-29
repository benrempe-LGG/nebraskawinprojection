import { describe, expect, it, vi } from "vitest";
import { LatestSaveQueue, type CloudSaveStatus } from "@/lib/cloudSaveQueue";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("LatestSaveQueue", () => {
  it("serializes writes and finishes with the newest payload", async () => {
    const first = deferred();
    const saved: string[] = [];
    const statuses: CloudSaveStatus[] = [];
    const save = vi.fn(async (value: string) => {
      saved.push(value);
      if (value === "first") await first.promise;
    });
    const queue = new LatestSaveQueue(save, (status) => statuses.push(status));

    queue.enqueue("first", "first");
    queue.enqueue("second", "second");

    expect(save).toHaveBeenCalledTimes(1);
    first.resolve();
    await queue.waitForIdle();

    expect(saved).toEqual(["first", "second"]);
    expect(statuses.at(-1)).toBe("saved");
  });

  it("skips queued stale payloads that have not started", async () => {
    const first = deferred();
    const saved: string[] = [];
    const queue = new LatestSaveQueue<string>(async (value) => {
      saved.push(value);
      if (value === "first") await first.promise;
    }, () => undefined);

    queue.enqueue("first", "first");
    queue.enqueue("second", "second");
    queue.enqueue("third", "third");
    first.resolve();
    await queue.waitForIdle();

    expect(saved).toEqual(["first", "third"]);
  });

  it("reports an error and retries on the next enqueue", async () => {
    let shouldFail = true;
    const statuses: CloudSaveStatus[] = [];
    const queue = new LatestSaveQueue<string>(async () => {
      if (shouldFail) throw new Error("offline");
    }, (status) => statuses.push(status));

    queue.enqueue("payload", "payload");
    await queue.waitForIdle();
    expect(statuses.at(-1)).toBe("error");

    shouldFail = false;
    queue.enqueue("payload", "payload");
    await queue.waitForIdle();
    expect(statuses.at(-1)).toBe("saved");
  });

  it("persists a reversion when an older write is already active", async () => {
    const first = deferred();
    const saved: string[] = [];
    const queue = new LatestSaveQueue<string>(async (value) => {
      saved.push(value);
      if (value === "changed") await first.promise;
    }, () => undefined);

    queue.seed("original");
    queue.enqueue("changed", "changed");
    queue.enqueue("original", "original");
    first.resolve();
    await queue.waitForIdle();

    expect(saved).toEqual(["changed", "original"]);
  });

  it("does not save a seeded payload again", async () => {
    const save = vi.fn(async () => undefined);
    const queue = new LatestSaveQueue(save, () => undefined);

    queue.seed("cloud-copy");
    queue.enqueue("cloud-copy", "cloud-copy");
    await queue.waitForIdle();

    expect(save).not.toHaveBeenCalled();
  });
});
