from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, 
    UserViewSet, 
    FinancialRecordViewSet, 
    AnalyticsSummaryView,
    UserProfileView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'records', FinancialRecordViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserProfileView.as_view(), name='user-profile'),
    # path('users/', UserListView.as_view(), name='user-list'), # Now handled by router
    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('', include(router.urls)),
]
