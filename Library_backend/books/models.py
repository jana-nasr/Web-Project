from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    description = models.TextField()

    image = models.ImageField(upload_to='books/', blank=True, null=True)
    available = models.BooleanField(default=True)

    book_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    language = models.CharField(max_length=50, blank=True, null=True)
    publish_year = models.IntegerField(blank=True, null=True)
    pages = models.IntegerField(blank=True, null=True)
    borrowed_count = models.IntegerField(default=0)
    cover_image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.author}"