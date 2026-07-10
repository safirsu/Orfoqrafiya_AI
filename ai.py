import requests
import json


def analyze_word(word):

    prompt = f"""
Sən Azərbaycan dili üzrə peşəkar müəllimsən.

Söz:
{word}

Yalnız JSON formatında cavab ver:

{{
"correct":"",
"meaning":"",
"part":"",
"example":""
}}

Qaydalar:
- Düzgün Azərbaycan dilində yaz.
- Nitq hissəsini dəqiq göstər.
- Sözün mənasını qısa və düzgün yaz.
- Azərbaycan dilində real nümunə cümlə yaz.
- Əlavə izah yazma.
"""


    try:

        response = requests.post(

            "http://localhost:11434/api/generate",

            json={

                "model":"qwen2.5:7b",

                "prompt":prompt,

                "stream":False

            },

            timeout=120

        )


        answer = response.json().get(
            "response",
            ""
        )


        answer = (
            answer
            .replace("```json","")
            .replace("```","")
            .strip()
        )


        start = answer.find("{")
        end = answer.rfind("}")


        if start != -1 and end != -1:

            answer = answer[start:end+1]


        data = json.loads(answer)


        return {

            "correct": data.get(
                "correct",
                word
            ),

            "meaning": data.get(
                "meaning",
                "-"
            ),

            "part": data.get(
                "part",
                "-"
            ),

            "example": data.get(
                "example",
                "-"
            )

        }


    except Exception as e:

        print(
            "OLLAMA ERROR:",
            e
        )


        return {

            "correct":word,

            "meaning":"-",

            "part":"-",

            "example":"-"

        }