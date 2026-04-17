from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("MODULE_LEADER", "Module Leader"),
        ("SUPERVISOR", "Supervisor"),
        ("SECOND_MARKER", "Second Marker"),
        ("ADMIN", "Admin"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="SUPERVISOR")

class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="student_profile"
    )

    matric_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    programme = models.CharField(max_length=255)
    school = models.CharField(max_length=255)
    
class Project(models.Model):
    title = models.CharField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    rating = models.IntegerField(default=0)
    level = models.CharField(max_length=50, blank=True)
    tags = models.CharField(max_length=250, blank=True)

class Assignment(models.Model):
    class Status(models.TextChoices):
        UNASSIGNED = "UNASSIGNED", "Unassigned"
        ASSIGNED = "ASSIGNED", "Assigned"
        MODERATED = "MODERATED", "Moderated"

    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name="assignment")
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    supervisor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="supervising", on_delete=models.SET_NULL, null=True, blank=True)
    second_marker = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="second_marking", on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNASSIGNED)
    submission_deadline = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

class MarkingSheet(models.Model):
    ROLE_CHOICES = (
        ("SUPERVISOR", "Supervisor"),
        ("SECOND_MARKER", "Second Marker"),
        ("MODULE_LEADER", "Module Leader"),
    )
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="sheets")
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    for_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    file_path = models.FileField(upload_to="marking_sheets/")
    created_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"
        IMPORT = "IMPORT", "Import"
        EXPORT = "EXPORT", "Export"
        GENERATE = "GENERATE", "Generate"
        LOGIN = "LOGIN", "Login"
        DENY = "DENY", "Denied"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=Action.choices)
    entity = models.CharField(max_length=50)
    entity_id = models.CharField(max_length=50, blank=True)
    meta = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

class Proposal(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="proposals"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="proposals"
    )

    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_proposals",
        limit_choices_to={"role": "SUPERVISOR"}
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "project")

class ProjectPreference(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SELECTED = "SELECTED", "Selected"
        REJECTED = "REJECTED", "Rejected"

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="project_preferences"
    )

    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_preferences"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )

    rank = models.PositiveSmallIntegerField()  # 1, 2, or 3

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "project")
        ordering = ["rank"]

    def __str__(self):
        return f"{self.student.name} → {self.project.title} (Rank {self.rank})"


class Notification(models.Model):

    NOTIFICATION_TYPES = (
        ("PREFERENCE_SUBMITTED", "Preference Submitted"),
        ("PREFERENCE_SELECTED", "Preference Selected"),
        ("PREFERENCE_REJECTED", "Preference Rejected"),
        ("PROPOSAL_ACCEPTED", "Proposal Accepted"),
        ("PROPOSAL_REJECTED", "Proposal Rejected"),
        ("ASSIGNMENT_CREATED", "Assignment Created"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    message = models.TextField()

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )

    related_id = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.notification_type}"


class Submission(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    file = models.FileField(upload_to='submissions/', null=True, blank=True)
    moodle_link = models.URLField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission - {self.student}"

class Marking(models.Model):

    assignment = models.OneToOneField(
        Assignment,
        on_delete=models.CASCADE,
        related_name="marking"
    )

    research_quality = models.IntegerField()
    implementation_quality = models.IntegerField()
    report_quality = models.IntegerField()
    presentation = models.IntegerField()

    comments = models.TextField(blank=True)

    total_marks = models.IntegerField()

    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    marked_at = models.DateTimeField(auto_now_add=True)

    # NEW FIELD → results visible to students only after release
    is_released = models.BooleanField(default=False)

    def save(self, *args, **kwargs):

        self.total_marks = (
            self.research_quality +
            self.implementation_quality +
            self.report_quality +
            self.presentation
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Marking for {self.assignment.student.name}"