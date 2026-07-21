import { AuthLayout as AuthLayoutComponent } from '@/components/layout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutComponent>
      {children}
    </AuthLayoutComponent>
  );
}
