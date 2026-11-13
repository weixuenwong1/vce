from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0005_tutoringinterest"),
    ]

    operations = [
        migrations.AddField(
            model_name="usersubjectengagement",
            name="questions_attempted",
            field=models.PositiveBigIntegerField(default=0),
        ),
    ]
