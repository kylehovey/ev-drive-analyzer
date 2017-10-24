class Dealership {
  constructor() {
    this.vehicles = {};
  }

  /** Add a vehicle definition to the dealership
   * @param {Vehicle} vehicle The vehicle to add
   */
  addVehicle(vehicle) {
    this.vehicles[vehicle.key] = vehicle;
  }

  /**
   * Add a vehicle definition to the dealership using vehicle options
   * @param {Object} opts
   */
  addVehicleFromOptions(opts) {
    this.vehicles[opts.key] = new Vehicle(opts);
  }
}
