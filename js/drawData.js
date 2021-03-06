/**
 * prida mezeru za kazdou treti cislici, aby sli lepe rozlisit tisice, miliony atd.
 * @param {string} inputNumber - cislo, do ktereho maji byt pridany mezery
 */
function printPrettyNumber(inputNumber, nbsp = false) {
    if (inputNumber < 1000) return inputNumber + "";
    var inp = "" + inputNumber;
    var i;
    var output = "";

    for (i = inp.length; i >= 0; i -= 3) {
        var tmp = output;
        if (i - 3 < 0) {
            output = inp.slice(0, i) + tmp;
        } else {
            output = (nbsp ? "&nbsp;" : " ") + inp.slice(i - 3, i) + tmp;
        }
    }
    return output;
}

function printIncrement(today, yesterday, verbose = false) {
    var cislo = printPrettyNumber(today, true);
    var prubehPrirustku = today - yesterday;

    var output;
    var color;
    var arrowUNC;
    var arrowIcon;

    if (prubehPrirustku < 0) {
        color = "red";
        arrowUNC = "&#11018;";
        arrowIcon = "bi bi-arrow-down-right";
    } else if (prubehPrirustku > 0) {
        color = "green";
        arrowUNC = "&#11016;";
        arrowIcon = "bi bi-arrow-up-right";
    } else {
        color = "";
        arrowUNC = "&#129042;";
        arrowIcon = "bi bi-arrow-right";
    }

    if (verbose){
        output = "<span style=\"color:" + color + ";\"><i class=\""+arrowIcon+"\"></i>+" + cislo + "</span>";
    }else{
        output = arrowUNC+"+"+cislo;
    }

    return output;
}

function drawPauseButton() {
    document.getElementById("animationToggle").innerHTML = "<button type=\"button\" class=\"btn btn-outline-secondary\" onclick=\"stopAnimation()\"><i class=\"fas fa-pause\"></i></button>";
}

function drawPlayButton() {
    document.getElementById("animationToggle").innerHTML = "<button type=\"button\" class=\"btn btn-outline-secondary\" onclick=\"startAnimation()\"><i class=\"fas fa-play\"></i></button>";
}

function drawInfo(kraj, prefix = "detail", verbose = false) {
    // make sure its visible
    var x = document.getElementById(prefix);
    if (x.style.display === "none") {
        x.style.display = "";
    }

    var date = toDate;
    var dateIndex = countDaysBetweenDates(toDate, dateEpoch);

    // info o kraji
    document.getElementById(prefix + "-jmenoKraje").innerText = kraj.jmeno;
    document.getElementById(prefix + "-infoOKraji").innerHTML = printPrettyNumber(kraj.pocetObyvatel, true) + " obyvatel [" + Math.round(10000 * kraj.pocetObyvatel / republika.pocetObyvatel) / 100 + "% populace ??R]<br><b>K datu " + date.getDate() + ". " + (date.getMonth() + 1) + ". " + date.getFullYear() + ":</b>";

    // celkove vyockovano / rozdeleni podle davek
    document.getElementById(prefix + "-celkemDavekButton").innerHTML = "Vyo??kov??no celkem: " + printPrettyNumber(kraj.prubeznaSuma[dateIndex].celkem, true) + "&nbsp;d??vek (" + Math.round(1000 * kraj.prubeznaSuma[dateIndex].celkem / kraj.pocetObyvatel) / 1000 + "&nbsp;d??vky/" + (verbose ? "osobu" : "os") + ") [" + printIncrement(kraj.prubeznaSuma[dateIndex].celkemPrirustek, (dateIndex < 1 ? 0 : kraj.prubeznaSuma[dateIndex - 1].celkemPrirustek), verbose) + "]";
    document.getElementById(prefix + "-celkemPrvnichDavekButton").innerHTML = "1. d??vkou: " + printPrettyNumber(kraj.prubeznaSuma[dateIndex].prvniDavka, true) + " (" + Math.round(10000 * kraj.prubeznaSuma[dateIndex].prvniDavka / kraj.pocetObyvatel) / 100 + "%&nbsp;"+(verbose ? "obyvatel" : "obyv")+") [" + printIncrement(kraj.prubeznaSuma[dateIndex].prvniDavkaPrirustek, (dateIndex < 1 ? 0 : kraj.prubeznaSuma[dateIndex - 1].prvniDavkaPrirustek), verbose) + "]";
    document.getElementById(prefix + "-celkemDruhychDavekButton").innerHTML = "2. d??vkou: " + printPrettyNumber(kraj.prubeznaSuma[dateIndex].druhaDavka, true) + " (" + Math.round(10000 * kraj.prubeznaSuma[dateIndex].druhaDavka / kraj.pocetObyvatel) / 100 + "%&nbsp;"+(verbose ? "obyvatel" : "obyv")+") [" + printIncrement(kraj.prubeznaSuma[dateIndex].druhaDavkaPrirustek, (dateIndex < 1 ? 0 : kraj.prubeznaSuma[dateIndex - 1].druhaDavkaPrirustek), verbose) + "]";

    var prvniDavkaBody = "<ul>"
    kraj.prubeznaSuma[dateIndex].vakcina.forEach(function (vakcina) {
        prvniDavkaBody += "<li>" + vakcina.nazev + ": " + printPrettyNumber(vakcina.prvniDavka) + " ";
        if (kraj.prubeznaSuma[dateIndex].prvniDavka < 1) {
            prvniDavkaBody += "(0%$nbsp;vakc??n)</li>";
        } else {
            prvniDavkaBody += "(" + Math.round(10000 * vakcina.prvniDavka / kraj.prubeznaSuma[dateIndex].prvniDavka) / 100 + "%&nbsp;vakc??n)</li>";
        }
    });
    var druhaDavkaBody = "<ul>"
    kraj.prubeznaSuma[dateIndex].vakcina.forEach(function (vakcina) {
        druhaDavkaBody += "<li>" + vakcina.nazev + ": " + printPrettyNumber(vakcina.druhaDavka) + " ";
        if (kraj.prubeznaSuma[dateIndex].druhaDavka < 1) {
            druhaDavkaBody += "(0%&nbsp;vakc??n)</li>";
        } else {
            druhaDavkaBody += "(" + Math.round(10000 * vakcina.druhaDavka / kraj.prubeznaSuma[dateIndex].druhaDavka) / 100 + "%&nbsp;vakc??n)</li>";
        }
    });

    document.getElementById(prefix + "-celkemPrvnichDavekText").innerHTML = prvniDavkaBody;
    document.getElementById(prefix + "-celkemDruhychDavekText").innerHTML = druhaDavkaBody;

    // rozdeleni podle druhu vakciny
    var rozdeleniPodleVakcinHtml = "";
    if (kraj.prubeznaSuma[dateIndex].celkem < 1) {
        kraj.prubeznaSuma[dateIndex].vakcina.forEach(function (vakcina) {
            rozdeleniPodleVakcinHtml += "<li>" + vakcina.nazev + ": 0 (0%nbsp;vakc??n)</li>"
        });
    } else {
        kraj.prubeznaSuma[dateIndex].vakcina.forEach(function (vakcina) {
            rozdeleniPodleVakcinHtml += "<li>" + vakcina.nazev + ": " + printPrettyNumber(vakcina.suma) + " (" + Math.round(10000 * vakcina.suma / kraj.prubeznaSuma[dateIndex].celkem) / 100 + "%&nbsp;vakc??n)</li>"
        });
    }
    document.getElementById(prefix + "-rozdeleniPodleVakcinList").innerHTML = rozdeleniPodleVakcinHtml;

    // rozdeleni podle vekovych skupin
    kraj.prubeznaSuma[dateIndex].vekova_skupina.forEach(function (skupina, idx) {
        var titleText = "";
        var bodyHtml = "<ul>";
        var pocetLidiVeSkupine = 1;
        // rucne odchytam specialni skupiny
        switch (skupina.nazev) {
            case "0-17":
                pocetLidiVeSkupine = kraj.demografie["15-19"] * 0.6 + kraj.demografie["0-4"] + kraj.demografie["5-9"] + kraj.demografie["10-14"];
                break;
            case "18-24":
                pocetLidiVeSkupine = kraj.demografie["15-19"] * 0.4 + kraj.demografie["20-24"];
                break;
            case "80":
                pocetLidiVeSkupine = kraj.demografie["80-84"] + kraj.demografie["85-89"] + kraj.demografie["90-94"] + kraj.demografie["95+"];
                break;
            default:
                // ostatni vyresime vsechny stejne
                pocetLidiVeSkupine = kraj.demografie[skupina.nazev];
        }
        titleText = printPrettyNumber(skupina.celkem) + " (" + ((skupina.nazev == "0-17" || skupina.nazev == "18-24") ? "~" : "") + Math.round(1000 * skupina.celkem / pocetLidiVeSkupine) / 1000 + "&nbsp;d??vky/" + (verbose ? "osobu" : "os") + ") [" + printIncrement(kraj.prubeznaSuma[dateIndex].vekova_skupina[idx].celkemPrirustek, (dateIndex < 1 ? 0 : kraj.prubeznaSuma[dateIndex-1].vekova_skupina[idx].celkemPrirustek), verbose) + "]";
        bodyHtml += "<li>1. d??vka: " + printPrettyNumber(skupina.prvniDavka) + " (" + Math.round(10000 * skupina.prvniDavka / pocetLidiVeSkupine) / 100 + "%&nbsp;skupiny) [" + printIncrement(kraj.prubeznaSuma[dateIndex].vekova_skupina[idx].prvniDavkaPrirustek, (dateIndex < 1 ? 0 : kraj.prubeznaSuma[dateIndex-1].vekova_skupina[idx].prvniDavkaPrirustek), verbose) + "]</li>";
        bodyHtml += "<li>2. d??vka: " + printPrettyNumber(skupina.druhaDavka) + " (" + Math.round(10000 * skupina.druhaDavka / pocetLidiVeSkupine) / 100 + "%&nbsp;skupiny) [" + printIncrement(kraj.prubeznaSuma[dateIndex].vekova_skupina[idx].druhaDavkaPrirustek, (dateIndex < 1 ? 0 : kraj.prubeznaSuma[dateIndex-1].vekova_skupina[idx].druhaDavkaPrirustek), verbose) + "]</li>";
        bodyHtml += "<li>Pod??ly o??kovac??ch l??tek:<ul>";
        kraj.prubeznaSuma[dateIndex].vakcina.forEach(function (vakcina, idx) {
            if (skupina.celkem < 1) {
                bodyHtml += "<li><b>" + vakcina.nazev + ":</b> 0%</li>"
            } else {
                bodyHtml += "<li><b>" + vakcina.nazev + ":</b> " + Math.round(10000 * skupina.vakcina[idx] / skupina.celkem) / 100 + "%</li>"
            }
        });
        bodyHtml += "</ul></li>";

        bodyHtml += "</ul>";
        document.getElementById(prefix + "-rozdeleniPodleVeku" + skupina.nazev + "Title").innerHTML = titleText;
        document.getElementById(prefix + "-rozdeleniPodleVeku" + skupina.nazev + "Body").innerHTML = bodyHtml;
    });
}

function mixColors(color_1, color_2, weight) {
    function d2h(d) { return d.toString(16); }  // convert a decimal value to hex
    function h2d(h) { return parseInt(h, 16); } // convert a hex value to decimal 

    weight = (typeof (weight) !== 'undefined') ? weight : 50; // set the weight to 50%, if that argument is omitted

    var color = "#";

    for (var i = 0; i <= 5; i += 2) { // loop through each of the 3 hex pairs???red, green, and blue
        var v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
            v2 = h2d(color_2.substr(i, 2)),

            // combine the current pairs from each source color, according to the specified weight
            val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0)));

        while (val.length < 2) { val = '0' + val; } // prepend a '0' if val results in a single digit

        color += val; // concatenate val to our new color string
    }

    return color; // PROFIT!
};

function writeRepublikaStats() {
    drawInfo(republika, "republika", true);
}

/**
 * 
 */
function drawBarvyKraju() {
    var datum = toDate;
    var dateIndex = countDaysBetweenDates(toDate, dateEpoch);
    var nejhorsiKraj = 100;
    var nejlepsiKraj = 0;

    if (krajSelected.status) {
        drawInfo(krajSelected.kraj);
    }

    kraje.forEach(function (kraj) {
        kraj.ockovaniProcento = kraj.prubeznaSuma[dateIndex].celkem / kraj.pocetObyvatel;
        if (kraj.ockovaniProcento < nejhorsiKraj) {
            nejhorsiKraj = Math.round(10000 * kraj.prubeznaSuma[dateIndex].celkem / kraj.pocetObyvatel) / 10000;
        }
        if (kraj.ockovaniProcento > nejlepsiKraj) {
            nejlepsiKraj = Math.round(10000 * kraj.prubeznaSuma[dateIndex].celkem / kraj.pocetObyvatel) / 10000;
        }
    });

    var worstKrajColor = "fc0303";
    var averageKrajColor = "fccf03";
    var bestKrajColor = "419600";
    var celorepublikoveNaockovano = republika.prubeznaSuma[dateIndex].celkem / republika.pocetObyvatel;

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
    var textWidth = ctx.measureText((Math.round(1000 * nejlepsiKraj) / 1000) + " d??vky na osobu");
    ctx.fillText((Math.round(1000 * nejhorsiKraj) / 1000) + " d??vky na osobu", c.width * 0.1, 40);
    ctx.fillText((Math.round(1000 * nejlepsiKraj) / 1000) + " d??vky na osobu", c.width * 0.9 - textWidth.width, 40);


    kraje.forEach(function (kraj) {
        var proockovanyPodil = kraj.prubeznaSuma[dateIndex].celkem / kraj.pocetObyvatel;
        if (proockovanyPodil == 0) {
            kraj.barva = "#ffffff";
        }
        if (proockovanyPodil <= celorepublikoveNaockovano && proockovanyPodil > 0) {
            // podprumerne ockovani
            kraj.barva = mixColors(averageKrajColor, worstKrajColor, Math.round(100 * (proockovanyPodil - nejhorsiKraj) / (celorepublikoveNaockovano - nejhorsiKraj)));
        }
        if (proockovanyPodil > celorepublikoveNaockovano) {
            // nadprumerne ockovani
            kraj.barva = mixColors(bestKrajColor, averageKrajColor, Math.round(100 * (proockovanyPodil - celorepublikoveNaockovano) / (nejlepsiKraj - celorepublikoveNaockovano)));
        }
        document.getElementById(kraj.id).style.fill = kraj.barva;
    });
}

function updateTimeline() {
    document.getElementById("timeline").value = countDaysBetweenDates(dateEpoch, toDate);
}

function updateDatePicker() {
    document.getElementById("dateInput").value = dateToDateString(toDate);
}

function inputChanged(source) {
    if (animation.isRunning) {
        animation.wasRunning = true;
        stopAnimation();
    } else {
        animation.wasRunning = false;
    }
    switch (source) {
        case "timeline":
            var dayDiff = parseInt(document.getElementById("timeline").value);
            var aktualniDatum = new Date(dateEpoch.getTime());
            aktualniDatum.setDate(27 + dayDiff);
            toDate = new Date(aktualniDatum.getTime());
            updateDatePicker();
            break;
        case "datepicker":
            console.log(document.getElementById("dateInput").value);
            toDate = new Date(document.getElementById("dateInput").value);
            console.log(toDate);
            updateTimeline();
            break;
        case "animation":
            updateDatePicker();
            updateTimeline();
            break;
        default:
            console.log("Zmena, ale neznamy zdroj");
    }
    drawBarvyKraju();
    writeRepublikaStats();
    if (animation.wasRunning) {
        startAnimation();
    }
}

function animateData() {
    // zkontrolujeme, jestli jsou zobrazena data z posledniho dne ockovani a pripadne se vratime na zacatek
    if (toDate.getFullYear() >= lastVaccineDate.getFullYear() && toDate.getMonth() >= lastVaccineDate.getMonth() && toDate.getDate() >= lastVaccineDate.getDate()) {
        toDate = new Date(dateEpochString);
    } else {
        var oDen = new Date(toDate.getTime());
        oDen.setDate(oDen.getDate() + 1);
        toDate = new Date(oDen.getTime());
    }
    inputChanged("animation");
}

function startAnimation() {
    if (!animation.isRunning) {
        animation.reference = setInterval(animateData, 1000);
        animation.isRunning = true;
    }
    drawPauseButton();
}

function stopAnimation() {
    clearInterval(animation.reference);
    animation.isRunning = false;
    drawPlayButton();
}

function spacebarListener() {
    if (animation.isRunning) {
        stopAnimation();
    } else {
        startAnimation();
    }
}