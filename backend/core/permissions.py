from rest_framework.permissions import BasePermission, SAFE_METHODS
class IsModuleLeader(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "MODULE_LEADER")

class IsModuleLeaderForWrites(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == "MODULE_LEADER"

class IsModuleLeaderOrAssignedStaff(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == "MODULE_LEADER":
            return True
        return request.method in SAFE_METHODS
