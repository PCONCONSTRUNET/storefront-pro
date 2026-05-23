import { playAdminNotificationBlip } from "./sound";

let seeded = false;

/** Resets baseline (e.g. on admin logout). */
export function resetAdminOrderAlert() {
  seeded = false;
}

/**
 * Compares order lists before/after sync. On first run while admin is logged in,
 * seeds the baseline without sound. Later, plays a blip for each newly seen order.
 */
export function detectAndAlertNewOrders(
  previous: { id: string }[],
  next: { id: string }[],
  isAdmin: boolean,
) {
  if (!isAdmin) return;

  if (!seeded) {
    seeded = true;
    return;
  }

  const prevIds = new Set(previous.map((o) => o.id));
  const added = next.filter((o) => !prevIds.has(o.id));
  if (added.length > 0) {
    playAdminNotificationBlip();
  }
}
