from django.contrib import admin
from .models import UserProfile, BorrowedBook

admin.site.register(UserProfile)
admin.site.register(BorrowedBook)