import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MessageSquare, Eye, EyeOff, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Listing {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  is_public: boolean;
  deleted_at: string | null;
  created_at: string;
  user_id: string;
}

const AdminContentModeration: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, city, state, price, is_public, deleted_at, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch listings"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleListingVisibility = async (listingId: string, isCurrentlyPublic: boolean) => {
    try {
      const { error } = await supabase.rpc('admin_set_listing', {
        p_listing_id: listingId,
        p_is_public: !isCurrentlyPublic
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Listing ${!isCurrentlyPublic ? 'published' : 'hidden'} successfully`,
      });

      fetchListings();
    } catch (error) {
      console.error('Error toggling listing visibility:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update listing visibility"
      });
    }
  };

  const softDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase.rpc('admin_set_listing', {
        p_listing_id: listingId,
        p_soft_delete: true
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });

      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete listing"
      });
    }
  };

  const restoreListing = async (listingId: string) => {
    try {
      const { error } = await supabase.rpc('admin_set_listing', {
        p_listing_id: listingId,
        p_soft_delete: false
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Listing restored successfully"
      });

      fetchListings();
    } catch (error) {
      console.error('Error restoring listing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to restore listing"
      });
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.state?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'public' && listing.is_public && !listing.deleted_at) ||
      (statusFilter === 'hidden' && !listing.is_public && !listing.deleted_at) ||
      (statusFilter === 'deleted' && listing.deleted_at);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (listing: Listing) => {
    if (listing.deleted_at) {
      return <Badge variant="destructive">Deleted</Badge>;
    }
    if (listing.is_public) {
      return <Badge variant="default">Public</Badge>;
    }
    return <Badge variant="secondary">Hidden</Badge>;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/20 rounded"></div>
        <div className="h-64 bg-white/20 rounded"></div>
      </div>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Content Moderation
        </CardTitle>
        <CardDescription className="text-white/70">
          Moderate listings and manage content visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchListings} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="rounded-lg border border-white/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/20">
                <TableHead className="text-white">Title</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Price</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id} className="border-white/20">
                  <TableCell className="text-white">
                    <div className="max-w-48 truncate">
                      {listing.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-white/70">
                    {listing.city}, {listing.state}
                  </TableCell>
                  <TableCell className="text-white/70">
                    ₹{listing.price?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(listing)}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link to={`/listing/${listing.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    
                    {!listing.deleted_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleListingVisibility(listing.id, listing.is_public)}
                      >
                        {listing.is_public ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    )}

                    {listing.deleted_at ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreListing(listing.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Restore
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this listing? This action can be undone by restoring the listing.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => softDeleteListing(listing.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-8 text-white/70">
            No listings found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminContentModeration;