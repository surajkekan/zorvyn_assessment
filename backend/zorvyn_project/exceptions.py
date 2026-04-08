from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call base exception handler first to get the standard error response.
    response = exception_handler(exc, context)

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
            custom_data['message'] = 'Validation Error'
        elif response.status_code == 401:
            custom_data['message'] = 'Authentication Failed'
        elif response.status_code == 403:
            custom_data['message'] = 'Permission Denied'
        elif response.status_code == 404:
            custom_data['message'] = 'Resource Not Found'

        response.data = custom_data

    return response
