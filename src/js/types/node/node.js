/**
 * A node for a graph
 */
class Node {
  /**
   * Construct a graph node
   * @param {String} label Label for node
   * @param {Object} data Data to set for node
   */
  constructor(label, data = {}) {
    /**
     * Label for node
     * @type {String}
     */
    this._label = label;

    /**
     * Data for node
     * @type {Object}
     */
    this._data = Object.assign({}, data);
  }

  /**
   * Get the label for this node
   * @return {String}
   */
  getLabel() {
    return this._label;
  }

  /**
   * Set stored data for this node
   * @param {Object} newData Data to set/merge
   */
  setData(newData) {
    Object.assign(this._data, newData);
  }

  /**
   * Get stored data for this node
   * @return {Object}
   */
  getData() {
    return this._data;
  }
}
