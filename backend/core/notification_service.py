from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


def create_notification(user, message, notification_type, related_id=None):
    """
    Create a notification for a single user.
    """

    if not user:
        return

    Notification.objects.create(
        user=user,
        message=message,
        notification_type=notification_type,
        related_id=str(related_id) if related_id else None
    )


def notify_module_leaders(message, notification_type, related_id=None):
    """
    Send notification to all module leaders.
    """

    module_leaders = User.objects.filter(role="MODULE_LEADER")

    for ml in module_leaders:
        create_notification(ml, message, notification_type, related_id)
