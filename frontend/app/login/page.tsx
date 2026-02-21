'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, authApi, type User } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      setAuth(data.token, data.user as User);
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      router.push('/dashboard');
    } catch (err: unknown) {
      let msg = 'Login failed';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { error?: string }; status?: number } }).response;
        if (res?.data?.error) msg = res.data.error;
        else if (res?.status === 401) msg = 'Invalid email or password';
        else if (res?.status) msg = `Error ${res.status}. Check backend.`;
      } else if (err && typeof err === 'object' && 'message' in err) {
        msg = 'Cannot reach server. Is the backend running on ' + (process.env.NEXT_PUBLIC_API_URL || 'localhost:3000') + '?';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
      <Card className="w-full max-w-md border-border/80 shadow-elevated">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">FleetFlow</CardTitle>
          </div>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
          <p className="text-center text-xs text-muted-foreground">
            {/* Demo: admin@fleetflow.com / admin123 */}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                // placeholder="admin@fleetflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline underline-offset-4">
                {/* Forgot Password? */}
              </Link>
              <span className="text-muted-foreground">
                No account?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">Create one</Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
