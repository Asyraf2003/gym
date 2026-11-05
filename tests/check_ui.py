from pathlib import Path
p=Path("app/src/main/assets")
js=(p/"app.js").read_text(encoding="utf-8")
css=(p/"style.css").read_text(encoding="utf-8")
html=(p/"index.html").read_text(encoding="utf-8")
required=["guidedStart","guidedComplete","guidedTune","guidedSaveTune","guidedSkip","guidedQueue","detailRutinitas","simpanRutinitas","mulai","centangSet","jedaKardio","konfirmasiSelesai","detailRiwayat","tema","exportBackup","daftarGerakan","tambahGerakan"]
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
assert version=="1.0.0", f"Unexpected Gradle version: {version}"
assert f'content="{version}"' in html, "Splash version does not match native APK version"
assert f"VERSION {version.split('-')[0]}" in html, "Visible splash version missing"
assert 'id="splash"' in html and 'id="skipSplash"' in html, "Opening screen missing"
assert "closeSplash" in js and "infoVersi" in js, "Splash/version UI handlers missing"
assert 'progress.js' in html and 'progress-ui.js' in html, "Progress modules missing"
assert "ForgeFitProgressUI.progress" in js and "settingsProfile" in js, "Progress / profile wiring missing"
progress_ui=(p/"progress-ui.js").read_text(encoding="utf-8")
assert "progress-filter-bar" in progress_ui and "progress-filter-sheet" in progress_ui, "Filter trigger / bottom sheet missing"
assert all(k in progress_ui for k in ["draftBagian","draftRentang","resetFilterProgres","terapkanFilterProgres"]), "Filter actions missing"
assert "progress-filter-icon" in css and "filterRise" in css, "Bottom sheet icon/animation missing"
assert "progressRange:previous.progressRange||'7'" in js, "Default range must be 7 days"

assert 'applicationId = "id.forgefit.preview.v093"' in gradle, "Changing package ID loses access to installed data"
assert 'android:label="ForgeFit"' in manifest, "Production launcher label missing"
assert 'android:name="id.forgefit.app.MainActivity"' in manifest, "Activity must use full class name"
print("Versi APK, app identity, and opening screen: PASS")

progress_ui=(p/"progress-ui.js").read_text(encoding="utf-8")
assert "syncFilterOptions(s)" in progress_ui, "In-place filter selection missing"
assert "s.filterDraft=node.dataset.name;renderModal()" not in progress_ui, "Bagian filter remounts sheet"
assert "s.rangeDraft=node.dataset.name;renderModal()" not in progress_ui, "Rentang filter remounts sheet"

# Native notification release checks, including permission and delivery when WebView is gone.
native=Path("app/src/main/java/id/forgefit/app")
main=(native/"MainActivity.java").read_text(encoding="utf-8")
scheduler=(native/"NotificationScheduler.java").read_text(encoding="utf-8")
receiver=(native/"NotificationReceiver.java").read_text(encoding="utf-8")
boot=(native/"SystemEventReceiver.java").read_text(encoding="utf-8")
assert '<script src="notify.js"></script>' in html, "Native adapter must load before app.js"
assert "ForgeFitNotify.syncRest" in js and "ForgeFitNotify.syncReminder" in js, "Workout lifecycle must sync native alarms"
assert "window.forgeFitNativeStateChanged" in js, "Foreground permission status callback missing"
assert "notification-reminder-options" in css and "notification-days" in css, "Settings notification UI missing"
assert all(x in manifest for x in ["android.permission.POST_NOTIFICATIONS","android.permission.RECEIVE_BOOT_COMPLETED","android.permission.SCHEDULE_EXACT_ALARM"]), "Android permissions missing"
assert all(x in manifest for x in ["NotificationReceiver","SystemEventReceiver","BOOT_COMPLETED"]), "Native alarm receiver missing"
assert "addJavascriptInterface" in main and "requestPermissions" in main and "requestExactAlarmAccess" in main, "Android permission bridge missing"
assert "setExactAndAllowWhileIdle" in scheduler and "setAndAllowWhileIdle" in scheduler, "Exact/fallback timer absent"
assert "canScheduleExactAlarms" in scheduler, "Exact permission must be checked"
assert "MainActivity.isForeground()" in scheduler, "Foreground duplicate-notification guard missing"
assert "ForgeFitDatabase" in main and "saveState" in main and "importLegacyState" in main, "SQLite bridge missing"
store=(native/"ForgeFitDatabase.java").read_text(encoding="utf-8")
assert all(x in store for x in ["SQLiteOpenHelper","SCHEMA_VERSION","checksum","beginTransaction","restoreBackup","app_state_archive"]), "Durable SQLite safety checks missing"
assert "restFeedback" in main and "restFinished" in js, "High visibility foreground alert missing"
assert "dismissRestAlert" in js and 'id="restAlert"' in html, "Persistent rest alert missing"
assert "scheduleNextReminder" in scheduler and "restoreAlarms" in boot, "Recurring reminder reboot recovery missing"
assert "onAlarm" in receiver, "Notification receiver does not dispatch"
print("Android notification wiring and permissions: PASS")

# Exercise renaming and searchable catalog are required in this preview.
guided=(p/"guided.js").read_text(encoding="utf-8")
assert "changeExercise" in guided and "const done=e.sets.filter(x=>x.done)" in guided, "Completed sets must be preserved when renaming"
assert all(k in js for k in ["guidedName","guidedChooseExercise","exerciseSearchControls","filterExerciseResults","pickerSearch","guidedSearch"]), "Editable exercise name/search missing"
assert "['Semua','Kardio','Dada','Punggung','Kaki','Perut']" in js, "Core category missing"
assert "Cable Crunch" in js and "Mountain Climbers" in js and "Treadmill HIIT" in js, "Expanded core/cardio catalog missing"
assert "exercise-picker-list" in css and "guided-name-editor" in css, "Search and tuning styles missing"
print("Exercise tuning/search integration: PASS")

# UX regression: search controls update inline, no nested list scroll, progress selection always visible.
assert "const PICKER_STEP=6" in js, "Picker needs bounded initial results"
assert "data-picker-category" in js and "case 'moreExerciseResults'" in js, "Picker category/more wiring absent"
assert "if(n.dataset.pickerCategory)" in js and "if(n.id==='progressExerciseSelect')" in js, "Live select handlers missing"
assert "body.modal-open" in css and ".exercise-picker-list{overflow:visible" in css, "Modal scroll/background fix missing"
assert "progress-exercise-select" in (p/"progress-ui.js").read_text(encoding="utf-8"), "Selected exercise visibility fix missing"
theme=Path("app/src/main/res/values/styles.xml").read_text(encoding="utf-8")
assert "android:windowBackground" in theme and "#0B1119" in theme, "Android white window corner not fixed"
assert "webView.setOverScrollMode" in main, "WebView overscroll still enabled"
print("Picker responsiveness, progress selector, and Android sheet background: PASS")

progress_ui=(p/"progress-ui.js").read_text(encoding="utf-8")
assert 'metric("SESI BEBAN"' in progress_ui and 'metric("TOTAL VOLUME"' not in progress_ui, "Strength dashboard must show sessions, not tonnage"
assert "Volume ${fmt(x.volumeKg)}" not in progress_ui, "Tonnage should not dominate individual exercise rows"
assert "background:#05090f!important" in css, "Tuning backdrop needs opaque surface behind rounded corners"
assert "aria-expanded" in js and "guidedToggleSearch" in js, "Picker expand/collapse state missing"
