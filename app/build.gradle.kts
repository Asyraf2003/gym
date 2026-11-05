plugins { id("com.android.application") }
android {
 namespace = "id.forgefit.app"
 compileSdk = 35
 defaultConfig { applicationId = "id.forgefit.preview.v093"; minSdk = 26; targetSdk = 34; versionCode = 12; versionName = "1.0.0" }
 buildTypes { release { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
