import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, MessageSquare, BarChart3, Settings, Download, Mail } from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Navigate } from 'react-router-dom';

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Management
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Manage user accounts and moderation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <p>Features coming soon:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>View flagged users</li>
                      <li>Activate/Deactivate accounts</li>
                      <li>View blocked users</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Content Moderation
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Moderate listings and messages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <p>Features coming soon:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Review reported content</li>
                      <li>Delete inappropriate listings</li>
                      <li>Remove inappropriate videos</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Reports & Flags</CardTitle>
                    <CardDescription className="text-white/70">
                      Review user reports and flags
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Open Reports:</span>
                        <Badge variant="destructive">0</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Under Review:</span>
                        <Badge variant="outline">0</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Analytics</CardTitle>
                  <CardDescription className="text-white/70">
                    View platform metrics and usage statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-white/90">
                  <p>Analytics dashboard coming soon with:</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Daily/Weekly/Monthly new user registrations</li>
                    <li>New listings created over time</li>
                    <li>Active chat conversations</li>
                    <li>User engagement metrics</li>
                    <li>Popular property types and locations</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Data Export</CardTitle>
                  <CardDescription className="text-white/70">
                    Export platform data for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-white/90">
                  <p>Data export features coming soon:</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Full database export (users, listings, messages)</li>
                    <li>CSV and JSON format options</li>
                    <li>Scheduled exports</li>
                    <li>Filtered exports by date range</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Communication</CardTitle>
                  <CardDescription className="text-white/70">
                    Communicate with your users
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-white/90">
                  <p>Communication features coming soon:</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Site-wide announcements</li>
                    <li>Email newsletters to all users</li>
                    <li>Broadcast important updates</li>
                    <li>Maintenance notifications</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Configure platform-wide settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-white/90">
                  <p>Settings panel coming soon:</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>Message rate limits (currently: 2 per day per user)</li>
                    <li>Maintenance mode toggle</li>
                    <li>Feature flags and toggles</li>
                    <li>User registration controls</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;