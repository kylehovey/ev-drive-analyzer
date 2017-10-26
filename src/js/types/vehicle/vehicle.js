/**
 * A general vehicle type
 */
export class Vehicle {
  /**
   * Create the vehicle
   * @param {String} opts.title Title and/or description of vehicle
   * @param {String} opts.key Identifier assigned to vehicle
   * @param {Number} opts.capacity Capacity of vehicle battery in kWh
   * @param {Number} opts.economy Economy of vehicle in miles / kWh
   * @param {String} opts.type Type of car (can be [car,bike,scooter])
   * @param {Number} opts.cost Cost of car in USD
   */
  constructor(opts) {
    // Set defaults
    Object.assign(this, {
        title : "Default",
        key : "default",
        capacity : 10,
        economy : 3,
        type : "car",
        cost : 30000
      }, opts);
  }

  /**
   * Get the range of this vehicle
   * @return {Number}
   */
  getRange() {
    return this.capacity * this.economy;
  }
}
