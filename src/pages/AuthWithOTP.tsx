import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState('');
  
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email domain
      if (!showForgotPassword && !email.endsWith('@chitkara.edu.in')) {
        throw new Error('Only Chitkara University email addresses (@chitkara.edu.in) are allowed');
      }

      if (showForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setShowForgotPassword(false);
      } else if (isLogin) {
        // First authenticate with password
        const { error, data } = await signIn(email, password) as any;
        if (error) throw error;
        
        // Check if user has 2FA enabled
        const { data: profile } = await supabase
          .from('profiles')
          .select('two_factor_enabled')
          .eq('id', data?.user?.id)
          .single();

        if (profile?.two_factor_enabled) {
          // Send OTP
          setTempUserId(data?.user?.id);
          const response = await supabase.functions.invoke('send-otp', {
            body: { email, userId: data?.user?.id }
          });
          
          if (response.error) throw response.error;
          
          setShowOTPInput(true);
          toast({
            title: "OTP Sent",
            description: "Check your email for the verification code.",
          });
        } else {
          // No 2FA, proceed to dashboard
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to ÉduPortail.",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: otpRecord, error } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('user_id', tempUserId)
        .eq('code', otp)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !otpRecord) {
        throw new Error('Invalid or expired OTP code');
      }

      // Mark OTP as verified
      await supabase
        .from('otp_codes')
        .update({ verified: true })
        .eq('id', otpRecord.id);

      toast({
        title: "Success!",
        description: "You've been verified successfully.",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showOTPInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Enter OTP</CardTitle>
            <CardDescription>
              We've sent a 6-digit code to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOTPVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify OTP
              </Button>

              <button
                type="button"
                onClick={() => setShowOTPInput(false)}
                className="w-full text-sm text-center text-primary hover:underline"
              >
                ← Back to login
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <h1 className="text-5xl font-bold mb-6">ÉduPortail</h1>
          <p className="text-xl mb-8">Your Campus Lost & Found Portal 💜💚</p>
          <p className="text-lg opacity-90">
            Join our Chitkara University community to help people find their lost items or reunite found items with their owners.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {showForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {showForgotPassword
                ? "Enter your Chitkara email to receive a reset link"
                : isLogin
                ? "Sign in with your Chitkara University email"
                : "Join with your Chitkara University email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Chitkara University Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@chitkara.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Only @chitkara.edu.in email addresses are allowed
                </p>
              </div>

              {!showForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {showForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              {!showForgotPassword && (
                <>
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full text-sm text-center text-primary hover:underline"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                  {isLogin && (
                    <button
                      onClick={() => setShowForgotPassword(true)}
                      className="w-full text-sm text-center text-muted-foreground hover:text-primary hover:underline"
                    >
                      Forgot your password?
                    </button>
                  )}
                </>
              )}
              {showForgotPassword && (
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-sm text-center text-primary hover:underline"
                >
                  Back to sign in
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="w-full text-sm text-center text-muted-foreground hover:text-primary hover:underline"
              >
                ← Back to home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
