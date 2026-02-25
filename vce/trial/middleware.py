import uuid
from django.conf import settings

TRIAL_COOKIE_NAME = "trial_id"

class TrialIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.COOKIES.get(TRIAL_COOKIE_NAME):
            request.trial_id_generated = str(uuid.uuid4())
            request.COOKIES[TRIAL_COOKIE_NAME] = request.trial_id_generated

        response = self.get_response(request)

        if getattr(request, "user", None) and request.user.is_authenticated:
            return response

        if getattr(request, "trial_id_generated", None):
            if settings.DEBUG:
                secure = False
                samesite = "Lax"
            else:
                secure = True
                samesite = "None"

            response.set_cookie(
                TRIAL_COOKIE_NAME,
                request.trial_id_generated,
                max_age=60 * 60 * 24 * 30,
                httponly=True,
                secure=secure,
                samesite=samesite,
                path="/",
            )

        return response