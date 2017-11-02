/**
 * An edge adjacent between two nodes
 */
class Edge {
  /**
   * Create an edge between two points
   * @param {Node} from Node edge is coming from
   * @param {Node} to Node edge is going to
   */
  constructor(from, to, data = {}) {
    /**
     * Beginning of edge
     * @type {Node}
     */
    this._from = from;

    /**
     * End of edge
     * @type {Node}
     */
    this._to = to;

    /**
     * Data for this edge
     * @type {Object}
     */
    this._data = data
  }

  /**
   * Set edge data
   * @param {Object} newData Data to set
   */
  setData(newData) {
    Object.assign(this._data, newData);
  }

  /**
   * Get edge data
   * @return {Object}
   */
  getData() {
    return this._data;
  }

  /**
   * Return starting node
   * @return {Node}
   */
  getFrom() {
    return this._from;
  }

  /**
   * Return ending node
   * @return {Node}
   */
  getTo() {
    return this._to;
  }

  /**
   * Return adjacent nodes
   * @return {[Node, Node]}
   */
  getAdjacentNodes() {
    return [ this.getFrom(), this.getTo() ];
  }
}
