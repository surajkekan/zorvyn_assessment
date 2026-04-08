from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError

def custom_exception_handler(exc, context):
    # Call base exception handler first to get the standard error response.
    response = exception_handler(exc, context)

    # Handle database integrity errors (like duplicate usernames or null violations)
    if response is None and isinstance(exc, IntegrityError):
        return Response({
            'success': False,
            'status_code': 400,
            'message': 'Database Constraint Violation',
            'details': str(exc)
        }, status=status.HTTP_400_BAD_REQUEST)

    if response is not None:
        # Standardize the response format
        custom_data = {
            'success': False,
            'status_code': response.status_code,
            'message': 'API Error',
            'details': response.data
        }
        
        # Use descriptive messages based on status code
        if response.status_code == 400:
            custom_data['message'] = 'Validation failed. Please check your input.'
        elif response.status_code == 401:
            custom_data['message'] = 'Authentication required. Please log in.'
        elif response.status_code == 403:
            custom_data['message'] = 'Access denied. You do not have permission for this action.'
        elif response.status_code == 404:
            custom_data['message'] = 'The requested resource was not found.'
        elif response.status_code == 500:
            custom_data['message'] = 'Internal server error. Our team has been notified.'

        response.data = custom_data

    return response
