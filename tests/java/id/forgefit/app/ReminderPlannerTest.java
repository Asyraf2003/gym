package id.forgefit.app;

import java.util.Calendar;
import java.util.TimeZone;

public final class ReminderPlannerTest {
  private static long millis(int year, int month, int date, int hour, int minute) {
    Calendar c = Calendar.getInstance(TimeZone.getTimeZone("Asia/Jakarta"));
    c.clear();
    c.set(year, month - 1, date, hour, minute);
    return c.getTimeInMillis();
  }
  private static void verify(boolean b, String message) { if (!b) throw new AssertionError(message); }
  public static void main(String[] args) {
    TimeZone original = TimeZone.getDefault();
    TimeZone.setDefault(TimeZone.getTimeZone("Asia/Jakarta"));
    try {
      final int MON = 1 << 1, WED = 1 << 3, SUN = 1;
      long monday1710 = millis(2026,11,2,17,10);
      verify(ReminderPlanner.nextAtMillis(18,0,MON,monday1710)==millis(2026,11,2,18,0),"same day");
      verify(ReminderPlanner.nextAtMillis(18,0,MON,millis(2026,11,2,18,0))==millis(2026,11,9,18,0),"next week, exact minute");
      verify(ReminderPlanner.nextAtMillis(18,0,WED,monday1710)==millis(2026,11,4,18,0),"Wednesday");
      verify(ReminderPlanner.nextAtMillis(9,30,SUN,monday1710)==millis(2026,11,8,9,30),"Sunday");
      verify(ReminderPlanner.nextAtMillis(18,0,0,monday1710)==-1,"empty days");
      verify(ReminderPlanner.nextAtMillis(25,0,127,monday1710)==-1,"invalid hour");
      verify(ReminderPlanner.nextAtMillis(18,60,127,monday1710)==-1,"invalid minute");
      verify(ReminderPlanner.nextAtMillis(19,0,127,monday1710)==millis(2026,11,2,19,0),"all days");
      System.out.println("ReminderPlanner: 8/8 tests PASS");
    } finally { TimeZone.setDefault(original); }
  }
}
