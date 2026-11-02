plugins { id("com.android.application") }
android {
 namespace = "id.forgefit.app"
 compileSdk = 35
 defaultConfig { applicationId = "id.forgefit.preview.v091"; minSdk = 26; targetSdk = 34; versionCode = 8; versionName = "0.9.1-preview" }
 buildTypes { release { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
