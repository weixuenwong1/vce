import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [(migrations.swappable_dependency(settings.AUTH_USER_MODEL))]

    operations = [
        migrations.CreateModel(
            name="BillingCustomer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("stripe_customer_id", models.CharField(max_length=255, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="billing_customer", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="MembershipSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("stripe_customer_id", models.CharField(db_index=True, max_length=255)),
                ("stripe_subscription_id", models.CharField(max_length=255, unique=True)),
                ("stripe_checkout_session_id", models.CharField(blank=True, max_length=255)),
                ("stripe_price_id", models.CharField(max_length=255)),
                ("plan", models.CharField(choices=[("self-study", "Chuba Self Study"), ("supported", "Chuba Supported")], max_length=20)),
                ("subject", models.CharField(choices=[("physics", "Physics"), ("chemistry", "Chemistry"), ("biology", "Biology")], max_length=20)),
                ("billing_cycle", models.CharField(choices=[("monthly", "Monthly"), ("annual", "Annual")], max_length=10)),
                ("status", models.CharField(db_index=True, default="incomplete", max_length=30)),
                ("current_period_end", models.DateTimeField(blank=True, null=True)),
                ("cancel_at_period_end", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="membership_subscriptions", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ("-created_at",)},
        ),
    ]
