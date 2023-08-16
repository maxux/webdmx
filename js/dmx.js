var socket;
var state = [];
var names = {
    50: "Blind Left - Dimmer",
    51: "Blind Left - Functions",
    52: "Blind Left - Red",
    53: "Blind Left - Green",
    54: "Blind Left - Blue",
    55: "Blind Right - Dimmer",
    56: "Blind Right - Functions",
    57: "Blind Right - Red",
    58: "Blind Right - Green",
    59: "Blind Right - Blue",
    60: "Black Light",
    61: "Black Strobe",
    91: "Kitchen",
    101: "Stars",
    103: "Bright Par-16",
    105: "Grp 1 - Red",
    106: "Grp 1 - Green",
    107: "Grp 1 - Blue",
    108: "Grp 1 - Cold White",
    109: "Grp 1 - Warn White",
    110: "Grp 1 - UV",
    111: "Grp 2 - Red",
    112: "Grp 2 - Green",
    113: "Grp 2 - Blue",
    114: "Grp 2 - Cold White",
    115: "Grp 2 - Warm White",
    116: "Grp 2 - UV",
    117: "Grp 3 - Red",
    118: "Grp 3 - Green",
    119: "Grp 3 - Blue",
    120: "Grp 3 - Cold White",
    121: "Grp 3 - Warm White",
    122: "Grp 3 - UV",
    123: "Grp 4 - Red",
    124: "Grp 4 - Green",
    125: "Grp 4 - Blue",
    126: "Grp 4 - Cold White",
    127: "Grp 4 - Warm White",
    128: "Grp 4 - UV",
}


function sliders() {
    for(var i = 0; i < 128; i++) {
        let tr = $('<tr>');

        tr.append($("<td>", {'class': 'channel'}).html("Channel " + (i + 1)));
        tr.append($('<td>').append(
            $('<input>', {
                'type': 'range',
                'min': '0',
                'max': '255',
                'value': '0',
                'class': 'slider',
                'id': 'channel-' + i,
                'onchange': 'updater(this)',
                'oninput': 'updater(this)',
            })
        ));
        tr.append($("<td>", {'class': 'value', 'id': 'value-' + i}).html("0"));
        tr.append($("<td>", {'class': 'name', 'id': 'name-' + i}).html(names[i + 1] != undefined ? names[i + 1] : ""));

        $('#channels').append(tr);
    }
}

function preset_save() {
    request("save", $("#save-name").val());
}

function preset_load(name) {
    request("load", name);
}

function request(name, value) {
    socket.send(JSON.stringify({"type": name, "value": value}));
}

function commit() {
    socket.send(JSON.stringify({"type": "change", "value": state}));
}

function updater(source) {
    console.log(source.id, source.value);
    let id = source.id.substr(8);
    console.log(id);

    state[parseInt(id)] = parseInt(source.value);
    $("#value-" + id).html(source.value);
    commit();
}

function connect() {
    socket = new WebSocket("ws://10.241.0.51:31501/");

    socket.onopen = function() {
        console.log("websocket open");
        $('#disconnected').hide();

        request("presets", null);
    }

    socket.onmessage = function(msg) {
        json = JSON.parse(msg.data);
        console.log(json);

        if(json["type"] == "state") {
            state = json["value"];

            for(var i = 0; i < state.length; i++) {
                $('#channel-' + i).val(state[i]);
                $('#value-' + i).html(state[i]);
            }
        }

        if(json["type"] == "presets") {
            $("#presets-list").empty();

            for(var i = 0; i < json["value"].length; i++) {
                let tags = {
                    'class': 'btn btn-dark m-1',
                    'onclick': "preset_load('" + json["value"][i]["name"] + "');",
                };

                $("#presets-list").append(
                    $("<button>", tags).html(json["value"][i]["name"])
                );
            }
        }
    }

    socket.onclose = function() {
        $('#disconnected').show();
        setTimeout(connect, 200);
    }
}


$(document).ready(function() {
    sliders();
    connect();
});
