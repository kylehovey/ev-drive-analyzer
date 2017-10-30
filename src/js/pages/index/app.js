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
  
    // Mapbox Config
    mapboxgl.accessToken =
      'pk.eyJ1IjoidXBlbCIsImEiOiJjajllZ29reTUyYTJoMndsc3ZtdGg2NXpsIn0.Y6sKlsUA9ZIm8rHfklQPaQ';

    /**
     * @type {mapboxgl.Map}
     */
    this.map = new mapboxgl.Map({
      container : 'map',
      style : 'mapbox://styles/mapbox/light-v9',
      center: [-111.801, 41.746],
      zoom: 9
    });

    // Config
    this.map.addControl(new mapboxgl.NavigationControl());
  }
};
