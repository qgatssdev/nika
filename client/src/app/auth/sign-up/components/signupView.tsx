'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import Link from 'next/link';
import { routes } from '@/routes';
import { useSignUp } from '../mutations';
import { SignupSchema } from '@/validations/signup.schema';
import toast from 'react-hot-toast';
import { SignUpPayload } from '@/services/auth/types';
import { useRouter, useSearchParams } from 'next/navigation';
import Storage from '@/utils/storage';
import Input from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import Button from '@/components/ui/button';

export default function SignUpView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get('ref') ?? '';

  const { mutate: signUp, isPending } = useSignUp(
    (response) => {
      const { token } = response;
      Storage.setCookie('authSession', token, 7);
      toast.success('Account created successfully');
      router.push(routes.DASHBOARD);
    },
    (error) => {
      toast.error(error.response?.data.message || 'An error occurred');
    }
  );

  const onSubmit = (values: SignUpPayload) => {
    signUp(values);
  };

  return (
    <div>
      <h1 className='text-2xl font-semibold'>Create your account</h1>
      <p className='text-white/70 mt-2 text-sm'>
        Already have an account?{' '}
        <Link href={routes.AUTH.LOGIN} className='underline'>
          Log in
        </Link>
      </p>

      <Formik<SignUpPayload>
        initialValues={{
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          referralCode: referralFromUrl,
        }}
        validationSchema={SignupSchema}
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
              <label className='block text-sm mb-1'>First Name</label>
              <Field
                as={Input}
                name='firstName'
                type='text'
                placeholder='John'
              />
            </div>
            <div>
              <label className='block text-sm mb-1'>Last Name</label>
              <Field as={Input} name='lastName' type='text' placeholder='Doe' />
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
            <div>
              <label className='block text-sm mb-1'>Referral Code</label>
              <Field
                as={Input}
                name='referralCode'
                type='text'
                placeholder='123456'
              />
            </div>

            <Button type='submit' loading={isPending}>
              Sign up
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
