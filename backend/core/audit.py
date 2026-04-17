from .models import AuditLog
def log_action(user, action, entity, entity_id="", meta=None):
    AuditLog.objects.create(
        user=user if getattr(user, "is_authenticated", False) else None,
        action=action, entity=entity, entity_id=str(entity_id) if entity_id else "",
        meta=meta or {},
    )
