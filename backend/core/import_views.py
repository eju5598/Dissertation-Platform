from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import IsModuleLeader
from .audit import log_action
from .models import Student, Project, Assignment, User
from .importers import import_students, import_projects, import_allocations

class ImportStudentsAPI(APIView):
    permission_classes = [IsModuleLeader]
    def post(self, request):
        f = request.FILES.get("file")
        if not f: return Response({"detail":"file is required"}, status=400)
        result = import_students(f, Student)
        log_action(request.user, "IMPORT", "Student", meta={"inserted": result.get("inserted",0), "updated": result.get("updated",0), "errors": len(result.get("errors",[]))})
        return Response(result)

class ImportProjectsAPI(APIView):
    permission_classes = [IsModuleLeader]
    def post(self, request):
        f = request.FILES.get("file")
        if not f: return Response({"detail":"file is required"}, status=400)
        result = import_projects(f, Project)
        log_action(request.user, "IMPORT", "Project", meta={"inserted": result.get("inserted",0), "updated": result.get("updated",0), "errors": len(result.get("errors",[]))})
        return Response(result)

class ImportAllocationsAPI(APIView):
    permission_classes = [IsModuleLeader]
    def post(self, request):
        f = request.FILES.get("file")
        if not f: return Response({"detail":"file is required"}, status=400)
        result = import_allocations(f, Student, Project, Assignment, User)
        log_action(request.user, "IMPORT", "Assignment", meta={"updated": result.get("updated",0), "errors": len(result.get("errors",[]))})
        return Response(result)
