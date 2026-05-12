from django.urls import path
from . import views

urlpatterns = [
    # User Profile API
    path('api/profile/',               views.api_user_profile,  name='api_user_profile'),
    path('api/profile/update/',        views.api_update_profile, name='api_update_profile'),

    # Borrow / Return
    path('api/borrow/<int:book_id>/',  views.api_borrow_book,   name='api_borrow_book'),
    path('api/return/<int:borrow_id>/',views.api_return_book,   name='api_return_book'),

    # Admin APIs
    path('api/admin/dashboard/',                    views.api_admin_dashboard, name='api_admin_dashboard'),
    path('api/admin/delete-user/<int:user_id>/',    views.api_delete_user,     name='api_delete_user'),

    # Register (called from signup.js)
    path('api/register/',              views.api_register,      name='api_register'),
]
