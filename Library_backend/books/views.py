from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Book
import json


def home(request):
    books = Book.objects.all()
    return render(request, 'Home.html', {'books': books})


def books_page(request):
    books = Book.objects.all()
    return render(request, 'servicess.html', {'books': books})


def borrowed_books(request):
    books = Book.objects.filter(available=False)
    return render(request, "borrowed.html", {"books": books})

def about_user(request):
    return render(request, "about_user.html")


def about_admin(request):
    return render(request, "about_admin.html")

def return_book(request, id):
    book = get_object_or_404(Book, id=id)

    if not book.available:
        book.available = True
        book.save()

    return redirect('borrowed_books')


# ---------- CRUD ----------

def add_book(request):
    if request.method == "POST":
        Book.objects.create(
            title=request.POST['title'],
            author=request.POST['author'],
            category=request.POST['category'],
            description=request.POST['description'],
            image=request.FILES.get('image'),
            language=request.POST.get('language'),
            pages=request.POST.get('pages')
        )
    return redirect('home')





def borrow_book(request, id):
    book = get_object_or_404(Book, id=id)

    if book.available:
        book.available = False
        book.borrowed_count += 1
        book.save()

    return redirect(request.META.get('HTTP_REFERER', 'home'))


# ---------- API ----------

def get_recent_books(request):
    books = Book.objects.all().order_by('-id')[:4]

    data = [
        {
            "title": b.title,
            "author": b.author,
            "category": b.category,
            "availability": "available" if b.available else "borrowed",
        }
        for b in books
    ]

    return JsonResponse({"books": data})

def admin_books(request):
    books = Book.objects.all()
    return render(request, "services_Admin.html", {"books": books})


def edit_book(request, id):
    book = get_object_or_404(Book, id=id)

    next_page = request.GET.get('next')

    if request.method == "POST":
        book.title = request.POST['title']
        book.author = request.POST['author']
        book.category = request.POST['category']
        book.description = request.POST['description']
        book.save()

        if next_page == "admin":
            return redirect('admin_books')
        else:
            return redirect('home')

    return render(request, "details.html", {"book": book})

def delete_book(request, id):
    book = get_object_or_404(Book, id=id)

    next_page = request.GET.get('next')

    book.delete()

    if next_page == "admin":
        return redirect('admin_books')
    else:
        return redirect('home')
    
    