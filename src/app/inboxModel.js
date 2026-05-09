import { sortByCreatedDesc } from "../data/Tasks";
import { taskDistance } from "../data/Graph";

export const MAX_FOCUS_HOPS = 2;

const HOP_LABELS = ["Direct", "1 hop away", "2 hops away"];

export function buildGroups(tasks, focusId) {
  if (!focusId) {
    return [{ label: "Notification", items: sortByCreatedDesc(tasks) }];
  }

  const buckets = HOP_LABELS.map(() => []);
  for (const task of tasks) {
    const distance = taskDistance(task, focusId);
    if (distance === Infinity || distance > MAX_FOCUS_HOPS) continue;
    buckets[distance].push(task);
  }

  return buckets
    .map((items, hop) => ({
      label: `${HOP_LABELS[hop]} (${items.length})`,
      items: sortByCreatedDesc(items),
    }))
    .filter((group) => group.items.length > 0);
}
