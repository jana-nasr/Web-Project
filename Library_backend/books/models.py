from django.db import models

# Create your models here.
class Book(models.Model):

    title = models.CharField(max_length=100)

    author = models.CharField(max_length=100)

    category = models.CharField(max_length=100)

    description = models.TextField()

    image = models.ImageField(upload_to='books/')

    available = models.BooleanField(default=True)

    def __str__(self):
        return self.title
