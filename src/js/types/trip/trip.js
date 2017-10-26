class Trip {
  constructor() {
    this._history = [];
    this._path = null;
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
}
