const proxyUrl = "https://infinite-springs-66524.herokuapp.com/";
// MPK
const mpkUrl = "http://ttss.mpk.krakow.pl/internetservice/services/passageInfo/stopPassages/stop?stop=";
// TRAMWAJE
const tramUrl = "http://www.ttss.krakow.pl/internetservice/services/passageInfo/stopPassages/stop?stop=";

var latin_map = {
    'ą': 'a',
    'ę': 'e',
    'ł': 'l',
    'ć': 'x',
    'ź': 'x',
    'ż': 'x',
    'ń': 'n',
    'ó': 'o',
    'ś': 's',
    'Ą': 'A',
    'Ę': 'E',
    'Ł': 'L',
    'Ć': 'Ć',
    'Ź': 'Z',
    'Ż': 'Z',
    'Ó': 'O',
    'Ś': 'S',
    'Ń': 'N'
};

String.prototype.latinise = function () {
    return this.replace(/[^A-Za-z0-9]/g, function (x) {
        return latin_map[x] || x;
    })
};

String.prototype.isLatin = function () {
    return this == this.latinise();
};

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

async function getData(url) {
    const data = await fetch(url)
        .then(
            function (response) {
                if (response.status !== 200) {
                    // console.log('There was a problem. Status Code: ' +
                        // response.status);
                    // return 0;
                }
                return response.json();
            }
        )
        .catch(function (err) {
            console.log('Fetch Error ', err);
        });
    return data;
}

async function parseData(busStopId) {
    let parser = new DOMParser();
    var newData = new Object;
    await getData(mpkUrl + busStopId).then(function (response) {
            newData = response;
        })
        .catch(function (error) {
            console.log(error);
        });
    return newData;
}

const convertArrayToObject = (array, key) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
        return {
            ...obj,
            [item[key]]: item,
        };
    }, initialValue);
};

var allStops = new Array;

function getAllStops() {
    console.log("getAllStops");
    for (let index = 0; index < 5000; index++) {
        let newStop = new Object;
        let busstop = parseData(index);
        sleep(10);
        busstop.then(function (result) {
            // console.log(result);
            newStop.id = result.stopShortName;
            newStop.name = result.stopName.toUpperCase();
            newStop.nameD = result.stopName.toUpperCase().latinise();
            // console.log(newStop.id);
            // console.log(newStop.nameD);
            // console.log(newStop.name);
            allStops.push(newStop);
        });
    }
    var allStopsObject = convertArrayToObject(allStops, 'id');
    console.log("allStops:", allStops);
    console.log("allStopsObject:", allStopsObject);
}