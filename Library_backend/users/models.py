from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime


class UserProfile(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone      = models.CharField(max_length=20, blank=True, null=True)
    address    = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class BorrowedBook(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowed_books')
    book       = models.ForeignKey('books.Book', on_delete=models.CASCADE)
    borrow_date = models.DateField(auto_now_add=True)
    due_date   = models.DateField()
    returned   = models.BooleanField(default=False)
    return_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-borrow_date']

    def __str__(self):
        return f"{self.user.username} borrowed {self.book.title}"

    def is_overdue(self):
        if not self.returned and self.due_date < timezone.now().date():
            return True
        return False

    def days_overdue(self):
        if self.is_overdue():
            return (timezone.now().date() - self.due_date).days
        return 0

    def save(self, *args, **kwargs):
        # Default due date = 14 days from borrow
        if not self.due_date:
            self.due_date = timezone.now().date() + datetime.timedelta(days=14)
        super().save(*args, **kwargs)
