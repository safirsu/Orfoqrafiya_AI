from flask import Flask, render_template, request, jsonify
import json
import os
import random
from difflib import get_close_matches

from dotenv import load_dotenv
from openai import OpenAI


# ==========================
# ENV
# ==========================

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

client = None

if api_key:
    client = OpenAI(
        api_key=api_key
    )


app = Flask(__name__)


# ==========================
# LÜĞƏT
# ==========================

DATA_FILE = os.path.join(
    "data",
    "orfo_luget.json"
)


def load_words():

    try:

        with open(
            DATA_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            data = json.load(f)

            if isinstance(data, list):

                return set(
                    str(x).lower()
                    for x in data
                )

            if isinstance(data, dict):

                return set(
                    str(x).lower()
                    for x in data.keys()
                )

    except Exception as e:

        print(
            "Lüğət xətası:",
            e
        )

    return set()



WORDS = load_words()



# ==========================
# FAVORİLƏR
# ==========================

FAVORITE_FILE = os.path.join(
    "data",
    "favorites.json"
)


def load_favorites():

    try:

        with open(
            FAVORITE_FILE,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)

    except:

        return []



def save_favorites(data):

    with open(
        FAVORITE_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=4
        )



FAVORITES = load_favorites()


checked_count = 0
game_count = 0



# ==========================
# SƏHİFƏLƏR
# ==========================


@app.route("/")
def index():

    return render_template(
        "index.html"
    )



@app.route("/oyun")
def oyun():

    return render_template(
        "oyun.html"
    )



@app.route("/luget")
def luget():

    return render_template(
        "luget.html"
    )# ==========================
# OYUN SÖZLƏRİ
# ==========================


@app.route("/api/game-words")
def game_words():

    words = list(WORDS)

    words = [
        w for w in words
        if 4 <= len(w) <= 12
    ]

    return jsonify(
        random.sample(
            words,
            min(10, len(words))
        )
    )



# ==========================
# LÜĞƏT API
# ==========================


@app.route("/api/dictionary")
def dictionary():

    query = request.args.get(
        "q",
        ""
    ).lower()


    results = []


    for word in WORDS:

        if query in word:

            results.append(word)


        if len(results) >= 30:

            break



    return jsonify({

        "count": len(WORDS),

        "results": results

    })




# ==========================
# SÖZ YOXLAMA
# ==========================


@app.route(
    "/yoxla",
    methods=["POST"]
)
def yoxla():

    global checked_count


    data = request.get_json()


    word = data.get(
        "word",
        ""
    ).strip().lower()



    checked_count += 1



    if word in WORDS:

        return jsonify({

            "status": "correct",

            "word": word,

            "message":
            "✅ Söz düzgündür"

        })



    suggestions = get_close_matches(

        word,

        list(WORDS),

        n=5,

        cutoff=0.60

    )



    return jsonify({

        "status": "incorrect",

        "message":
        "❌ Söz lüğətdə tapılmadı",

        "suggestions":
        suggestions

    })





# ==========================
# AI ANALİZ
# ==========================


@app.route(
    "/ai_axtar",
    methods=["POST"]
)
def ai_axtar():


    data = request.get_json()


    word = data.get(
        "word",
        ""
    ).strip()



    if not word:

        return jsonify({

            "correct": "",

            "meaning":
            "Söz daxil edilməyib",

            "part":
            "-",

            "example":
            "-"

        })



    if client is None:

        return jsonify({

            "correct":
            word,

            "meaning":
            "API açarı yoxdur",

            "part":
            "-",

            "example":
            "-"

        })



    try:


        response = client.chat.completions.create(

            model="gpt-4o-mini",

            messages=[

                {

                    "role":"system",

                    "content":
                    """
Azərbaycan dili üzrə söz analizi et.
Cavabı yalnız JSON formatında ver.
                    """

                },

                {

                    "role":"user",

                    "content":
                    f"""
Söz: {word}

Format:

{{
"correct":"",
"meaning":"",
"part":"",
"example":""
}}
                    """

                }

            ]

        )



        answer = response.choices[0].message.content



        cleaned = answer.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()



        return jsonify(
            json.loads(cleaned)
        )



    except Exception as e:


        print(
            "AI ERROR:",
            e
        )


        return jsonify({

            "correct":
            word,

            "meaning":
            "AI cavabı alınmadı",

            "part":
            "-",

            "example":
            "-"

        })# ==========================
# FAVORİLƏR
# ==========================


@app.route("/favoriler")
def favoriler():

    return jsonify(
        FAVORITES
    )



@app.route(
    "/favori_elave",
    methods=["POST"]
)
def favori_elave():

    data = request.get_json()


    word = data.get(
        "word",
        ""
    ).strip().lower()



    if word and word not in FAVORITES:

        FAVORITES.append(word)

        save_favorites(
            FAVORITES
        )



    return jsonify({

        "status":"ok",

        "favorites":
        FAVORITES

    })





@app.route(
    "/favori_sil",
    methods=["POST"]
)
def favori_sil():

    data = request.get_json()


    word = data.get(
        "word",
        ""
    ).strip().lower()



    if word in FAVORITES:

        FAVORITES.remove(word)

        save_favorites(
            FAVORITES
        )



    return jsonify({

        "status":"ok",

        "favorites":
        FAVORITES

    })





# ==========================
# STATİSTİKA
# ==========================


@app.route("/api/stats")
def stats():

    return jsonify({

        "words":
        len(WORDS),

        "checked":
        checked_count,

        "games":
        game_count

    })





# ==========================
# START
# ==========================


if __name__ == "__main__":

    app.run(

        debug=True,

        port=5000

    )
   # ==========================
# START
# ==========================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )