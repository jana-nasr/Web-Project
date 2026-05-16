from django.urls import path
from . import views

urlpatterns = [
    # ---------- USER ----------
    path('', views.home, name='home'),
    path('admin-home/', views.home_admin, name='home_admin'),
    path('books/', views.books_page, name='books'),
    path('borrowed/', views.borrowed_books, name='borrowed_books'),

    path('add/', views.add_book, name='add_book'),
    path('edit/<int:id>/', views.edit_book, name='edit_book'),
    path('delete/<int:id>/', views.delete_book, name='delete_book'),
    path('borrow/<int:id>/', views.borrow_book, name='borrow_book'),
    path('return/<int:id>/', views.return_book, name='return_book'),

    # ---------- ADMIN ----------
    path('admin/books/', views.admin_books, name='admin_books'),
    path('admin/books/delete/<int:id>/', views.delete_book, name='admin_delete_book'),
    path('admin/books/edit/<int:id>/', views.edit_book, name='admin_edit_book'),
    path('services-admin/', views.admin_books, name='services_admin'),
    path('details/', views.details_page, name='details'),

    # ---------- API ----------
    path('api/recent-books/', views.get_recent_books, name='recent_books_api'),
    path('api/add-book/', views.api_add_book, name='api_add_book'),
    path('about/', views.about_user, name='about'),
    path('dashboard/about/', views.about_admin, name='about_admin'),
]