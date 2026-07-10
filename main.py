from flask import Flask, render_template, request, jsonify

import json
import os
import random

from difflib import get_close_matches
from rapidfuzz import process, fuzz

from ai import analyze_word


app = Flask(__name__)


from games.game2048 import game2048_bp

app.register_blueprint(game2048_bp)



BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


DATA_DIR = os.path.join(
    BASE_DIR,
    "data"
)


DATA_FILE = os.path.join(
    DATA_DIR,
    "orfo_luget.json"
)


FAVORITE_FILE = os.path.join(
    DATA_DIR,
    "favorites.json"
)



def load_json(path, default):

    try:

        with open(
            path,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)

    except:

        return default



def save_json(path, data):

    os.makedirs(
        os.path.dirname(path),
        exist_ok=True
    )

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=4
        )



raw_words = load_json(
    DATA_FILE,
    []
)


if isinstance(raw_words, list):

    WORDS = {

        str(x).strip().lower()

        for x in raw_words

        if str(x).strip()

    }


elif isinstance(raw_words, dict):

    WORDS = {

        str(x).strip().lower()

        for x in raw_words.keys()

        if str(x).strip()

    }


else:

    WORDS = set()



FAVORITES = load_json(
    FAVORITE_FILE,
    []
)


checked_count = 0

game_count = 0
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



# ===============================
# OYUN SÖZLƏRİ
# ===============================

@app.route("/api/game-words")
def game_words():

    words = [

        w

        for w in WORDS

        if 4 <= len(w) <= 12

    ]


    random.shuffle(words)


    return jsonify(
        words[:10]
    )



# ===============================
# LÜĞƏT
# ===============================

@app.route("/api/dictionary")
def dictionary():

    query = request.args.get(
        "q",
        ""
    ).strip().lower()



    if not query:

        return jsonify({

            "count":len(WORDS),

            "results":[]

        })



    results = [

        w

        for w in WORDS

        if query in w

    ][:30]



    return jsonify({

        "count":len(WORDS),

        "results":results

    })




# ===============================
# SÖZ YOXLAMA
# ===============================

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

            "status":"error",

            "message":"Söz daxil edilməyib."

        })



    checked_count += 1



    if word in WORDS:

        return jsonify({

            "status":"correct",

            "word":word,

            "message":"✅ Söz düzgündür"

        })

    # Oxşar sözləri tap
    suggestions = []

    matches = process.extract(
        word,
        WORDS,
        scorer=fuzz.WRatio,
        limit=5
    )

    for match, score, _ in matches:
        if score >= 45:
            suggestions.append(match)




    return jsonify({

        "status":"incorrect",

        "message":"❌ Söz lüğətdə tapılmadı.",

        "suggestions":suggestions

    })



# ===============================
# AI
# ===============================

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

            "correct":"",

            "meaning":"Söz daxil edilməyib.",

            "part":"-",

            "example":"-"

        })


    return jsonify(
        analyze_word(word)
    )
# ===============================
# FAVORİLƏR
# ===============================


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



    if word and word not in FAVORITES:

        FAVORITES.append(word)

        save_json(
            FAVORITE_FILE,
            FAVORITES
        )



    return jsonify({

        "status":"ok",

        "favorites":FAVORITES

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

        "status":"ok",

        "favorites":FAVORITES

    })




# ===============================
# STATİSTİKA
# ===============================


@app.route("/api/stats")
def stats():

    return jsonify({

        "words":len(WORDS),

        "checked":checked_count,

        "games":game_count

    })




# ===============================
# START
# ===============================


if __name__ == "__main__":


    print(
        "Söz sayı:",
        len(WORDS)
    )


    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )