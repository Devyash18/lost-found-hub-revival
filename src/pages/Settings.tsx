import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Trash2, Upload, Shield, User, Lock, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [deletePassword, setDeletePassword] = useState('');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully (mock)');
  };

  const handleDeleteAccount = async () => {
    toast.success('Account deleted successfully (mock)');
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-5xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3"><SettingsIcon className="text-primary" />Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6 animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile" className="gap-2"><User size={16} />Profile</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield size={16} />Security</TabsTrigger>
            <TabsTrigger value="account" className="gap-2"><Lock size={16} />Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User size={20} className="text-primary" />Profile Picture</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 transition-transform hover:scale-105">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-2"><Upload size={16} /><span className="font-medium">Choose a photo</span></div>
                      </Label>
                      <Input id="avatar-upload" type="file" accept="image/*" className="cursor-pointer" onChange={() => toast.success('Avatar upload (mock)')} />
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF (max 2MB).</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User size={20} className="text-primary" />Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Full Name</Label>
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="h-11" />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Email Address</Label>
                    <Input id="email" value={profile?.email || ''} disabled className="h-11 bg-muted" />
                    <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" className="h-11" />
                  </div>
                  <Button type="submit" className="hover-scale">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield size={20} className="text-primary" />Security</CardTitle>
                <CardDescription>Your account security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Password-based authentication is enabled. Your account is secure.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="border-destructive/50 shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><Trash2 size={20} />Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <h4 className="font-semibold mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" className="hover-scale"><Trash2 size={16} />Delete My Account</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                        <Input id="deletePassword" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your password" />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletePassword('')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Account</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
