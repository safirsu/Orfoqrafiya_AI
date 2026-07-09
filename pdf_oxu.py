from pypdf import PdfReader
import json
import re

# PDF faylının adı
pdf_yolu = "orfo_luget.pdf"

# Çıxış faylı
json_yolu = "data/orfo_luget.json"


print("PDF oxunur...")

reader = PdfReader(pdf_yolu)

print("Səhifə sayı:", len(reader.pages))


sozler = set()


for i, sehife in enumerate(reader.pages):
    print(f"{i+1}/{len(reader.pages)} səhifə işlənir...")

    metn = sehife.extract_text()

    if metn:
        setirler = metn.split("\n")

        for setir in setirler:
            soz = setir.strip()

            # boş sətirləri sil
            if not soz:
                continue

            # mötərizə içini sil
            soz = re.sub(r"\(.*?\)", "", soz)

            # artıq boşluqları sil
            soz = soz.strip()

            # çox qısa olanları at
            if len(soz) < 2:
                continue

            # yalnız hərfləri saxla
            soz = re.sub(r"[^a-zA-ZƏÖÜĞÇŞİəöüğçşı-]", "", soz)

            if soz:
                sozler.add(soz.lower())


print("Tapılan söz sayı:", len(sozler))


# JSON-a yazırıq
with open(json_yolu, "w", encoding="utf-8") as fayl:
    json.dump(
        sorted(list(sozler)),
        fayl,
        ensure_ascii=False,
        indent=2
    )


print("Hazırdır!")
print("Yaradıldı:", json_yolu)