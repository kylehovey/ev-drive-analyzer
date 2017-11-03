/**
 * Horizontal minimal bar chart
 */
class HBarChart {
  /**
   * Create the bar chart and render it
   * @param {Object} opts
   * @param {String} opts.container Container ID
   * @param {Array<String|Object>} columnInfo Info about type of data stored
   *  in each column
   * @param {String[]} colorScheme Array of colors for chart data
   * @param {Array[]} opts.data Data as 2D array
   */
  constructor(opts) {
    /**
     * Make sure required arguments are supplied
     */
    if (
      [ opts.container, opts.columnInfo, opts.colorScheme ]
        .filter(val => val === undefined)
        .length > 0
    ) {
      throw new Error("Not all required parameters were supplied.");
    }

    /**
     * Chart container
     * @type {DOMElement}
     */
    this._container = $(`#${opts.container}`)[0];

    /**
     * Chart column structure
     * @type {Array<String|Object>}
     */
    this._columnInfo = opts.columnInfo;

    /**
     * Color scheme
     * @type {String[]}
     */
    this._colorScheme = opts.colorScheme;

    /**
     * Minimal display options
     * @type {Object}
     */
    this._chartOptions = {
      title: "",
      hAxis: {
        minValue: 0,
        textPosition : "none",
        gridlines : { color : "transparent" }
      },
      vAxis : {
        textPosition : "none",
        gridlines : { color : "transparent" }
      },
      legend: { position: "none" },
      backgroundColor : { fill:"transparent" }
    };

    /**
     * Internal promise for tracking chart loading
     * @type {Promise}
     */
    this._loaded = new Promise(resolve => {
      this._resolveChart = resolve;
    });

    // Load the chart API
    google.charts.load("current", { "packages" : [ "corechart" ] })
      .then(() => {

        /**
         * Build the chart
         * @type {google.visualization.BarChart}
         */
        this._chart = new google.visualization.BarChart(this._container);

        /**
         * Initialize chart data
         * @type {Array[]}
         */
        this.setData(opts.data !== undefined ? opts.data : []);

        // Resolve out
        this._resolveChart();
      });
  }

  /**
   * Get a color for a given data index
   * @param {Number} idx Index of data
   * @return {String}
   */
  _getColor(idx) {
    return this._colorScheme[idx % this._colorScheme.length];
  }
  

  /**
   * Re-draw the chart
   */
  draw() {
    this._chart.draw(this._data, this._chartOptions);
  }

  /**
   * Set data displayed in the graph
   * @param {Array[]} data
   */
  setData(data) {
    this._data = google.visualization.arrayToDataTable(
      [
        [ ...this._columnInfo, { role : "style" } ],
        ...data.map((row, i) => row.concat(this._getColor(i)))
      ]
    );
    this.draw();
  }

  /**
   * Use Promise-based functionality to do things after chart has been created
   * @return {Promise}
   */
  whenLoaded() {
    return this._loaded;
  }
}
