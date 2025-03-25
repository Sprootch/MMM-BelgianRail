Module.register("MMM-BelgianRail", {

    defaults: {
        header: "Belgian Rail",
        from: "Tournai",
        to: "Bruxelles-Central",
        endpoint: "https://api.irail.be",
        language: "fr",
        humanizeDuration: false,
        results: 3,
        showStationNames: true,
        activeDays: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        showAlerts: true,
        // updateInterval: 5, // minutes
        // requestDelay: 0,
    },

    getScripts() {
        return ["moment.js"];
    },

    getStyles() {
        return ["MMM-BelgianRail.css"]
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            fr: "translations/fr.json",
            nl: "translations/nl.json",
            de: "translations/de.json",
        };
    },

    start() {
        Log.info("Starting module: " + this.name);

        //sanitize optional parameters
        if (!Number.isFinite(this.config.results) || this.config.results > 6) {
            this.config.results = 6;
        }

        this.railData = null;
        var self = this;
        setTimeout(function () {
            //first data pull is delayed by config
            self.getData();

            setInterval(function () {
                self.getData();
            }, 5 * 60 * 1000); //convert to milliseconds

        }, this.config.requestDelay);
    },

    isActiveDay: function () {
        moment.locale('en');
        let today = moment().format('ddd').toUpperCase();
        return this.config.activeDays.includes(today);
    },

    getData: function () {
        if (!this.isActiveDay()) {
            return;
        }

        this.sendSocketNotification("BELGIANRAIL_CONNECTIONS_GET", {
            instanceId: this.identifier,
            endpoint: this.config.endpoint,
            from: this.config.from,
            to: this.config.to,
            language: this.config.language
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BELGIANRAIL_CONNECTIONS_DATA" && payload.instanceId === this.identifier) {
            this.railData = payload;

            Log.info("Data received");
            this.updateDom();
        }
    },

    getDom() {
        if (this.railData) {
            return this.processConnections(this.railData);
        }
        const wrapper = document.createElement("div");
        wrapper.innerHTML = "Loading";
        return wrapper;
    },

    getHeader: function () {
        return this.config.header;
    },

    processConnections: function (data) {
        let table = document.createElement("table");
        table.className = "MMM-BelgianRail";
        let tHead = document.createElement("thead");
        let headerRow = document.createElement("tr");
        let headerDeparture = document.createElement("td");
        headerDeparture.innerHTML = this.translate("DEPARTURE");
        let headerLine = document.createElement("td");
        let headerArrival = document.createElement("td");
        headerArrival.innerHTML = this.translate("ARRIVAL");

        if (this.config.showStationNames && data && data.connection && data.connection[0]) {
            let departureStation = document.createElement("span");
            departureStation.className = "xsmall station-name";
            departureStation.innerHTML = data.connection[0].departure.station;
            headerDeparture.appendChild(departureStation);
        }

        if (this.config.showStationNames && data && data.connection && data.connection[0]) {
            let arrivalStation = document.createElement("span");
            arrivalStation.className = "xsmall station-name";
            arrivalStation.innerHTML = data.connection[0].arrival.station;
            headerArrival.appendChild(arrivalStation);
        }

        headerRow.appendChild(headerDeparture);
        headerRow.appendChild(headerLine);
        headerRow.appendChild(headerArrival);
        tHead.appendChild(headerRow);
        table.appendChild(tHead);

        let connections = data.connection;

        for (let i = 0; i < this.config.results; i++) {
            let connection = connections[i];
            let connectionRow = document.createElement("tr");
            let departureTime = document.createElement("td");
            departureTime.className = "title bright";
            if (parseInt(connection.departure.canceled, 10) > 0) {
                departureTime.className = "dimmed line-through";
            }
            departureTime.innerHTML = moment.unix(connection.departure.time).format("HH:mm");
            let departureDelay = document.createElement("span");
            departureDelay.className = "xsmall ontime";
            let delayMinutes = moment.utc(connection.departure.delay * 1000).format("m");
            departureDelay.innerHTML = ` +${delayMinutes}`;
            if (parseInt(delayMinutes, 10) > 0) {
                departureDelay.className = "xsmall delayed";
            }
            departureTime.appendChild(departureDelay);
            connectionRow.appendChild(departureTime);

            let line = document.createElement("td");
            line.className = "dimmed";
            let trainIcon = document.createElement("span");
            trainIcon.className = "fa fa-train";
            line.innerHTML = "&boxh;&boxh;&boxh;&boxh;&boxh;&boxh; ";
            connectionRow.appendChild(line);

            let arrivalTime = document.createElement("td");
            arrivalTime.className = "title bright";
            if (parseInt(connection.arrival.canceled, 10) > 0) {
                arrivalTime.className = "dimmed line-through";
            }
            arrivalTime.innerHTML = moment.unix(connection.arrival.time).format("HH:mm");
            let arrivalDelay = document.createElement("span");
            arrivalDelay.className = "xsmall ontime";
            let delayArrivalMinutes = moment.utc(connection.arrival.delay * 1000).format("m");
            arrivalDelay.innerHTML = ` +${delayArrivalMinutes}`;
            if (parseInt(delayArrivalMinutes, 10) > 0) {
                arrivalDelay.className = "xsmall delayed";
            }
            arrivalTime.appendChild(arrivalDelay);
            connectionRow.appendChild(arrivalTime);

            let infoRow = document.createElement("tr");
            let departurePlatform = document.createElement("td");
            departurePlatform.className = "xsmall";
            departurePlatform.innerHTML = `${this.translate("PLATFORM")} ${connection.departure.platform}`;
            infoRow.appendChild(departurePlatform);

            let emptyLine = document.createElement("td");
            infoRow.appendChild(emptyLine);

            let duration = document.createElement("td");
            let durationTime = moment.utc(connection.duration * 1000).format('HH:mm');
            if (this.config.humanizeDuration) {
                durationTime = moment.duration(connection.duration * 1000).humanize();
            }
            duration.className = "xsmall";
            duration.innerHTML = durationTime;

            if (connection.vias && parseInt(connection.vias.number, 10) > 0) {
                duration.innerHTML += `, ${connection.vias.number} ${this.translate("CHANGE")}`;
                line.innerHTML = "&boxh;&boxh; ";
                line.appendChild(trainIcon);
                line.innerHTML += " &boxh;&boxh; ";
            }

            infoRow.appendChild(duration);
            table.appendChild(connectionRow);
            table.appendChild(infoRow);
        }

        //if (this.config.showAlerts) {
            let alerts = this.getUniqueAlerts(data);
            let row = document.createElement("tr");
            let tableData = document.createElement("td");
            tableData.className = "xsmall";
            tableData.innerHTML = "Entre Hal et Lembeek :Circulation sur une seule voie";
            row.appendChild(tableData);
            table.appendChild(row);
        //}
        return table;
        // this.forecast = table;
        //
        // this.show(this.config.animationSpeed, {lockString: this.identifier});
        // this.loaded = true;
        // this.updateDom(this.config.animationSpeed);
    },
    getUniqueAlerts: function (data) {
        const uniqueAlertIds = new Set();
        const uniqueAlerts = [];

        data.connection.forEach(connection => {
            if (connection.alerts && connection.alerts.alert) {
                connection.alerts.alert.forEach(alert => {
                    if (!uniqueAlertIds.has(alert.id)) {
                        uniqueAlertIds.add(alert.id);
                        uniqueAlerts.push(alert);
                    }
                });
            }
        });

        return uniqueAlerts;
    }
})

