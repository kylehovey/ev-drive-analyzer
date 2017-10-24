class Vehicle {
  constructor(opts) {
    // Set defaults
    Object.assign(this, {
        title : "Default",
        key : "default",
        capacity : 10,
        economy : 3
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
