from django.shortcuts import render, get_object_or_404, redirect
from .models import Book


def home(request):
    books = Book.objects.all()
    return render(request, 'Home.html', {'books': books})


def home_admin(request):
    books = Book.objects.all()
    return render(request, 'Home_Admin.html', {'books': books})


def delete_book(request, id):
    if not request.user.is_staff:
        return redirect('home')

    book = get_object_or_404(Book, id=id)
    book.delete()
    return redirect('home_admin')


def edit_book(request, id):
    if not request.user.is_staff:
        return redirect('home')

    book = get_object_or_404(Book, id=id)

    if request.method == "POST":
        book.title = request.POST['title']
        book.author = request.POST['author']
        book.category = request.POST['category']
        book.description = request.POST['description']
        book.save()

    return redirect('home_admin')


def add_book(request):
    if not request.user.is_staff:
        return redirect('home')

    if request.method == "POST":
        Book.objects.create(
            title=request.POST['title'],
            author=request.POST['author'],
            category=request.POST['category'],
            description=request.POST['description'],
            image=request.FILES.get('image')  
        )

    return redirect('home_admin')


def borrow_book(request, id):
    book = get_object_or_404(Book, id=id)

    book.available = False
    book.save()

    return redirect('home')


def borrowed_books(request):
    books = Book.objects.filter(available=False)
    return render(request, "borrowed.html", {"books": books})