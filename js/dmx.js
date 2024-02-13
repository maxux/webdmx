var socket;
var state = [];
var names = {
    50: "Blind Left - Dimmer",
    51: "Blind Left - Functions",
    52: "Blind Left - Red",
    53: "Blind Left - Green",
    54: "Blind Left - Blue",
    55: "Blind Left - Sound",
    56: "Blind Right - Dimmer",
    57: "Blind Right - Functions",
    58: "Blind Right - Red",
    59: "Blind Right - Green",
    60: "Blind Right - Blue",
    61: "Blind Right - Sound",
    62: "Black Light",
    63: "Black Strobe",
    97: "Desktop Par-16",
    99: "Living Room Par-16",
    100: "Service Par-16",
    101: "Kitchen Par-16 Down",
    103: "Kitchen Par-16 Up",
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
    for(var i = 45; i < 128; i++) {
        if(i > 66 && i < 94)
            continue;

        let active = names[i + 1] != undefined ? "row channel-active" : "row channel-inactive";
        let row = $('<div>', {'class': active});

        row.append($("<div>", {'class': 'col-2 order-1 channel d-none d-lg-block'}).html("Channel " + (i + 1)));
        row.append($('<div>', {'class': 'col order-3'}).append(
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
        row.append($("<div>", {'class': 'col-1 value order-2', 'id': 'value-' + i}).html("0"));
        row.append($("<div>", {'class': 'col name order-1 order-md-4', 'id': 'name-' + i}).html(names[i + 1] != undefined ? names[i + 1] : ""));

        $('#channels').append(row);
    }
}

function preset_save() {
    request("save", $("#save-name").val());
}

function preset_load_replace(name) {
    request("load-replace", name);
}

function preset_load(name) {
    let mode = document.querySelector('input[name="moderadio"]:checked').id;
    request(mode, name);
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
            $("#presets-important").empty();
            $("#presets-list").empty();

            for(var i = 0; i < json["value"].length; i++) {
                let onclick = "preset_load('" + json["value"][i]["name"] + "');";
                let onclick_imp = "preset_load_replace('" + json["value"][i]["name"] + "');";

                let tags = {'class': 'btn btn-dark m-1 flex-fill', 'onclick': onclick};
                let tag_default = {'class': 'btn btn-success m-1 flex-fill', 'onclick': onclick_imp};
                let tag_black = {'class': 'btn btn-danger m-1 flex-fill', 'onclick': onclick_imp};

                if(json["value"][i]["name"] == "Default") {
                    $("#presets-important").append(
                        $("<button>", tag_default).html(json["value"][i]["name"])
                    );
                    continue;
                }

                if(json["value"][i]["name"] == "Black") {
                    $("#presets-important").append(
                        $("<button>", tag_black).html(json["value"][i]["name"])
                    );
                    continue;
                }

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
