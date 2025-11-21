import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Search, Upload, Bell, CheckCircle, Shield, Clock } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          userName: contactForm.name,
          userEmail: contactForm.email,
          message: contactForm.message,
        }
      });
      if (error) throw error;
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      setContactForm({ name: '', email: '', message: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-hero-gradient py-20 md:py-32 animate-fade-in">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-scale-in">
              Reuniting Lost Items With Their Owners
            </h1>
            <p className="mb-8 text-lg md:text-xl opacity-90 animate-fade-in">
              Our community lost and found system helps people recover their lost belongings quickly and easily. 
              Whether you've lost something or found an item, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button asChild size="lg" variant="secondary" className="text-lg hover-scale">
                <Link to="/auth">Report an Item</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg bg-white/10 hover:bg-white/20 border-white/20 text-white hover-scale">
                <Link to="/browse">Browse Items</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10"></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <h2 className="mb-4 text-3xl font-bold">About Lost & Found Hub</h2>
            <p className="text-lg text-muted-foreground">
              We're a community-driven platform dedicated to helping people reunite with their lost belongings. 
              Our platform connects those who have lost items with those who have found them, making the recovery 
              process simple, fast, and efficient.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 hover-scale animate-fade-in">
              <CardContent className="pt-6">
                <Shield className="mb-4 h-12 w-12 text-primary transition-transform hover:scale-110" />
                <h3 className="mb-2 text-xl font-bold">Secure & Safe</h3>
                <p className="text-muted-foreground">
                  Your data is protected with industry-standard security measures.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 hover-scale animate-fade-in">
              <CardContent className="pt-6">
                <Clock className="mb-4 h-12 w-12 text-primary transition-transform hover:scale-110" />
                <h3 className="mb-2 text-xl font-bold">Quick Results</h3>
                <p className="text-muted-foreground">
                  Get instant notifications when someone reports your lost item.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 hover-scale animate-fade-in">
              <CardContent className="pt-6">
                <CheckCircle className="mb-4 h-12 w-12 text-primary transition-transform hover:scale-110" />
                <h3 className="mb-2 text-xl font-bold">Easy to Use</h3>
                <p className="text-muted-foreground">
                  Simple interface makes reporting and finding items effortless.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to reunite lost items with their owners
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">1. Report Item</h3>
              <p className="text-muted-foreground">
                Post details about your lost or found item with photos and description.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">2. Search & Match</h3>
              <p className="text-muted-foreground">
                Browse listings to find matches or get notified when someone reports your item.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold">3. Get Reunited</h3>
              <p className="text-muted-foreground">
                Connect with the finder or owner to arrange the safe return of the item.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold">Contact Us</h2>
              <p className="text-lg text-muted-foreground">
                Have questions or need assistance? Reach out to us!
              </p>
            </div>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Lost & Found Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
