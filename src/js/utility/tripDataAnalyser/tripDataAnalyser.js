class TripDataAnalyser {
  constructor() {
    this._vehicle = null;
    this._userData = null;
  }

  /**
   * Use a given vehicle model for analysis
   * @param {Vehicle} vehicle The vehicle to examine
   */
  setVehicle(vehicle) {
    this._vehicle = vehicle;
  }
}
