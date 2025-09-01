interface PriceFormatOptions {
  price?: number;
  price_rupees?: number;
  price_amount_raw?: number;
  price_unit?: string;
  transaction_type?: string;
}

export const formatListingPrice = (options: PriceFormatOptions): string => {
  const { price, price_rupees, price_amount_raw, price_unit, transaction_type } = options;
  
  // For new listings with structured price data
  if (price_amount_raw && price_unit) {
    let formattedAmount = '';
    
    // Format the amount based on the unit
    if (price_unit === 'lakh' || price_unit === 'crore') {
      formattedAmount = `${price_amount_raw} ${price_unit}`;
    } else {
      // For other units, format with Indian number system
      formattedAmount = price_amount_raw.toLocaleString('en-IN');
    }
    
    const suffix = transaction_type === 'rent' ? ' per month' : '';
    return `₹${formattedAmount}${suffix}`;
  }
  
  // For listings with price_rupees (converted)
  if (price_rupees) {
    const suffix = transaction_type === 'rent' ? ' per month' : '';
    return `₹${price_rupees.toLocaleString('en-IN')}${suffix}`;
  }
  
  // Fallback for legacy listings with just price field
  if (price) {
    const suffix = transaction_type === 'rent' ? ' per month' : '';
    return `₹${price.toLocaleString('en-IN')}${suffix}`;
  }
  
  return '₹0';
};