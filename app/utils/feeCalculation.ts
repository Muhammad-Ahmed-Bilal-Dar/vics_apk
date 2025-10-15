// Utility functions for fee calculation based on vehicle engine capacity

export interface VehicleInfo {
  vehicle_CC: string;
  vehicle_type?: string;
  // Add other vehicle properties as needed
}

// Fee schedule based on the provided table
export const FEE_SCHEDULE = {
  UP_TO_1000_CC: 800,
  ABOVE_1000_CC: 1000,
  DIESEL_VEHICLE: 1000
} as const;

/**
 * Calculate testing fee based on vehicle CC and type
 * @param vehicleCC - Engine capacity in CC (e.g., "1300", "800")
 * @param vehicleType - Type of vehicle (optional, for diesel detection)
 * @param isDiesel - Whether the vehicle is diesel powered (optional)
 * @returns Fee amount in PKR
 */
export const calculateTestingFee = (
  vehicleCC: string | number, 
  vehicleType?: string, 
  isDiesel?: boolean
): number => {
  // Convert CC to number if it's a string
  const ccValue = typeof vehicleCC === 'string' ? parseInt(vehicleCC, 10) : vehicleCC;
  
  // Check if it's a diesel vehicle
  if (isDiesel || (vehicleType && vehicleType.toLowerCase().includes('diesel'))) {
    return FEE_SCHEDULE.DIESEL_VEHICLE;
  }
  
  // Check engine capacity
  if (ccValue <= 1000) {
    return FEE_SCHEDULE.UP_TO_1000_CC;
  } else {
    return FEE_SCHEDULE.ABOVE_1000_CC;
  }
};

/**
 * Format fee amount for display
 * @param amount - Fee amount in PKR
 * @returns Formatted string (e.g., "PKR 1,000")
 */
export const formatFee = (amount: number): string => {
  return `PKR ${amount.toLocaleString()}`;
};

/**
 * Get fee category description based on vehicle CC
 * @param vehicleCC - Engine capacity in CC
 * @param isDiesel - Whether the vehicle is diesel powered
 * @returns Description of the fee category
 */
export const getFeeCategory = (vehicleCC: string | number, isDiesel?: boolean): string => {
  const ccValue = typeof vehicleCC === 'string' ? parseInt(vehicleCC, 10) : vehicleCC;
  
  if (isDiesel) {
    return "Diesel Vehicle";
  }
  
  if (ccValue <= 1000) {
    return "Up to 1,000 cc";
  } else {
    return "Above 1,000 cc";
  }
};

/**
 * Get vehicle information from the dataset and calculate fee
 * @param vehicle - Vehicle information object
 * @returns Object with CC, fee, and category information
 */
export const getVehicleFeeInfo = (vehicle: VehicleInfo) => {
  const cc = vehicle.vehicle_CC;
  const fee = calculateTestingFee(cc, vehicle.vehicle_type);
  const category = getFeeCategory(cc);
  
  return {
    cc,
    fee,
    category,
    formattedFee: formatFee(fee)
  };
};