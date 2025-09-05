import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle,
  Home,
  ArrowLeft,
  Calendar,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ReportDialog from "@/components/ReportDialog";
import BlockUserButton from "@/components/BlockUserButton";

interface Message {
  id: string;
  listing_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  listing: {
    title: string;
  };
}

const Inbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            listing_id,
            sender_user_id,
            body,
            created_at,
            read_at,
            listings!messages_listing_id_fkey (
              title
            )
          `)
          .eq('owner_user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match our interface
        const transformedMessages = data?.map(msg => ({
          ...msg,
          listing: {
            title: msg.listings?.title || 'Unknown Listing'
          }
        })) || [];

        setMessages(transformedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error Loading Messages",
          description: "Failed to load your messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, toast]);

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('owner_user_id', user?.id);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, read_at: new Date().toISOString() }
          : msg
      ));

      toast({
        title: "Message Marked as Read",
        description: "The message has been marked as read.",
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark message as read.",
        variant: "destructive"
      });
    }
  };

  const openListing = (listingId: string) => {
    window.open(`/listing/${listingId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-real-estate-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-real-estate-primary mx-auto"></div>
            <p className="mt-4 text-real-estate-neutral/70">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(msg => !msg.read_at).length;

  return (
    <div className="min-h-screen bg-real-estate-light py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Link to="/my-listings">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Listings
              </Button>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-real-estate-neutral mb-2">
              Message Inbox
            </h1>
            <p className="text-lg md:text-xl text-real-estate-neutral/70">
              Messages from potential renters about your properties
            </p>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="mt-2">
                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-real-estate-neutral/50 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-real-estate-neutral mb-2">
              No Messages Yet
            </h2>
            <p className="text-lg md:text-xl text-real-estate-neutral/70 mb-6">
              When potential renters message you about your listings, they'll appear here.
            </p>
            <Link to="/my-listings">
              <Button className="bg-gradient-hero text-white shadow-hero">
                <Home className="w-4 h-4 mr-2" />
                View My Listings
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className={`bg-gradient-card shadow-card border-0 ${
                !message.read_at ? 'ring-2 ring-real-estate-primary/20' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                      <MessageCircle className="w-6 h-6" />
                      Re: {message.listing.title}
                      {!message.read_at && (
                        <Badge variant="destructive" className="text-xs">
                          New
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Message Content */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-real-estate-neutral leading-relaxed whitespace-pre-wrap text-lg">
                      {message.body}
                    </p>
                  </div>

                  {/* Message Info */}
                  <div className="flex items-center justify-between text-sm text-real-estate-neutral/70">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(message.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                      {message.read_at && (
                        <Badge variant="secondary" className="text-xs">
                          Read
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {!message.read_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(message.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark as Read
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={() => openListing(message.listing_id)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Listing
                    </Button>

                    <ReportDialog 
                      reportedUserId={message.sender_user_id}
                      triggerText="Report"
                      triggerVariant="outline"
                    />
                    
                    <BlockUserButton 
                      targetUserId={message.sender_user_id}
                      triggerText="Block"
                      triggerVariant="destructive"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;