import requests
import json


OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:7b"


def analyze_word(word):

    prompt = f"""
Sən Azərbaycan dili üzrə köməkçisən.

Söz:
{word}

Yalnız bunları yaz:

1. Düzgün yazılış
2. Qısa və düzgün məna
3. Həmin sözlə nümunə cümlə

Qaydalar:
- Azərbaycan dilində cavab ver.
- Sözün mənasını uydurma.
- Nümunə cümlədə mütləq "{word}" sözü olsun.
- Başqa söz haqqında yazma.

Yalnız JSON qaytar:

{{
"correct":"",
"meaning":"",
"example":""
}}
"""


    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=180
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

            "example": data.get(
                "example",
                "-"
            ),

            "part": ""

        }


    except Exception as e:

        print(
            "AI ERROR:",
            e
        )


        return {

            "correct": word,

            "meaning":"-",

            "example":"-",

            "part":""

        }