 
// src/utils/laborCalculator.js

export class LaborCalculator {
  constructor(logisticsData, installationHours, pricing) {
    this.data = logisticsData;
    this.installationHours = installationHours;
    this.pricing = pricing;
  }

  calculateTravelCosts() {
    const mileage = this.data.distanceToSite || 0;
    const trips = this.data.numberOfTrips || 1;
    const mileageRate = 0.63; // IRS standard rate

    return {
      totalMiles: mileage * 2 * trips, // Round trip for each visit
      cost: mileage * 2 * trips * mileageRate
    };
  }

  calculateHotelCosts() {
    const days = this.data.travelDays || 0;
    const rate = this.data.hotelRate || 150; // Default rate

    return {
      nights: Math.max(0, days - 1), // One less night than days
      cost: Math.max(0, days - 1) * rate
    };
  }

  calculateLaborHours() {
    const standardHours = (this.data.estimatedDays || 0) * 8; // 8 hours per day
    const additionalHours = this.data.generalLaborHours || 0;
    const installHours = this.installationHours || 0;

    return {
      standard: standardHours,
      additional: additionalHours,
      installation: installHours,
      total: standardHours + additionalHours + installHours
    };
  }

  calculateLaborCosts() {
    const hours = this.calculateLaborHours();
    const laborRate = this.pricing.services.generalLabor || 50;

    return {
      standard: hours.standard * laborRate,
      additional: hours.additional * laborRate,
      installation: hours.installation * laborRate,
      total: hours.total * laborRate
    };
  }

  calculatePerDiemCosts() {
    const days = this.data.travelDays || 0;
    const perDiemRate = 50; // Daily food and incidental expenses
    const crew = 2; // Assuming 2-person crew

    return {
      days,
      crew,
      cost: days * perDiemRate * crew
    };
  }

  calculateTotalCosts() {
    const travel = this.calculateTravelCosts();
    const hotel = this.calculateHotelCosts();
    const labor = this.calculateLaborCosts();
    const perDiem = this.calculatePerDiemCosts();
    const hours = this.calculateLaborHours();

    return {
      travel,
      hotel,
      labor,
      perDiem,
      hours,
      details: {
        totalDays: this.data.travelDays || 0,
        numberOfTrips: this.data.numberOfTrips || 1,
        totalHours: hours.total
      },
      total: travel.cost + hotel.cost + labor.total + perDiem.cost
    };
  }
}
