Module.register("MMM-BelgianRail", {

    defaults: {
        header: "Belgian Rail"
        // stationid: "BE.NMBS.008885001",
        // endpoint: "https://api.irail.be",
        // language: "fr",
        // updateInterval: 5, // minutes
        // requestDelay: 0,
    },

    getScripts() {
        return ["moment.js"];
    },

    getStyles() {
        return ["belgian-rail.css"]
    },

    start() {
        Log.info("Starting module: " + this.name);

        this.railData = null;
        //start data poll
        var self = this;
        setTimeout(function () {
            //first data pull is delayed by config
            self.getData();

            setInterval(function () {
                self.getData();
            }, 5 * 60 * 1000); //convert to milliseconds

        }, this.config.requestDelay);
    },

    getData: function () {
        this.sendSocketNotification("BELGIANRAIL_LIVEBOARD_GET", {
            // stationid: this.config.stationid,
            // language: this.config.language,
            // endpoint: this.config.endpoint,
            // instanceId: this.identifier,
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
        if (notification === "BELGIANRAIL_LIVEBOARD_DATA") {
            this.data = payload;

            Log.info("Data received");
            this.updateDom();
        }
    },

    /**
     * Render the page we're on.
     */
    getDom() {
        const wrapper = document.createElement("div")
        if (this.railData) {
            wrapper.innerHTML = this.railData.station;
        } else {
            wrapper.innerHTML = "Loading";
        }

        return wrapper;
    },

    getHeader: function () {
        return this.config.header;
    }
})
