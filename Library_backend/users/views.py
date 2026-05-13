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

ADMIN_EMAIL = 'admin@onlinelibrary.com'


# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────

def get_user_by_email(email):
    """Get User by email or None"""
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
    if request.user.email.strip().lower() != ADMIN_EMAIL or not request.user.is_staff:
        return redirect('login')
    return render(request, 'admin_profile.html')


def login_page(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')

        if not email or not password:
            return render(request, 'login.html', {
                'error': 'Email and password are required.'
            })

        user_obj = get_user_by_email(email)
        if not user_obj:
            return render(request, 'login.html', {
                'error': 'Invalid email or password.'
            })

        user = authenticate(request, username=user_obj.username, password=password)
        if user is None:
            return render(request, 'login.html', {
                'error': 'Invalid email or password.'
            })

        if email == ADMIN_EMAIL and not user.is_staff:
            return render(request, 'login.html', {
                'error': 'Only the admin account can log in here.'
            })

        auth_login(request, user)

        if email == ADMIN_EMAIL and user.is_staff:
            return redirect('admin_profile')

        return redirect('profile')

    return render(request, 'login.html')


def signup_page(request):
    return render(request, 'signup.html')


def contact_page(request):
    return render(request, 'contact.html')


# ─────────────────────────────────────────
# GET USER PROFILE DATA
# GET /api/profile/?email=xxx
# ─────────────────────────────────────────

@require_GET
def api_user_profile(request):
    email = request.GET.get('email', '').strip().lower()

    if not email:
        return JsonResponse(
            {'success': False, 'message': 'Email required'},
            status=400
        )

    user = get_user_by_email(email)

    if not user:
        return JsonResponse(
            {'success': False, 'message': 'User not found'},
            status=404
        )

    profile, _ = UserProfile.objects.get_or_create(user=user)

    borrowed = BorrowedBook.objects.filter(
        user=user,
        returned=False
    ).select_related('book')

    today = timezone.now().date()

    overdue_count = 0
    due_this_week = 0
    borrowed_list = []

    for b in borrowed:

        is_overdue = b.due_date and b.due_date < today

        days_left = (
            (b.due_date - today).days
            if b.due_date else 0
        )

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
        'is_admin': profile.is_admin,
        'borrowed_books': borrowed_list,
        'overdue_count': overdue_count,
        'due_this_week': due_this_week,
    })


# ─────────────────────────────────────────
# UPDATE PROFILE
# POST /api/profile/update/
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_update_profile(request):
    try:
        data = json.loads(request.body)

        email = data.get('email', '').strip().lower()
        phone = data.get('phone', None)
        address = data.get('address', None)

        if not email:
            return JsonResponse(
                {'success': False, 'message': 'Email required'},
                status=400
            )

        user = get_user_by_email(email)

        if not user:
            return JsonResponse(
                {'success': False, 'message': 'User not found'},
                status=404
            )

        profile, _ = UserProfile.objects.get_or_create(user=user)

        if phone is not None:
            profile.phone = phone.strip()

        if address is not None:
            profile.address = address.strip()

        profile.save()

        return JsonResponse({
            'success': True,
            'message': 'Profile updated successfully!'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ─────────────────────────────────────────
# RETURN BOOK
# POST /api/return/<borrow_id>/
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_return_book(request, borrow_id):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()

        user = get_user_by_email(email)

        if not user:
            return JsonResponse(
                {'success': False, 'message': 'User not found'},
                status=404
            )

        borrow = get_object_or_404(
            BorrowedBook,
            id=borrow_id,
            user=user
        )

        if borrow.returned:
            return JsonResponse({
                'success': False,
                'message': 'Book already returned'
            })

        borrow.returned = True
        borrow.return_date = timezone.now().date()
        borrow.save()

        borrow.book.available = True
        borrow.book.save()

        return JsonResponse({
            'success': True,
            'message': 'Book returned successfully!'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ─────────────────────────────────────────
# BORROW BOOK
# POST /api/borrow/<book_id>/
# ─────────────────────────────────────────

@csrf_exempt
@require_POST
def api_borrow_book(request, book_id):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()

        user = get_user_by_email(email)

        if not user:
            return JsonResponse(
                {'success': False, 'message': 'User not found'},
                status=404
            )

        book = get_object_or_404(Book, id=book_id)

        if not book.available:
            return JsonResponse({
                'success': False,
                'message': 'Book is not available'
            })

        already = BorrowedBook.objects.filter(
            user=user,
            book=book,
            returned=False
        ).exists()

        if already:
            return JsonResponse({
                'success': False,
                'message': 'You already borrowed this book'
            })

        BorrowedBook.objects.create(
            user=user,
            book=book,
            due_date=timezone.now().date() + timedelta(days=7)
        )

        book.available = False
        book.save()

        return JsonResponse({
            'success': True,
            'message': f'"{book.title}" borrowed successfully!'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ─────────────────────────────────────────
# ADMIN DASHBOARD
# GET /api/admin/dashboard/
# ─────────────────────────────────────────

@require_GET
def api_admin_dashboard(request):
    email = request.GET.get('email', '').strip().lower()

    user = get_user_by_email(email)

    if not user or not user.is_staff:
        return JsonResponse({
            'success': False,
            'message': 'Admin access required'
        }, status=403)

    profile, _ = UserProfile.objects.get_or_create(user=user)

    total_books = Book.objects.count()
    available_books = Book.objects.filter(
        available=True
    ).count()

    categories = list(
        Book.objects.values_list(
            'category',
            flat=True
        ).distinct()
    )

    recent_books = list(
        Book.objects.order_by('-id')[:10].values(
            'id',
            'title',
            'author',
            'category',
            'available'
        )
    )

    today = timezone.now().date()

    overdue = BorrowedBook.objects.filter(
        returned=False,
        due_date__lt=today
    ).select_related('user', 'book')

    overdue_list = [{
        'user_id': b.user.id,
        'username': b.user.username,
        'email': b.user.email,
        'book_title': b.book.title,
        'due_date': str(b.due_date),
        'days_overdue': (today - b.due_date).days,
    } for b in overdue]

    all_users = User.objects.filter(
        is_staff=False
    ).select_related('profile')

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
        'categories': len(categories),
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
    try:
        data = json.loads(request.body)
        admin_email = data.get('email', '').strip().lower()

        admin = get_user_by_email(admin_email)

        if not admin or not admin.is_staff:
            return JsonResponse({
                'success': False,
                'message': 'Admin access required'
            }, status=403)

        target = get_object_or_404(User, id=user_id)

        if target.is_staff:
            return JsonResponse({
                'success': False,
                'message': 'Cannot delete another admin'
            })

        target.delete()

        return JsonResponse({
            'success': True,
            'message': 'User deleted successfully!'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ─────────────────────────────────────────
# REGISTER USER
# POST /api/register/
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
        raw_admin = data.get('is_admin', False)
        is_admin = str(raw_admin).lower() in ['1', 'true', 'yes', 'on']

        if not username or not email or not password:
            return JsonResponse({
                'success': False,
                'message': 'All fields required'
            })

        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'message': 'Username already exists'
            })

        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email already registered'
            })

        if email == ADMIN_EMAIL:
            is_admin = True
        elif is_admin:
            return JsonResponse({
                'success': False,
                'message': 'Only admin@onlinelibrary.com can register as admin.'
            }, status=403)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=is_admin,
            is_superuser=is_admin
        )

        UserProfile.objects.create(
            user=user,
            phone=phone
        )

        return JsonResponse({
            'success': True,
            'message': 'User registered successfully!'
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)