# Generated by Django 5.1.6 on 2025-04-13 07:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contents', '0002_chapter_slug_topic_slug'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chapter',
            name='slug',
        ),
        migrations.RemoveField(
            model_name='topic',
            name='slug',
        ),
    ]
