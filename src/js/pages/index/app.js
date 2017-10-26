/**
 * Application for home page
 */
class App {
  /**
   * Initialize applicaiton components
   */
  constructor() {
    /**
     * @type {TripDataAnalyser}
     */
    this.analyser = new TripDataAnalyser;

    /**
     * @type {Dealership}
     */
    this.dealership = new Dealership;

    /**
     * @type {VehicleStats}
     */
    this.vehicleStats = new VehicleStats({
      id : "vehicle-stats"
    });
  }
};
