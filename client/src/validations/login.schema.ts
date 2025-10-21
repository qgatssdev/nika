import * as Yup from 'yup';

export const LoginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export type LoginSchemaType = Yup.InferType<typeof LoginSchema>;
