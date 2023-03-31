import axios from "axios";
import { parseString } from "xml2js";
import express from 'express';
const router = express.Router();
router.get('/', (req, res) => {
    const url =
        "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DKIJakarta.xml";

    axios
        .get(url)
        .then((response) => {
            const data = response.data;

            parseString(data, (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }
                let weatherData = '';
                result.data.forecast[0].area.forEach(item => {
                    // access the data in the object
                    let cuaca_lokasi = item.name[1]._;
                    let parameter = item.parameter;
                    // Humidity
                    let score_humidity = humidity(parameter);
                    let newDateHumidity = null; // Objek dengan tanggal dan waktu terdekat
                    // Menampilkan tanggal dan waktu dalam format Indonesia
                    const optionsID = { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };
                    let beforeNewDate = indonesiaFormateDateTime(score_humidity.$.datetime);;
                    newDateHumidity = new Intl.DateTimeFormat("id-ID", optionsID).format(beforeNewDate)
                    // End Humidity

                    // Max Humidity
                    let score_maxhumidity = humidityMax(parameter);
                    let newDateMaxHumidity = null; // Objek dengan tanggal dan waktu terdekat
                    let beforeNewDateMaxHumidity = indonesiaFormateDateTime(score_maxhumidity.$.datetime);;
                    newDateMaxHumidity = new Intl.DateTimeFormat("id-ID", optionsID).format(beforeNewDateMaxHumidity)
                    // End Max Humidity

                    // Max Humidity
                    let score_minhumidity = humidityMin(parameter);
                    let newDateMinHumidity = null; // Objek dengan tanggal dan waktu terdekat
                    let beforeNewDateMinHumidity = indonesiaFormateDateTime(score_minhumidity.$.datetime);;
                    newDateMinHumidity = new Intl.DateTimeFormat("id-ID", optionsID).format(beforeNewDateMinHumidity)
                    // End Max Humidity
                    // Temperatur
                    let temp = temperatur(parameter);
                    let newDateTemp = null; // Objek dengan tanggal dan waktu terdekat
                    let beforeNewDateTemp = indonesiaFormateDateTime(temp.$.datetime);;
                    newDateTemp = new Intl.DateTimeFormat("id-ID", optionsID).format(beforeNewDateTemp)
                    // End Temperatur
                    // Weather
                    let weather = weathers(parameter);
                    let newDateWeather = null; // Objek dengan tanggal dan waktu terdekat
                    let beforeNewDateWeather = indonesiaFormateDateTime(weather.$.datetime);;
                    newDateWeather = new Intl.DateTimeFormat("id-ID", optionsID).format(beforeNewDateWeather)
                    // End Weather
                    // console.log("Lokasi : " + cuaca_lokasi + "\n");
                    // console.log('Info Humidity Cuaca Pada Jam :' + newDateHumidity);
                    // console.log('Kelembapan Udara dalam % : ' + score_humidity.value[0]._ + score_humidity.value[0].$.unit); // Objek dengan tanggal dan waktu terdekat
                    // console.log("\n");
                    // console.log('Info Max Humidity Cuaca Pada :' + newDateHumidity);
                    // console.log('Kelembapan Udara dalam % : ' + score_maxhumidity.value[0]._ + score_maxhumidity.value[0].$.unit); // Objek dengan tanggal dan waktu terdekat
                    // console.log("\n");
                    // console.log('Info Min Humidity Cuaca Pada :' + newDateMinHumidity);
                    // console.log('Kelembapan Udara dalam % : ' + score_minhumidity.value[0]._ + score_minhumidity.value[0].$.unit); // Objek dengan tanggal dan waktu terdekat
                    // console.log("\n");
                    // console.log('Info Temperatur Pada :' + newDateMinHumidity);
                    // console.log('Temperatur :' + temp.value[0]._ + temp.value[0].$.unit + ' ' + temp.value[1]._ + temp.value[1].$.unit);
                    // console.log("\n");
                    // console.log('Info Temperatur Pada :' + newDateWeather);
                    // console.log(findWeatherDescription(weather.value[0]._));
                    // console.log("\n");
                    // console.log("#####################################################");

                    weatherData += "Lokasi : " + cuaca_lokasi + "<br><br>" +
                        'Info Humidity Cuaca Pada Jam :' + newDateHumidity + "<br>" +
                        'Kelembapan Udara dalam % : ' + score_humidity.value[0]._ + score_humidity.value[0].$.unit + "<br><br>" +
                        'Info Max Humidity Cuaca Pada :' + newDateMaxHumidity + "<br>" +
                        'Kelembapan Udara dalam % : ' + score_maxhumidity.value[0]._ + score_maxhumidity.value[0].$.unit + "<br><br>" +
                        'Info Min Humidity Cuaca Pada: ' + newDateMinHumidity + "<br>" +
                        'Kelembapan Udara dalam % : ' + score_minhumidity.value[0]._ + score_minhumidity.value[0].$.unit + "<br><br>" +
                        'Info Temperatur Pada :' + newDateTemp + "<br>" +
                        'Temperatur :' + temp.value[0]._ + temp.value[0].$.unit + ' ' + temp.value[1]._ + temp.value[1].$.unit + "<br><br>" +
                        'Info Weather Pada :' + newDateWeather + "<br>" +
                        findWeatherDescription(weather.value[0]._) + "<br><br>" +
                        "#####################################################<br><br>";


                });

                res.send(weatherData);

            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Internal Server Error');

        });
})

function indonesiaFormateDateTime(datetime) {
    const year = datetime.slice(0, 4);
    const month = datetime.slice(4, 6) - 1; // JavaScript months are 0-indexed
    const day = datetime.slice(6, 8);
    const hour = datetime.slice(8, 10);
    const minute = datetime.slice(10, 12);

    return new Date(year, month, day, hour, minute); // Tanggal dan waktu objek saat ini
}

function humidity(parameter) {
    let closestObj = null; // Objek dengan tanggal dan waktu terdekat
    let closestDiff = Infinity; // Selisih waktu terdekat dengan waktu saat ini
    const targetDate = new Date(); // Tanggal dan waktu saat ini

    let hu = parameter.find((item) => item["$"].id === "hu");

    hu.timerange.forEach(obj => {
        const objDate = indonesiaFormateDateTime(obj['$'].datetime); // Tanggal dan waktu objek saat ini
        const diff = Math.abs(objDate - targetDate); // Selisih waktu dengan waktu saat ini

        // Jika selisih waktu objek saat ini lebih kecil dari selisih waktu terdekat sebelumnya,
        // maka objek saat ini menjadi objek dengan tanggal dan waktu terdekat
        if (diff < closestDiff) {
            closestObj = obj;
            closestDiff = diff;
        }

    });
    return closestObj;
}

function humidityMax(parameter) {

    let closestObj = null; // Objek dengan tanggal dan waktu terdekat
    let closestDiff = Infinity; // Selisih waktu terdekat dengan waktu saat ini
    const targetDate = new Date(); // Tanggal dan waktu saat ini

    let hu = parameter.find((item) => item["$"].id === "humax");

    hu.timerange.forEach(obj => {
        const objDate = indonesiaFormateDateTime(obj['$'].datetime); // Tanggal dan waktu objek saat ini
        const diff = Math.abs(objDate - targetDate); // Selisih waktu dengan waktu saat ini

        // Jika selisih waktu objek saat ini lebih kecil dari selisih waktu terdekat sebelumnya,
        // maka objek saat ini menjadi objek dengan tanggal dan waktu terdekat
        if (diff < closestDiff) {
            closestObj = obj;
            closestDiff = diff;
        }

    });
    return closestObj;

}

function humidityMin(parameter) {

    let closestObj = null; // Objek dengan tanggal dan waktu terdekat
    let closestDiff = Infinity; // Selisih waktu terdekat dengan waktu saat ini
    const targetDate = new Date(); // Tanggal dan waktu saat ini

    let hu = parameter.find((item) => item["$"].id === "humin");

    hu.timerange.forEach(obj => {
        const objDate = indonesiaFormateDateTime(obj['$'].datetime); // Tanggal dan waktu objek saat ini
        const diff = Math.abs(objDate - targetDate); // Selisih waktu dengan waktu saat ini

        // Jika selisih waktu objek saat ini lebih kecil dari selisih waktu terdekat sebelumnya,
        // maka objek saat ini menjadi objek dengan tanggal dan waktu terdekat
        if (diff < closestDiff) {
            closestObj = obj;
            closestDiff = diff;
        }

    });
    return closestObj;

}

function temperatur(parameter) {

    let closestObj = null; // Objek dengan tanggal dan waktu terdekat
    let closestDiff = Infinity; // Selisih waktu terdekat dengan waktu saat ini
    const targetDate = new Date(); // Tanggal dan waktu saat ini

    let hu = parameter.find((item) => item["$"].id === "t");
    hu.timerange.forEach(obj => {
        const objDate = indonesiaFormateDateTime(obj['$'].datetime); // Tanggal dan waktu objek saat ini
        const diff = Math.abs(objDate - targetDate); // Selisih waktu dengan waktu saat ini

        // Jika selisih waktu objek saat ini lebih kecil dari selisih waktu terdekat sebelumnya,
        // maka objek saat ini menjadi objek dengan tanggal dan waktu terdekat
        if (diff < closestDiff) {
            closestObj = obj;
            closestDiff = diff;
        }

    });
    return closestObj;

}

function weathers(parameter) {
    let closestObj = null; // Objek dengan tanggal dan waktu terdekat
    let closestDiff = Infinity; // Selisih waktu terdekat dengan waktu saat ini
    const targetDate = new Date(); // Tanggal dan waktu saat ini

    let weather = parameter.find((item) => item["$"].id === "weather");
    weather.timerange.forEach(obj => {
        const objDate = indonesiaFormateDateTime(obj['$'].datetime); // Tanggal dan waktu objek saat ini
        const diff = Math.abs(objDate - targetDate); // Selisih waktu dengan waktu saat ini

        // Jika selisih waktu objek saat ini lebih kecil dari selisih waktu terdekat sebelumnya,
        // maka objek saat ini menjadi objek dengan tanggal dan waktu terdekat
        if (diff < closestDiff) {
            closestObj = obj;
            closestDiff = diff;
        }

    });
    return closestObj;
}

let dataJson = {
    "0": "Cerah / Clear Skies",
    "1": "Cerah Berawan / Partly Cloudy",
    "2": "Cerah Berawan / Partly Cloudy",
    "3": "Berawan / Mostly Cloudy",
    "4": "Berawan Tebal / Overcast",
    "5": "Udara Kabur / Haze",
    "10": "Asap / Smoke",
    "45": "Kabut / Fog",
    "60": "Hujan Ringan / Light Rain",
    "61": "Hujan Sedang / Rain",
    "63": "Hujan Lebat / Heavy Rain",
    "80": "Hujan Lokal / Isolated Shower",
    "95": "Hujan Petir / Severe Thunderstorm",
    "97": "Hujan Petir / Severe Thunderstorm"
};

// fungsi untuk mencari deskripsi cuaca
function findWeatherDescription(condition) {
    console.log()
    if (dataJson[condition]) {
        return dataJson[condition];
    } else {
        return "Kondisi cuaca tidak ditemukan";
    }
}

export default router;
