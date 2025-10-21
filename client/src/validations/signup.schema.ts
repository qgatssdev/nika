import * as Yup from 'yup';

export const SignupSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Required'),
});

export type SignupSchemaType = Yup.InferType<typeof SignupSchema>;
