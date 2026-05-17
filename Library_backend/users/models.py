from django.db import models
from django.contrib.auth.models import User
from books.models import Book 


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')  # one to one
    phone = models.CharField(max_length=20, blank=True, default='')
    address = models.TextField(blank=True, default='')
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {'Admin' if self.is_admin else 'User'}"


class BorrowedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowed_books') # one to many
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowings')
    borrow_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    returned = models.BooleanField(default=False)
    return_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} borrowed {self.book.title}"

    @property
    def is_overdue(self):
        if self.returned or not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.due_date