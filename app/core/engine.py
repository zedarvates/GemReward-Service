import logging
from typing import Optional, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import AppRewardRule, UserWallet, GemTransaction

logger = logging.getLogger(__name__)

class GemEngineStandalone:
    """
    Decoupled GemEngine for multi-tenant rewards.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_app_rules(self, app_id: str) -> Dict[str, int]:
        """Fetch all reward rules for a specific application."""
        stmt = select(AppRewardRule).where(AppRewardRule.app_id == app_id)
        result = await self.db.execute(stmt)
        rules = result.scalars().all()
        
        # Convert to dictionary for easy lookup
        return {rule.trigger_key: rule.gem_amount for rule in rules}

    async def calculate_reward(self, app_id: str, trigger_keys: List[str]) -> int:
        """
        Calculate gem amount based on application-specific rules.
        Takes the maximum value found among trigger keys.
        """
        rules = await self.get_app_rules(app_id)
        max_gems = rules.get("__default__", 1)
        
        found = False
        for key in trigger_keys:
            if key in rules:
                max_gems = max(max_gems, rules[key])
                found = True
        
        return max_gems if found or "__default__" in rules else 0

    async def process_transaction(
        self,
        app_id: str,
        user_id: str,
        amount: int,
        transaction_type: str,
        source_platform: str,
        source_id: str,
        metadata: Optional[Dict] = None
    ) -> Optional[GemTransaction]:
        """
        Atomically process a gem transaction:
        1. Update/Create User Wallet
        2. Record Transaction
        3. Update Tier (Optional global logic)
        """
        try:
            # 1. Get or Create User Wallet
            stmt = select(UserWallet).where(UserWallet.user_id == user_id).with_for_update()
            result = await self.db.execute(stmt)
            wallet = result.scalar_one_or_none()
            
            if not wallet:
                wallet = UserWallet(user_id=user_id, gem_balance=0, gem_total_earned=0)
                self.db.add(wallet)
                await self.db.flush()

            # 2. Update Balance
            wallet.gem_balance += amount
            if amount > 0:
                wallet.gem_total_earned += amount
            
            # 3. Create Transaction Record
            transaction = GemTransaction(
                app_id=app_id,
                user_id=user_id,
                amount=amount,
                transaction_type=transaction_type,
                source_platform=source_platform,
                source_id=source_id,
                metadata_json=metadata or {},
                status="confirmed"
            )
            self.db.add(transaction)
            
            # 4. Tier Update Logic (Simplified)
            wallet.gem_tier = self._calculate_tier(wallet.gem_total_earned)
            
            await self.db.commit()
            return transaction

        except Exception as e:
            logger.error(f"Failed to process gem transaction: {e}")
            await self.db.rollback()
            return None

    def _calculate_tier(self, total_gems: int) -> str:
        """Global tier thresholds."""
        if total_gems >= 100: return "legend"
        if total_gems >= 30:  return "gold"
        if total_gems >= 10:  return "silver"
        return "contributor"
