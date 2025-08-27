-- Add property type and transaction type fields to listings table
ALTER TABLE public.listings 
ADD COLUMN property_type TEXT CHECK (property_type IN ('house', 'land')) DEFAULT 'house',
ADD COLUMN transaction_type TEXT CHECK (transaction_type IN ('sale', 'rent')) DEFAULT 'sale';