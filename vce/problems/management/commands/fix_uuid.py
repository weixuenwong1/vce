from problems.models import Question, Order, Solution
from django.db.models import Count
import uuid

def fix_uuids(model, uuid_field='uuid'):
    model_name = model.__name__
    pk_field = model._meta.pk.name

    print(f"\n🔍 Checking {model_name}...")

    # Find duplicate UUIDs
    duplicates = (
        model.objects
        .values(uuid_field)
        .annotate(dupe_count=Count(pk_field))
        .filter(dupe_count__gt=1)
    )
    duplicate_uuids = set(item[uuid_field] for item in duplicates if item[uuid_field])

    updated = 0
    for obj in model.objects.all():
        current_uuid = getattr(obj, uuid_field)
        if not current_uuid or current_uuid in duplicate_uuids:
            new_uuid = uuid.uuid4()
            setattr(obj, uuid_field, new_uuid)
            obj.save()
            updated += 1

    print(f"✅ {updated} UUIDs fixed in {model_name}.")

# Run for each model
fix_uuids(Question)
fix_uuids(Order)
fix_uuids(Solution)