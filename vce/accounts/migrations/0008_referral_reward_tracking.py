from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0007_referral_referralcode"),
        ("billing", "0002_membershipsubscription_stripe_payment_intent_id_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="referral",
            name="friend_discount_amount",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="referral",
            name="last_reward_attempt_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="referral",
            name="qualifying_membership",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="qualifying_referrals",
                to="billing.membershipsubscription",
            ),
        ),
        migrations.AddField(
            model_name="referral",
            name="referrer_reward_amount",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="referral",
            name="reward_due_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name="referral",
            name="reward_error",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="referral",
            name="stripe_refund_id",
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
