from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Initialize FastAPI
app = FastAPI(
    title="GemReward Standalone Service",
    description="Multi-tenant Gem Economy Microservice for StoryCore Universe",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 GemReward-Service starting up...")

@app.get("/")
async def root():
    return {
        "service": "GemReward-Service",
        "status": "active",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Inclusion des routeurs
from app.api.webhooks import router as webhooks_router

app.include_router(webhooks_router, prefix="/v1/webhooks", tags=["Webhooks"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
