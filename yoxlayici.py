import json
from rapidfuzz import process, fuzz


def sadeleşdir(soz):
    soz = soz.lower().strip()

    deyisiklik = {
        "e": "ə",
        "i": "ı",
        "o": "ö",
        "u": "ü",
        "g": "ğ",
        "c": "ç",
        "s": "ş"
    }

    for a, b in deyisiklik.items():
        soz = soz.replace(a, b)

    return soz



# Lüğəti yüklə
with open("data/orfo_luget_temiz.json", "r", encoding="utf-8") as f:
    luget = json.load(f)



print("Azərbaycan dili orfoqrafiya yoxlayıcısı hazırdır")
print("Söz sayı:", len(luget))


# Sadələşdirilmiş lüğət
sadelesmis = {}

for soz in luget:
    sadelesmis[sadeleşdir(soz)] = soz



while True:

    daxil = input("\nSöz daxil et (çıxmaq üçün q): ")

    if daxil == "q":
        break


    axtaris = sadeleşdir(daxil)



    # Tam uyğunluq
    if axtaris in sadelesmis:

        duzgun = sadelesmis[axtaris]


        if daxil == duzgun:
            print("✅ Söz düzgündür")

        else:
            print("❌ Söz səhv yazılıb")
            print("✅ Düzgün variant:", duzgun)

        continue



    # Uzunluğa görə namizədlər
    namizedler = []

    for soz in sadelesmis.keys():

        ferq = abs(len(soz) - len(axtaris))

        if ferq <= 2:
            namizedler.append(soz)



    neticeler = process.extract(
        axtaris,
        namizedler,
        scorer=fuzz.WRatio,
        limit=3,
        score_cutoff=70
    )



    if neticeler:

        print("❌ Söz səhv yazılıb")
        print("\nBəlkə bunları nəzərdə tutdunuz:")


        for i, netice in enumerate(neticeler, 1):

            duzgun = sadelesmis[netice[0]]

            print(f"{i}. {duzgun}")


    else:

        print("❌ Söz tapılmadı")