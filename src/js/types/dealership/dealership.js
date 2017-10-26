/**
 * A collection of vehicles
 */
class Dealership {
  /**
   * Initialize stateful data
   */
  constructor() {
    /**
     * @type {Object}
     */
    this._vehicles = {};
  }

  /** Add a vehicle definition to the dealership
   * @param {Vehicle} vehicle The vehicle to add
   */
  addVehicle(vehicle) {
    this._vehicles[vehicle.key] = vehicle;
  }

  /**
   * Add a vehicle definition to the dealership using vehicle options
   * @param {Object} opts
   */
  addVehicleFromOptions(opts) {
    this._vehicles[opts.key] = new Vehicle(opts);
  }

  /**
   * Get a list of all vehicles
   * @return {Array}
   */
  getVehicles() {
    return Object.values(this._vehicles);
  }

  /**
   * Get a vehicle by key
   * @param {String} key Vehicle key
   */
  getVehicle(key) {
    if (key in this._vehicles) {
      return this._vehicles[key];
    } else {
      throw new Error("Vehicle does not exist in dealership.");
    }
  }
}
