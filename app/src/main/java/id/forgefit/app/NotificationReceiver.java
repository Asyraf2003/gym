package id.forgefit.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class NotificationReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    if (intent == null) return;
    NotificationScheduler.onAlarm(context, intent.getAction(),
      intent.getLongExtra(NotificationScheduler.EXTRA_DUE,0));
  }
}
