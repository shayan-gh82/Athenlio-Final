import base64
import tempfile
from datetime import date, time

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from students.models import Student
from tutors.models import Tutor
from .models import Course, Enrollment, Homework, Lesson


def course_data(code='cr-test'):
    return {
        'courseId': code,
        'title': 'English Foundations',
        'description': 'A practical language course for beginner students.',
        'detail': 'A complete course with guided lessons and useful practice.',
        'requirements': 'Motivation',
        'materials': 'Notebook',
        'price_per_hour': '10.00',
        'price_per_dollar': '12.00',
        'price_per_toman': '960.00',
        'language': 'English',
        'level': 'A1',
        'schedule_day': 'Monday',
        'schedule_start': '09:00',
        'schedule_end': '10:00',
        'capacity': 10,
        'length': 20,
        'course_duration': 60,
    }


class ProjectApiContractTests(APITestCase):
    def setUp(self):
        self.tutor_user = User.objects.create_user(
            email='tutor@example.com', password='pass', first_name='Pending',
            last_name='Tutor', is_teacher=True,
        )
        self.tutor = Tutor.objects.create(user=self.tutor_user, subjects=['English'])
        self.student_user = User.objects.create_user(
            email='student@example.com', password='pass', first_name='First',
            last_name='Student', is_teacher=False,
        )
        self.student = Student.objects.create(user=self.student_user)

    def test_pending_tutor_cannot_create_course_but_approved_tutor_can(self):
        self.client.force_authenticate(self.tutor_user)
        blocked = self.client.post('/api/courses/', course_data(), format='json')
        self.assertEqual(blocked.status_code, status.HTTP_403_FORBIDDEN)

        self.tutor.is_approved = True
        self.tutor.save(update_fields=['is_approved'])
        created = self.client.post('/api/courses/', course_data(), format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data['tutor']['user']['first_name'], 'Pending')

    def test_tutor_can_replace_profile_picture_after_registration(self):
        image = SimpleUploadedFile(
            'profile.png',
            base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
            content_type='image/png',
        )
        self.client.force_authenticate(self.tutor_user)
        with tempfile.TemporaryDirectory() as media_root, self.settings(MEDIA_ROOT=media_root):
            response = self.client.patch(
                f'/api/tutors/{self.tutor.id}/',
                {
                    'profile_picture': image,
                    'subjects': '["IELTS", "Conversation"]',
                    'languages_spoken': '[{"language":"English","level":"C2"}]',
                },
                format='multipart',
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.tutor.refresh_from_db()
            self.assertTrue(self.tutor.profile_picture.name.startswith('tutor_photos/profile'))
            self.assertEqual(self.tutor.subjects, ['IELTS', 'Conversation'])
            self.assertEqual(self.tutor.languages_spoken[0]['level'], 'C2')

    def test_public_tutor_list_only_contains_approved_tutors(self):
        approved_user = User.objects.create_user(
            email='approved@example.com', password='pass', first_name='Approved',
            last_name='Tutor', is_teacher=True,
        )
        approved = Tutor.objects.create(user=approved_user, is_approved=True)
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/tutors/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['id'] for item in response.data], [approved.id])
        self.assertTrue(response.data[0]['is_approved'])

    def test_public_course_list_hides_courses_from_unapproved_tutors(self):
        hidden = Course.objects.create(
            tutor=self.tutor, courseId='hidden-course', title='Hidden Course',
            description='Description', detail='Detail', requirements='None',
            materials='Book', language='English', level='A1',
            schedule_day='Monday', schedule_start=time(9), schedule_end=time(10),
            capacity=10,
        )
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(hidden.id, [item['id'] for item in response.data])

        self.tutor.is_approved = True
        self.tutor.save(update_fields=['is_approved'])
        response = self.client.get('/api/courses/')
        self.assertIn(hidden.id, [item['id'] for item in response.data])

    def test_student_profile_dashboard_and_homework_contract(self):
        self.tutor.is_approved = True
        self.tutor.save(update_fields=['is_approved'])
        course = Course.objects.create(
            tutor=self.tutor, courseId='homework-course', title='Homework Course',
            description='Description', detail='Detail', requirements='None',
            materials='Book', language='English', level='A1',
            schedule_day='Monday', schedule_start=time(9), schedule_end=time(10),
            capacity=10,
        )
        lesson = Lesson.objects.create(course=course, title='Lesson 1', description='Basics')
        Homework.objects.create(lesson=lesson, title='Exercise 1', due_date=date(2030, 1, 1))
        Enrollment.objects.create(student=self.student, course=course, status='approved')

        self.client.force_authenticate(self.student_user)
        profile = self.client.get('/api/students/me/')
        dashboard = self.client.get('/api/students/me/dashboard/')
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data['user']['first_name'], 'First')
        self.assertEqual(dashboard.status_code, status.HTTP_200_OK)
        homework = dashboard.data['approved_courses'][0]['lessons'][0]['homeworks'][0]
        self.assertEqual(homework['title'], 'Exercise 1')

    def test_enrollment_list_is_scoped_to_the_current_user(self):
        self.tutor.is_approved = True
        self.tutor.save(update_fields=['is_approved'])
        course = Course.objects.create(
            tutor=self.tutor, courseId='private-course', title='Private Course',
            description='Description', detail='Detail', requirements='None',
            materials='Book', language='English', level='A1',
            schedule_day='Monday', schedule_start=time(9), schedule_end=time(10),
            capacity=10,
        )
        mine = Enrollment.objects.create(student=self.student, course=course, status='under_review')
        other_user = User.objects.create_user(
            email='other@example.com', password='pass', first_name='Other', last_name='Student'
        )
        other_student = Student.objects.create(user=other_user)
        Enrollment.objects.create(student=other_student, course=course, status='under_review')

        self.client.force_authenticate(self.student_user)
        response = self.client.get('/api/enrollments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['id'] for item in response.data], [mine.id])
