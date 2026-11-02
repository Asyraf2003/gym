package id.forgefit.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Offline WebView preview with a narrow, local-only Android notification bridge. */
public final class MainActivity extends Activity {
  private static final int NOTIFICATION_REQUEST = 901;
  private static volatile boolean foreground = false;
  private WebView webView;
  private boolean exactPermissionWasAllowed;

  public static boolean isForeground() { return foreground; }

  @Override public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Window window = getWindow();
    window.setStatusBarColor(Color.rgb(11,17,25));
    window.setNavigationBarColor(Color.rgb(11,17,25));
    NotificationScheduler.createChannels(this);
    exactPermissionWasAllowed = NotificationScheduler.canUseExact(this);
    webView = new WebView(this);
    webView.setBackgroundColor(Color.rgb(11,17,25));
    webView.getSettings().setJavaScriptEnabled(true);
    webView.getSettings().setDomStorageEnabled(true);
    webView.getSettings().setAllowFileAccess(true);
    webView.getSettings().setAllowContentAccess(false);
    webView.getSettings().setAllowFileAccessFromFileURLs(false);
    webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
    webView.addJavascriptInterface(new NativeBridge(), "ForgeFitAndroid");
    webView.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        return !request.getUrl().toString().startsWith("file:///android_asset/");
      }
      @Override public void onPageFinished(WebView view, String url) {
        if (url.startsWith("file:///android_asset/")) {
          notifyJs();
          view.postDelayed(() -> requestNotificationPermission(false), 1900);
        }
      }
    });
    setContentView(webView);
    webView.loadUrl("file:///android_asset/index.html");
  }

  private void notifyJs() {
    if (webView != null) webView.evaluateJavascript(
      "window.forgeFitNativeStateChanged && window.forgeFitNativeStateChanged()", null);
  }
  private void notificationSettings() {
    Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
    intent.putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
    try { startActivity(intent); }
    catch (Exception unavailable) {
      startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.parse("package:" + getPackageName())));
    }
  }
  private void requestNotificationPermission(boolean explicit) {
    if (Build.VERSION.SDK_INT < 33) { notifyJs(); return; }
    if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
      notifyJs(); return;
    }
    boolean requested=NotificationScheduler.prefs(this).getBoolean("notification_prompted",false);
    if (!explicit && requested) return;
    if (explicit && requested && !shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
      notificationSettings();
      return;
    }
    NotificationScheduler.prefs(this).edit().putBoolean("notification_prompted",true).apply();
    requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFICATION_REQUEST);
  }

  @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
    super.onRequestPermissionsResult(requestCode, permissions, results);
    if (requestCode == NOTIFICATION_REQUEST) notifyJs();
  }
  @Override protected void onResume() {
    super.onResume();
    foreground = true;
    boolean exact = NotificationScheduler.canUseExact(this);
    if (exact != exactPermissionWasAllowed) {
      exactPermissionWasAllowed = exact;
      NotificationScheduler.restoreAlarms(this);
    }
    notifyJs();
  }
  @Override protected void onPause() {
    foreground = false;
    super.onPause();
  }
  @Override protected void onDestroy() {
    foreground = false;
    if (webView != null) { webView.destroy(); webView=null; }
    super.onDestroy();
  }
  @Override public void onBackPressed() {
    if (webView == null) { super.onBackPressed(); return; }
    webView.evaluateJavascript("window.forgeFitBack && window.forgeFitBack()", result -> {
      if ("false".equals(result)) finish();
    });
  }

  private final class NativeBridge {
    @JavascriptInterface public String getStatus() {
      return NotificationScheduler.status(MainActivity.this);
    }
    @JavascriptInterface public void requestPermission() {
      runOnUiThread(() -> requestNotificationPermission(true));
    }
    @JavascriptInterface public void openNotificationSettings() {
      runOnUiThread(() -> notificationSettings());
    }
    @JavascriptInterface public void requestExactAlarmAccess() {
      runOnUiThread(() -> {
        if (Build.VERSION.SDK_INT < 31 || NotificationScheduler.canUseExact(MainActivity.this)) {
          notifyJs();return;
        }
        Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
          Uri.parse("package:" + getPackageName()));
        try { startActivity(intent); }
        catch (Exception unavailable) {
          startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
            Uri.parse("package:" + getPackageName())));
        }
      });
    }
    @JavascriptInterface public void setRestEnabled(boolean enabled) {
      NotificationScheduler.setRestEnabled(MainActivity.this,enabled);
    }
    @JavascriptInterface public void scheduleRest(String epochMs, String exercise) {
      try {
        NotificationScheduler.scheduleRest(MainActivity.this,Long.parseLong(epochMs),exercise);
      } catch (NumberFormatException invalid) {
        NotificationScheduler.cancelRest(MainActivity.this);
      }
    }
    @JavascriptInterface public void cancelRest() {
      NotificationScheduler.cancelRest(MainActivity.this);
    }
    @JavascriptInterface public void updateReminder(boolean enabled,String time,int daysMask) {
      NotificationScheduler.updateReminder(MainActivity.this,enabled,time,daysMask);
    }
    @JavascriptInterface public void testNotification() {
      runOnUiThread(() -> {
        if (!NotificationScheduler.testNotification(MainActivity.this))
          requestNotificationPermission(true);
        notifyJs();
      });
    }
  }
}
