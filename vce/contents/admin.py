from django.contrib import admin
from .models import Subject, Chapter, Topic

# Register your models here.
admin.site.register(Chapter)
admin.site.register(Topic)
admin.site.register(Subject)