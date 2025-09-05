import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReportDialogProps {
  reportedUserId?: string;
  listingId?: string;
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
}

const ReportDialog: React.FC<ReportDialogProps> = ({ 
  reportedUserId, 
  listingId, 
  triggerText = "Report", 
  triggerVariant = "outline" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to submit a report.",
        variant: "destructive"
      });
      return;
    }

    if (!category) {
      toast({
        title: "Category Required",
        description: "Please select a category for your report.",
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for your report.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reports' as any)
        .insert({
          reporter_user_id: user.id,
          reported_user_id: reportedUserId || null,
          listing_id: listingId || null,
          category,
          reason: reason.trim(),
          details: details.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for your report. Our team will review it shortly.",
      });

      setOpen(false);
      setCategory("");
      setReason("");
      setDetails("");
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportType = listingId ? "listing" : "user";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          <Flag className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report {reportType === "listing" ? "Listing" : "User"}</DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {reportType === "listing" ? (
                  <>
                    <SelectItem value="fake">Fake or misleading listing</SelectItem>
                    <SelectItem value="spam">Spam or duplicate</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                    <SelectItem value="pricing">Pricing issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="harassment">Harassment or abuse</SelectItem>
                    <SelectItem value="spam">Spam messages</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate behavior</SelectItem>
                    <SelectItem value="fake">Fake profile</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason*</Label>
            <Textarea
              id="reason"
              placeholder="Please describe why you're reporting this..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              placeholder="Any additional information that might be helpful..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-16"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;