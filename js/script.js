const proxyUrl = "https://infinite-springs-66524.herokuapp.com/";
const mpkUrl = "http://ttss.mpk.krakow.pl/internetservice/services/passageInfo/stopPassages/stop?stop=";
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

async function getData(url) {
    const data = await fetch(url)
        .then(
            function (response) {
                if (response.status !== 200) {
                    console.log('There was a problem. Status Code: ' +
                        response.status);
                    return 0;
                }
                return response.json();
            }
        )
        .catch(function (err) {
            console.log('Fetch Error ', err);
        });
    return data;
}

var allStops = new Array;
var allStopsTRAM = new Array;
async function fetchAllStops() {
    allStops = await getData('./allStopsArr.json');
    allStopsTRAM = await getData('./allStopsArrTRAM.json');
}

async function parseData(busStopId) {
    var newData = new Object;
    var lines = new Array;
    var lines2 = new Array;

    let url = proxyUrl + mpkUrl + busStopId;
    let url2 = proxyUrl + tramUrl + busStopId;

    await getData(url).then(function (response) {
            // console.log(response);
            let howManyBusses = response.actual.length;
            newData.name = response.stopName;
            // newData.time = schedules.getAttribute("time");
            newData.id = response.stopShortName;

            for (i = 0; i < howManyBusses; i++) {
                let line = new Object;
                line.nr = response.actual[i].patternText;
                line.dir = response.actual[i].direction;
                line.veh = "A";
                line.time = response.actual[i].mixedTime.replace('%UNIT_MIN%', ' min');
                lines.push(line);
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    await getData(url2).then(function (response) {
            // console.log(response);
            let howManyBusses = response.actual.length;
            newData.name = response.stopName;
            // newData.time = schedules.getAttribute("time");
            newData.id = response.stopShortName;

            for (i = 0; i < howManyBusses; i++) {
                let line = new Object;
                line.nr = response.actual[i].patternText;
                line.dir = response.actual[i].direction;
                line.veh = "T";
                line.time = response.actual[i].mixedTime.replace('%UNIT_MIN%', ' min');
                lines2.push(line);
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    newData.lines = lines;
    newData.lines2 = lines2;
    console.log(newData);
    return newData;
}

function printData(parsedData) {
    let wrapper = document.getElementById("wrapper");
    let newContent = document.createElement("div");

    if (parsedData.name != undefined) {
        newContent.id = "content_" + parsedData.id;
        newContent.className = "content";

        let busStopTitle = document.createElement("div");
        busStopTitle.className = 'busStopTitle';

        let newBusStopName = document.createElement("p");
        newBusStopName.id = "busStopName_" + parsedData.id;
        newBusStopName.className = "busStopName";

        let deleteButton = document.createElement("p");
        deleteButton.className = "deleteStop";
        deleteButton.innerHTML = "✖";
        deleteButton.setAttribute('onclick', 'removeStop(' + parsedData.id + ')');

        let newBusStopCat = document.createElement("p");
        newBusStopCat.className = "stopCattegory";

        let newBusLines = document.createElement("div");
        newBusLines.id = "busLines_" + parsedData.id;
        newBusLines.className = "container";

        busStopTitle.appendChild(newBusStopName);
        busStopTitle.appendChild(deleteButton);
        newContent.appendChild(busStopTitle);
        newContent.appendChild(newBusLines);
        wrapper.appendChild(newContent);

        let txt = "<p class='busDir cattegory'>autobusy</p>";
        // console.log(parsedData);
        // if (parsedData.name != undefined) {
        document.getElementById("busStopName_" + parsedData.id).innerHTML = parsedData.name;
        // } else {
        // document.getElementById("busStopName_err" + Math.random()*10000).innerHTML = "błąd wczytywania, odśwież stronę";
        // }
        if (parsedData.lines.length > 0) {
            parsedData.lines.forEach(element => {
                let nr = element.nr;
                let dir = element.dir;
                let t = element.time;
                let veh = element.veh;
                txt += "<span class='busNr border'>" + nr + "</span>" +
                    "<span class='busDir border'>" + dir + "</span>" +
                    "<span class='busVeh border'></span>" +
                    "<span class='busTime border'>" + t + "</span>";
            });
        } else {
            txt = "<span class='busDir border'> brak autobusów :( </span>"
        }
        document.getElementById("busLines_" + parsedData.id).innerHTML = txt;

        
        txt += "<p class='busDir cattegory'>tramwaje</p>";
        if (parsedData.lines2.length > 0) {
            parsedData.lines2.forEach(element => {
                let nr = element.nr;
                let dir = element.dir;
                let t = element.time;
                let veh = element.veh;
                // if (veh === 'T') {
                //     icon = `<img title='Biletomat w autobusie' src='./biletomat.png'>`
                // } else if (veh === 'N') {
                //     icon = `<img src='./brakbiletomatu.png'>`
                // }
                txt += "<span class='busNr border'>" + nr + "</span>" +
                    "<span class='busDir border'>" + dir + "</span>" +
                    "<span class='busVeh border'></span>" +
                    "<span class='busTime border'>" + t + "</span>";
            });
        } else {
            txt = "<span class='busDir border'> brak tramwajów :( </span>"
        }
        newBusStopCat.innerHTML = "tramwaje";
        document.getElementById("busLines_" + parsedData.id).innerHTML = txt;

    } else {
        newContent.innerHTML = "<br><br><p style='text-align: center; padding: 100px auto; width: '>błąd pobierania danych<br><br>sprawdź połączenie z Internetem i spróbuj ponownie :)</p><br><br>";
        wrapper.appendChild(newContent);
        newContent.scrollIntoView();
        loader.style.display = 'none';
    }
}

var loader = document.getElementById("loader");

var savedStops = new Array;
var loadedStops = localStorage.getItem('stopsCoJedzieKrk');
if (localStorage.getItem('stopsCoJedzieKrk') === null) {
    savedStops = new Array;
} else {
    savedStops = JSON.parse(loadedStops);
}

if (savedStops != 0) {
    document.getElementById("zeroStops").style.display = "none";
    savedStops.forEach(element => {
        loader.style.display = 'block';
        let newStop = parseData(element);
        newStop.then(function (result) {
            printData(result);
            loader.style.display = 'none';
        });
    });
} else {
    document.getElementById("zeroStops").style.display = "block";
}

// EVENT LISTENERS
document.getElementById("newStopID").addEventListener("focusout", function () {
    let name = document.getElementById("newStopID").value;
    if (name == "") {
        document.getElementById('search').style.display = "none";
    }
});

document.getElementById("newStopID").addEventListener("focusin", function () {
    let html = document.getElementById("search").innerHTML;
    if (html != "") {
        document.getElementById('search').style.display = 'block';
    }
});

document.getElementById("newStopID").addEventListener("keyup", function () {
    let name = document.getElementById("newStopID").value;
    if (name != "") {
        searchStop(name);
        document.getElementById('search').style.display = 'block';
    } else {
        document.getElementById('search').style.display = 'none';
        document.getElementById('search').innerHTML = "";
    }
});

function addStop(id) {
    if (id !== "") {
        if (Number.isInteger(id)) {
            if (!savedStops.includes(id)) {
                loader.style.display = 'block';
                let busstop = parseData(id);
                busstop.then(function (result) {
                    printData(result);
                    let newElement = document.getElementById("busStopName_" + id);
                    newElement.scrollIntoView();
                    loader.style.display = 'none';
                });
                savedStops.push(id);
                localStorage.setItem('stopsCoJedzieKrk', JSON.stringify(savedStops));

                document.getElementById("zeroStops").style.display = "none";
                document.getElementById("newStopID").value = "";
                document.getElementById('search').style.display = "none";
                document.getElementById('search').innerHTML = "";
            } else alert("Ten przystanek już istnieje");
        } else alert("Podaj liczbę");
    } else {
        alert("Podaj ID przystanku");
    }
}

function removeStop(id) {
    document.getElementById("content_" + id).remove();
    var index = savedStops.indexOf(id);
    savedStops.splice(index, 1);
    localStorage.setItem('stopsCoJedzieKrk', JSON.stringify(savedStops));
    if (savedStops == 0) {
        document.getElementById("zeroStops").style.display = "block";
    }
}

function searchStop(search) {
    let found = filterIt(allStops, search);
    let txt = ``;
    found.forEach(element => {
        txt += `<li onclick='addStop(` + element.id + `)'>` + element.name + `</li>`;
    });
    document.getElementById('search').innerHTML = txt;
}

function filterIt(arr, searchKey) {
    return arr.filter(function (obj) {
        return Object.keys(obj).some(function (key) {
            let upperSearch = searchKey.toUpperCase();
            let stringSearch = String(upperSearch);
            let latinSearch = stringSearch.latinise();
            return obj[key].includes(latinSearch);
        })
    });
}