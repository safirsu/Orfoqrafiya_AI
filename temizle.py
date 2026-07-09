import json
import re


giris = "data/orfo_luget.json"
cixis = "data/orfo_luget_temiz.json"


with open(giris, "r", encoding="utf-8") as f:
    luget = json.load(f)


temiz = set()


for soz in luget:

    soz = soz.lower().strip()

    # Mötərizə içlərini sil
    soz = re.sub(r"\(.*?\)", "", soz)

    # Rəqəmləri sil
    soz = re.sub(r"\d+", "", soz)

    # Boşluqları təmizlə
    soz = soz.strip()


    # Tireli və izahlı sözləri çıxart
    if "-" in soz:
        continue


    # Yalnız Azərbaycan hərfləri qalsın
    soz = re.sub(
        r"[^a-zəöüğçşı]",
        "",
        soz
    )


    # 2 hərfdən qısa sözləri sil
    if len(soz) < 2:
        continue


    # eyni hərfdən ibarət zibilləri sil
    if len(set(soz)) == 1:
        continue


    temiz.add(soz)



with open(cixis, "w", encoding="utf-8") as f:
    json.dump(
        sorted(list(temiz)),
        f,
        ensure_ascii=False,
        indent=2
    )


print("Əvvəl:", len(luget))
print("Sonra:", len(temiz))
print("Hazırdır")