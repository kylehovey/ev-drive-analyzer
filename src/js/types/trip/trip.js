/**
 * A trip composes many locations into a path
 */
class Trip {
  /**
   * Start off with trip with no points
   */
  constructor() {
    /**
     * @type {Array}
     */
    this._history = [];
  }

  /**
   * Add a point to the trip
   * @param {Array} point Point in the trip in [lon, lat]
   */
  addPoint(point) {
    this._history.push(point);
  }

  /**
   * Find the distance of the trip
   * @param {String} type Type of measurement
   * @return {Number}
   */
  getDistance(type = "miles") {
    if (this._history.length > 1) {
      const path = turf.lineString(this._history.map(loc => loc.toArray()));
      return turf.lineDistance(path, type);
    } else {
      return 0;
    }
  }

  /**
   * Find the total duration of the trip in ms
   * @return {Number}
   */
  getDuration() {
    const [ first ] = this._history;
    const [ last ] = this._history.slice(-1);
    return last.getTime() - first.getTime();
  }

  /**
   * Find the average speed of the trip
   * @param {String} type Type of measurement
   * @return {Number}
   */
  getAverageSpeed(type = 'miles') {
    return this.getDistance(type) / this.getDuration();
  }

  /**
   * Convert to GeoJSON LineString
   * @return {Object}
   */
  toLineString() {
    return {
      type : "Feature",
      properties : {},
      geometry : {
        type : "LineString",
        coordinates : this._history.map(loc => loc.toArray())
      }
    };
  }
}
