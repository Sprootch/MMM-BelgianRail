Module.register("MMM-BelgianRail", {

    defaults: {
        stationid: "BE.NMBS.008885001",
        endpoint: "https://api.irail.be",
        language: "fr",
        updateInterval: 5, // minutes
    },

    /**
     * Apply the default styles.
     */
    getStyles() {
        return ["belgian-rail.css"]
    },

    /**
     * Pseudo-constructor for our module. Initialize stuff here.
     */
    start() {
        Log.info("Starting module: " + this.name);

        this.data = null;
        //start data poll
        var self = this;
        setTimeout(function () {
            //first data pull is delayed by config
            self.getData();

            setInterval(function () {
                self.getData();
            }, self.config.updateInterval * 60 * 1000); //convert to milliseconds

        }, this.config.requestDelay);
    },

    getData: function () {
        this.sendSocketNotification("BELGIANRAIL_LIVEBOARD_GET", {
            stationid: this.config.stationid,
            language: this.config.language,
            endpoint: this.config.endpoint,
            instanceId: this.identifier,
        });
    },

    /**
     * Handle notifications received by the node helper.
     * So we can communicate between the node helper and the module.
     *
     * @param {string} notification - The notification identifier.
     * @param {any} payload - The payload data`returned by the node helper.
     */
    socketNotificationReceived: function (notification, payload) {
        if (notification === "BELGIANRAIL_LIVEBOARD_DATA" && payload.instanceId === this.identifier) {
            this.data = payload;

            Log.info("Data received: " + this.data.version);
            // this.updateDom();
        }
    },

    /**
     * Render the page we're on.
     */
    getDom() {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = `<b>Title</b><br />`

        return wrapper;
    },
})
