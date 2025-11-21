import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Trash2, Upload, Shield, User, Lock, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setTwoFactorEnabled(data.two_factor_enabled || false);
      return data;
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { full_name?: string; phone?: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  const toggle2FAMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: enabled })
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setTwoFactorEnabled(enabled);
      toast.success(enabled ? '2FA enabled successfully' : '2FA disabled successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update 2FA settings: ' + error.message);
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.avatar_url) return;
      
      const oldPath = profile.avatar_url.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('item-images').remove([`avatars/${oldPath}`]);
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile picture removed successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to remove avatar: ' + error.message);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!deletePassword) throw new Error('Please enter your password');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: deletePassword,
      });

      if (signInError) throw new Error('Incorrect password');

      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success('Account deleted successfully');
      await signOut();
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete account');
      setDeletePassword('');
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ full_name: fullName, phone });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      setUploadingAvatar(true);

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('item-images').remove([`avatars/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      toast.error('Failed to upload avatar: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-5xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <SettingsIcon className="text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6 animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile" className="gap-2">
              <User size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield size={16} />
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Lock size={16} />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Picture Section */}
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Profile Picture
                </CardTitle>
                <CardDescription>Update your profile picture and make it stand out</CardDescription>
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
                        <div className="flex items-center gap-2 mb-2">
                          <Upload size={16} />
                          <span className="font-medium">Choose a photo</span>
                        </div>
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF (max 2MB). For best results, use a square image.
                      </p>
                    </div>
                    {profile?.avatar_url && (
                      <Button
                        variant="outline"
                        onClick={() => deleteAvatarMutation.mutate()}
                        disabled={deleteAvatarMutation.isPending}
                        className="hover-scale"
                      >
                        <Trash2 size={16} />
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Full Name</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="h-11"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Email Address</Label>
                    <Input
                      id="email"
                      value={profile?.email}
                      disabled
                      className="h-11 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Chitkara University email cannot be changed
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="h-11"
                    />
                  </div>
                  
                  <Button type="submit" disabled={updateProfileMutation.isPending} className="hover-scale">
                    {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} className="text-primary" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account with 2FA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="2fa" className="text-base font-semibold">
                        Enable Two-Factor Authentication
                      </Label>
                      {twoFactorEnabled && (
                        <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When enabled, you'll need to enter a code sent to your email in addition 
                      to your password when signing in. This helps protect your account from 
                      unauthorized access.
                    </p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactorEnabled}
                    onCheckedChange={(checked) => toggle2FAMutation.mutate(checked)}
                    disabled={toggle2FAMutation.isPending}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-destructive/50 shadow-card hover:shadow-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 size={20} />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <h4 className="font-semibold mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                    All your data including reported items, claims, and profile information 
                    will be permanently removed.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="hover-scale">
                        <Trash2 size={16} />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>This action cannot be undone. This will permanently:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Delete your account</li>
                            <li>Remove all your reported items</li>
                            <li>Delete all your claims</li>
                            <li>Erase your profile information</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                        <Input
                          id="deletePassword"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Your password"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletePassword('')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAccountMutation.mutate()}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
                        </AlertDialogAction>
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
