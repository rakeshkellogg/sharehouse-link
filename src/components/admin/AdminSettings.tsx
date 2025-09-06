import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Shield, MessageCircle, Wrench, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AppConfig {
  maintenance_mode: boolean;
  max_messages_per_day: number;
  allow_new_registrations: boolean;
  require_email_verification: boolean;
}

const AdminSettings: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({
    maintenance_mode: false,
    max_messages_per_day: 2,
    allow_new_registrations: true,
    require_email_verification: true
  });
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.rpc('read_settings');
      
      if (error) {
        throw error;
      }

      // Cast the data to expected type
      const settings = data as any;

      setConfig({
        maintenance_mode: settings?.maintenance_mode === 'true' || settings?.maintenance_mode === true,
        max_messages_per_day: parseInt(settings?.message_rate_per_day || '50'),
        allow_new_registrations: settings?.allow_new_registrations === 'true' || settings?.allow_new_registrations === true,
        require_email_verification: settings?.require_email_verification === 'true' || settings?.require_email_verification === true,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch settings"
      });
    }
  };

  const updateConfig = (key: keyof AppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save each setting using the secure RPC
      await Promise.all([
        supabase.rpc('write_setting', { k: 'maintenance_mode', v: config.maintenance_mode }),
        supabase.rpc('write_setting', { k: 'message_rate_per_day', v: config.max_messages_per_day }),
        supabase.rpc('write_setting', { k: 'allow_new_registrations', v: config.allow_new_registrations }),
        supabase.rpc('write_setting', { k: 'require_email_verification', v: config.require_email_verification })
      ]);
      
      setHasChanges(false);
      toast({
        title: "Settings Saved",
        description: "Platform settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save settings. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    setConfig({
      maintenance_mode: false,
      max_messages_per_day: 2,
      allow_new_registrations: true,
      require_email_verification: true
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Platform Settings
          </CardTitle>
          <CardDescription className="text-white/70">
            Configure platform-wide settings and controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Maintenance Mode */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-white">System Controls</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label htmlFor="maintenance" className="text-white font-medium">
                  Maintenance Mode
                </Label>
                <p className="text-sm text-white/70">
                  Temporarily disable the platform for maintenance
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={config.maintenance_mode}
                onCheckedChange={(checked) => updateConfig('maintenance_mode', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label htmlFor="registrations" className="text-white font-medium">
                  Allow New Registrations
                </Label>
                <p className="text-sm text-white/70">
                  Enable or disable new user account creation
                </p>
              </div>
              <Switch
                id="registrations"
                checked={config.allow_new_registrations}
                onCheckedChange={(checked) => updateConfig('allow_new_registrations', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <Label htmlFor="email-verification" className="text-white font-medium">
                  Require Email Verification
                </Label>
                <p className="text-sm text-white/70">
                  Force users to verify their email before using the platform
                </p>
              </div>
              <Switch
                id="email-verification"
                checked={config.require_email_verification}
                onCheckedChange={(checked) => updateConfig('require_email_verification', checked)}
              />
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Messaging Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-white">Messaging Controls</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-limit" className="text-white">
                Daily Message Limit Per User
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="message-limit"
                  type="number"
                  min="1"
                  max="50"
                  value={config.max_messages_per_day}
                  onChange={(e) => updateConfig('max_messages_per_day', parseInt(e.target.value))}
                  className="w-32"
                />
                <span className="text-white/70 text-sm">
                  messages per day per recipient
                </span>
              </div>
              <p className="text-sm text-white/60">
                Currently set to {config.max_messages_per_day} messages per day to each property owner
              </p>
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-white">Security & Moderation</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-white font-medium">Auto-moderation</div>
                <div className="text-sm text-white/70 mt-1">
                  Coming Soon: Automated content filtering
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-white font-medium">Rate Limiting</div>
                <div className="text-sm text-white/70 mt-1">
                  Active: API and messaging rate limits
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-white font-medium">Spam Detection</div>
                <div className="text-sm text-white/70 mt-1">
                  Coming Soon: AI-powered spam detection
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-white font-medium">Content Filters</div>
                <div className="text-sm text-white/70 mt-1">
                  Coming Soon: Inappropriate content filtering
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              onClick={saveSettings}
              disabled={!hasChanges || loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              variant="outline"
              onClick={resetSettings}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>

            {hasChanges && (
              <span className="text-yellow-400 text-sm">
                You have unsaved changes
              </span>
            )}
          </div>

          {/* Settings Info */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="text-white font-medium mb-2">Settings Information</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Changes take effect immediately after saving</li>
              <li>• Maintenance mode will show a maintenance page to all users</li>
              <li>• Message limits help prevent spam and abuse</li>
              <li>• Some features require page refresh to take effect</li>
              <li>• Settings are stored securely in the database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;