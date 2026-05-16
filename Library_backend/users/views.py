from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User
from django.utils import timezone
from django.shortcuts import get_object_or_404, render, redirect
from datetime import timedelta
import json

from .models import UserProfile, BorrowedBook
from books.models import Book


# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────

def get_user_by_email(email):
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        return None


# ─────────────────────────────────────────
# TEMPLATE PAGES
# ─────────────────────────────────────────

def profile_page(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'profile.html')


def admin_profile_page(request):
    if not request.user.is_authenticated:
        return redirect('login')
    if not request.user.is_staff:
        return redirect('profile')
    return render(request, 'admin_profile.html')


def login_page(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        if not email or not password:
            return render(request, 'login.html', {'error': 'Email and password are required.'})

        user_obj = get_user_by_email(email)
        if not user_obj:
            return render(request, 'login.html', {'error': 'Invalid email or password.'})

        user = authenticate(request, username=user_obj.username, password=password)
        if user is None:
            return render(request, 'login.html', {'error': 'Invalid email or password.'})

        auth_login(request, user)

        if user.is_staff:
            return redirect('admin_profile')

        return redirect('profile')

    return render(request, 'login.html')


def signup_page(request):
    return render(request, 'signup.html')


def forgot_password_page(request):
    message = ''
    error = ''

    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        if not email:
            error = 'Please enter your email address.'
        else:
            user_obj = get_user_by_email(email)
            if user_obj:
                message = f'A password reset link has been sent to {email}.'
            else:
                error = 'No account was found with that email address.'

    return render(request, 'forgot_password.html', {
        'message': message,
        'error': error,
    })


def contact_page(request):
    return render(request, 'contact.html')


# ─────────────────────────────────────────
# GET USER PROFILE DATA
# ─────────────────────────────────────────

@require_GET
def api_user_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Not logged in'}, status=401)

    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    borrowed = BorrowedBook.objects.filter(user=user, returned=False).select_related('book')

    today = timezone.now().date()
    overdue_count = 0
    due_this_week = 0
    borrowed_list = []

    for b in borrowed:
        is_overdue = b.due_date and b.due_date < today
        days_left = (b.due_date - today).days if b.due_date else 0

        if is_overdue:
            overdue_count += 1
        elif days_left <= 7:
            due_this_week += 1

        borrowed_list.append({
            'borrow_id': b.id,
            'book_id': b.book.id,
            'title': b.book.title,
            'author': b.book.author,
            'due_date': str(b.due_date),
            'is_overdue': is_overdue,
            'days_left': days_left,
        })

    return JsonResponse({
        'success': True,
        'username': user.username,
        'email': user.email,
        'phone': profile.phone or '',
        'address': profile.address or '',
        'is_admin': profile.is_admin,  # من is_admin مش من profile
        'borrowed_books': borrowed_list,
        'overdue_count': overdue_count,
        'due_this_week': due_this_week,
    })


# ─────────────────────────────────────────
# UPDATE PROFILE
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_update_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Not logged in'}, status=401)

    try:
        data = json.loads(request.body)
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        if data.get('phone') is not None:
            profile.phone = data['phone'].strip()
        if data.get('address') is not None:
            profile.address = data['address'].strip()

        profile.save()
        return JsonResponse({'success': True, 'message': 'Profile updated successfully!'})

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


# ─────────────────────────────────────────
# RETURN BOOK
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_return_book(request, borrow_id):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Not logged in'}, status=401)

    try:
        user = request.user
        borrow = get_object_or_404(BorrowedBook, id=borrow_id, user=user)

        if borrow.returned:
            return JsonResponse({'success': False, 'message': 'Book already returned'})

        borrow.returned = True
        borrow.return_date = timezone.now().date()
        borrow.save()

        borrow.book.available = True
        borrow.book.save()

        return JsonResponse({'success': True, 'message': 'Book returned successfully!'})

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


# ─────────────────────────────────────────
# BORROW BOOK
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_borrow_book(request, book_id):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'Not logged in'}, status=401)

    try:
        user = request.user
        book = get_object_or_404(Book, id=book_id)

        if not book.available:
            return JsonResponse({'success': False, 'message': 'Book is not available'})

        already = BorrowedBook.objects.filter(user=user, book=book, returned=False).exists()
        if already:
            return JsonResponse({'success': False, 'message': 'You already borrowed this book'})

        BorrowedBook.objects.create(
            user=user,
            book=book,
            due_date=timezone.now().date() + timedelta(days=14)
        )
        book.available = False
        book.save()

        return JsonResponse({'success': True, 'message': f'"{book.title}" borrowed successfully!'})

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


# ─────────────────────────────────────────
# ADMIN DASHBOARD
# ─────────────────────────────────────────

@require_GET
def api_admin_dashboard(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'success': False, 'message': 'Admin access required'}, status=403)

    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    total_books = Book.objects.count()
    available_books = Book.objects.filter(available=True).count()
    categories = Book.objects.values_list('category', flat=True).distinct()

    recent_books = list(Book.objects.order_by('-id')[:10].values(
        'id', 'title', 'author', 'category', 'available'
    ))

    today = timezone.now().date()
    overdue = BorrowedBook.objects.filter(returned=False, due_date__lt=today).select_related('user', 'book')
    overdue_list = [{
        'user_id': b.user.id,
        'username': b.user.username,
        'email': b.user.email,
        'book_title': b.book.title,
        'due_date': str(b.due_date),
        'days_overdue': (today - b.due_date).days,
    } for b in overdue]

    all_users = User.objects.filter(is_staff=False).select_related('profile')
    users_list = [{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'phone': u.profile.phone if hasattr(u, 'profile') else '',
        'joined': str(u.date_joined.date()),
    } for u in all_users]

    return JsonResponse({
        'success': True,
        'username': user.username,
        'email': user.email,
        'phone': profile.phone or '',
        'total_books': total_books,
        'available_books': available_books,
        'categories': len(list(categories)),
        'recent_books': recent_books,
        'overdue_list': overdue_list,
        'all_users': users_list,
    })


# ─────────────────────────────────────────
# DELETE USER
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_delete_user(request, user_id):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'success': False, 'message': 'Admin access required'}, status=403)

    try:
        target = get_object_or_404(User, id=user_id)
        if target.is_staff:
            return JsonResponse({'success': False, 'message': 'Cannot delete another admin'})

        target.delete()
        return JsonResponse({'success': True, 'message': 'User deleted successfully!'})

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


# ─────────────────────────────────────────
# REGISTER USER
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_register(request):
    try:
        data = json.loads(request.body)

        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        phone = data.get('phone', '')
        is_admin = data.get('is_admin')

        if not username or not email or not password:
            return JsonResponse({'success': False, 'message': 'All fields required'})

        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'message': 'Username already exists'})

        if User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'message': 'Email already registered'})

        is_admin_bool = str(is_admin) in ['1', 'true', 'True', 'yes', 'on']

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=is_admin_bool,
            is_superuser=False
        )

        UserProfile.objects.create(user=user, phone=phone, is_admin=is_admin_bool)

        return JsonResponse({'success': True, 'message': 'User registered successfully!'})

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)