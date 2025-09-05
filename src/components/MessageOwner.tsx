import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Clock, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBlockStatus } from "@/hooks/useBlockStatus";

interface MessageOwnerProps {
  listingId: string;
  ownerUserId: string;
  listingTitle: string;
}

const MessageOwner: React.FC<MessageOwnerProps> = ({ listingId, ownerUserId, listingTitle }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isBlocked, isLoading: blockLoading } = useBlockStatus(ownerUserId);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const getCharCount = (text: string) => {
    return text.length;
  };

  const checkRemainingMessages = async () => {
    if (!user) return;
    
    setIsCheckingLimit(true);
    try {
      const { data, error } = await supabase
        .rpc('get_remaining_messages_today', {
          sender_id: user.id,
          recipient_id: ownerUserId
        });

      if (error) {
        console.error('Error checking rate limit:', error);
        setRemainingMessages(null);
      } else {
        setRemainingMessages(data);
      }
    } catch (error) {
      console.error('Error checking rate limit:', error);
      setRemainingMessages(null);
    } finally {
      setIsCheckingLimit(false);
    }
  };

  useEffect(() => {
    if (user && user.id !== ownerUserId) {
      checkRemainingMessages();
    }
  }, [user, ownerUserId]);

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to send a message.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === ownerUserId) {
      toast({
        title: "Cannot Message Yourself",
        description: "You cannot send a message to your own listing.",
        variant: "destructive"
      });
      return;
    }

    const wordCount = getWordCount(message);
    const charCount = getCharCount(message);

    if (wordCount === 0) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }

    if (wordCount > 50) {
      toast({
        title: "Message Too Long",
        description: "Messages are limited to 50 words maximum.",
        variant: "destructive"
      });
      return;
    }

    if (charCount > 300) {
      toast({
        title: "Message Too Long",
        description: "Messages are limited to 300 characters maximum.",
        variant: "destructive"
      });
      return;
    }

    if (remainingMessages === 0) {
      toast({
        title: "Daily Limit Reached",
        description: "You can only send 2 messages per day to each user. Please try again tomorrow.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      // Send the message to database
      const { data: messageData, error } = await supabase
        .from('messages')
        .insert([{
          listing_id: listingId,
          sender_user_id: user.id,
          owner_user_id: ownerUserId,
          body: message.trim()
        }])
        .select()
        .single();

      if (error) throw error;

      // Send email notification in background (don't wait for it)
      // The edge function will handle getting the owner's email
      supabase.functions.invoke('send-message-notification', {
        body: {
          messageId: messageData.id,
          listingTitle,
          senderName: user.user_metadata?.full_name || user.email || 'Someone',
          messageBody: message.trim(),
          ownerUserId,
          listingId
        }
      }).catch(emailError => {
        console.error('Failed to send email notification:', emailError);
        // Don't show error to user since message was sent successfully
      });

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the property owner.",
      });

      setMessage("");
      // Refresh remaining messages count
      checkRemainingMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      
      // Check if it's a block error
      if (errorMessage.includes('Messaging is blocked')) {
        toast({
          title: "Messaging Blocked",
          description: "You cannot send messages to this user. They may have blocked you or you may have blocked them.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('Rate limit exceeded')) {
        toast({
          title: "Daily Limit Reached",
          description: "You can only send 2 messages per day to each user. Please try again tomorrow.",
          variant: "destructive"
        });
        // Refresh the count to show 0 remaining
        checkRemainingMessages();
      } else {
        toast({
          title: "Failed to Send Message",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="pt-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg md:text-xl mb-2">Message the Owner</h3>
            <p className="text-muted-foreground text-sm md:text-base mb-4">
              Sign in to send a message to the property owner
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                sessionStorage.setItem('returnTo', window.location.pathname);
                navigate('/auth');
              }} 
              className="text-sm md:text-base"
            >
              Sign In to Message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (user.id === ownerUserId) {
    return null; // Don't show messaging component to the owner
  }

  // Show blocked message if users have blocked each other
  if (isBlocked) {
    return (
      <Card className="bg-gradient-card shadow-card border-0">
        <CardContent className="pt-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg md:text-xl mb-2">Messaging Unavailable</h3>
            <p className="text-muted-foreground text-sm md:text-base mb-4">
              You cannot send messages to this user due to blocking restrictions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const wordCount = getWordCount(message);
  const charCount = getCharCount(message);
  const isOverWordLimit = wordCount > 50;
  const isOverCharLimit = charCount > 300;
  const isAtRateLimit = remainingMessages === 0;
  const canSend = !isOverWordLimit && !isOverCharLimit && wordCount > 0 && !isAtRateLimit && !blockLoading;

  return (
    <Card className="bg-gradient-card shadow-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-bold">
          <MessageCircle className="w-5 h-5" />
          Message Owner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily quota information */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Daily quota: 2 messages per owner per day (resets at midnight)
          </p>
          
          {/* Rate limit status */}
          <div className={`p-3 rounded-lg border ${
            isCheckingLimit 
              ? 'bg-blue-50 border-blue-200'
              : remainingMessages === 0 
                ? 'bg-red-50 border-red-200' 
                : remainingMessages === 1 
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-2">
              {isCheckingLimit ? (
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              ) : remainingMessages === 0 ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <Clock className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm font-medium">
                {isCheckingLimit 
                  ? 'Checking daily limit...'
                  : remainingMessages === 0 
                    ? 'Daily limit reached (0 remaining)'
                    : remainingMessages === 1 
                      ? '1 message remaining today'
                      : `${remainingMessages} messages remaining today`
                }
              </span>
            </div>
            {remainingMessages === 0 && (
              <p className="text-xs text-red-600 mt-1">
                You can send more messages tomorrow.
              </p>
            )}
          </div>
        </div>

        <div>
          <Textarea
            placeholder={`Send a message about "${listingTitle}"...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24 text-sm md:text-base"
            disabled={isSending}
          />
          <div className="flex justify-between items-center mt-2 text-xs md:text-sm">
            <span className={`${isOverWordLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {wordCount}/50 words
            </span>
            <span className={`${isOverCharLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {charCount}/300 characters
            </span>
          </div>
          {(isOverWordLimit || isOverCharLimit) && (
            <p className="text-destructive text-xs md:text-sm mt-2">
              {isOverWordLimit && "Message exceeds 50 word limit. "}
              {isOverCharLimit && "Message exceeds 300 character limit."}
            </p>
          )}
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!canSend || isSending || isCheckingLimit}
          className="w-full text-sm md:text-base"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSending ? "Sending..." : isCheckingLimit ? "Checking..." : "Send Message"}
        </Button>

        <p className="text-xs md:text-sm text-muted-foreground">
          Keep messages respectful and relevant to the property listing.
        </p>
      </CardContent>
    </Card>
  );
};

export default MessageOwner;