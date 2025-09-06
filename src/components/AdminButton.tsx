import React from 'react';
import { Button } from './ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const AdminButton: React.FC = () => {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Button variant="default" size="sm" asChild>
      <Link to="/admin">
        <Shield className="w-4 h-4 mr-2" />
        Admin
      </Link>
    </Button>
  );
};

export default AdminButton;