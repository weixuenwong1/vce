from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from billing.referrals import process_due_resource_referrals


class Command(BaseCommand):
    help = "Verify due annual referrals and issue eligible Stripe partial refunds."

    def handle(self, *args, **options):
        if not settings.REFERRALS_ENABLED:
            raise CommandError("Referral rewards are disabled.")
        if not settings.STRIPE_SECRET_KEY:
            raise CommandError("STRIPE_SECRET_KEY is not configured.")
        results = process_due_resource_referrals()
        self.stdout.write(
            self.style.SUCCESS(
                "Referral rewards processed: "
                + ", ".join(f"{name}={count}" for name, count in results.items())
            )
        )
