/**
 * Utility class for analyzing Google Takeout data
 */
class TripDataAnalyser {
  /**
   * Instantiate the analyser
   * @param {Vehicle} opts.vehicle Vehicle to use for analysis
   * @param {Object} opts.takeoutData Google takeout data
   */
  constructor(opts) {
    /**
     * Configuration options
     * @type {Object}
     */
    this._opts = Object.assign({
      vehicle : new Vehicle,
      takeoutData : []
    }, opts);

    /**
     * All trips
     * @type {Array}
     */
    this._trips = [];

    /**
     * Graph structure of trips
     * @type {Graph}
     */
    this.tripGraph = new Graph;
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
    this._opts.takeoutData = data.locations.reverse();
    this._computeTrips();
  }

  /**
   * Get trip data
   * @return {Array}
   */
  getTrips() {
    return this._trips;
  }

  /**
   * Get trip data as a feature collection
   * @return {FeatureCollection}
   */
  getTripsCollection() {
    return turf.featureCollection(
      this.getTrips().map(trip => trip.toLineString())
    );
  }

  /**
   * Get the endpoints of each trip (start/stop)
   * @return {Array}
   */
  getEndpoints() {
    return this.getTrips()
      .map(trip => [
        trip._history[0],
        trip._history[trip._history.length - 1]
      ])
      .reduce((acc, pair) => acc.concat(pair), []);
  }

  /**
   * Get the endpoints as a feature collection
   * @return {FeatureCollection}
   */
  getEndpointsCollection() {
    return turf.featureCollection(
      this.getEndpoints().map(loc => loc.toTurfPoint())
    );
  }

  /**
   * Compute all trips in a recent time period from the data
   *  - A trip is defined as an ordered set of {lat,lon,elev,date} locations
   *    such that the adjacent pairwise time difference between the former
   *    and latter location does not exceed some epsilon deemed unreasonable
   *    for a regular sampling of vehicular travel data. An equivalent epsilon
   *    is also considered for distance to prevent spurious data.
   *  @param {Number} days Number of days to go back from now in analysis
   *  @param {Number} maxTDelta Temporal epsilon mentioned in definition (hours)
   *  @param {Number} maxDistDelta Maximum distance between any
   *    two locations (miles)
   *  @param {Number} minTripDist Minimum distance in miles for trip results
   *  @param {Number} minDistDelta Minimum decimal degree difference to warrant
   *    considering a pair of points as being different locations geographically
   */
  _computeTrips(days = 120, maxTDelta = 0.1, maxDistDelta = 5, minTripDist = 0.5, minDistDelta = 0.000001) {
    // Get data from the specified time period
    const dateCutoff = +new Date - days * 86400000;

    // Get recent data and transform it into Array of Locations
    let rawData = _(this._opts.takeoutData)
      .filter(geoJSON => +geoJSON.timestampMs > dateCutoff)
      .map(geoJSON => new Location(geoJSON))
      .value();

    // Exclude adjacent points that are very close to each other
    rawData = _(rawData)
      .filter((loc, i) => {
        if (rawData[i + 1] !== undefined) {
          const [ [lon1, lat1], [lon2, lat2] ] = [ loc, rawData[i + 1] ]
            .map(l => l.toArray());

          return [ [lon1, lon2], [lat1, lat2] ]
            .filter(([a, b]) => Math.abs(a - b) < minDistDelta)
            .length === 0;
        } else {
          return true;
        }
      })
      .value()

    // Organize data into trips
    this._trips = [ new Trip ];
    let [ curTrip ] = this._trips;
    let lastLoc = rawData.shift();

    const maxTDeltaMs = maxTDelta * 3600000;
    rawData.forEach(curLoc => {
      if (
        curLoc.getTime() - lastLoc.getTime() > maxTDeltaMs ||
        Math.abs(turf.distance(curLoc.toArray(), lastLoc.toArray(), 'miles')) > maxDistDelta
      ) {
        // New trip
        curTrip = new Trip;
        this._trips.push(curTrip);
      }

      // Add to current trip
      curTrip.addPoint(curLoc);
      lastLoc = curLoc;
    });

    // Filter out any trips that did not get enough data
    this._trips = this._trips.filter(trip => trip.getDistance() > minTripDist);
  }

  /**
   * Compute a trip graph using the computed trips from user data
   */
  _computeGraph() {
    // TODO
  }
}
