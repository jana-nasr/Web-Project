import json
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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

def details_page(request):
    if not request.user.is_staff:
        return redirect('home') 
    return render(request, 'details.html')

# --- NEW AJAX API ENDPOINTS ---

@csrf_exempt 
def add_book_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            if data.get('id') and Book.objects.filter(book_id=data['id']).exists():
                return JsonResponse({'success': False, 'error': 'A book with this ID already exists.'})

            # Safely parse numeric fields
            pub_year = int(data['publishYear']) if data['publishYear'] and data['publishYear'] != 'Unknown' else None
            page_count = int(data['pages']) if data['pages'] and data['pages'] != '0' else None
            borrow_count = int(data['borrowedCount']) if data['borrowedCount'] else 0
            
            # Convert string availability to boolean for your team's existing model
            is_available = True if data['availability'] == 'available' else False

            Book.objects.create(
                book_id=data['id'],
                title=data['title'],
                author=data['author'],
                category=data['category'],
                description=data['description'],
                available=is_available,
                language=data['language'],
                publish_year=pub_year,
                pages=page_count,
                borrowed_count=borrow_count,
                cover_image_url=data['image']
            )
            return JsonResponse({'success': True, 'message': 'Book saved to the database successfully.'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

def get_recent_books(request):
    recent_books = Book.objects.all().order_by('-id')[:4]
    books_data = []
    for book in recent_books:
        books_data.append({
            'title': book.title,
            'author': book.author,
            'category': book.category,
            'availability': 'available' if book.available else 'not_available',
            'publishYear': book.publish_year or "Unknown"
        })
    return JsonResponse({'success': True, 'books': books_data})
