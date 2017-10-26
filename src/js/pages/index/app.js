class App {
  constructor() {
    this.analyser = new TripDataAnalyser;
    this.dealership = new Dealership;
    this.vehicleStats = new VehicleStats({
      id : "vehicle-stats"
    });
  }
};
