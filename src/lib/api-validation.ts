export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePropertiesParams(searchParams: URLSearchParams): ValidationResult {
  const errors: string[] = [];
  
  // Validate page parameter
  const page = searchParams.get('page');
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
      errors.push('Page must be a number between 1 and 1000');
    }
  }
  
  // Validate limit parameter
  const limit = searchParams.get('limit');
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be a number between 1 and 100');
    }
  }
  
  // Validate latitude parameters
  const latMin = searchParams.get('latitudeMin');
  const latMax = searchParams.get('latitudeMax');
  if (latMin || latMax) {
    const latMinNum = latMin ? parseFloat(latMin) : null;
    const latMaxNum = latMax ? parseFloat(latMax) : null;
    
    if (latMinNum !== null && (isNaN(latMinNum) || latMinNum < -90 || latMinNum > 90)) {
      errors.push('latitudeMin must be a number between -90 and 90');
    }
    if (latMaxNum !== null && (isNaN(latMaxNum) || latMaxNum < -90 || latMaxNum > 90)) {
      errors.push('latitudeMax must be a number between -90 and 90');
    }
    if (latMinNum !== null && latMaxNum !== null && latMinNum >= latMaxNum) {
      errors.push('latitudeMin must be less than latitudeMax');
    }
  }
  
  // Validate longitude parameters
  const lngMin = searchParams.get('longitudeMin');
  const lngMax = searchParams.get('longitudeMax');
  if (lngMin || lngMax) {
    const lngMinNum = lngMin ? parseFloat(lngMin) : null;
    const lngMaxNum = lngMax ? parseFloat(lngMax) : null;
    
    if (lngMinNum !== null && (isNaN(lngMinNum) || lngMinNum < -180 || lngMinNum > 180)) {
      errors.push('longitudeMin must be a number between -180 and 180');
    }
    if (lngMaxNum !== null && (isNaN(lngMaxNum) || lngMaxNum < -180 || lngMaxNum > 180)) {
      errors.push('longitudeMax must be a number between -180 and 180');
    }
    if (lngMinNum !== null && lngMaxNum !== null && lngMinNum >= lngMaxNum) {
      errors.push('longitudeMin must be less than longitudeMax');
    }
  }
  
  // Validate area size (prevent extremely large queries)
  if (latMin && latMax && lngMin && lngMax) {
    const latDiff = Math.abs(parseFloat(latMax) - parseFloat(latMin));
    const lngDiff = Math.abs(parseFloat(lngMax) - parseFloat(lngMin));
    
    if (latDiff > 10 || lngDiff > 10) {
      errors.push('Query area is too large. Maximum allowed area is 10x10 degrees');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeParams(searchParams: URLSearchParams): URLSearchParams {
  const sanitized = new URLSearchParams();
  
  // Only allow known parameters
  const allowedParams = [
    'page', 'limit', 'latitudeMin', 'latitudeMax', 
    'longitudeMin', 'longitudeMax', 'property_type', 
    'price_min', 'price_max', 'sqft_min', 'sqft_max'
  ];
  
  for (const [key, value] of searchParams.entries()) {
    if (allowedParams.includes(key)) {
      sanitized.set(key, value);
    }
  }
  
  return sanitized;
} 