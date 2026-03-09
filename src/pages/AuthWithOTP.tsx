import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showForgotPassword) {
      const { error } = await resetPassword(email);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Password reset email sent" }); setShowForgotPassword(false); }
      return;
    }

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Welcome back!" }); navigate('/dashboard'); }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Account created!" }); navigate('/dashboard'); }
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-hero-gradient items-center justify-center p-12">
        <div className="text-white max-w-md text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">ÉduPortail</h2>
          <p className="text-lg opacity-90">Your campus lost & found community</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{showForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>{showForgotPassword ? "Enter your email" : isLogin ? 'Sign in to your account' : 'Create a new account'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              {!showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
              <Button type="submit" className="w-full">{showForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}</Button>
              {isLogin && !showForgotPassword && <Button type="button" variant="link" className="w-full" onClick={() => setShowForgotPassword(true)}>Forgot password?</Button>}
              {showForgotPassword ? (
                <Button type="button" variant="link" className="w-full" onClick={() => setShowForgotPassword(false)}><ArrowLeft size={16} className="mr-1" />Back to sign in</Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">{isLogin ? 'Sign up' : 'Sign in'}</button>
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
