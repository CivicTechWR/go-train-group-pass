import { PasswordUpdateForm } from '@/components/auth/PasswordUpdateForm';

export default function ChangePasswordPage() {
  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-100 via-green-100 to-teal-100 flex items-center justify-center py-12 px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
        <h1 className='text-2xl font-bold mb-6'>Change Password</h1>
        <PasswordUpdateForm />
      </div>
    </div>
  );
}
