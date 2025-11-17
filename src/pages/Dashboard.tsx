import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Search, Plus, TrendingUp } from 'lucide-react';

export default function Dashboard() {
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

  const { data: recentItems } = useQuery({
    queryKey: ['recent-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const lostCount = userItems?.filter(item => item.type === 'lost').length || 0;
  const foundCount = userItems?.filter(item => item.type === 'found').length || 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">Here's an overview of your lost and found activity</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lost Items Reported</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{lostCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Found Items Reported</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{foundCount}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{lostCount + foundCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/report">
                <Plus className="mr-2 h-4 w-4" />
                Report Item
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/browse">
                <Search className="mr-2 h-4 w-4" />
                Browse Items
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Your Items */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle>Your Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {userItems && userItems.length > 0 ? (
              <div className="space-y-4">
                {userItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'lost' ? 'Lost' : 'Found'} · {item.location} · {new Date(item.date_lost_found).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'returned' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                You haven't reported any items yet. <Link to="/report" className="text-primary hover:underline">Report your first item</Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Community Items */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Community Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentItems && recentItems.length > 0 ? (
              <div className="space-y-4">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'lost' ? 'Lost' : 'Found'} by {item.profiles?.full_name} · {item.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No recent items</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
