from fastapi import FastAPI, UploadFile, File
import requests, time, hashlib, hmac, base64, json, os

app = FastAPI()

# --- Load credentials from Render Environment Variables ---
HOST = os.getenv("ACR_HOST")
ACCESS_KEY = os.getenv("ACR_ACCESS_KEY")
ACCESS_SECRET = os.getenv("ACR_SECRET_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-pro"

# ACRCloud request
def recognize_acr(file_bytes):
    http_method = "POST"
    http_uri = "/v1/identify"
    data_type = "audio"
    signature_version = "1"
    timestamp = str(int(time.time()))

    string_to_sign = f"{http_method}\n{http_uri}\n{ACCESS_KEY}\n{data_type}\n{signature_version}\n{timestamp}"
    sign = base64.b64encode(
        hmac.new(ACCESS_SECRET.encode("ascii"), string_to_sign.encode("ascii"), digestmod=hashlib.sha1).digest()
    ).decode("ascii")

    files = {"sample": file_bytes}
    data = {
        "access_key": ACCESS_KEY,
        "sample_bytes": len(file_bytes),
        "timestamp": timestamp,
        "signature": sign,
        "data_type": data_type,
        "signature_version": signature_version,
    }
    url = f"http://{HOST}{http_uri}"
    return requests.post(url, files=files, data=data, timeout=10).json()

# Gemini enrichment
def enrich_with_gemini(acr_json):
    prompt = f"""
    Normalize this ACRCloud result into JSON with fields:
    {{
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "spotify_url": "...",
      "youtube_url": "...",
      "apple_music_url": "..."
    }}
    If missing, set to null.
    ACR Result: {json.dumps(acr_json)}
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    data = {"contents": [{"parts": [{"text": prompt}]}]}
    resp = requests.post(url, headers=headers, json=data).json()

    try:
        return json.loads(resp["candidates"][0]["content"]["parts"][0]["text"])
    except:
        return {"error": "Gemini failed", "raw": resp}

@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    file_bytes = await file.read()
    acr_result = recognize_acr(file_bytes)
    enriched = enrich_with_gemini(acr_result)
    return enriched
