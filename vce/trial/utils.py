from rest_framework.response import Response
from rest_framework import status
from .models import TrialAccess
import uuid

TRIAL_COOKIE_NAME = "trial_id"
SUMMARY_LIMIT = 4
PROBLEM_LIMIT = 4

def get_trial(request):
    raw = request.COOKIES.get(TRIAL_COOKIE_NAME)
    if not raw:
        return None
    try:
        trial_uuid = uuid.UUID(raw) 
        obj, _ = TrialAccess.objects.get_or_create(trial_id=trial_uuid)
        return obj
    except Exception:
        return None

def trial_blocked_response(kind: str):
    return Response(
        {
            "detail": "Login required",
            "code": "trial_limit_reached",
            "kind": kind,
            "limits": {"summaries": SUMMARY_LIMIT, "problems": PROBLEM_LIMIT},
        },
        status=status.HTTP_403_FORBIDDEN,
    )