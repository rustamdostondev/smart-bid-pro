import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import { setCurrentUser } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (user: any) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      
      if (result) {
        // Update mock data current user
        setCurrentUser(result.user);
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${result.user.name}`,
        });
        onLogin(result.user);
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setIsLoading(true);

    try {
      const result = await authService.login(demoEmail, 'password');
      
      if (result) {
        // Update mock data current user
        setCurrentUser(result.user);
        
        toast({
          title: "Demo login successful!",
          description: `Logged in as ${result.user.name}`,
        });
        onLogin(result.user);
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Demo login failed",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TenderPlatform
          </CardTitle>
          <CardDescription>
            Sign in to access the tender management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => handleDemoLogin('admin@smartbid.com')}
                disabled={isLoading}
              >
                Demo Admin (John Admin)
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => handleDemoLogin('user@company.com')}
                disabled={isLoading}
              >
                Demo User (Jane User - Tech Solutions)
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => handleDemoLogin('contractor@build.com')}
                disabled={isLoading}
              >
                Demo Contractor (Mike Builder - BuildCorp)
              </Button>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Use password: "password" for all accounts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}