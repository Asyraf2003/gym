package id.forgefit.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

final class NotificationScheduler {
  static final String PREFS = "forgefit_notification_settings";
  static final String ACTION_REST = "id.forgefit.app.REST_DONE";
  static final String ACTION_REMINDER = "id.forgefit.app.WORKOUT_REMINDER";
  static final String EXTRA_DUE = "due";
  private static final String CHANNEL_REST = "forgefit_rest_v1";
  private static final String CHANNEL_REMINDER = "forgefit_reminder_v1";
  private static final int REST_REQUEST = 31, REMINDER_REQUEST = 32;
  private static final int REST_NOTIFICATION = 301, REMINDER_NOTIFICATION = 302, TEST_NOTIFICATION = 303;

  private NotificationScheduler() {}
  static SharedPreferences prefs(Context context) {
    return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
  }
  static boolean restEnabled(Context ctx) {
    return prefs(ctx).getBoolean("rest_enabled", true);
  }
  static boolean canPost(Context context) {
    if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
    return ((NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE)).areNotificationsEnabled();
  }
  static boolean canUseExact(Context context) {
    if (Build.VERSION.SDK_INT < 31) return true;
    return ((AlarmManager)context.getSystemService(Context.ALARM_SERVICE)).canScheduleExactAlarms();
  }
  static String status(Context context) {
    return "{\"available\":true,\"permission\":" + canPost(context) +
      ",\"exact\":" + canUseExact(context) +
      ",\"restEnabled\":" + restEnabled(context) + "}";
  }
  static void createChannels(Context context) {
    NotificationManager mgr = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    NotificationChannel rest = new NotificationChannel(CHANNEL_REST, "Istirahat selesai", NotificationManager.IMPORTANCE_HIGH);
    rest.setDescription("Pengingat saat waktu istirahat antar set selesai");
    NotificationChannel reminder = new NotificationChannel(CHANNEL_REMINDER, "Jadwal olahraga", NotificationManager.IMPORTANCE_DEFAULT);
    reminder.setDescription("Pengingat olahraga sesuai jam dan hari pilihan");
    mgr.createNotificationChannel(rest);
    mgr.createNotificationChannel(reminder);
  }
  private static PendingIntent pending(Context context, String action, int request, long due) {
    Intent intent = new Intent(context, NotificationReceiver.class).setAction(action);
    intent.putExtra(EXTRA_DUE, due);
    return PendingIntent.getBroadcast(context, request, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }
  private static void cancel(Context context, String action, int request) {
    AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    alarm.cancel(pending(context,action,request,0));
  }
  private static void arm(Context context, String action, int request, long due, boolean preciseWhenAllowed) {
    AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    PendingIntent pi = pending(context, action, request, due);
    alarm.cancel(pi);
    if (preciseWhenAllowed && canUseExact(context)) {
      try {
        alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, due, pi);
        return;
      } catch (SecurityException denied) {
        // Exact alarms are optional; Android 14+ may revoke them.
      }
    }
    alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, due, pi);
  }
  static void setRestEnabled(Context context, boolean enabled) {
    prefs(context).edit().putBoolean("rest_enabled", enabled).apply();
    if (!enabled) cancelRest(context);
  }
  static void scheduleRest(Context context, long due, String exercise) {
    if (!restEnabled(context) || due <= System.currentTimeMillis() || due > System.currentTimeMillis() + 3_600_000L) {
      cancelRest(context);
      return;
    }
    String safe = exercise == null ? "Gerakan berikutnya" : exercise.trim();
    if (safe.isEmpty()) safe = "Gerakan berikutnya";
    if (safe.length() > 64) safe = safe.substring(0,64);
    SharedPreferences p = prefs(context);
    if (p.getLong("rest_due",0) == due && safe.equals(p.getString("rest_exercise",""))) return;
    p.edit().putLong("rest_due",due).putString("rest_exercise",safe).apply();
    arm(context,ACTION_REST,REST_REQUEST,due,true);
  }
  static void cancelRest(Context context) {
    prefs(context).edit().remove("rest_due").remove("rest_exercise").apply();
    cancel(context,ACTION_REST,REST_REQUEST);
  }
  static void updateReminder(Context context, boolean enabled, String time, int daysMask) {
    int hour = 18, minute = 0;
    if (time != null && time.matches("(?:[01][0-9]|2[0-3]):[0-5][0-9]")) {
      hour = Integer.parseInt(time.substring(0,2));
      minute = Integer.parseInt(time.substring(3,5));
    }
    int mask = daysMask & 127;
    if (mask==0) enabled=false;
    prefs(context).edit().putBoolean("reminder_enabled",enabled).putInt("reminder_hour",hour)
      .putInt("reminder_minute",minute).putInt("reminder_days",mask).apply();
    scheduleNextReminder(context);
  }
  static void scheduleNextReminder(Context context) {
    cancel(context,ACTION_REMINDER,REMINDER_REQUEST);
    SharedPreferences p=prefs(context);
    if (!p.getBoolean("reminder_enabled",false)) {
      p.edit().remove("reminder_due").apply();
      return;
    }
    long due=ReminderPlanner.nextAtMillis(p.getInt("reminder_hour",18),p.getInt("reminder_minute",0),
      p.getInt("reminder_days",127),System.currentTimeMillis());
    if(due<0){p.edit().remove("reminder_due").apply();return;}
    p.edit().putLong("reminder_due",due).apply();
    // Reminder is intentionally inexact: avoids unnecessary exact-alarm privileges.
    arm(context,ACTION_REMINDER,REMINDER_REQUEST,due,false);
  }
  static void restoreAlarms(Context context) {
    SharedPreferences p=prefs(context);
    long rest=p.getLong("rest_due",0);
    if (restEnabled(context) && rest > System.currentTimeMillis() && rest < System.currentTimeMillis()+3_600_000L)
      arm(context,ACTION_REST,REST_REQUEST,rest,true);
    else cancelRest(context);
    scheduleNextReminder(context);
  }
  private static Notification build(Context context,String channel,String title,String message) {
    Intent intent=new Intent(context,MainActivity.class)
      .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    PendingIntent open=PendingIntent.getActivity(context,0,intent,PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    return new Notification.Builder(context,channel)
      .setSmallIcon(R.drawable.forgefit_icon)
      .setContentTitle(title)
      .setContentText(message)
      .setContentIntent(open)
      .setAutoCancel(true)
      .setCategory(Notification.CATEGORY_REMINDER)
      .setVisibility(Notification.VISIBILITY_PRIVATE)
      .build();
  }
  static boolean testNotification(Context context) {
    if (!canPost(context)) return false;
    createChannels(context);
    NotificationManager mgr=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
    mgr.notify(TEST_NOTIFICATION,build(context,CHANNEL_REST,"ForgeFit siap","Notifikasi olahraga sudah aktif."));
    return true;
  }
  static void onAlarm(Context context, String action, long expected) {
    SharedPreferences p=prefs(context);
    if (ACTION_REST.equals(action)) {
      if (expected <= 0 || expected != p.getLong("rest_due",0)) return;
      // Mark handled first, so a duplicate/re-delivered broadcast cannot notify twice.
      String exercise=p.getString("rest_exercise","Latihan");
      p.edit().remove("rest_due").remove("rest_exercise").apply();
      if (MainActivity.isForeground() || !restEnabled(context) || !canPost(context)) return;
      createChannels(context);
      NotificationManager mgr=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
      mgr.notify(REST_NOTIFICATION,build(context,CHANNEL_REST,"Istirahat selesai",
        "Siap lanjut set berikutnya · "+exercise));
    } else if (ACTION_REMINDER.equals(action)) {
      if(expected<=0 || expected!=p.getLong("reminder_due",0) || !p.getBoolean("reminder_enabled",false))return;
      scheduleNextReminder(context);
      if(!canPost(context))return;
      createChannels(context);
      NotificationManager mgr=(NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
      mgr.notify(REMINDER_NOTIFICATION,build(context,CHANNEL_REMINDER,"Waktunya olahraga",
        "Jadwal latihan ForgeFit hari ini sudah tiba."));
    }
  }
}
