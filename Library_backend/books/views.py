from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
from .models import Book
from users.models import BorrowedBook
import json


def home(request):
    books = Book.objects.all()
    return render(request, 'Home.html', {'books': books})

def home_admin(request):
    books = Book.objects.all()
    return render(request, 'Home_Admin.html', {'books': books})

def books_page(request):
    books = Book.objects.all()
    return render(request, 'servicess.html', {'books': books})

@login_required
def borrowed_books(request):
    borrowed = BorrowedBook.objects.filter(
        user=request.user,
        returned=False
    ).select_related('book')
    books = [b.book for b in borrowed]
    return render(request, "borrowed.html", {"books": books, "borrowed_records": borrowed})

def about_user(request):
    return render(request, "about_user.html")

def about_admin(request):
    return render(request, "about_admin.html")

@login_required
def return_book(request, id):
    book = get_object_or_404(Book, id=id)
    borrow_record = BorrowedBook.objects.filter(
        user=request.user,
        book=book,
        returned=False
    ).first()
    if borrow_record:
        borrow_record.returned = True
        borrow_record.return_date = timezone.now().date()
        borrow_record.save()
        book.available = True
        book.save()
    return redirect('borrowed_books')

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

def details_page(request):
    return render(request, 'details.html')

@csrf_exempt
def api_add_book(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            pages = data.get('pages')
            publish_year = data.get('publishYear')
            borrowed_count = data.get('borrowedCount')
            Book.objects.create(
                title=data.get('title', ''),
                author=data.get('author', ''),
                category=data.get('category', ''),
                description=data.get('description', ''),
                language=data.get('language', ''),
                pages=int(pages) if pages and str(pages).isdigit() else None,
                publish_year=int(publish_year) if publish_year and str(publish_year).isdigit() else None,
                borrowed_count=int(borrowed_count) if borrowed_count and str(borrowed_count).isdigit() else 0,
                cover_image_url=data.get('image', ''),
                available=data.get('availability') != 'not_available',
            )
            return JsonResponse({'success': True, 'message': 'Book added successfully!'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
def borrow_book(request, id):
    book = get_object_or_404(Book, id=id)
    if book.available:
        BorrowedBook.objects.create(
            user=request.user,
            book=book,
            due_date=timezone.now().date() + timedelta(days=14)
        )
        book.available = False
        book.borrowed_count += 1
        book.save()
    return redirect(request.META.get('HTTP_REFERER', 'home'))

def get_recent_books(request):
    books = Book.objects.all().order_by('-id')[:4]
    data = [{
        "title": b.title, 
        "author": b.author, 
        "category": b.category,
        "availability": "available" if b.available else "borrowed",
        "publishYear": b.publish_year if b.publish_year else "Unknown" # Added to match JS
    } for b in books]
    
    return JsonResponse({"success": True, "books": data}) # Added success flag

def admin_books(request):
    books = Book.objects.all()
    return render(request, "services_Admin.html", {"books": books})

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
    return render(request, 'Home_Admin.html')

def delete_book(request, id):
    book = get_object_or_404(Book, id=id)
    next_page = request.GET.get('next')
    book.delete()
    if next_page == "admin":
        return redirect('admin_books')
    else:
        return redirect('home')
    
    
def edit_book_popup(request, id):
    if not request.user.is_staff:
        return redirect('home')

    book = get_object_or_404(Book, id=id)

    if request.method == "POST":
        book.title = request.POST.get('title')
        book.author = request.POST.get('author')
        book.category = request.POST.get('category')
        book.description = request.POST.get('description')
        book.save()

    return redirect('services_admin')
