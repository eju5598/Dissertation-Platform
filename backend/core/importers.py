import csv, io
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


def _read_csv(file_obj):
    decoded = file_obj.read().decode("utf-8-sig")
    return list(csv.DictReader(io.StringIO(decoded)))



def import_students(file_obj, Student):
    required = ["matric_id", "name", "email", "programme", "school"]
    rows = _read_csv(file_obj)
    errors, inserted, updated = [], 0, 0

    if not rows:
        return {
            "inserted": 0,
            "updated": 0,
            "errors": [{"row": 0, "field": "", "message": "Empty CSV"}],
        }

    for col in required:
        if col not in rows[0]:
            errors.append({"row": 0, "field": col, "message": "Missing required column"})

    if errors:
        return {"inserted": 0, "updated": 0, "errors": errors}

    seen = set()

    for i, r in enumerate(rows, start=2):
        matric = str(r.get("matric_id") or "").strip().replace(".0", "")
        name = (r.get("name") or "").strip()
        email = (r.get("email") or "").strip()
        programme = (r.get("programme") or "").strip()
        school = (r.get("school") or "").strip()

        if not matric:
            errors.append({"row": i, "field": "matric_id", "message": "Required"})
            continue

        if matric in seen:
            errors.append({"row": i, "field": "matric_id", "message": "Duplicate in file"})
            continue

        seen.add(matric)

        if not name:
            errors.append({"row": i, "field": "name", "message": "Required"})

        try:
            validate_email(email)
        except ValidationError:
            errors.append({"row": i, "field": "email", "message": "Invalid email"})

        if not programme:
            errors.append({"row": i, "field": "programme", "message": "Required"})

        if not school:
            errors.append({"row": i, "field": "school", "message": "Required"})

        if any(e["row"] == i for e in errors):
            continue

        try:
            with transaction.atomic():
                user, user_created = User.objects.get_or_create(
                    username=name,
                    defaults={
                        "email": email,
                        "role": "STUDENT",
                        "is_active": True,
                    },
                )

                if user_created:
                    user.set_password(matric)
                    user.save()

                Student.objects.update_or_create(
                    matric_id=matric,
                    defaults={
                        "user": user,
                        "name": name,
                        "email": email,
                        "programme": programme,
                        "school": school,
                    },
                )

                inserted += 1 if user_created else 0
                updated += 0 if user_created else 1

        except Exception as e:
            errors.append({"row": i, "field": "", "message": str(e)})

    return {"inserted": inserted, "updated": updated, "errors": errors}


# ======================================================
# PROJECT IMPORT (UNCHANGED)
# ======================================================
def import_projects(file_obj, Project):
    required = ["project_title", "description", "level", "rating", "tags"]
    rows = _read_csv(file_obj)
    errors, inserted, updated = [], 0, 0

    if not rows:
        return {"inserted": 0, "updated": 0, "errors": [{"row": 0, "field": "", "message": "Empty CSV"}]}

    for col in required:
        if col not in rows[0]:
            errors.append({"row": 0, "field": col, "message": "Missing required column"})

    if errors:
        return {"inserted": 0, "updated": 0, "errors": errors}

    seen = set()

    for i, r in enumerate(rows, start=2):
        title = (r.get("project_title") or "").strip()
        desc = (r.get("description") or "").strip()
        level = (r.get("level") or "").strip()
        rating_raw = (r.get("rating") or "").strip()
        tags = (r.get("tags") or "").strip()

        if not title:
            errors.append({"row": i, "field": "project_title", "message": "Required"})
            continue

        if title in seen:
            errors.append({"row": i, "field": "project_title", "message": "Duplicate in file"})
            continue

        seen.add(title)

        try:
            rating = int(rating_raw)
        except:
            errors.append({"row": i, "field": "rating", "message": "Rating must be integer"})
            continue

        Project.objects.update_or_create(
            title=title,
            defaults={
                "description": desc,
                "level": level,
                "rating": rating,
                "tags": tags,
            },
        )

        inserted += 1

    return {"inserted": inserted, "updated": updated, "errors": errors}


# ======================================================
# ALLOCATION IMPORT (NO PROJECT, SECOND MARKER OPTIONAL)
# ======================================================
def import_allocations(file_obj, Student, Project, Assignment, User):
    required = ["matric_id", "supervisor_email"]
    rows = _read_csv(file_obj)
    errors, updated = [], 0

    if not rows:
        return {"updated": 0, "errors": [{"row": 0, "field": "", "message": "Empty CSV"}]}

    for col in required:
        if col not in rows[0]:
            errors.append({"row": 0, "field": col, "message": "Missing required column"})

    if errors:
        return {"updated": 0, "errors": errors}

    for i, r in enumerate(rows, start=2):
        matric = str(r.get("matric_id") or "").strip().replace(".0", "")
        sup_email = (r.get("supervisor_email") or "").strip()
        sm_email = (r.get("second_marker_email") or "").strip()

        student = Student.objects.filter(matric_id__iexact=matric).first()
        if not student:
            errors.append({"row": i, "field": "matric_id", "message": "Student not found"})
            continue

        supervisor = User.objects.filter(
            email__iexact=sup_email,
            role="SUPERVISOR"
        ).first()

        if not supervisor:
            errors.append({"row": i, "field": "supervisor_email", "message": "Supervisor not found"})
            continue

        second_marker = None
        if sm_email:
            second_marker = User.objects.filter(
                email__iexact=sm_email,
                role="SECOND_MARKER"
            ).first()

            if not second_marker:
                errors.append({"row": i, "field": "second_marker_email", "message": "Second marker not found"})
                continue

        assignment, _ = Assignment.objects.get_or_create(student=student)
        assignment.supervisor = supervisor
        assignment.second_marker = second_marker

        if assignment.status != Assignment.Status.ASSIGNED:
           assignment.project = None
           assignment.status = Assignment.Status.UNASSIGNED

        assignment.save()

        updated += 1

    return {"updated": updated, "errors": errors}
 