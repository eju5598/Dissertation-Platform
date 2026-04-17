from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, ProjectViewSet, AssignmentViewSet, AuditLogViewSet, SupervisorViewSet, ProposalViewSet, ProjectPreferenceViewSet, NotificationViewSet, SubmissionViewSet,check_marking_access,MarkingViewSet,release_results,release_single_result
from .import_views import ImportStudentsAPI, ImportProjectsAPI, ImportAllocationsAPI
from .sheet_views import GenerateMarkingSheetXLSX


router = DefaultRouter()
router.register("students", StudentViewSet, basename="students")
router.register("projects", ProjectViewSet, basename="projects")
router.register("assignments", AssignmentViewSet, basename="assignments")
router.register("audit", AuditLogViewSet, basename="audit")
router.register("supervisors", SupervisorViewSet, basename="supervisors")
router.register("proposals", ProposalViewSet, basename="proposals")
router.register("project-preferences", ProjectPreferenceViewSet, basename="project-preferences")
router.register("notifications", NotificationViewSet, basename="notifications")
router.register("submissions", SubmissionViewSet, basename="submissions")
router.register("markings", MarkingViewSet, basename="markings")


urlpatterns = router.urls + [
    path("import/students/", ImportStudentsAPI.as_view()),
    path("import/projects/", ImportProjectsAPI.as_view()),
    path("import/allocations/", ImportAllocationsAPI.as_view()),
    path("marking-sheets/<int:assignment_id>/generate-xlsx/", GenerateMarkingSheetXLSX.as_view()),
    path("assignments/<int:assignment_id>/marking-access/", check_marking_access),
    path("release-results/", release_results),
    path("release-result/<int:assignment_id>/", release_single_result),
]
