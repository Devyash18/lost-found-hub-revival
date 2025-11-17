import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, User } from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles(full_name, email, phone)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          ← Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full rounded-lg shadow-card"
              />
            )}
          </div>

          <div>
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {item.type === 'lost' ? 'Lost' : 'Found'}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={20} />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={20} />
                <span>{new Date(item.date_lost_found).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={20} />
                <span>Reported by {item.profiles?.full_name}</span>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>

            {item.reward && (
              <Card className="mb-6 bg-primary/5">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Reward</h3>
                  <p className="text-primary font-medium">{item.reward}</p>
                </CardContent>
              </Card>
            )}

            {user && user.id !== item.user_id && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    {item.contact_info && (
                      <p>Contact: {item.contact_info}</p>
                    )}
                    <p>Email: {item.profiles?.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
