from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from openai import OpenAI

import json
import os
import random
from difflib import get_close_matches


# ======================================
# ENV
# ======================================

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key) if api_key else None


# ======================================
# FLASK
# ======================================

app = Flask(__name__)


# ======================================
# PATHLAR
# ======================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")

DATA_FILE = os.path.join(DATA_DIR, "orfo_luget.json")

FAVORITE_FILE = os.path.join(DATA_DIR, "favorites.json")


# ======================================
# KÖMƏKÇİ FUNKSİYALAR
# ======================================

def load_json(path, default):

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    except (FileNotFoundError, json.JSONDecodeError):
        return default



def save_json(path, data):

    os.makedirs(
        os.path.dirname(path),
        exist_ok=True
    )

    with open(path, "w", encoding="utf-8") as f:

        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=4
        )


# ======================================
# LÜĞƏT
# ======================================

raw_words = load_json(
    DATA_FILE,
    []
)


if isinstance(raw_words, list):

    WORDS = {

        str(word).strip().lower()

        for word in raw_words

        if str(word).strip()

    }


elif isinstance(raw_words, dict):

    WORDS = {

        str(word).strip().lower()

        for word in raw_words.keys()

        if str(word).strip()

    }


else:

    WORDS = set()



# ======================================
# FAVORİLƏR
# ======================================

FAVORITES = load_json(
    FAVORITE_FILE,
    []
)


# ======================================
# STATİSTİKA
# ======================================

checked_count = 0

game_count = 0



# ======================================
# SƏHİFƏLƏR
# ======================================

@app.route("/")
def index():

    return render_template(
        "index.html"
    )


@app.route("/luget")
def luget():

    return render_template(
        "luget.html"
    )


@app.route("/oyun")
def oyun():

    return render_template(
        "oyun.html"
    )


@app.route("/2048")
def game2048():

    return render_template(
        "2048.html"
    )
# ======================================
# OYUN API
# ======================================

@app.route("/api/game-words")
def game_words():

    words = [

        word

        for word in WORDS

        if 4 <= len(word) <= 12

    ]

    random.shuffle(words)

    return jsonify(
        words[:10]
    )



# ======================================
# LÜĞƏT API
# ======================================

@app.route("/api/dictionary")
def dictionary():

    query = request.args.get(
        "q",
        ""
    ).strip().lower()


    if not query:

        return jsonify({

            "count": len(WORDS),

            "results": []

        })


    results = [

        word

        for word in WORDS

        if query in word

    ][:30]


    return jsonify({

        "count": len(WORDS),

        "results": results

    })



# ======================================
# SÖZ YOXLAMA
# ======================================

@app.route("/yoxla", methods=["POST"])
def yoxla():

    global checked_count


    data = request.get_json(
        silent=True
    ) or {}


    word = data.get(
        "word",
        ""
    ).strip().lower()



    if not word:

        return jsonify({

            "status": "error",

            "message": "Söz daxil edilməyib."

        }), 400



    checked_count += 1



    if word in WORDS:

        return jsonify({

            "status": "correct",

            "word": word,

            "message": "✅ Söz düzgündür"

        })



    suggestions = get_close_matches(

        word,

        list(WORDS),

        n=5,

        cutoff=0.60

    )



    return jsonify({

        "status": "incorrect",

        "message": "❌ Söz lüğətdə tapılmadı.",

        "suggestions": suggestions

    })



# ======================================
# AI ANALİZ
# ======================================

@app.route("/ai_axtar", methods=["POST"])
def ai_axtar():


    data = request.get_json(
        silent=True
    ) or {}



    word = data.get(
        "word",
        ""
    ).strip()



    if not word:

        return jsonify({

            "correct": "",

            "meaning": "Söz daxil edilməyib.",

            "part": "-",

            "example": "-"

        })



    if client is None:

        return jsonify({

            "correct": word,

            "meaning": "OpenAI API açarı tapılmadı.",

            "part": "-",

            "example": "-"

        })



    try:


        response = client.chat.completions.create(

            model="gpt-4o-mini",


            messages=[

                {

                    "role": "system",

                    "content":
                    """
Sən Azərbaycan dili üzrə orfoqrafiya köməkçisisən.

Cavabı yalnız JSON formatında qaytar.

Əlavə izah yazma.
"""

                },


                {

                    "role": "user",

                    "content": f"""

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

            ],


            temperature=0.2

        )



        answer = response.choices[0].message.content



        cleaned = (

            answer

            .replace("```json", "")

            .replace("```", "")

            .strip()

        )



        return jsonify(
            json.loads(cleaned)
        )



    except Exception as e:


        print(
            "AI ERROR:",
            e
        )


        return jsonify({

            "correct": word,

            "meaning": "AI cavabı alınmadı.",

            "part": "-",

            "example": "-"

        })
    
# ======================================
# FAVORİLƏR API
# ======================================

@app.route("/favoriler")
def favoriler():

    return jsonify(
        FAVORITES
    )



@app.route("/favori_elave", methods=["POST"])
def favori_elave():

    data = request.get_json(
        silent=True
    ) or {}


    word = data.get(
        "word",
        ""
    ).strip().lower()



    if not word:

        return jsonify({

            "status": "error",

            "message": "Söz boşdur."

        }), 400



    if word not in FAVORITES:

        FAVORITES.append(word)

        save_json(
            FAVORITE_FILE,
            FAVORITES
        )



    return jsonify({

        "status": "ok",

        "favorites": FAVORITES

    })




@app.route("/favori_sil", methods=["POST"])
def favori_sil():

    data = request.get_json(
        silent=True
    ) or {}


    word = data.get(
        "word",
        ""
    ).strip().lower()



    if word in FAVORITES:

        FAVORITES.remove(word)

        save_json(
            FAVORITE_FILE,
            FAVORITES
        )



    return jsonify({

        "status": "ok",

        "favorites": FAVORITES

    })



# ======================================
# STATİSTİKA
# ======================================

@app.route("/api/stats")
def stats():

    return jsonify({

        "words": len(WORDS),

        "checked": checked_count,

        "games": game_count

    })



# ======================================
# START
# ======================================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )