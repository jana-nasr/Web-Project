from django.contrib import admin
from .models import UserProfile, Book, BorrowedBook

admin.site.register(UserProfile)
admin.site.register(Book)
admin.site.register(BorrowedBook)