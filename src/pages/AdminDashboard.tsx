import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, MessageSquare, BarChart3, Settings, Download, Mail } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminContentModeration from '@/components/admin/AdminContentModeration';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminDataExport from '@/components/admin/AdminDataExport';
import AdminCommunication from '@/components/admin/AdminCommunication';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <Badge variant="secondary" className="ml-2">Super Admin</Badge>
            </div>
            <p className="text-white/80">Manage your real estate platform with comprehensive admin tools.</p>
          </div>

          <Tabs defaultValue="monitoring" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm">
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Data Export
              </TabsTrigger>
              <TabsTrigger value="communication" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Communication
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring">
              <div className="space-y-8">
                <AdminUserManagement />
                <AdminContentModeration />
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="data">
              <AdminDataExport />
            </TabsContent>

            <TabsContent value="communication">
              <AdminCommunication />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;