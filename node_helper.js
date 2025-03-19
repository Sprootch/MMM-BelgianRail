const Log = require("logger");
const NodeHelper = require("node_helper");
const moment = require("moment");

module.exports = NodeHelper.create({

    start() {
        Log.log(`Starting node_helper for ${this.name}`);
    },

    async socketNotificationReceived(notification, payload) {
        if (notification === "BELGIANRAIL_LIVEBOARD_GET") {
            const self = this;

            // make request to BelgianRail API
            // const url = payload.endpoint + '/liveboard' +
            //     "?id=" + payload.stationid +
            //     "&lang=" + payload.language +
            //     "&format=json";
            // const url = `${payload.endpoint}/liveboard/?id=${payload.stationid}&lang=${payload.language}&format=json`;
            const url = "https://api.irail.be/liveboard?id=BE.NMBS.008885001&lang=fr&format=json";

            Log.log("[MMM-BelgianRail] Getting data: " + url);
            try {
                const response = await fetch(url);
                if (response.ok) {
                    const resp = await response.json();
                    self.sendSocketNotification("BELGIANRAIL_LIVEBOARD_DATA", resp);
                } else {
                    Log.error(`[MMM-BelgianRail] ${moment().format("D-MMM-YY HH:mm")} ** ERROR ** ${response.status}`);
                }
            } catch (error) {
                Log.error(`[MMM-BelgianRail] ${moment().format("D-MMM-YY HH:mm")} ** ERROR ** ${error.message}`);
            }
        }
    }
});
