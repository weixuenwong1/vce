# Generated by Django 5.1.6 on 2025-04-15 09:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contents', '0004_chapter_slug_topic_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='content',
            field=models.TextField(blank=True, null=True),
        ),
    ]
