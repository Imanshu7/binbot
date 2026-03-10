import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Binbot Backend API")

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

from pydantic import BaseModel
from database import get_waste_info

# ==========================================
# API Routes (Backend Logic)
# ==========================================

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Binbot API is running"}

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
        # Default fallback or error if not found
        return {
            "success": False,
            "message": f"Item '{req.item}' not found in database.",
        }

# Add future API routes here (e.g., /api/login, /api/classify)

# ==========================================
# Static Files & Frontend Routing
# ==========================================

# Mount the static frontend directory
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
