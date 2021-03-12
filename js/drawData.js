/**
 * prida mezeru za kazdou treti cislici, aby sli lepe rozlisit tisice, miliony atd.
 * @param {string} inputNumber - cislo, do ktereho maji byt pridany mezery
 */
function printPrettyNumber(inputNumber) {
    if (inputNumber < 1000) return inputNumber.toString;
    var inp = "" + inputNumber;
    var i;
    var output = "";

    // console.log("Input: "+inp);
    for (i = inp.length; i >= 0; i -= 3) {
        var tmp = output;
        if (i - 3 < 0) {
            output = " " + inp.slice(0, i) + tmp;
        } else {
            output = " " + inp.slice(i - 3, i) + tmp;
        }
        // console.log(inp.slice(i-3,i));
    }
    return output;
}
function drawInfo(kraj) {
    var date = new Date(dataModified);

    var newValue = "<div class=\"card\"><h4 class=\"card-header\">Detail očkování v kraji</h4>";
    newValue += "<div class=\"card-body\">";
    newValue += "<h6 class=\"card-title\">" + kraj.jmeno + "</h6>";
    newValue += "<p class=\"card-text\">" + printPrettyNumber(kraj.pocetObyvatel) + " obyvatel [" + Math.round(10000 * kraj.pocetObyvatel / pocetObyvatelCR) / 100 + "% populace ČR]";
    newValue += "<br>K datu " + date.getDate() + ". " + (date.getMonth() + 1) + ". " + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + " :";
    newValue += "</p><ul>"
    newValue += "<li>Vyočkováno celkem: " + printPrettyNumber(kraj.ockovani.celkem) + " dávek (" + Math.round(1000 * kraj.ockovani.celkem / kraj.pocetObyvatel) / 1000 + " dávky na osobu)<ul>";
    newValue += "<li>1. dávkou naočkováno: " + printPrettyNumber(kraj.ockovani.prvniDavka) + " (" + Math.round(10000 * kraj.ockovani.prvniDavka / kraj.pocetObyvatel) / 100 + "% obyvatel)</li>";
    newValue += "<li>2. dávkou naočkováno: " + printPrettyNumber(kraj.ockovani.druhaDavka) + " (" + Math.round(10000 * kraj.ockovani.druhaDavka / kraj.pocetObyvatel) / 100 + "% obyvatel)</li>";
    newValue += "</ul></li></ul></div></div>";
    document.getElementById("popis").innerHTML = newValue;
}

function mixColors(color_1, color_2, weight) {
    function d2h(d) { return d.toString(16); }  // convert a decimal value to hex
    function h2d(h) { return parseInt(h, 16); } // convert a hex value to decimal 

    weight = (typeof (weight) !== 'undefined') ? weight : 50; // set the weight to 50%, if that argument is omitted

    var color = "#";

    for (var i = 0; i <= 5; i += 2) { // loop through each of the 3 hex pairs�red, green, and blue
        var v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
            v2 = h2d(color_2.substr(i, 2)),

            // combine the current pairs from each source color, according to the specified weight
            val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0)));

        while (val.length < 2) { val = '0' + val; } // prepend a '0' if val results in a single digit

        color += val; // concatenate val to our new color string
    }

    return color; // PROFIT!
};

/**
 * 
 * @param {Date} datum 
 */
function drawBarvyKraju(datum) {
    var pocetDavek = { celkem: 0, prvniDavka: 0, druhaDavka: 0 };
    var nejhorsiKraj = 100;
    var nejlepsiKraj = 0;

    kraje.forEach(function (kraj) {
        pocetDavek.celkem += kraj.ockovani.celkem;
        pocetDavek.prvniDavka += kraj.ockovani.prvniDavka;
        pocetDavek.druhaDavka += kraj.ockovani.druhaDavka;
        kraj.ockovaniProcento = kraj.ockovani.celkem / kraj.pocetObyvatel;
        if (kraj.ockovaniProcento < nejhorsiKraj) {
            nejhorsiKraj = Math.round(10000 * kraj.ockovani.celkem / kraj.pocetObyvatel) / 10000;
        }
        if (kraj.ockovaniProcento > nejlepsiKraj) {
            nejlepsiKraj = Math.round(10000 * kraj.ockovani.celkem / kraj.pocetObyvatel) / 10000;
        }
    });

    var worstKrajColor = "fc0303";
    var averageKrajColor = "fccf03";
    var bestKrajColor = "419600";
    var celorepublikoveNaockovano = pocetDavek.celkem / pocetObyvatelCR;
    // console.log(celkemOckovani+" ("+celorepublikoveNaockovano*100+" %), nejl: "+nejlepsiKraj+", nejh: "+nejhorsiKraj);

    // vyplnime legendu pod mapou vztahujici se na celou republiku
    var legendaHTML = "<h5>K datu " + datum.getDate() + ". " + (datum.getMonth() + 1) + ". " + datum.getFullYear() + " " + datum.getHours() + ":" + datum.getMinutes() + " :</h5>";
    legendaHTML += "<ul><li>Vyočkováno celkem: " + printPrettyNumber(pocetDavek.celkem) + " dávek<ul>";
    legendaHTML += "<li>1. dávkou naočkováno: " + printPrettyNumber(pocetDavek.prvniDavka) + " (" + Math.round(10000 * pocetDavek.prvniDavka / pocetObyvatelCR) / 100 + "% populace)</li>";
    legendaHTML += "<li>2. dávkou naočkováno: " + printPrettyNumber(pocetDavek.druhaDavka) + " (" + Math.round(10000 * pocetDavek.druhaDavka / pocetObyvatelCR) / 100 + "% populace)</li></ul></li></ul>";
    document.getElementById("legenda").innerHTML = legendaHTML;

    // nakreslime stupnici barev
    var c = document.getElementById("legendCanvas");
    var ctx = c.getContext("2d");
    c.width = document.getElementById("levyPanel").offsetWidth * 0.75;
    // nadefinovat gradienty
    // createLinearGradient(x leveho rohu, 0, x praveho rohu, 0)
    var grdPodprumer = ctx.createLinearGradient(c.width * 0.1, 0, c.width * 0.5, 0);
    grdPodprumer.addColorStop(0, "#" + worstKrajColor);
    grdPodprumer.addColorStop(1, "#" + averageKrajColor);
    var grdNadprumer = ctx.createLinearGradient(c.width * 0.5, 0, c.width * 0.9, 0);
    grdNadprumer.addColorStop(0, "#" + averageKrajColor);
    grdNadprumer.addColorStop(1, "#" + bestKrajColor);

    // nakreslit samotne obdelniky vyplnene gradientem
    ctx.fillStyle = grdPodprumer;
    ctx.fillRect(c.width * 0.1, 0, c.width * 0.4, 20);
    ctx.fillStyle = grdNadprumer;
    ctx.fillRect(c.width * 0.5, 0, c.width * 0.4, 20);
    ctx.strokeRect(c.width * 0.1, 0, c.width * 0.8, 20)

    //popisky
    if (c.width < 500) {
        ctx.font = "1ex Helvetica";
    } else {
        ctx.font = "2ex Helvetica";
    }
    ctx.fillStyle = "#000000";
    var textWidth = ctx.measureText((Math.round(1000 * nejlepsiKraj) / 1000) + " dávky na osobu");
    ctx.fillText((Math.round(1000 * nejhorsiKraj) / 1000) + " dávky na osobu", c.width * 0.1, 40);
    ctx.fillText((Math.round(1000 * nejlepsiKraj) / 1000) + " dávky na osobu", c.width * 0.9 - textWidth.width, 40);


    kraje.forEach(function (kraj) {
        var proockovanyPodil = kraj.ockovani.celkem / kraj.pocetObyvatel;
        if (proockovanyPodil <= celorepublikoveNaockovano) {
            // podprumerne ockovani
            kraj.barva = mixColors(averageKrajColor, worstKrajColor, Math.round(100 * (proockovanyPodil - nejhorsiKraj) / (celorepublikoveNaockovano - nejhorsiKraj)));
            // console.log("["+kraj.jmeno+"] "+proockovanyPodil*100+" % (podprumer) - barva: "+kraj.barva);         
        }
        if (proockovanyPodil > celorepublikoveNaockovano) {
            // nadprumerne ockovani
            kraj.barva = mixColors(bestKrajColor, averageKrajColor, Math.round(100 * (proockovanyPodil - celorepublikoveNaockovano) / (nejlepsiKraj - celorepublikoveNaockovano)));
            // console.log("["+kraj.jmeno+"] "+proockovanyPodil*100+" % (nadprumer) - barva: "+kraj.barva);        
        }
        document.getElementById(kraj.id).style.fill = kraj.barva;
    });
}

function animateData() {
    drawBarvyKraju(new Date(dataModified));
}

function startAnimation() {
    if (!animation.isRunning) {
        animation.reference = setInterval(animateData, 5000);
        animation.isRunning = true;
    }
}

function stopAnimation() {
    clearInterval(animation.reference);
    animation.isRunning = false;
}