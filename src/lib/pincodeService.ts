import { supabase } from "@/integrations/supabase/client";
import { PincodeData } from "./indiaHelpers";

// Cache duration: 90 days
const CACHE_DURATION = 90 * 24 * 60 * 60 * 1000;

// Lookup pincode data with caching
export const lookupPincode = async (pincode: string): Promise<PincodeData | null> => {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    return null;
  }

  try {
    // First check cache
    const { data: cacheData } = await supabase
      .from('pincode_cache')
      .select('*')
      .eq('pincode', pincode)
      .single();

    // If found in cache and not expired, return it
    if (cacheData) {
      const cacheAge = Date.now() - new Date(cacheData.updated_at).getTime();
      if (cacheAge < CACHE_DURATION) {
        return {
          pincode: cacheData.pincode,
          city: cacheData.city,
          state: cacheData.state,
          lat: cacheData.lat || undefined,
          lng: cacheData.lng || undefined
        };
      }
    }

    // If not in cache or expired, try to fetch from external API
    // For now, return a basic lookup - this can be enhanced with Google Geocoding API later
    const mockData = getMockPincodeData(pincode);
    
    if (mockData) {
      // Save to cache
      await supabase
        .from('pincode_cache')
        .upsert({
          pincode: mockData.pincode,
          city: mockData.city,
          state: mockData.state,
          lat: mockData.lat,
          lng: mockData.lng,
          updated_at: new Date().toISOString()
        });
      
      return mockData;
    }

    return null;
  } catch (error) {
    console.error('Error looking up pincode:', error);
    return null;
  }
};

// Mock pincode data - replace with real API integration later
const getMockPincodeData = (pincode: string): PincodeData | null => {
  const mockData: Record<string, PincodeData> = {
    '560001': { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    '560002': { pincode: '560002', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    '560102': { pincode: '560102', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    '110001': { pincode: '110001', city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
    '400001': { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
    '600001': { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    '700001': { pincode: '700001', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    '500001': { pincode: '500001', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    '411001': { pincode: '411001', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    '380001': { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 }
  };

  return mockData[pincode] || null;
};