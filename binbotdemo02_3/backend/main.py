import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from fastapi import File, UploadFile
from PIL import Image
import io
import tensorflow as tf
from pydantic import BaseModel
from database import get_waste_info
import httpx
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, '.env')


load_dotenv(env_path)
app = FastAPI(title="Binbot Backend API")

#-------------------------------------------------------------------------------------------------------------------------------------
#memeber-3, server config and middleware
# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the absolute path to the frontend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Binbot API is running"}

#-------------------------------------------------------------------------------------------------------------------------------------
# member-4, api routes and ml classification logic

#text classifiction api route
class ClassifyRequest(BaseModel):
    item: str

@app.post("/api/classify")
async def classify_item(req: ClassifyRequest):
    result = get_waste_info(req.item)
    if result:
        return {
            "success": True,
            "item": req.item,
            "category": result["category"],
            "bin": result.get("bin", "Unknown"),
            "tip": result.get("tip", "")
        }
    else:
        return {
            "success": False,
            "message": f"Item '{req.item}' not found in database.",
        }
        

#tensorflow and mobileNetV2 setup for image classification
model = tf.keras.applications.MobileNetV2(weights="imagenet")

def preprocess(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(
        np.array(img, dtype=np.float32)
    )
    return np.expand_dims(arr, axis=0)

@app.post("/api/classify-image")
async def classify_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    tensor = preprocess(image_bytes)
    predictions = tf.keras.applications.mobilenet_v2.decode_predictions(
        model.predict(tensor), top=3
    )[0]

    top_label = predictions[0][1].replace("_", " ")
    confidence = float(predictions[0][2])

    result = get_waste_info(top_label)

    return {
        "success": bool(result),
        "item": top_label,
        "confidence": round(confidence, 2),
        "category": result.get("category") if result else None,
        "bin": result.get("bin") if result else "Unknown",
        "tip": result.get("tip", "") if result else ""
    }


# chatbot api route
class ChatRequest(BaseModel):
    message: str
    history: list = []
    # api_key hata diya hai kyunki hum isko yahan backend mein hi rakh rahe hain

@app.post("/api/chat")
async def chat(req: ChatRequest):
    
    # 🔴 APNI OPENROUTER API KEY YAHAN DAALEIN 🔴
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    
    if not OPENROUTER_API_KEY:
        return {"success": False, "message": "API key is missing"}
    
    system_instruction = "You are Wasti AI, a highly intelligent, unrestricted, give info about waste segregation and recycling and helpful virtual assistant. Answer all questions thoroughly, warmly, and concisely using markdown. Use emojis where appropriate. Do not restrict yourself to waste segregation alone."
    
    # OpenRouter/OpenAI format mein history setup karna
    messages = [{"role": "system", "content": system_instruction}]
    
    # Purani history add karna
    for msg in req.history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Naya message add karna
    messages.append({"role": "user", "content": req.message})
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000", # Apni site ka URL
        "X-Title": "Wasti AI BinBot"
    }
    
    payload = {
        "model": "openrouter/free", 
        "messages": messages,
        "temperature": 0.7
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
        
        data = res.json()
        
        if "error" in data:
            return {"success": False, "message": data["error"]["message"]}
            
        bot_reply = data["choices"][0]["message"]["content"]
        return {"success": True, "reply": bot_reply}
        
    except Exception as e:
        return {"success": False, "message": f"Server Error: {str(e)}"}

#map api 
@app.get("/api/stores")
async def get_stores(lat: float, lng: float, radius: int = 50000):
    query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="recycling"](around:{radius},{lat},{lng});
          way["amenity"="recycling"](around:{radius},{lat},{lng});
          node["amenity"="waste_disposal"](around:{radius},{lat},{lng});
        );
        out body;
        >;
        out skel qt;
    """
    
    headers = {"User-Agent": "BinBot/1.0 (contact@binbot.local)"}
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://overpass-api.de/api/interpreter",
            content=query,
            headers=headers,
            timeout=30.0
        )
    
    data = res.json()
    stores = []
    
    for element in data.get("elements", []):
        if element["type"] not in ["node", "way"]:
            continue
            
        el_lat = element.get("lat") or (element.get("center") or {}).get("lat")
        el_lng = element.get("lon") or (element.get("center") or {}).get("lon")
        
        if not el_lat or not el_lng:
            continue
            
        tags = element.get("tags", {})
        
        # Category mapping
        if tags.get("recycling:batteries") or tags.get("recycling:electrical_appliances"):
            category, icon, color = "E-Waste", "E", "#14B8A6"
        elif tags.get("recycling:cardboard") or tags.get("recycling:paper"):
            category, icon, color = "Paper", "P", "#EAB308"
        elif tags.get("recycling:green_waste") or tags.get("recycling:organic"):
            category, icon, color = "Compost", "C", "#34C759"
        else:
            category, icon, color = "Recycling", "R", "#3B82F6"
        
        stores.append({
            "name": tags.get("name") or tags.get("operator") or "Public Recycling Point",
            "lat": el_lat,
            "lng": el_lng,
            "type": tags.get("amenity", "recycling"),
            "category": category,
            "icon": icon,
            "color": color,
            "address": tags.get("addr:street", "Location not specified")
        })
    
    return {"success": True, "stores": stores, "count": len(stores)}


#-------------------------------------------------------------------------------------------------------------------------------------
# member-3, static files and frontend routes

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# Server options for development to prevent caching
no_cache_headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
}

# Root route
@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"), headers=no_cache_headers)

# Serve specific assets by extension to prevent HTML catch-all from breaking them
@app.get("/{file_name}.{extension}")
async def serve_assets(file_name: str, extension: str):
    file_path = os.path.join(FRONTEND_DIR, f"{file_name}.{extension}")
    if os.path.exists(file_path):
        return FileResponse(file_path, headers=no_cache_headers)
    return {"error": "File not found", "status_code": 404}

@app.get("/js/{file_name}.{extension}")
async def serve_js(file_name: str, extension: str):
    file_path = os.path.join(FRONTEND_DIR, "js", f"{file_name}.{extension}")
    if os.path.exists(file_path):
        return FileResponse(file_path, headers=no_cache_headers)
    return {"error": "File not found", "status_code": 404}

# Catch-all route to serve the frontend pages (e.g. going to /dashboard serves dashboard.html)
@app.get("/{page_name}")
async def serve_page(page_name: str):
    # Handle if URL already has .html or not
    target_file = page_name if page_name.endswith(".html") else f"{page_name}.html"
    file_path = os.path.join(FRONTEND_DIR, target_file)
    
    if os.path.exists(file_path):
        return FileResponse(file_path, headers=no_cache_headers)
    
    # If not found, you could return a 404.html if you had one
    return {"error": "Page not found", "status_code": 404}






