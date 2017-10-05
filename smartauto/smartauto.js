(function ($) {
    //fixed for chorome
    if (!String.prototype.contains) {
        String.prototype.contains = function (s) {
            return this.indexOf(s) > -1;
        }
    };
    $.fn.SmartAuto = function (options) {

        var settings = $.extend({
            source: [],
            addText: "Add",
            dataText: "",
            dataValue: "",
            isSourceObject: false,
            hiddenField: "",
            callback: function () { }
        }, options);

        this.each(function() {
            $(this).autocomplete({
                minLength: 0,
                source: function(request, response) {
                    // console.log(request)
                    // console.log(response)
                    if (!settings.isSourceObject) {
                        var result = $.ui.autocomplete.filter(settings.source, request.term);


                        if ($.inArray(request.term, result) < 0) {
                            // $("#add").toggle($.inArray(request.term, result) < 0);
                            // result.push();
                            if ($.trim(request.term) != "") {
                                result.splice(0, 0, {
                                    label: request.term,
                                    isPlaceholder: true
                                });
                            }
                        }
                        response(result);
                    } else {
                        var result = settings.source.filter(function(el) {
                            return el[settings.dataText].toLowerCase().indexOf(request.term.toLowerCase()) >= 0
                            // return el[settings.dataText].contains(request.term)
                        });
                        // console.log(result)
                        var exactResult = result.filter(function(el) {
                            return el[settings.dataText].toLowerCase() == request.term.toLowerCase()
                        });
                        // console.log(exactResult)
                        if (exactResult.length == 0) {
                            if ($.trim(request.term) != "") {
                                // console.log("addedplace")
                                var sp = {};

                                sp[settings.dataText] = request.term,
                                    sp[settings.dataValue] = 0,
                                    sp.isPlaceholder = true
                                result.splice(0, 0, sp);
                            }
                        }
                        //console.log(result);
                        var final = $.map(result, function(value, key) {
                            // console.log(value)
                            return {
                                value: value[settings.dataText],
                                label: value[settings.dataValue],
                                isPlaceholder: value.isPlaceholder
                            }
                        })
                        response(final);
                    }
                },
                change: function(event, ui) {
                    //console.log(event)
                },
                select: function(event, ui) {
                    // console.log($(this))
                    // place the person.given_name value into the textfield called 'select_origin'...
                    $(this).val(ui.item.value);
                    // console.log(ui.item.value);
                    $("input:hidden[name=" + settings.hiddenField + "]").val(ui.item.label).trigger("change");
                    // and place the person.id into the hidden textfield called 'link_origin_id'. 
                    // $('#link_origin_id').val(ui.item.id);
                    //return false;
                    return false;
                },
                focus: function() {
                    $(".ui-helper-hidden-accessible").remove();
                    $(this).autocomplete("search", this.value);
                },
                open: function(e, ui) {

                    // Appends a div at the end, containing the link to open myModal
                    // $('.ui-autocomplete').append("<div id='endtext'><a href='#' data-toggle='modal' data-target='#myModal'>Click here to display my modal</a></div>");

                }
            }).data("ui-autocomplete")._renderItem = function(ul, item) {
                if (!settings.isSourceObject) {
                    if (item.isPlaceholder) {
                        return $("<li class='helper'>").click(settings.callback)
                            .data("item.autocomplete", item)
                            .append(settings.addText + " <b>\"" + item.label + "\"</b>")
                            .appendTo(ul);

                    } else {
                        return $("<li>")
                            .attr("data-value", item.label)
                            .append(item.value)
                            .appendTo(ul);
                    }
                } else {
                    //console.log(item)
                    if (item.isPlaceholder != undefined && item.isPlaceholder == true) {
                        return $("<li class='helper'>").click(settings.callback)
                            .data("item.autocomplete", item)
                            .append(settings.addText + " <b>\"" + item.value + "\"</b>")
                            .appendTo(ul);

                    } else {
                        return $("<li>")
                            .attr("data-value", item.label)
                            .append(item.value)
                            .appendTo(ul);
                    }
                }
            }


        }).keypress(function(e) {
            if (e.which == 13) {
                //console.log('You pressed enter!');
                //ajax call
                settings.callback();
                //settings.source.push($(this).val());
                //append to js array
                e.preventDefault();

            }
        }).addClass("")//.after("<button type='button' class='input-sidedrop-arrow flex-col--2 button-attach'></button>")
        .bind('autocompleteopen', function (event, ui) {
            $(this).data('is_open', true);
        }).bind('autocompleteclose', function (event, ui) {
            $(this).data('is_open', false);
        }).parents("div:eq(0)").addClass("relative");
        //$(".input-sidedrop-arrow").off('click').click(function () {
        //    if (!$(this).prev().data('is_open')) {
        //        $(this).prev().autocomplete("search");
        //    } else
        //        $(this).prev().autocomplete("close");
        //})
    }

}(jQuery));