package id.forgefit.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Restore future alarms after device reboot, time changes or precise-alarm grant. */
public final class SystemEventReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    if (intent == null) return;
    String action=intent.getAction();
    if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
        Intent.ACTION_TIME_CHANGED.equals(action) ||
        Intent.ACTION_TIMEZONE_CHANGED.equals(action) ||
        android.app.AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED.equals(action)) {
      NotificationScheduler.restoreAlarms(context);
    }
  }
}
