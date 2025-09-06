import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Users, Home, MessageCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDataExport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportLimit, setExportLimit] = useState('500');
  const { toast } = useToast();

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No data available for export"
      });
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle null/undefined values and escape quotes
          const stringValue = value === null || value === undefined ? '' : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `${data.length} records exported successfully`
    });
  };

  const exportUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select('user_id, display_name, created_at, suspended_at')
        .order('created_at', { ascending: false });

      if (exportLimit) {
        query = query.limit(parseInt(exportLimit));
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.csv();
      
      if (error) {
        throw error;
      }
      
      const blob = new Blob([data as string], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Users data has been exported successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export users data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportListings = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('listings')
        .select('id, title, city, state, price, is_public, created_at, deleted_at')
        .order('created_at', { ascending: false });

      if (exportLimit) {
        query = query.limit(parseInt(exportLimit));
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.csv();
      
      if (error) {
        throw error;
      }
      
      const blob = new Blob([data as string], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'listings-export.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Listings data has been exported successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export listings data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportMessages = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('messages')
        .select('id, listing_id, sender_user_id, owner_user_id, created_at, read_at')
        .order('created_at', { ascending: false });

      if (exportLimit) {
        query = query.limit(parseInt(exportLimit));
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.csv();
      
      if (error) {
        throw error;
      }
      
      const blob = new Blob([data as string], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'messages-export.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Messages data has been exported successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export messages data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportListingAnalytics = async () => {
    setLoading(true);
    try {
      // Export listing analytics with aggregated data
      let query = supabase
        .from('listings')
        .select('city, state, property_type, transaction_type, price, is_public, created_at')
        .eq('is_public', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.limit(parseInt(exportLimit));

      if (error) throw error;

      generateCSV(data || [], 'listing_analytics_export');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export analytics data"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Export Controls
          </CardTitle>
          <CardDescription className="text-white/70">
            Configure export parameters and download data in CSV format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-white">Start Date (optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-white">End Date (optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="limit" className="text-white">Export Limit</Label>
              <Select value={exportLimit} onValueChange={setExportLimit}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 records</SelectItem>
                  <SelectItem value="500">500 records</SelectItem>
                  <SelectItem value="1000">1,000 records</SelectItem>
                  <SelectItem value="2000">2,000 records</SelectItem>
                  <SelectItem value="5000">5,000 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users Export
            </CardTitle>
            <CardDescription className="text-white/70">
              Export user profiles and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/80 text-sm">
              Exports: User ID, Display Name, Avatar URL, Bio, Created Date, Updated Date
            </p>
            <Button 
              onClick={exportUsers} 
              disabled={loading}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Users CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Home className="w-5 h-5" />
              Listings Export
            </CardTitle>
            <CardDescription className="text-white/70">
              Export property listings and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/80 text-sm">
              Exports: ID, Title, Location, Price, Property Type, Transaction Type, Status
            </p>
            <Button 
              onClick={exportListings} 
              disabled={loading}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Listings CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages Export
            </CardTitle>
            <CardDescription className="text-white/70">
              Export messaging activity (anonymized)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/80 text-sm">
              Exports: Message ID, Listing ID, Users, Timestamp, Read Status (content anonymized)
            </p>
            <Button 
              onClick={exportMessages} 
              disabled={loading}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Messages CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Analytics Export
            </CardTitle>
            <CardDescription className="text-white/70">
              Export aggregated platform analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/80 text-sm">
              Exports: Listing trends by location, property types, pricing, and activity patterns
            </p>
            <Button 
              onClick={exportListingAnalytics} 
              disabled={loading}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Analytics CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
            </div>
            <div className="flex-1">
              <p className="text-white/90 font-medium">Export Guidelines</p>
              <ul className="text-white/70 text-sm mt-2 space-y-1">
                <li>• Large exports may take time to process</li>
                <li>• Message content is anonymized for privacy</li>
                <li>• Date filters help focus on specific time periods</li>
                <li>• All timestamps are in UTC format</li>
                <li>• CSV files can be opened in Excel or Google Sheets</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDataExport;