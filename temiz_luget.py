import json
import re
import os


INPUT = "data/orfo_luget.json"
OUTPUT = "data/orfo_luget_temiz.json"


print("Lüğət yüklənir...")


with open(
    INPUT,
    "r",
    encoding="utf-8"
) as f:

    sozler = json.load(f)



temiz = []


for soz in sozler:

    soz = str(soz).lower().strip()



    # mötərizə içlərini sil
    soz = re.sub(
        r"\(.*?\)",
        "",
        soz
    ).strip()



    # boş qalanları keç
    if not soz:
        continue



    # rəqəm olan sözləri sil
    if re.search(
        r"\d",
        soz
    ):
        continue



    # səhifə nömrələri və simvollar
    if not re.fullmatch(
        r"[a-zəğıöüşç]+",
        soz
    ):
        continue



    # çox qısa sözləri sil
    if len(soz) < 3:
        continue



    # aaa, sss kimi lazımsız təkrarlar
    if re.search(
        r"(.)\1{2,}",
        soz
    ):
        continue



    # tək hərf kombinasiyaları
    if soz in [
        "aa",
        "ğa",
        "xa",
        "ba",
        "da"
    ]:
        continue



    temiz.append(
        soz
    )



# təkrarları sil
temiz = sorted(
    list(set(temiz))
)



with open(
    OUTPUT,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        temiz,
        f,
        ensure_ascii=False,
        indent=4
    )



print("==============================")
print("Köhnə söz sayı:", len(sozler))
print("Təmiz söz sayı:", len(temiz))
print("Yeni fayl:", OUTPUT)
print("==============================")