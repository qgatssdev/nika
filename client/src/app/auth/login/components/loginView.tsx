'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import Link from 'next/link';
import { routes } from '@/routes';
import { LoginSchema } from '@/validations/login.schema';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import Button from '@/components/ui/button';
import { useLogin } from '../mutations';
import { useRouter } from 'next/navigation';
import Storage from '@/utils/storage';
import toast from 'react-hot-toast';
import { SignInPayload } from '@/services/auth/types';

export default function LoginView() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin(
    (response) => {
      const { token } = response;
      Storage.setCookie('authSession', token, 7);
      toast.success('Logged in successfully');
      router.push(routes.DASHBOARD);
    },
    (error) => {
      toast.error(error.response?.data.message || 'An error occurred');
    }
  );

  const onSubmit = (values: SignInPayload) => {
    login(values);
  };

  return (
    <div>
      <h1 className='text-2xl font-semibold'>Welcome back</h1>
      <p className='text-white/70 mt-2 text-sm'>
        New here?{' '}
        <Link href={routes.AUTH.SIGNUP} className='underline'>
          Create an account
        </Link>
      </p>

      <Formik<SignInPayload>
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <Form className='mt-6 space-y-4'>
            <div>
              <label className='block text-sm mb-1'>Email</label>
              <Field
                as={Input}
                name='email'
                type='email'
                placeholder='you@example.com'
              />
              <div className='text-red-400 text-sm mt-1'>
                <ErrorMessage name='email' />
              </div>
            </div>
            <div>
              <label className='block text-sm mb-1'>Password</label>
              <Field
                as={PasswordInput}
                name='password'
                placeholder='••••••••'
              />
              <div className='text-red-400 text-sm mt-1'>
                <ErrorMessage name='password' />
              </div>
            </div>
            <Button type='submit' loading={isPending}>
              Log in
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
