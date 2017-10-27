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
     * @type {Object}
     */
    this._opts = Object.assign({
      vehicle : new Vehicle,
      takeoutData : []
    }, opts);

    /**
     * @type {Array}
     */
    this._trips = [];
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
   */
  getTrips() {
    return this._trips;
  }

  /**
   * Compute all trips in a recent time period from the data
   *  - A trip is defined as an ordered set of {lat,lon,elev,date} locations
   *    such that the adjacent pairwise geographic distance between the former
   *    and latter location does not exceed some epsilon deemed unreasonable
   *    for a regular sampling of vehicular travel data. An epsilon for time
   *    is also considered.
   *  @param {Number} days Number of days to go back from now in analysis
   *  @param {Number} maxDistDelta Location epsilon mentioned in definition
   *    of trip (mph)
   *  @param {Number} maxTDelta Temporal epsilon mentioned in definition (hours)
   *  @param {Number} minTripDist Minimum distance in miles for trip results
   */
  _computeTrips(days = 90, maxDistDelta = 4, maxTDelta = 1, minTripDist = 0.5) {
    // Get data from the specified time period
    const dateCutoff = +new Date - days * 86400000;

    const rawData = this._opts.takeoutData
      .filter(loc => +loc.timestampMs > dateCutoff)
      .map(loc => new Location(loc));

    // Organize data into trips
    this._trips = [ new Trip ];
    let [ curTrip ] = this._trips;
    let lastLoc = rawData.shift();

    const maxTDeltaMs = maxTDelta * 3600000;
    rawData.forEach(curLoc => {
      if (
        turf.distance(lastLoc.coords, curLoc.coords, 'miles') > maxDistDelta
        || (curLoc.getTime() - lastLoc.getTime() > maxTDeltaMs)
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
}
