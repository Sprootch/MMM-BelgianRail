Module.register("MMM-BelgianRail", {

    defaults: {
        header: "Belgian Rail",
        from: "Tournai",
        to: "Bruxelles-Central",
        endpoint: "https://api.irail.be",
        language: "fr",
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
            endpoint: this.config.endpoint,
            from: this.config.from,
            to: this.config.to,
            language: this.config.language
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
            this.railData = payload;

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
            wrapper.innerHTML = this.railData.version;
        } else {
            wrapper.innerHTML = "Loading";
        }

        return wrapper;
    },

    getHeader: function () {
        return this.config.header;
    }
})
