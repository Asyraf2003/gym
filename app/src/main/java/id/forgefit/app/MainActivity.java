package id.forgefit.app;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.view.Window;

/** Pratinjau antarmuka offline, tanpa izin internet atau JavaScript bridge. */
public final class MainActivity extends Activity {
  private WebView webView;
  @Override public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    Window window = getWindow();
    window.setStatusBarColor(Color.rgb(11,17,25));
    window.setNavigationBarColor(Color.rgb(11,17,25));
    webView = new WebView(this);
    webView.setBackgroundColor(Color.rgb(11,17,25));
    webView.getSettings().setJavaScriptEnabled(true);
    webView.getSettings().setDomStorageEnabled(true);
    webView.getSettings().setAllowFileAccess(true);
    webView.getSettings().setAllowContentAccess(false);
    webView.getSettings().setAllowFileAccessFromFileURLs(false);
    webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
    webView.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        return !"file".equals(request.getUrl().getScheme());
      }
    });
    setContentView(webView);
    webView.loadUrl("file:///android_asset/index.html");
  }
  @Override public void onBackPressed() {
    if (webView == null) { super.onBackPressed(); return; }
    webView.evaluateJavascript("window.forgeFitBack && window.forgeFitBack()", result -> {
      if ("false".equals(result)) finish();
    });
  }
  @Override protected void onDestroy() {
    if(webView != null) { webView.destroy(); webView=null; }
    super.onDestroy();
  }
}
