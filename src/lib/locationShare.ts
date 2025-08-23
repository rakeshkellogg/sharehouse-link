interface LocationShareOptions {
  address?: string;
  lat?: number;
  lng?: number;
  title?: string;
  message?: string;
}

interface ShareableLinks {
  googleMaps: string;
  whatsapp: string;
  plainText: string;
}

export const generateShareableLocationLinks = ({
  address,
  lat,
  lng,
  title = "Check out this location",
  message = ""
}: LocationShareOptions): ShareableLinks => {
  let googleMapsUrl = "";
  let locationText = "";

  // Generate Google Maps URL
  if (lat && lng) {
    googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    locationText = `${lat},${lng}`;
  } else if (address) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    locationText = address;
  }

  // Generate WhatsApp message
  const whatsappMessage = message 
    ? `${message}\n\n📍 ${title}\n${locationText}\n\n${googleMapsUrl}`
    : `📍 ${title}\n${locationText}\n\n${googleMapsUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  // Plain text for sharing
  const plainText = `${title}\n${locationText}\n${googleMapsUrl}`;

  return {
    googleMaps: googleMapsUrl,
    whatsapp: whatsappUrl,
    plainText
  };
};

export const shareLocation = async ({
  address,
  lat,
  lng,
  title = "Check out this location",
  message = ""
}: LocationShareOptions): Promise<boolean> => {
  const links = generateShareableLocationLinks({ address, lat, lng, title, message });

  // Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: links.plainText,
        url: links.googleMaps
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred, fall back to clipboard
      console.log('Web Share cancelled or failed:', error);
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(links.plainText);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    return false;
  }
};

export const shareLocationViaWhatsApp = ({
  address,
  lat,
  lng,
  title = "Check out this location",
  message = ""
}: LocationShareOptions) => {
  const links = generateShareableLocationLinks({ address, lat, lng, title, message });
  window.open(links.whatsapp, '_blank');
};

export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};