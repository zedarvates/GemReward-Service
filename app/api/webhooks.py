import logging
import json
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import AppRegistration
from app.core.security import verify_github_signature
from app.core.engine import GemEngineStandalone

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/{provider}/{app_id}")
async def handle_universal_webhook(
    provider: str,
    app_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint universel pour recevoir les Webhooks.
    Prend en paramètre le "provider" (github, gitlab...) et "app_id" de l'application cliente.
    """
    
    # 1. Lire le corps (body) de la requête brute pour la vérification de signature
    body = await request.body()
    
    # 2. Chercher l'AppRegistration pour obtenir le secret
    stmt = select(AppRegistration).where(AppRegistration.id == app_id, AppRegistration.is_active == True)
    result = await db.execute(stmt)
    app_reg = result.scalar_one_or_none()
    
    if not app_reg:
        logger.warning(f"Webhook rejected: Unknown or inactive app_id {app_id}")
        raise HTTPException(status_code=404, detail="Application not found or inactive")
        
    # 3. Traiter le Webhook selon le provider
    if provider.lower() == "github":
        signature = request.headers.get("X-Hub-Signature-256")
        
        # Vérification de sécurité HMAC du payload entier
        if not app_reg.webhook_secret or not verify_github_signature(body, signature, app_reg.webhook_secret):
            logger.warning(f"Invalid webhook signature for app {app_id}")
            raise HTTPException(status_code=401, detail="Invalid signature")
            
        return await _handle_github_event(request.headers, body, app_id, db)
    
    # Ajouter logic pour GitLab ou autres ici
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider : {provider}")


async def _handle_github_event(headers: dict, body: bytes, app_id: str, db: AsyncSession):
    event_type = headers.get("x-github-event", "")
    
    if event_type == "ping":
        return {"status": "pong", "app_id": app_id}
        
    if event_type != "issues":
        return {"status": "ignored", "event": event_type}
        
    # Parser JSON
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    action = payload.get("action", "")
    issue = payload.get("issue", {})
    issue_number = issue.get("number")
    
    if action == "labeled" and issue_number:
        label = payload.get("label", {})
        label_name = label.get("name", "")
        
        engine = GemEngineStandalone(db)
        
        # Exemple de gestion : si c'est un "gem-awarded", on applique le barème de l'App
        if label_name == "gem-awarded":
            labels = issue.get("labels", [])
            trigger_keys = [l.get("name") for l in labels if isinstance(l, dict)]
            
            # 1. Calcul des gemmes basées sur les règles de l'App !
            gems = await engine.calculate_reward(app_id, trigger_keys)
            
            # En réalité, la détection de who to reward ("user_id") viendrait 
            # de metadata dans l'issue ou de la mapping local (GitHub Username -> Global ID). 
            # Pour l'example, on suppose que l'issue spécifie le global ID.
            # L'attente ici serait de chercher "user_id"
            # Placeholder pour récupérer l'ID :
            target_username = issue.get("user", {}).get("login", "unknown_user")
            
            if gems > 0:
                await engine.process_transaction(
                    app_id=app_id,
                    user_id=target_username, # Utilisation username comme ID temporaire
                    amount=gems,
                    transaction_type="issue_reward",
                    source_platform="github",
                    source_id=str(issue_number),
                    metadata={"issue_url": issue.get("html_url")}
                )
                return {
                    "status": "gem_awarded",
                    "app_id": app_id,
                    "target": target_username,
                    "gems": gems
                }
                
    return {"status": "success", "action_ignored": True}
