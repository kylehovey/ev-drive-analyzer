/**
 * Custom location type used in data analysis
 */
class Location {
  /**
   * Construct a location instance
   * @param {Object} geoJSON GeoJSON location object
   */
  constructor(geoJSON) {
    if (geoJSON !== undefined) {
      Object.assign(this, {
        date : new Date(+geoJSON.timestampMs),
        coords : [
          geoJSON.longitudeE7,
          geoJSON.latitudeE7
        ].map(val => val / 1E7)
      });
    } else {
      throw new Error("Must supply geoJSON to constructor of locaiton.");
    }
  }

  /**
   * Convert location to turf point
   * @return {turf.point}
   */
  toTurfPoint() {
    return turf.point(this.location);
  }

  /**
   * Convert location to coordinate array
   * @return {Array}
   */
  toArray() {
    return this.coords;
  }

  /**
   * Get time at location
   * @return {Date}
   */
  getTime() {
    return this.date;
  }
}
