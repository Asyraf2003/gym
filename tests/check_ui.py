from pathlib import Path
p=Path("app/src/main/assets")
js=(p/"app.js").read_text(encoding="utf-8")
css=(p/"style.css").read_text(encoding="utf-8")
html=(p/"index.html").read_text(encoding="utf-8")
required=["guidedStart","guidedComplete","guidedTune","guidedSaveTune","guidedSkip","guidedQueue","detailRutinitas","simpanRutinitas","mulai","centangSet","jedaKardio","konfirmasiSelesai","detailRiwayat","tema","infoCadangan","daftarGerakan","tambahGerakan"]
for action in required:
    assert action in js, f"Aksi hilang: {action}"
assert "addEventListener('click',click)" in js, "Penerima klik hilang"
assert "window.forgeFitBack" in js, "Navigasi kembali hilang"
assert "guided-dock" in css and "guided-target" in css, "Guided styles missing"
assert "body.guided #app.enter" in css and "guidedFade" in css, "Fixed guided dock can be displaced by page animation"
assert "guided.js" in html, "Guided engine script missing"
assert "body.light" in css, "Tema terang hilang"
assert 'lang="id"' in html, "Bahasa aplikasi bukan Indonesia"
print("Kelengkapan antarmuka: lulus")

# Version identity and splash are release-critical: protect against the wrong APK.
import re
gradle=Path("app/build.gradle.kts").read_text(encoding="utf-8")
manifest=Path("app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
version=re.search(r'versionName\s*=\s*"([^"]+)"',gradle).group(1)
assert version=="0.6.0-preview", f"Unexpected Gradle version: {version}"
assert f'content="{version}"' in html, "Splash version does not match native APK version"
assert f"VERSION {version.split('-')[0]}" in html, "Visible splash version missing"
assert 'id="splash"' in html and 'id="skipSplash"' in html, "Opening screen missing"
assert "closeSplash" in js and "infoVersi" in js, "Splash/version UI handlers missing"
assert 'applicationId = "id.forgefit.preview"' in gradle, "Preview APK must install beside old version"
assert 'android:label="ForgeFit Preview 0.6"' in manifest, "Launcher label not versioned"
assert 'android:name="id.forgefit.app.MainActivity"' in manifest, "Activity must use full class name"
print("Versi APK, opening screen, and preview identity: PASS")
