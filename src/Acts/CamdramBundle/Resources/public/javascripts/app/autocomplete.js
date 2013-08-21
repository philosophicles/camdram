// Register the autocomplete system
var Camdram = Camdram || {};
Camdram.autocomplete = {};
// Stored result items
Camdram.autocomplete.items = [];
// On load register all requirements into views
$(function() {
    $(".autocomplete .searchfield").focus(function(e) {
        $(this).closest(".autocomplete").addClass("active");
        Camdram.autocomplete.trigger(this);
    }).blur(function(e) {
        $(this).closest(".autocomplete").removeClass("active");
        Camdram.autocomplete.drawControl(false);
    }).keyup(function(e) {
        if(e.keyCode == 38 || e.keyCode == 40)
            Camdram.autocomplete.shiftOption(this, (e.keyCode == 40));
        else if(e.keyCode == 13)
            Camdram.autocomplete.chooseOption(this);
        else if(e.keyCode == 27) {
            $(this).val('');
            Camdram.autocomplete.drawControl(false);
        } else if(e.keyCode != 37 && e.keyCode != 39)
            Camdram.autocomplete.trigger(this);
        e.preventDefault();
        return false;
    });
    $(".autocomplete .searchform").keyup(function(e) {
        if(e.keyCode == 13) e.preventDefault();
        return false;
    });
});

// We don't want to continuously trigger as they type, so timeout
Camdram.autocomplete.timeout = null;
Camdram.autocomplete.trigger = function(field) {
    if(Camdram.autocomplete.timeout != null) clearTimeout(Camdram.autocomplete.timeout);
    Camdram.autocomplete.timeout = setTimeout(function() { Camdram.autocomplete.suggest(field) }, 250);
};

Camdram.autocomplete.chooseOption = function(field) {
    // Find if we currently have a selected item
    var current = -1;
    var holder = $(field).closest(".autocomplete");
    var results = holder.find(".results ul li");
    for (var i = 0; i < results.length; i++) {
        if($(results[i]).hasClass("active")) {
            current = i;
            $(results[i]).removeClass("active")
            break;
        }
    }
    // If we do have a selected item then jump to it, otherwise just search
    if(current == -1) $("#search_form").submit();
    else {
        var data_item = Camdram.autocomplete.items[current];
        window.location.href = Routing.generate('get_entity', {id: data_item.id});
    }
};

Camdram.autocomplete.shiftOption = function(field, down) {
    // Find currently active item
    var holder = $(field).closest(".autocomplete");
    var results = holder.find(".results ul li");
    if(results.length == 0) return;
    // Find currently selected one
    var current = -1;
    for (var i = 0; i < results.length; i++) {
        if($(results[i]).hasClass("active")) {
            current = i;
            $(results[i]).removeClass("active")
            break;
        }
    }
    // Shift in the relevant direction
    if(current < 0 && down) $(results[0]).addClass("active");
    else if(current < 0 && !down) $(results[(results.length - 1)]).addClass("active");
    else if(down) {
        var toselect = current + 1;
        if(toselect >= results.length) toselect = (results.length - 1);
        $(results[toselect]).addClass("active");
    } else {
        var toselect = current - 1;
        if(toselect < 0) toselect = 0;
        $(results[toselect]).addClass("active");
    }
}

Camdram.autocomplete.drawControl = function(show, height) {
    if (height == null) height = 40;
    if(show) {
        $(".autocomplete").animate({"height": height + 37 + "px"}, 250);
        $(".autocomplete .results").css({"display": "block", "height": height + "px"}).animate({"opacity": 1.0}, 250);
    }
    else {
        $(".autocomplete").animate({"height": "40px"}, 250);
        $(".autocomplete .results").animate({"opacity": 0.0, "display": "none"}, 250);
    }
}

Camdram.autocomplete.suggest = function(field) {
    var typed = $(field).val();
    if(typed.length < 3) {
        Camdram.autocomplete.drawControl(false);
        return;
    }
    $(".autocomplete .status-icon").removeClass("icon-search").addClass("icon-spinner").addClass("icon-spin");
    // Activate the field
    var url = Routing.generate('get_entities', {_format: 'json', q: encodeURIComponent(typed), limit: 10, autocomplete: true});
    $.getJSON(url, function(data){
        // Store the results
        Camdram.autocomplete.items = data;
        $(".autocomplete .results ul").empty();
        // Draw out the elements
        if (data.length > 0) {
            $(".noresults").css("display", "none");
            for (var i = 0; i < Camdram.autocomplete.items.length; i++) {
                var result = Camdram.autocomplete.items[i];
                var item = Camdram.autocomplete._generate_item(result);
                // Add item into the page
                $(".autocomplete .results ul").append(item);
            }
            Camdram.autocomplete.drawControl(true, (data.length * 39));
        } else {
            $(".noresults").css("display", "block");
            Camdram.autocomplete.drawControl(true);
        }
        $(".autocomplete .status-icon").removeClass("icon-spinner").removeClass("icon-spin").addClass("icon-search");
    });
}

Camdram.autocomplete._generate_item = function(result) {
    var item = document.createElement("li");
    item.onclick = (function(data_item) { return function() {
        window.location.href = Routing.generate('get_entity', {id: data_item.id});
    };})(result);
    // Add in the icon
    var icon = document.createElement("i");
    icon.className = "icon-user";
    if(result.camdram_type == "show") icon.className = "icon-ticket";
    else if(result.camdram_type == "venue") icon.className = "icon-building";
    else if(result.camdram_type == "society") icon.className = "icon-group";
    item.appendChild(icon);
    // Add in the text segments
    var textholder = document.createElement("div");
    textholder.className = "textHolder";
    item.appendChild(textholder);
    // Add in the text
    var text = document.createElement("div");
    text.className = "resultText";
    text.innerHTML = result.name;
    textholder.appendChild(text);
    if(result.camdram_type == "show") {
        // Wind up text
        text.style.marginTop = "-5px";
        // Add in subtext
        var subtext = document.createElement("div");
        subtext.className = "subText";
        subtext.innerHTML = result.dates + " - " + result.venue_name;
        textholder.appendChild(subtext);
    }
    // Autosize text
    $(text).quickfit({
        "min": 12,
        "max": 16,
        "truncate": true,
        "width": 500
    });
    
    return item;
}