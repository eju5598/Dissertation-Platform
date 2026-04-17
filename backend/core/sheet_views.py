from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files.base import ContentFile
from .models import Assignment, MarkingSheet
from .audit import log_action
from .sheets import build_marking_sheet_xlsx

class GenerateMarkingSheetXLSX(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, assignment_id):
        user = request.user
        assignment = Assignment.objects.select_related("student","project","supervisor","second_marker").filter(id=assignment_id).first()
        if not assignment: return Response({"detail":"Assignment not found"}, status=404)
        if user.role != "MODULE_LEADER" and not (assignment.supervisor_id == user.id or assignment.second_marker_id == user.id):
            log_action(user, "DENY", "MarkingSheet", assignment_id, {"reason":"not_assigned"})
            return Response({"detail":"Not allowed"}, status=403)
        for_role = "MODULE_LEADER" if user.role=="MODULE_LEADER" else ("SUPERVISOR" if assignment.supervisor_id==user.id else "SECOND_MARKER")
        xlsx_bytes = build_marking_sheet_xlsx(assignment)
        filename = f"marking_{assignment.student.matric_id}_{for_role}.xlsx"
        sheet = MarkingSheet.objects.create(assignment=assignment, generated_by=user, for_role=for_role)
        sheet.file_path.save(filename, ContentFile(xlsx_bytes.read())); sheet.save()
        log_action(user, "GENERATE", "MarkingSheet", sheet.id, {"assignment_id": assignment.id, "matric_id": assignment.student.matric_id, "for_role": for_role})
        return Response({"sheet_id": sheet.id, "file_url": sheet.file_path.url})
