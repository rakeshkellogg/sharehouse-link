-- Enable Row Level Security on pincode_cache table
ALTER TABLE pincode_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read from pincode_cache
CREATE POLICY "Allow authenticated users to read pincode cache" ON pincode_cache
FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow system/service role to insert/update pincode cache
CREATE POLICY "Allow system to manage pincode cache" ON pincode_cache
FOR ALL USING (auth.role() = 'service_role');