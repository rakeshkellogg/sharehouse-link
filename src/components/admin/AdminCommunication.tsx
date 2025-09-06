import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Edit, Eye, EyeOff, Trash2, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data structure - would be replaced with real Supabase data
interface Announcement {
  id: string;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

const AdminCommunication: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    message: string;
    level: 'info' | 'warning' | 'critical';
    is_active: boolean;
    start_date: string;
    end_date: string;
  }>({
    title: '',
    message: '',
    level: 'info',
    is_active: true,
    start_date: '',
    end_date: ''
  });
  const { toast } = useToast();

  // Mock data - replace with real Supabase queries
  useEffect(() => {
    // Simulate fetching announcements
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'Platform Maintenance Scheduled',
        message: 'We will be performing scheduled maintenance on Sunday from 2-4 AM IST.',
        level: 'warning',
        is_active: true,
        start_date: '2025-01-08',
        end_date: '2025-01-15',
        created_at: '2025-01-06T10:00:00Z'
      },
      {
        id: '2',
        title: 'New Features Available',
        message: 'Check out our new property comparison tool and enhanced search filters!',
        level: 'info',
        is_active: false,
        created_at: '2025-01-05T14:30:00Z'
      }
    ];
    setAnnouncements(mockAnnouncements);
  }, []);

  const handleCreateAnnouncement = () => {
    // Mock creation - replace with Supabase insert
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString()
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    
    toast({
      title: "Success",
      description: "Announcement created successfully"
    });

    // Reset form
    setFormData({
      title: '',
      message: '',
      level: 'info',
      is_active: true,
      start_date: '',
      end_date: ''
    });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateAnnouncement = () => {
    if (!editingAnnouncement) return;

    // Mock update - replace with Supabase update
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === editingAnnouncement.id
          ? { ...ann, ...formData }
          : ann
      )
    );

    toast({
      title: "Success",
      description: "Announcement updated successfully"
    });

    setEditingAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      level: 'info',
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const toggleAnnouncementStatus = (id: string) => {
    // Mock toggle - replace with Supabase update
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === id
          ? { ...ann, is_active: !ann.is_active }
          : ann
      )
    );

    toast({
      title: "Success",
      description: "Announcement status updated"
    });
  };

  const deleteAnnouncement = (id: string) => {
    // Mock delete - replace with Supabase delete
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    
    toast({
      title: "Success",
      description: "Announcement deleted successfully"
    });
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      level: announcement.level,
      is_active: announcement.is_active,
      start_date: announcement.start_date || '',
      end_date: announcement.end_date || ''
    });
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      critical: 'destructive'
    } as const;

    return <Badge variant={variants[level as keyof typeof variants]}>{level.toUpperCase()}</Badge>;
  };

  const AnnouncementForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Announcement title..."
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Write your announcement message..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="level">Priority Level</Label>
          <Select
            value={formData.level}
            onValueChange={(value: 'info' | 'warning' | 'critical') =>
              setFormData(prev => ({ ...prev, level: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="active">Active</Label>
          <Switch
            id="active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, is_active: checked }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date (optional)</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="end_date">End Date (optional)</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>
      </div>

      <Button
        onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
        className="w-full"
        disabled={!formData.title || !formData.message}
      >
        {editingAnnouncement ? 'Update' : 'Create'} Announcement
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Platform Communication
              </CardTitle>
              <CardDescription className="text-white/70">
                Manage site-wide announcements and user communications
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                  <DialogDescription>
                    Create a site-wide announcement for all users
                  </DialogDescription>
                </DialogHeader>
                <AnnouncementForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white/80">
              <Megaphone className="w-5 h-5" />
              <span>Active announcements will be shown to all users</span>
            </div>

            <div className="rounded-lg border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white">Title</TableHead>
                    <TableHead className="text-white">Level</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Duration</TableHead>
                    <TableHead className="text-white">Created</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id} className="border-white/20">
                      <TableCell className="text-white">
                        <div>
                          <div className="font-medium">{announcement.title}</div>
                          <div className="text-sm text-white/70 max-w-xs truncate">
                            {announcement.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLevelBadge(announcement.level)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                          {announcement.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {announcement.start_date || announcement.end_date ? (
                          <div className="text-xs">
                            {announcement.start_date && `From: ${announcement.start_date}`}
                            {announcement.end_date && (
                              <div>Until: {announcement.end_date}</div>
                            )}
                          </div>
                        ) : (
                          'Indefinite'
                        )}
                      </TableCell>
                      <TableCell className="text-white/70">
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAnnouncementStatus(announcement.id)}
                        >
                          {announcement.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(announcement)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Announcement</DialogTitle>
                              <DialogDescription>
                                Update the announcement details
                              </DialogDescription>
                            </DialogHeader>
                            <AnnouncementForm />
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAnnouncement(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {announcements.length === 0 && (
              <div className="text-center py-8 text-white/70">
                No announcements created yet. Create your first announcement above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Future communication features placeholder */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Future Communication Features</CardTitle>
          <CardDescription className="text-white/70">
            Additional communication tools coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="text-white/90">
          <ul className="space-y-2">
            <li>• Email newsletters to all registered users</li>
            <li>• Targeted announcements by user segment</li>
            <li>• Push notifications for mobile users</li>
            <li>• Emergency broadcast system</li>
            <li>• Scheduled announcement publishing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommunication;