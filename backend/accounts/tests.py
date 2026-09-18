from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class AuthenticationFlowTests(APITestCase):
    def test_register_me_and_logout_cookie_flow(self):
        response = self.client.post('/api/register/', {
            'email': 'student@example.com',
            'password': 'StrongPass123!',
            'first_name': 'Test',
            'last_name': 'Student',
            'is_teacher': False,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        user = User.objects.get(email='student@example.com')
        self.assertTrue(hasattr(user, 'student_profile'))

        me = self.client.get('/api/me/')
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertEqual(me.data['email'], 'student@example.com')

        logout = self.client.post('/api/logout/')
        self.assertEqual(logout.status_code, status.HTTP_200_OK)
        self.assertEqual(logout.cookies['access_token']['max-age'], 0)

    def test_login_does_not_expose_tokens_in_json(self):
        User.objects.create_user(
            email='login@example.com', password='StrongPass123!',
            first_name='Login', last_name='User',
        )
        response = self.client.post('/api/login/', {
            'email': 'login@example.com', 'password': 'StrongPass123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'ok': True})
        self.assertIn('access_token', response.cookies)
