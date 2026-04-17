from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User, Student, Project, Assignment, MarkingSheet, AuditLog

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (("Role", {"fields": ("role",)}),)
    list_display = ("username", "email", "role", "is_staff", "is_active")

admin.site.register(Student)
admin.site.register(Project)
admin.site.register(Assignment)
admin.site.register(MarkingSheet)
admin.site.register(AuditLog)
