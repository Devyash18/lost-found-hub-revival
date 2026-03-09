import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, User, Phone, Mail, Share2, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { mockItems, mockClaims } from '@/data/mockData';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claimMessage, setClaimMessage] = useState('');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const item = useMemo(() => mockItems.find(i => i.id === id), [id]);

  const existingClaim = useMemo(() => {
    if (claimed) return { id: 'new-claim', created_at: new Date().toISOString() };
    return mockClaims.find(c => c.item_id === id && c.claimer_id === user?.id) || null;
  }, [id, user?.id, claimed]);

  const matchingItems = useMemo(() => {
    if (!item) return [];
    return mockItems.filter(i => i.id !== item.id && i.type !== item.type && i.status === 'pending').slice(0, 3);
  }, [item]);

  if (!item) {
    return <div className="flex min-h-screen items-center justify-center">Item not found</div>;
  }

  const handleClaim = () => {
    setClaimed(true);
    setShowClaimForm(false);
    setClaimMessage('');
    toast.success('Claim submitted successfully! Contact information revealed.');
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 hover-scale transition-all">← Back</Button>

        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          <div className="hover-scale">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-full rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300" />
            )}
          </div>

          <div>
            <div className="mb-4 animate-scale-in">
              <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${item.type === 'lost' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                {item.type === 'lost' ? 'Lost' : 'Found'}
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4 animate-fade-in">{item.title}</h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in"><MapPin size={20} /><span>{item.location}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in"><Calendar size={20} /><span>{new Date(item.date_lost_found).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in"><User size={20} /><span>Reported by {item.profiles?.full_name}</span></div>
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
              <Button variant="outline" size="sm" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title} on ÉduPortail ${window.location.href}`)}`, '_blank')} className="hover-scale">
                <MessageCircle className="h-4 w-4 mr-1" />WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${item.type === 'lost' ? 'Lost' : 'Found'}: ${item.title} on ÉduPortail`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')} className="hover-scale">
                <Twitter className="h-4 w-4 mr-1" />Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="hover-scale">
                <Facebook className="h-4 w-4 mr-1" />Facebook
              </Button>
            </div>

            {/* Claim for found items */}
            {user && user.id !== item.user_id && !existingClaim && item.type === 'found' && (
              <Card className="mb-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-scale-in">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Interested in this item?</h3>
                  {!showClaimForm ? (
                    <Button onClick={() => setShowClaimForm(true)} className="w-full hover-scale">Claim This Item</Button>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <Textarea placeholder="Add a message (optional)..." value={claimMessage} onChange={(e) => setClaimMessage(e.target.value)} className="min-h-[100px]" />
                      <div className="flex gap-2">
                        <Button onClick={handleClaim} className="flex-1 hover-scale">Submit Claim</Button>
                        <Button variant="outline" onClick={() => setShowClaimForm(false)} className="flex-1 hover-scale">Cancel</Button>
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
                    <Mail className="text-accent" size={20} />Contact Information Revealed
                  </h3>
                  <div className="space-y-3 text-sm bg-accent/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2"><Mail size={16} className="text-accent" /><span className="text-accent font-medium">{item.profiles?.email}</span></div>
                    {item.profiles?.phone && <div className="flex items-center gap-2"><Phone size={16} className="text-accent" /><span className="text-accent font-medium">{item.profiles?.phone}</span></div>}
                    {item.contact_info && <div className="flex items-center gap-2"><User size={16} className="text-accent" /><span className="text-muted-foreground">{item.contact_info}</span></div>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">Claimed on {new Date(existingClaim.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            )}

            {/* Matching suggestions */}
            {matchingItems.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border animate-fade-in">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Share2 className="h-4 w-4" />Potential Matches Found</h3>
                <div className="space-y-2">
                  {matchingItems.map((match) => (
                    <a key={match.id} href={`/item/${match.id}`} className="block p-3 bg-background rounded border hover:border-primary transition-colors hover-scale">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{match.title}</p>
                          <p className="text-xs text-muted-foreground">{match.type === 'lost' ? 'Lost' : 'Found'} by {match.profiles?.full_name}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{Math.round(Math.random() * 30 + 70)}% Match</Badge>
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
