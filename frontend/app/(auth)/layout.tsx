export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
        {children}
      </div>
    </div>
  );
}
