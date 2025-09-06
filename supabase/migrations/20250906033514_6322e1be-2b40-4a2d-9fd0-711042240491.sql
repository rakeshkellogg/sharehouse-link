-- Add super admin email
INSERT INTO public.admin_emails (email, note) 
VALUES ('RAKESH.NW.KELLOGG@GMAIL.COM', 'Project owner - auto super admin access')
ON CONFLICT (email) DO NOTHING;