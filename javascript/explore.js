var username = getParam("username");

var labels = [];
var data2 = {
    labels: labels,
    datasets: [{
        label: 'Net worth',
        backgroundColor: 'rgb(0, 71, 171)',
        borderColor: 'rgb(0, 71, 171)',
        data: [],
        fill: false
    }]
};

var config = {
    type: 'line',
    data: data2,
    options: {plugins: {
        legend: {
            display: false
        }
    }}
};

var marketOpen = false;

function search() {
    var user = $("#username").val();
    location.replace("explore.html?username=" + user);
}

function loadAll() {
    $.post("./backend/API.php",{"type":6},function(res) {
        $("#availables").empty();
        for(var i = 0;i < res.length;++i) {
            $("#availables").append("<tr><td>" + nameToCode(res[i]["name"],res[i]["rating"]) + "</td><td>$" + reformNum(res[i]["price"]) + "</td><td>" + res[i]["qty"] + "</td></tr>");
        }
    });
}

function init() {
    $.post("./backend/API.php",{"type":6},function(res) {
        if(username == undefined) {
            location.replace("explore.html?username=" + res[Math.floor(Math.random() * res.length)]["name"]);
        }
        for(var i = 0;i < Math.min(5,res.length);++i) {
            $("#availables").append("<tr><td>" + nameToCode(res[i]["name"],res[i]["rating"]) + "</td><td>$" + reformNum(res[i]["price"]) + "</td><td>" + res[i]["qty"] + "</td></tr>");
        }
    });
    $.post("./backend/API.php",{"type":5,"username":username},function(res) {
        if(res["success"] != 1 && username != undefined) {
            alert("Error code " + res["success"] + ": " + res["message"]);
            location.replace("explore.html");
        }
        for(var i = 0;i < res["changes"].length;++i) {
            labels.push(res["changes"][i]["time"].split(" ")[0]);
            data2.datasets[0].data.push(res["changes"][i]["value"]);
        }
        const changeChart = new Chart(document.getElementById('changeChart'),config);
        $("#networth").text("$" + reformNum(res["networth"]));
        var change = 0;
        if(res["changes"].length > 1) {
            change = (res["changes"][res["changes"].length - 1].value - res["changes"][res["changes"].length - 2].value) / res["changes"][res["changes"].length - 2].value * 100;
        }
        if(change >= 0) {
            $("#growth").text("+" + reformNum(change) + "%");
        }else{
            $("#growth").text(reformNum(change) + "%");
        }
        $("#cash").text("$" + reformNum(res["cash"]));
        $("#cfvalue").text("$" + reformNum(res["price"]));
        $("#rank").text("#" + res["rank"] + " / " + res["total"]);

        marketOpen = res["open"];
        if(marketOpen) {
            $("#openclose").addClass("alert-success");
            $("#openclose").html("The Market is <b>OPEN</b> right now!");
            $("#btnBuySell").removeAttr("disabled");
        }else{
            $("#openclose").addClass("alert-danger");
            $("#openclose").html("The Market is <b>CLOSED</b> right now!");
        }
        for(const [user,row] of Object.entries(res["holdings"])) {
            if(row["qty"] == 0) continue;
            $("#holdings").append("<tr><td>" + nameToCode(user,row["rating"]) + "</td><td>$" + reformNum(row["currentPrice"]) + "</td><td>$" + reformNum(row["purchasePrice"]) + "</td><td>" + Math.abs(row["qty"]) + "</td></tr>");
        }
        var totalLeft = 1000;
        for(const [user,row] of Object.entries(res["owners"])) {
            totalLeft -= row["qty"];
            if(row["qty"] == 0) continue;
            $("#owners").append("<tr><td>" + nameToCode(user,row["rating"]) + "</td><td>" + row["qty"] + "</td><td>$" + reformNum(row["qty"] * res["price"]) + "</td><td>" + reformNum(100 * row["qty"] / 1000) + "%</td></tr>");
        }

        $("#qtyleft").text(totalLeft);

        for(var i = res["history"].length - 1;i >= 0;--i) {
            $("#history").append("<tr><td>" + nameToCode(res["history"][i]["stock"],res["history"][i]["rating"]) + "</td><td>" + shortenTime(res["history"][i]["tradeTime"]) + "</td><td>$" + reformNum(res["history"][i]["price"]) + "</td><td>" + Math.abs(res["history"][i]["qty"]) + "</td><td>" + buyOrSell(res["history"][i]["qty"]) + "</td></tr>")
        }
    });

    $.post("https://codeforces.com/api/user.rating?handle=" + username,function(res) {
        var minimumRating = 4000;
        var maximumRating = 0;
        for(var i = 0;i < res["result"].length;++i) {
            data.push([res["result"][i]["ratingUpdateTimeSeconds"] * 1000,res["result"][i]["newRating"],res["result"][i]["newRating"] - res["result"][i]["oldRating"],res["result"][i]["contestName"],res["result"][i]["contestId"],res["result"][i]["rank"]]);
            minimumRating = Math.min(minimumRating,res["result"][i]["newRating"]);
            maximumRating = Math.max(maximumRating,res["result"][i]["newRating"]);
        }
        if(res["result"].length == 0) {
            minimumRating = 1200;
            maximumRating = 2800;
        }

        var options = {
            lines: { show: true },
            points: { show: true },
            xaxis: {
                mode: "time",
                zoomRange: [172800000, null],
                panRange: [1555164300000, 1629815700000],
                timeformat: function () {
                    let minTimestamp = 1e18;
                    let maxTimestamp = -1e18;
                    for (let i = 0; i < data.length; i++) {
                        minTimestamp = Math.min(minTimestamp, data[i][0]);
                        maxTimestamp = Math.max(maxTimestamp, data[i][0]);
                    }
                    if (minTimestamp > maxTimestamp) {
                        return null;
                    }

                    const deltaMillis = maxTimestamp - minTimestamp;
                    const days = deltaMillis / (1000 * 60 * 60 * 24);
                    const months = days / 30;
                    const years = deltaMillis / (1000 * 60 * 60 * 24 * 365);

                    if (years >= 7) {
                        return "%Y";
                    } else if (years < 1 && months <= 7) {
                        return "%d %b %Y"
                    } else {
                        return "%b %Y";
                    }
                }()
            },
            yaxis: {
                min: Math.max(0,minimumRating - 100),
                max: maximumRating + 250,
                ticks: [1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000],
                zoomRange: [500, null],
                panRange: [1000, 2516]
            },
            grid: {
                hoverable: true,
                markings: markings
            },
            zoom: {
                interactive: false
            },
            pan: {
                interactive: false
            }
        };

        var prev = -1;
        $("#usersRatingGraphPlaceholder").bind("plothover", function (event, pos, item) {
            if (item) {
                if (prev !== item.dataIndex) {
                    $("#tooltip").remove();
                    var params = data[item.dataIndex];

                    var total = params[1];
                    var rank = params[5];
                    var change = params[2] > 0 ? "+" + params[2] : params[2];
                    var contestName = params[3];
                    var contestId = params[4];

                    var html = "= " + total + " (" + change + ")<br>Rank: " + rank + "<br/><a href='https://codeforces.com/contest/" + contestId + "'>" + contestName + "</a>";
                    showTooltip(item.pageX, item.pageY, html);
                    setTimeout(function () {
                        $("#tooltip").fadeOut(200);
                        prev = -1;
                    }, 4000);
                    prev = item.dataIndex;
                }
            }
        });

        $("#usersRatingGraphPlaceholder").click(function () {
            options.zoom = {interactive:true};
            options.pan = {interactive:true};

            plot = $.plot($("#usersRatingGraphPlaceholder"), datas, options);
            addScroll();

            $("#usersRatingGraphPlaceholder").unbind("click");
            $(".zoomTip").fadeOut();
        });

        var plot = $.plot($("#usersRatingGraphPlaceholder"), datas, options);
        $(window).resize(function () {
            plot.resize();
            plot.setupGrid();
            plot.draw();
        });
    });


}

function showTooltip(x, y, contents) {
    $('<div id="tooltip">' + contents + '</div>').css( {
        position: 'absolute',
        display: 'none',
        top: y - 20,
        left: x + 10,
        border: '1px solid #fdd',
        padding: '2px',
        'font-size' : '11px',
        'background-color': '#fee',
        opacity: 0.80
    }).appendTo("body").fadeIn(200);
}

function trade() {
    var username = $("#usernameBuySell").val();
    var quantity = parseInt($("#quantityBuySell").val()) * $("#actionBuySell").val();
    $.post("./backend/API.php",{"type":8,"username":username,"password":"17784b1c524c148195fd68da3ed058af","stock":username,"qty":quantity},function(res) {
        if(res["success"] == 1) {
            alert("Success!");
            location.reload();
        }else{
            alert("Error code " + res["success"] + ": " + res["message"]);
        }
    });
}

$(init);

var data = [];

var datas = [
{label: username, data: data},        
];

var markings = [
{ color: '#a00', lineWidth: 1, yaxis: { from: 3000 } },
{ color: '#f33', lineWidth: 1, yaxis: { from: 2600, to: 2999 } },
{ color: '#f77', lineWidth: 1, yaxis: { from: 2400, to: 2599 } },
{ color: '#ffbb55', lineWidth: 1, yaxis: { from: 2300, to: 2399 } },
{ color: '#ffcc88', lineWidth: 1, yaxis: { from: 2100, to: 2299 } },
{ color: '#f8f', lineWidth: 1, yaxis: { from: 1900, to: 2099 } },
{ color: '#aaf', lineWidth: 1, yaxis: { from: 1600, to: 1899 } },
{ color: '#77ddbb', lineWidth: 1, yaxis: { from: 1400, to: 1599 } },
{ color: '#7f7', lineWidth: 1, yaxis: { from: 1200, to: 1399 } },
{ color: '#ccc', lineWidth: 1, yaxis: { from: 0, to: 1199 } },
];

