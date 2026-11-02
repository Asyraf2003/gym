from pathlib import Path
p=Path("app/src/main/assets")
js=(p/"app.js").read_text(encoding="utf-8")
css=(p/"style.css").read_text(encoding="utf-8")
html=(p/"index.html").read_text(encoding="utf-8")
required=["detailRutinitas","simpanRutinitas","mulai","centangSet","jedaKardio","konfirmasiSelesai","detailRiwayat","tema","infoCadangan","daftarGerakan","tambahGerakan"]
for action in required:
    assert action in js, f"Aksi hilang: {action}"
assert "addEventListener('click',click)" in js, "Penerima klik hilang"
assert "window.forgeFitBack" in js, "Navigasi kembali hilang"
assert "body.light" in css, "Tema terang hilang"
assert 'lang="id"' in html, "Bahasa aplikasi bukan Indonesia"
print("Kelengkapan antarmuka: lulus")
