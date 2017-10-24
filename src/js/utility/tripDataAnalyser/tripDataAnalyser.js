class TripDataAnalyser {
  /**
   * Instantiate the analyser
   * @param {Vehicle} opts.vehicle Vehicle to use for analysis
   * @param {Object} opts.takeoutData Google takeout data
   */
  constructor(opts) {
    // Set defaults
    this._opts = Object.assign({
      vehicle : new Vehicle,
      userData : []
    }, opts);
  }

  /**
   * Use a given vehicle model for analysis
   * @param {Vehicle} vehicle The vehicle to examine
   */
  setVehicle(vehicle) {
    this._opts.vehicle = vehicle;
  }

  /**
   * Use given Google Takeout data for analysis
   * @param {Object} data Google Takeout data
   */
  setData(data) {
    this._opts.data = data;
  }
}
