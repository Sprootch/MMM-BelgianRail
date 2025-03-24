const Log = require("logger");
const NodeHelper = require("node_helper");
const moment = require("moment");

module.exports = NodeHelper.create({

    start() {
        Log.log(`Starting node_helper for ${this.name}`);
    },

    async socketNotificationReceived(notification, payload) {
        if (notification === "BELGIANRAIL_CONNECTIONS_GET") {
            const self = this;

            const url = `${payload.endpoint}/connections/?to=${payload.to}&from=${payload.from}&timeSel=depart&format=json&lang=${payload.language}`;
            Log.log("[MMM-BelgianRail] Getting data: " + url);
            try {
                const response = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Node.js) MagicMirror (https://github.com/Sprootch/MMM-BelgianRail)"
                    }});
                if (response.ok) {
                    const resp = await response.json();
                    self.sendSocketNotification("BELGIANRAIL_CONNECTIONS_DATA", resp);
                } else {
                    Log.error(`[MMM-BelgianRail] ${moment().format("D-MMM-YY HH:mm")} ** ERROR ** ${response.status}`);
                }
            } catch (error) {
                Log.error(`[MMM-BelgianRail] ${moment().format("D-MMM-YY HH:mm")} ** ERROR ** ${error.message}`);
            }
        }
    }
});
