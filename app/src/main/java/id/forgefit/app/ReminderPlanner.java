package id.forgefit.app;

import java.util.Calendar;

/** Pure Java time calculation for weekday-based local reminders. */
public final class ReminderPlanner {
  private ReminderPlanner() {}
  /** Sunday = bit 0, Monday = bit 1, ..., Saturday = bit 6. */
  public static long nextAtMillis(int hour, int minute, int daysMask, long nowMillis) {
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || (daysMask & 127) == 0) return -1;
    Calendar candidate = Calendar.getInstance();
    candidate.setTimeInMillis(nowMillis);
    candidate.set(Calendar.SECOND, 0);
    candidate.set(Calendar.MILLISECOND, 0);
    candidate.set(Calendar.HOUR_OF_DAY, hour);
    candidate.set(Calendar.MINUTE, minute);
    for (int offset = 0; offset < 8; offset++) {
      int weekdayBit = 1 << (candidate.get(Calendar.DAY_OF_WEEK) - Calendar.SUNDAY);
      if (candidate.getTimeInMillis() > nowMillis && ((daysMask & weekdayBit) != 0)) {
        return candidate.getTimeInMillis();
      }
      candidate.add(Calendar.DAY_OF_MONTH, 1);
      candidate.set(Calendar.HOUR_OF_DAY, hour);
      candidate.set(Calendar.MINUTE, minute);
    }
    return -1;
  }
}
