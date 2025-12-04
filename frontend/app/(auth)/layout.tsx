export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex items-start sm:items-center justify-center py-4 sm:py-8 md:py-12 px-4'>
      <div className='max-w-md w-full mt-4 sm:mt-0'>{children}</div>
    </div>
  );
}
