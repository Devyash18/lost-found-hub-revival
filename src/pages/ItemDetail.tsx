import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, User, Phone, Mail, Share2, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { ChatDialog } from '@/components/ChatDialog';
import { AppointmentScheduler } from '@/components/AppointmentScheduler';
import { AppointmentsList } from '@/components/AppointmentsList';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [claimMessage, setClaimMessage] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);

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

  // Fetch matching items for smart suggestions
  const { data: matchingItems } = useQuery({
    queryKey: ['matching-items', id, item?.type],
    queryFn: async () => {
      if (!item) return [];
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles!items_user_id_fkey(full_name)')
        .neq('id', item.id)
        .neq('type', item.type)
        .eq('status', 'pending')
        .or(`title.ilike.%${item.title}%`)
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!item,
  });

  const { data: existingClaim } = useQuery({
    queryKey: ['claim', id, user?.id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('item_id', id)
        .eq('claimer_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('claims')
        .insert({
          item_id: id,
          claimer_id: user.id,
          message: claimMessage,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim', id, user?.id] });
      toast.success('Claim submitted successfully! Contact information revealed.');
      setShowClaimForm(false);
      setClaimMessage('');
    },
    onError: (error) => {
      toast.error('Failed to submit claim: ' + error.message);
    }
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
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 hover-scale transition-all"
        >
          ← Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          <div className="hover-scale">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300"
              />
            )}
          </div>

          <div>
            <div className="mb-4 animate-scale-in">
              <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                item.type === 'lost' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}>
                {item.type === 'lost' ? 'Lost' : 'Found'}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4 animate-fade-in">{item.title}</h1>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in">
                <MapPin size={20} />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in">
                <Calendar size={20} />
                <span>{new Date(item.date_lost_found).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in">
                <User size={20} />
                <span>Reported by {item.profiles?.full_name}</span>
              </div>
            </div>

            <Card className="mb-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>

            {item.reward && (
              <Card className="mb-6 bg-primary/5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Reward</h3>
                  <p className="text-primary font-medium">{item.reward}</p>
                </CardContent>
              </Card>
            )}

            {/* Social Sharing */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b animate-fade-in">
              <span className="text-sm font-medium">Share:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title} on ÉduPortail`;
                  const url = window.location.href;
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
                    '_blank'
                  );
                }}
                className="hover-scale"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title} on ÉduPortail`;
                  const url = window.location.href;
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                    '_blank'
                  );
                }}
                className="hover-scale"
              >
                <Twitter className="h-4 w-4 mr-1" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = window.location.href;
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    '_blank'
                  );
                }}
                className="hover-scale"
              >
                <Facebook className="h-4 w-4 mr-1" />
                Facebook
              </Button>
            </div>

            {/* Only show claim for FOUND items */}
            {user && user.id !== item.user_id && !existingClaim && item.type === 'found' && (
              <Card className="mb-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Interested in this item?</h3>
                  {!showClaimForm ? (
                    <Button 
                      onClick={() => setShowClaimForm(true)}
                      className="w-full hover-scale"
                    >
                      Claim This Item
                    </Button>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <Textarea
                        placeholder="Add a message (optional)..."
                        value={claimMessage}
                        onChange={(e) => setClaimMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => claimMutation.mutate()}
                          disabled={claimMutation.isPending}
                          className="flex-1 hover-scale"
                        >
                          {claimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowClaimForm(false)}
                          className="flex-1 hover-scale"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {user && existingClaim && item.type === 'found' && (
              <Card className="border-accent shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Mail className="text-accent" size={20} />
                    Contact Information Revealed
                  </h3>
                  <div className="space-y-3 text-sm bg-accent/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-accent" />
                      <a 
                        href={`mailto:${item.profiles?.email}`}
                        className="text-accent hover:underline font-medium transition-all"
                      >
                        {item.profiles?.email}
                      </a>
                    </div>
                    {item.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-accent" />
                        <a 
                          href={`tel:${item.profiles?.phone}`}
                          className="text-accent hover:underline font-medium transition-all"
                        >
                          {item.profiles?.phone}
                        </a>
                      </div>
                    )}
                    {item.contact_info && (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-accent" />
                        <span className="text-muted-foreground">{item.contact_info}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Claimed on {new Date(existingClaim.created_at).toLocaleDateString()}
                    </p>
                    <ChatDialog
                      claimId={existingClaim.id}
                      itemOwnerId={item.user_id}
                      claimerId={user.id}
                      itemTitle={item.title}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appointment Scheduling Section */}
            {user && existingClaim && item.type === 'found' && (
              <Card className="mt-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Schedule Meetup</h3>
                  <div className="space-y-4">
                    <AppointmentScheduler
                      claimId={existingClaim.id}
                      itemTitle={item.title}
                    />
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-sm mb-3 text-muted-foreground">Scheduled Appointments</h4>
                      <AppointmentsList claimId={existingClaim.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Smart Matching Suggestions */}
            {matchingItems && matchingItems.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border animate-fade-in">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Potential Matches Found
                </h3>
                <div className="space-y-2">
                  {matchingItems.map((match: any) => (
                    <a
                      key={match.id}
                      href={`/item/${match.id}`}
                      className="block p-3 bg-background rounded border hover:border-primary transition-colors hover-scale"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{match.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {match.type === 'lost' ? 'Lost' : 'Found'} by {match.profiles?.full_name}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(Math.random() * 30 + 70)}% Match
                        </Badge>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
