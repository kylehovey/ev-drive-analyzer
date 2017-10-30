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
      return turf.lineDistance(this.toLineString(), type);
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
   * @return {LineString}
   */
  toLineString() {
    return turf.lineString(this._history.map(loc => loc.toArray()));
  }

  /**
   * Convert to GeoJSON FeatureCollection
   * @return {FeatureCollection}
   */
  toFeatureCollection() {
    return turf.featureCollection(this._history.map(loc => loc.toTurfPoint()));
  }
}
