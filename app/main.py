"""VPNHub: точка входа. Отдаёт сайт, API и админку одним сервисом на Railway."""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from .admin import router as admin_router
from .api import router as api_router
from .db import close_pool, init_pool

BASE = Path(__file__).resolve().parent.parent
STATIC = BASE / "static"
ADMIN_DIR = BASE / "admin"

_DOC_PAGES = {"terms", "privacy", "legal"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()


app = FastAPI(title="VPNHub", docs_url=None, redoc_url=None, lifespan=lifespan)
class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path
        if path in ("/", "/admin") or path.endswith((".html", ".js", ".css")):
            response.headers["Cache-Control"] = "no-cache, must-revalidate"
        return response

app.add_middleware(NoCacheMiddleware)

app.include_router(api_router)
app.include_router(admin_router)

# Статика: css/js/img раздаются как есть
app.mount("/css", StaticFiles(directory=STATIC / "css"), name="css")
app.mount("/js", StaticFiles(directory=STATIC / "js"), name="js")
app.mount("/img", StaticFiles(directory=STATIC / "img"), name="img")


@app.get("/healthz", include_in_schema=False)
async def healthz():
    return {"ok": True}


@app.get("/admin", include_in_schema=False)
async def admin_page():
    return FileResponse(ADMIN_DIR / "index.html")


@app.get("/robots.txt", include_in_schema=False)
async def robots():
    return FileResponse(STATIC / "robots.txt")


@app.get("/sitemap.xml", include_in_schema=False)
async def sitemap():
    return FileResponse(STATIC / "sitemap.xml", media_type="application/xml")


@app.get("/", include_in_schema=False)
async def index():
    return FileResponse(STATIC / "index.html")


@app.get("/index.html", include_in_schema=False)
async def index_html():
    return FileResponse(STATIC / "index.html")


@app.get("/{page}.html", include_in_schema=False)
async def doc_pages(page: str):
    """Только terms/privacy/legal — всё остальное падает в 404."""
    if page not in _DOC_PAGES:
        return FileResponse(STATIC / "404.html", status_code=404)
    return FileResponse(STATIC / f"{page}.html")


@app.exception_handler(404)
async def not_found(request: Request, exc):
    if request.url.path.startswith("/api"):
        return JSONResponse({"detail": "Не найдено"}, status_code=404)
    return FileResponse(STATIC / "404.html", status_code=404)
