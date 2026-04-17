from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Student, Project, Assignment, AuditLog, User,Submission,Marking
from .serializers import StudentSerializer, ProjectSerializer, AssignmentSerializer, AuditLogSerializer,SubmissionSerializer,MarkingSerializer
from .permissions import IsModuleLeaderForWrites, IsModuleLeaderOrAssignedStaff
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.decorators import action,api_view
from rest_framework import viewsets, permissions, status
from .models import Proposal
from .serializers import ProposalSerializer
from rest_framework.decorators import action
from django.db import transaction
from .models import ProjectPreference
from .serializers import ProjectPreferenceSerializer
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from core.notification_service import create_notification, notify_module_leaders
from .models import Notification
from .serializers import NotificationSerializer
from django.utils import timezone
from django.utils.dateparse import parse_datetime

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsModuleLeaderForWrites]

    def get_queryset(self):
        u = self.request.user
        if u.role == "MODULE_LEADER":
            return Student.objects.all().order_by("matric_id")

        return Student.objects.filter(
            assignment__in=Assignment.objects.filter(
                Q(supervisor=u) | Q(second_marker=u)
            )
        ).order_by("matric_id")

    def create(self, request, *args, **kwargs):

        data = request.data

        matric = data.get("matric_id")
        name = data.get("name")
        email = data.get("email")
        programme = data.get("programme")
        school = data.get("school")

        if not all([matric, name, email, programme, school]):
            return Response(
                {"detail": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Student.objects.filter(matric_id=matric).exists():
            return Response(
                {"detail": "Matric ID already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            
            user = User.objects.create_user(
                username=email,         
                email=email,
                password=matric,        
                role="STUDENT",
                is_active=True
            )

            student = Student.objects.create(
                user=user,
                matric_id=matric,
                name=name,
                email=email,
                programme=programme,
                school=school
            )

        serializer = self.get_serializer(student)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == "STUDENT":
            return Project.objects.all().order_by("title")

        if user.role == "SUPERVISOR":
            return Project.objects.filter(
                projectpreference__supervisor=user
            ).distinct().order_by("title")

        return Project.objects.all().order_by("title")

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsModuleLeaderForWrites()]

    def create(self, request, *args, **kwargs):

        title = request.data.get("title")
        description = request.data.get("description")
        level = request.data.get("level")
        rating = request.data.get("rating")
        tags = request.data.get("tags")

        if not title:
            return Response(
                {"detail": "Project title is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Project.objects.filter(title=title).exists():
            return Response(
                {"detail": "Project with this title already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if rating is None:
            rating = 0

        with transaction.atomic():
            project = Project.objects.create(
                title=title,
                description=description,
                level=level,
                rating=rating,
                tags=tags
            )

        serializer = self.get_serializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

   
    def update(self, request, *args, **kwargs):
        project = self.get_object()

        title = request.data.get("title", project.title)

        # Prevent duplicate title on update
        if Project.objects.exclude(id=project.id).filter(title=title).exists():
            return Response(
                {"detail": "Another project with this title already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().update(request, *args, **kwargs)

   
    def destroy(self, request, *args, **kwargs):
        project = self.get_object()

        # Optional: prevent delete if assigned
        if Assignment.objects.filter(project=project).exists():
            return Response(
                {"detail": "Cannot delete project assigned to students"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)



class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = Assignment.objects.select_related(
            "student", "project", "supervisor", "second_marker"
        )

        if u.role == "MODULE_LEADER":
            return qs.order_by("student__matric_id")

        if u.role == "SUPERVISOR":
            return qs.filter(supervisor=u)

        if u.role == "SECOND_MARKER":
            return qs.filter(second_marker=u)

        if u.role == "STUDENT":
            return qs.filter(student__user=u)

        return Assignment.objects.none()

    @action(detail=True, methods=["post"], url_path="assign-supervisor")
    def assign_supervisor(self, request, pk=None):
        assignment = self.get_object()
        supervisor_id = request.data.get("supervisor_id")

        if not supervisor_id:
            return Response(
                {"error": "supervisor_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            supervisor = User.objects.get(id=supervisor_id, role="SUPERVISOR")
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid supervisor"},
                status=status.HTTP_400_BAD_REQUEST
            )

        assignment.supervisor = supervisor
        assignment.save()

        return Response(
            {"message": "Supervisor assigned successfully"},
            status=status.HTTP_200_OK
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        if self.request.user.role != "MODULE_LEADER":
            return AuditLog.objects.none()
        return AuditLog.objects.all()
    
class SupervisorViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        supervisors = User.objects.filter(role="SUPERVISOR")
        data = [
            {
                "id": s.id,
                "name": f"{s.first_name} {s.last_name}".strip() or s.email
            }
            for s in supervisors
        ]
        return Response(data)
    
class ProposalViewSet(viewsets.ModelViewSet):
    serializer_class = ProposalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "SUPERVISOR":
            return Proposal.objects.filter(supervisor=user)

        if user.role == "STUDENT":
            return Proposal.objects.filter(student__user=user)

        if user.role in ["MODULE_LEADER", "ADMIN"]:
            return Proposal.objects.all()

        return Proposal.objects.none()

    def partial_update(self, request, *args, **kwargs):
        proposal = self.get_object()

        if request.user != proposal.supervisor:
            return Response(
                {"detail": "You are not allowed to update this proposal"},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get("status")

        if new_status not in ["ACCEPTED", "REJECTED"]:
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            proposal.status = new_status
            proposal.save()

            if new_status == "ACCEPTED":
                Assignment.objects.update_or_create(
                    student=proposal.student,
                    defaults={
                        "project": proposal.project,
                        "supervisor": proposal.supervisor,
                        "status": Assignment.Status.ASSIGNED
                    }
                )

        return Response(self.get_serializer(proposal).data)
    

class ProjectPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "STUDENT":
            return ProjectPreference.objects.filter(
                student__user=user
            )

        if user.role == "SUPERVISOR":
            return ProjectPreference.objects.filter(
                supervisor=user
            ).exclude(
                status=ProjectPreference.Status.REJECTED
            )

        return ProjectPreference.objects.none()

    def create(self, request, *args, **kwargs):

        if request.user.role == "STUDENT":

            assignment = Assignment.objects.filter(
                student__user=request.user
            ).first()

            if not assignment or not assignment.supervisor:
                return Response(
                    {"detail": "Supervisor not assigned yet."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            existing_prefs = ProjectPreference.objects.filter(
                student__user=request.user
            )

            if existing_prefs.exists():

                all_rejected = not existing_prefs.exclude(
                    status=ProjectPreference.Status.REJECTED
                ).exists()

                if not all_rejected:
                    return Response(
                        {
                            "detail": "You cannot resubmit until all preferences are rejected."
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

                existing_prefs.delete()

            # Inject supervisor automatically
            if isinstance(request.data, list):
                for item in request.data:
                    item["supervisor"] = assignment.supervisor.id
            else:
                request.data["supervisor"] = assignment.supervisor.id

        is_bulk = isinstance(request.data, list)

        serializer = self.get_serializer(data=request.data, many=is_bulk)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
          self.perform_create(serializer)

          if request.user.role == "STUDENT":

           assignment = Assignment.objects.filter(
            student__user=request.user
        ).first()

        created_preferences = serializer.instance

        # Handle bulk or single
        if not isinstance(created_preferences, list):
            created_preferences = [created_preferences]

        for pref in created_preferences:

            project_title = pref.project.title  # adjust if field name differs

            # 🔔 Notify Supervisor
            if assignment and assignment.supervisor:
                create_notification(
                    assignment.supervisor,
                    f"{request.user.username} submitted preference for project: {project_title}.",
                    "PREFERENCE_SUBMITTED",
                    pref.id
                )

            # 🔔 Notify Module Leaders
            notify_module_leaders(
                f"{request.user.username} submitted preference for project: {project_title}.",
                "PREFERENCE_SUBMITTED",
                pref.id
            )


        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="select")
    def select_project(self, request, pk=None):
        preference = self.get_object()

        if request.user != preference.supervisor:
            return Response(
                {"detail": "You are not allowed to select this project"},
                status=status.HTTP_403_FORBIDDEN
            )

        student = preference.student

        if ProjectPreference.objects.filter(
            student=student,
            status=ProjectPreference.Status.SELECTED
        ).exists():
            return Response(
                {"detail": "A project is already selected for this student"},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            preference.status = ProjectPreference.Status.SELECTED
            preference.save(update_fields=["status"])

            ProjectPreference.objects.filter(
                student=student
            ).exclude(id=preference.id).update(
                status=ProjectPreference.Status.REJECTED
            )

            Assignment.objects.update_or_create(
                student=student,
                defaults={
                    "supervisor": preference.supervisor,
                    "project": preference.project,
                    "status": Assignment.Status.ASSIGNED
                }
            )

            project_title = preference.project.title

            # 🔔 Notify Student
            create_notification(
             student.user,
             f"Your project '{project_title}' has been selected by your supervisor.",
            "PREFERENCE_SELECTED",
             preference.id
            )

          # 🔔 Notify Module Leaders
            notify_module_leaders(
             f"{student.user.username}'s project '{project_title}' was selected.",
             "PREFERENCE_SELECTED",
               preference.id
           )


        return Response(
            {"detail": "Project selected successfully"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"], url_path="reject")
    def reject_project(self, request, pk=None):
        preference = self.get_object()

        if request.user != preference.supervisor:
            return Response(
                {"detail": "You are not allowed to reject this project"},
                status=status.HTTP_403_FORBIDDEN
            )

        preference.status = ProjectPreference.Status.REJECTED
        preference.save(update_fields=["status"])

        project_title = preference.project.title

        # 🔔 Notify Student
        create_notification(
          preference.student.user,
          f"Your project '{project_title}' has been rejected by your supervisor.",
             "PREFERENCE_REJECTED",
          preference.id
        )

          # 🔔 Notify Module Leaders
        notify_module_leaders(
           f"{preference.student.user.username}'s project '{project_title}' was rejected.",
             "PREFERENCE_REJECTED",
              preference.id
         )


        return Response(
            {"detail": "Project rejected successfully"},
            status=status.HTTP_200_OK
        )
    

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # User can only see their own notifications
        return Notification.objects.filter(
            user=self.request.user
        )

    @action(detail=True, methods=["post"], url_path="read")
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"detail": "Notification marked as read."})

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({"unread_count": count})



   
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "STUDENT":
            return Submission.objects.filter(student__user=user)

        if user.role in ["SUPERVISOR", "SECOND_MARKER"]:
            return Submission.objects.filter(
                student__assignment__in=Assignment.objects.filter(
                    Q(supervisor=user) | Q(second_marker=user)
                )
            )

        if user.role == "MODULE_LEADER":
            return Submission.objects.all()

        return Submission.objects.none()

    def perform_create(self, serializer):
        student = Student.objects.get(user=self.request.user)

        # Save submission
        submission = serializer.save(student=student)

        # Find assignment
        assignment = Assignment.objects.filter(student=student).first()

        if assignment:

            # 🔔 Notify Supervisor
            if assignment.supervisor:
                create_notification(
                    assignment.supervisor,
                    f"{student.name} submitted dissertation.",
                    "DISSERTATION_SUBMITTED",
                    submission.id
                )

            # 🔔 Notify Second Marker
            if assignment.second_marker:
                create_notification(
                    assignment.second_marker,
                    f"{student.name} submitted dissertation.",
                    "DISSERTATION_SUBMITTED",
                    submission.id
                )

            # 🔔 Notify Module Leaders
            notify_module_leaders(
                f"{student.name} submitted dissertation.",
                "DISSERTATION_SUBMITTED",
                submission.id
            )

@api_view(["GET"])
def check_marking_access(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        return Response({"error": "Assignment not found"}, status=404)

    # Check if student submitted dissertation
    submission_exists = Submission.objects.filter(
        student=assignment.student
    ).exists()

    # Check if deadline passed
    deadline_passed = False
    if assignment.submission_deadline:
        deadline_passed = timezone.now() >= assignment.submission_deadline

    return Response({
    "submission_exists": submission_exists,
    "deadline_passed": deadline_passed,
    "can_start_marking": submission_exists
    })


class MarkingViewSet(viewsets.ModelViewSet):

    serializer_class = MarkingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["SUPERVISOR", "SECOND_MARKER"]:
            return Marking.objects.filter(
                assignment__in=Assignment.objects.filter(
                    Q(supervisor=user) | Q(second_marker=user)
                )
            )

        if user.role == "MODULE_LEADER":
            return Marking.objects.all()

        return Marking.objects.none()

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

@api_view(["GET"])
def check_marking_access(request, assignment_id):

    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        return Response({"error": "Assignment not found"}, status=404)

    submission_exists = Submission.objects.filter(
        student=assignment.student
    ).exists()

    deadline_passed = False

    if assignment.submission_deadline:
        deadline_passed = timezone.now() >= assignment.submission_deadline

    return Response({
        "submission_exists": submission_exists,
        "deadline_passed": deadline_passed,
        "can_start_marking": submission_exists
    })


@api_view(["POST"])
def set_submission_deadline(request):

    if request.user.role != "MODULE_LEADER":
        return Response(
            {"error": "Only module leader can set deadline"},
            status=403
        )

    deadline = request.data.get("deadline")

    if not deadline:
        return Response(
            {"error": "Deadline required"},
            status=400
        )

    deadline_dt = parse_datetime(deadline)

    if not deadline_dt:
        return Response(
            {"error": "Invalid datetime format"},
            status=400
        )

    Assignment.objects.update(submission_deadline=deadline_dt)

    return Response({
        "message": "Submission deadline updated successfully",
        "deadline": deadline_dt
    })


@api_view(["POST"])
def release_results(request):

    if request.user.role != "MODULE_LEADER":
        return Response({"error": "Only module leader can release results"}, status=403)

    Marking.objects.update(is_released=True)

    return Response({"message": "Results released successfully"})

@api_view(["POST"])
def release_single_result(request, assignment_id):

    try:
        marking = Marking.objects.get(assignment_id=assignment_id)

    except Marking.DoesNotExist:
        return Response({"error": "Marks not found"}, status=404)

    marking.is_released = True
    marking.save()

    return Response({"message": "Result released successfully"})

