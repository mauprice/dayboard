import { runDailyRollover } from '@/services/dailyReset';
import { toLocalDateKey } from '@/services/date';

const MIDNIGHT_ALARM = 'dayboard-midnight-reset';

function msUntilNextLocalMidnight(from = new Date()): number {
  const next = new Date(from);
  next.setHours(24, 0, 1, 0); // 00:00:01 the next day
  return next.getTime() - from.getTime();
}

export default defineBackground(() => {
  browser.alarms.create(MIDNIGHT_ALARM, {
    when: Date.now() + msUntilNextLocalMidnight(),
    periodInMinutes: 24 * 60,
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === MIDNIGHT_ALARM) void runDailyRollover(toLocalDateKey(new Date()));
  });

  // Catch up immediately in case the service worker was asleep at the last boundary.
  void runDailyRollover(toLocalDateKey(new Date()));
});
