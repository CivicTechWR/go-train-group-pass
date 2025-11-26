import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className='text-2xl font-bold mb-6'>Reset Password</h1>
      <PasswordResetRequestForm />
    </>
  );
}
