import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">
            GO Train Group Pass
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to coordinate your commute
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
