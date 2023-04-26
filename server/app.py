from flask import Flask, request
from flask_cors import CORS
import requests
import base64
import json
import re

import os

from language import Agent


app = Flask(__name__)
CORS(app)

agent = Agent()

remove_chars = re.compile("(\(*\s*[a-zA-Z]+\s*[a-zA-Z]+\s*\)*)")


@app.route("/voice", methods=["POST"])
def gen_voice():
    speaker_num2id = [2, 3, 8, 10, 9, 11, 12, 13, 14, 16]

    text = request.json["text"]
    speaker = speaker_num2id[request.json["speaker"]]

    for c in re.findall(remove_chars, text):
        text = text.replace(c, "")

    query = requests.post(
        "http://voicevox-container:50021/audio_query",
        params={
            "text": text,
            "speaker": speaker,
        }
    )

    if not query.status_code == 200:
        print(query.json())
        return

    results = requests.post(
        "http://voicevox-container:50021/synthesis",
        params={"speaker": speaker},
        data=json.dumps(query.json()),
    )

    return {"output": base64.b64encode(results.content).decode()}


@app.route("/chat", methods=["POST"])
def chat_ai():
    prompt = request.json["input"]

    output = agent(prompt)
    emotion = analize_emotion(output)

    return {"output": output, "emotion": emotion}


def analize_emotion(text):
    ans = agent.just_ask(f"""What is the most appropriate emotion to describe this text? Answer by following number.
    1. angry
    2. trouble
    3. laugh
    4. normal
    5. sad
    6. surprise

    text: {text}
    """)
    normal = 4

    num = re.findall("[0-9]+", ans)
    try:
        num = int(num[0])
        if 1 <= num <= 6:
            return num
        else:
            return normal
    except:
        return normal


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5000, ssl_context=("/openssl/server.crt", "/openssl/server.key"))
