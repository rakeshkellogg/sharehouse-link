import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, Search, UserCheck, UserX, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  created_at: string;
  avatar_url?: string;
  suspended_at?: string;
}

const AdminUserManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    try {
      const { error } = await supabase.rpc('admin_set_user_suspension', {
        p_user_id: userId,
        p_suspend: suspend
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`,
      });

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user suspension:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !profile.suspended_at) ||
      (statusFilter === 'suspended' && profile.suspended_at);
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateId = (id: string) => {
    return `${id.substring(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded"></div>
          <div className="h-64 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
          <CardDescription className="text-white/70">
            Manage user accounts and view activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or user ID..."
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
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} variant="outline">
              Refresh
            </Button>
          </div>

          <div className="rounded-lg border border-white/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">User ID</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id} className="border-white/20">
                    <TableCell className="text-white">
                      {profile.display_name || 'No name'}
                    </TableCell>
                    <TableCell className="text-white/70 font-mono">
                      {truncateId(profile.user_id)}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {formatDate(profile.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.suspended_at ? "destructive" : "secondary"}>
                        {profile.suspended_at ? "Suspended" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(profile)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                            <DialogDescription>
                              View user information and account details
                            </DialogDescription>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div>
                                <Label>Display Name</Label>
                                <div className="text-sm text-muted-foreground">
                                  {selectedUser.display_name || 'No name set'}
                                </div>
                              </div>
                              <div>
                                <Label>User ID</Label>
                                <div className="text-sm text-muted-foreground font-mono">
                                  {selectedUser.user_id}
                                </div>
                              </div>
                              <div>
                                <Label>Account Created</Label>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(selectedUser.created_at).toLocaleString()}
                                </div>
                              </div>
                              {selectedUser.suspended_at && (
                                <div>
                                  <Label>Suspended At</Label>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(selectedUser.suspended_at).toLocaleString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {profile.suspended_at ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendUser(profile.user_id, false)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Unsuspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendUser(profile.user_id, true)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Suspend
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-8 text-white/70">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;