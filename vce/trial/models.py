import uuid
from django.db import models

class TrialAccess(models.Model):
    trial_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    summaries_viewed = models.JSONField(default=list, blank=True)  
    problems_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)

    def can_view_summary(self, key: str, limit=4) -> bool:
        if key in self.summaries_viewed:
            return True
        return len(self.summaries_viewed) < limit

    def mark_summary(self, key: str):
        if key not in self.summaries_viewed:
            self.summaries_viewed.append(key)
            self.save(update_fields=["summaries_viewed", "last_seen_at"])