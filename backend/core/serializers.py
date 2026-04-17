from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Proposal
from .models import Student, Project, Assignment, AuditLog,Submission,Submission,Marking
from django.contrib.auth.models import User
from .models import ProjectPreference
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()



class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "level",
            "rating",  
            "tags",
        ]

class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = [
            "id",
            "message",
            "notification_type",
            "related_id",
            "is_read",
            "created_at",
        ]

class AssignmentSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)

    supervisor_name = serializers.SerializerMethodField()
    second_marker_name = serializers.SerializerMethodField()

    submission = serializers.SerializerMethodField()
    marking = serializers.SerializerMethodField()   # NEW FIELD

    student_id = serializers.PrimaryKeyRelatedField(
        source="student",
        queryset=Student.objects.all(),
        write_only=True
    )

    project_id = serializers.PrimaryKeyRelatedField(
        source="project",
        queryset=Project.objects.all(),
        write_only=True,
        allow_null=True,
        required=False
    )

    supervisor_id = serializers.PrimaryKeyRelatedField(
        source="supervisor",
        queryset=User.objects.filter(role="SUPERVISOR"),
        write_only=True,
        required=False,
        allow_null=True
    )

    second_marker_id = serializers.PrimaryKeyRelatedField(
        source="second_marker",
        queryset=User.objects.filter(role="SECOND_MARKER"),
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Assignment
        fields = [
    "id",
    "status",
    "updated_at",
    "submission_deadline",   
    "student",
    "project",
    "submission",
    "marking",
    "student_id",
    "project_id",
    "supervisor_id",
    "supervisor_name",
    "second_marker_id",
    "second_marker_name",
    ]

    def get_supervisor_name(self, obj):
        return obj.supervisor.username if obj.supervisor else None

    def get_second_marker_name(self, obj):
        return obj.second_marker.username if obj.second_marker else None

    def get_submission(self, obj):
        submission = Submission.objects.filter(student=obj.student).first()

        if submission:
            return {
                "id": submission.id,
                "moodle_link": submission.moodle_link,
                "submitted_at": submission.submitted_at
            }

        return None

    def get_marking(self, obj):
        marking = Marking.objects.filter(assignment=obj).first()

        if marking:
            return {
               "research_quality": marking.research_quality,
               "implementation_quality": marking.implementation_quality,
               "report_quality": marking.report_quality,
               "presentation": marking.presentation,
               "total_marks": marking.total_marks,
              "is_released": marking.is_released
            }

        return None

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"

class SupervisorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["role"] = user.role
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser

        return token
    

class ProposalSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    project_title = serializers.CharField(source="project.title", read_only=True)
    supervisor_name = serializers.CharField(source="supervisor.username", read_only=True)

    class Meta:
        model = Proposal
        fields = [
            "id",
            "student",
            "student_name",
            "project",
            "project_title",
            "supervisor",
            "supervisor_name",
            "status",
            "created_at",
        ]
        read_only_fields = ["status", "created_at"]
        

class ProjectPreferenceSerializer(serializers.ModelSerializer):    
    student_name = serializers.CharField(
        source="student.name",
        read_only=True
    )

    project_title = serializers.CharField(
        source="project.title",
        read_only=True
    )

    supervisor_name = serializers.CharField(
        source="supervisor.name",
        read_only=True
    )

    class Meta:
        model = ProjectPreference
        fields = [
            "id",
            "student",
            "student_name",
            "project",
            "project_title",
            "supervisor",
            "supervisor_name",
            "rank",
            "status",
            "created_at",
        ]


class SubmissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Submission
        fields = ["id", "file", "moodle_link", "submitted_at", "student"]
        read_only_fields = ["student", "submitted_at"]

    def validate(self, data):
        if not data.get("moodle_link") and not data.get("file"):
            raise serializers.ValidationError(
                "Provide a Moodle link or upload a file."
            )
        return data
    

class MarkingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Marking
        fields = [
            "id",
            "assignment",
            "research_quality",
            "implementation_quality",
            "report_quality",
            "presentation",
            "comments",
            "total_marks",
            "marked_by",
            "marked_at"
        ]
        read_only_fields = ["total_marks", "marked_by", "marked_at"]