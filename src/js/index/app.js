class App {
  constructor() {
    this.analyser = new TripDataAnalyser;
    this.dealership = new Dealership;
  }

  /**
   * Initialize data
   */
  async init() {
    // Add all vehicles to the dealership
    (await $.getJSON("/data/vehicleData.json"))
      .map(opts => new Vehicle(opts))
      .forEach(vehicle => {
        this.dealership.addVehicle(vehicle);
      });
  }
};
