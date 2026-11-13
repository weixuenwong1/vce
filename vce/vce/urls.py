from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from knox import views as knox_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/billing/', include('billing.urls')),
    path('', include('accounts.urls')),
    path('api/auth/', include('knox.urls')),
    path('logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path('logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
    path('api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
