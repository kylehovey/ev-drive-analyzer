/**
 * A generalized graph with edge weights
 */
class Graph {
  /**
   * Create the graph
   * @param {Number} nodeCount Number of nodes in graph
   */
  constructor() {
    this._nodes = {};
    this._edges = {};
    this._adjacencies = new Map();
  }

  /**
   * Add a node to the graph
   * @param {String|Number} label Label for node
   * @param {Object} data Data to set for node
   */
  addNode(label, data = {}) {
    // Instantiate node
    const node = new Node(label, data);

    // Add to graph
    this._nodes[label] = node;
    this._adjacencies.set(node, []);
  }

  /**
   * Determine whether or not a node exists
   * @param {String|Number} label Label for node
   * @return {Boolean}
   */
  hasNode(label) {
    return label in this._nodes;
  }

  /**
   * Get the node specified by a label
   * @param {String|Number} label Label for node
   * @return {Node}
   */
  getNode(label) {
    if (this.hasNode(label)) {
      return this._nodes[label];
    } else {
      throw new Error(`Node "${label}" not found in graph.`);
    }
  }

  /**
   * Get all nodes for the graph
   * @return {[Node, ...]}
   */
  getNodes() {
    return [...this._adjacencies.keys()];
  }

  /**
   * Get all labels for the graph
   * @return {[String|Number, ...]}
   */
  getLabels() {
    return this.getNodes()
      .map(node => node.getLabel());
  }

  /**
   * Get adjacent nodes to a given label
   * @param {String|Number} label Label for node
   * @return {Node[]}
   */
  getAdjacent(label) {
    return this._adjacencies.get(this.getNode(label));
  }

  /**
   * Add an edge to the graph
   * @param {String} from Label of node from
   * @param {String} to Label of node to
   * @param {Object} data Data to store for edge
   */
  addEdge(from, to, data = {}) {
    // Add edge to graph
    [ from, to ]
      .map(this.getAdjacent.bind(this))
      .forEach((list, i) => list.push(i === 0 ? to : from));

    // Add edge data to graph
    this._edges[`${from}${to}`] = new Edge(
      this.getNode(from),
      this.getNode(to),
      data
    );
  }

  /**
   * Get the edge between two nodes
   * @param {String} from Label of node from
   * @param {String} to Label of node to
   * @return {Edge}
   */
  getEdge(from, to) {
    const edgeForward = this._edges[`${from}${to}`];
    const edgeReverse = this._edges[`${to}${from}`];

    if (edgeForward !== undefined || edgeReverse !== undefined) {
      return edgeForward !== undefined ? edgeForward : edgeReverse;
    } else {
      throw new Error(`Edge from "${from}" to "${to}" not found.`);
    }
  }

  /**
   * Get all edges
   * @return {[Edge, ...]}
   */
  getEdges() {
    return Object.values(this._edges);
  }

  /**
   * Set edge data for a given edge
   * @param {String} from Label of node from
   * @param {String} to Label of node to
   * @param {Object} data Data to set
   */
  setEdgeData(from, to, data) {
    Object.assign(this.getEdgeData(from, to), data);
  }
}
