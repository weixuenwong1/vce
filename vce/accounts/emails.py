import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags


logger = logging.getLogger(__name__)


def send_tutoring_interest_emails(enquiry):
    from_email = settings.DEFAULT_FROM_EMAIL or "support@chuba.io"
    connection = get_connection()
    context = {"enquiry": enquiry}
    html_message = render_to_string(
        "backend/tutoring_interest_confirmation.html",
        context,
    )
    confirmation = EmailMultiAlternatives(
        subject="We received your Chuba tutoring enquiry",
        body=strip_tags(html_message),
        from_email=from_email,
        to=[enquiry.email],
        connection=connection,
    )
    confirmation.attach_alternative(html_message, "text/html")

    internal_message = (
        f"New tutoring enquiry from {enquiry.student_name}\n\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone}\n"
        f"Subject: {enquiry.get_subject_display()}\n"
        f"Year level: {enquiry.year_level}\n"
        f"Preferred format: {enquiry.get_preferred_format_display()}\n"
        f"Availability: {enquiry.availability}\n\n"
        f"Goals:\n{enquiry.goals}\n"
    )
    internal = EmailMultiAlternatives(
        subject=f"New tutoring enquiry: {enquiry.student_name}",
        body=internal_message,
        from_email=from_email,
        to=[getattr(settings, "TUTORING_ENQUIRY_EMAIL", "support@chuba.io")],
        connection=connection,
    )

    try:
        connection.open()
    except Exception:
        logger.exception("Unable to open the tutoring enquiry email connection")
        return

    try:
        for message in (confirmation, internal):
            try:
                message.send()
            except Exception:
                logger.exception(
                    "Unable to send tutoring enquiry email for enquiry %s",
                    enquiry.pk,
                )
    finally:
        try:
            connection.close()
        except Exception:
            logger.exception("Unable to close the tutoring enquiry email connection")


def send_referral_reward_email(referral):
    amount = referral.referrer_reward_amount / 100
    context = {
        "referral": referral,
        "amount": f"A${amount:,.0f}",
    }
    html_message = render_to_string(
        "backend/referral_reward_confirmation.html",
        context,
    )
    message = EmailMultiAlternatives(
        subject="Your Chuba referral reward has been issued",
        body=strip_tags(html_message),
        from_email=settings.DEFAULT_FROM_EMAIL or "support@chuba.io",
        to=[referral.referrer.email],
    )
    message.attach_alternative(html_message, "text/html")
    try:
        message.send()
    except Exception:
        logger.exception(
            "Unable to send referral reward email for referral %s",
            referral.pk,
        )
