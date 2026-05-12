from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('admin-home/', views.home_admin, name='home_admin'),

    path('edit/<int:id>/', views.edit_book, name='edit_book'),
    path('delete/<int:id>/', views.delete_book, name='delete_book'),
    path('add/', views.add_book, name='add_book'),
    path('borrow/<int:id>/', views.borrow_book, name='borrow_book'),
    path('borrowed/', views.borrowed_books, name='borrowed_books'),
    path('details/', views.details_page, name='details'),
    path('api/add-book/', views.add_book_api, name='add_book_api'),
    path('api/recent-books/', views.get_recent_books, name='recent_books_api')
]
