import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { mockMessages, MockMessage } from '@/data/mockData';

interface ChatDialogProps {
  claimId: string;
  itemOwnerId: string;
  claimerId: string;
  itemTitle: string;
}

export function ChatDialog({ claimId, itemOwnerId, claimerId, itemTitle }: ChatDialogProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MockMessage[]>(
    mockMessages.filter(m => m.claim_id === claimId)
  );

  const receiverId = user?.id === itemOwnerId ? claimerId : itemOwnerId;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    const newMsg: MockMessage = {
      id: `msg-${Date.now()}`,
      claim_id: claimId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: message,
      created_at: new Date().toISOString(),
      sender: { full_name: 'You' },
    };
    setMessages(prev => [...prev, newMsg]);
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover-scale"><MessageCircle size={16} />Chat</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader><DialogTitle>Chat about: {itemTitle}</DialogTitle></DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Start the conversation!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-4 py-2 ${msg.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm font-medium mb-1">{msg.sender_id === user?.id ? 'You' : msg.sender?.full_name}</p>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSend} className="flex gap-2 pt-4 border-t">
          <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." />
          <Button type="submit" size="icon" disabled={!message.trim()}><Send size={18} /></Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
