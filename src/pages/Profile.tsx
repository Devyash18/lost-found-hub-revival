import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Calendar, Package, CheckCircle, Settings, Shield, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userItems } = useQuery({
    queryKey: ['user-items', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userClaims } = useQuery({
    queryKey: ['user-claims', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*, items(*)')
        .eq('claimer_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['user-activities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const stats = [
    {
      label: 'Items Reported',
      value: userItems?.length || 0,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Claims Made',
      value: userClaims?.length || 0,
      icon: CheckCircle,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and view your activity</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-32 w-32 mb-4 border-4 border-primary/20 transition-transform hover:scale-105">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-4xl">
                      {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-2xl font-bold mb-1">{profile?.full_name}</h2>
                  
                  {profile?.two_factor_enabled && (
                    <Badge variant="secondary" className="mb-4 gap-1">
                      <Shield size={12} />
                      2FA Enabled
                    </Badge>
                  )}

                  <Button asChild className="w-full mt-4 hover-scale">
                    <Link to="/settings">
                      <Settings size={16} />
                      Edit Profile
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground break-all">{profile?.email}</span>
                  </div>
                  
                  {profile?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={18} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{profile.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Joined {new Date(profile?.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <Card 
                  key={stat.label} 
                  className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Items */}
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} className="text-primary" />
                  Recent Items Reported
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userItems && userItems.length > 0 ? (
                  <div className="space-y-3">
                    {userItems.slice(0, 5).map((item) => (
                      <Link
                        key={item.id}
                        to={`/item/${item.id}`}
                        className="block p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-200 hover-scale"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{item.location}</span>
                              <span>•</span>
                              <span>{new Date(item.date_lost_found).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                            {item.type}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No items reported yet</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link to="/report">Report an Item</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Claims */}
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-accent" />
                  Recent Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userClaims && userClaims.length > 0 ? (
                  <div className="space-y-3">
                    {userClaims.slice(0, 5).map((claim) => (
                      <Link
                        key={claim.id}
                        to={`/item/${claim.item_id}`}
                        className="block p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-200 hover-scale"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{claim.items?.title}</h4>
                            {claim.message && (
                              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                "{claim.message}"
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Claimed {new Date(claim.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {claim.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No claims made yet</p>
                    <Button asChild className="mt-4" variant="outline">
                      <Link to="/browse">Browse Items</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity: any, index: number) => (
                      <div key={activity.id} className="relative">
                        {index !== activities.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                        )}
                        <div className="flex gap-4 items-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center relative z-10">
                            {activity.activity_type === 'item_reported' && <Package className="h-4 w-4 text-primary" />}
                            {activity.activity_type === 'claim_made' && <CheckCircle className="h-4 w-4 text-primary" />}
                            {activity.activity_type === 'profile_updated' && <Settings className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
