plugins { id("com.android.application") }
val ownerStorePath=System.getenv("FORGEFIT_KEYSTORE_PATH")
val ownerStorePassword=System.getenv("FORGEFIT_KEYSTORE_PASSWORD")
val ownerAlias=System.getenv("FORGEFIT_KEY_ALIAS")
val ownerKeyPassword=System.getenv("FORGEFIT_KEY_PASSWORD")
val ownerSigningReady=listOf(ownerStorePath,ownerStorePassword,ownerAlias,ownerKeyPassword).all { !it.isNullOrBlank() }
android {
 namespace = "id.forgefit.app"
 compileSdk = 35
 defaultConfig { applicationId = "id.forgefit.preview.v093"; minSdk = 26; targetSdk = 34; versionCode = 12; versionName = "1.0.0" }
 signingConfigs {
   if(ownerSigningReady)create("ownerRelease") {
     storeFile = file(ownerStorePath!!)
     storePassword = ownerStorePassword
     keyAlias = ownerAlias
     keyPassword = ownerKeyPassword
   }
 }
 buildTypes {
   release {
     isMinifyEnabled = false
     if(ownerSigningReady)signingConfig=signingConfigs.getByName("ownerRelease")
   }
 }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
