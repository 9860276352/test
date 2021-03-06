/**
 * form autofill (jQuery plugin)
 * Version: 0.1
 * Released: 2011-11-30
 * 
 * Copyright (c) 2011 Creative Area
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Require jQuery
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function ($) {
    $.fn.extend({
        autofill: function (data, options) {
            var settings = {
                findbyname: true,
                restrict: true
            },
				self = this;

            if (options) {
                $.extend(settings, options);
            }

            return this.each(function () {
                $.each(data, function (k, v) {

                    // switch case findbyname / findbyid

                    var selector, elt;

                    if (settings.findbyname) { // by name

                        selector = '[name="' + k + '"]';
                        elt = (settings.restrict) ? self.find(selector) : $(selector);
                        //console.log(elt, [v])
                        if (elt.prop("type") == "textarea") {
                            // console.log(k)
                            if (typeof (tinymce) != "undefined") {
                                if (tinymce.editors[k] == undefined)
                                    elt.val([v]);
                                else
                                    tinymce.editors[k].setContent(v);
                            }

                        }

                        if (elt.prop("type") == "hidden") {
                            alert(1)
                            if (v.indexOf('/imageresizer/') > -1) {
                                //preload image 
                                if (typeof (Dropzone) != "undefined") {
                                    $.each(Dropzone.instances, function(indx, dropzone) {
                                        dropzone.emit('preload', v);

                                    });
                                }
                            }
                        }
                        if (elt.length == 1) {
                            elt.val((elt.attr("type") == "checkbox") ? [v] : v);
                            if (v == true) {
                                elt.prop('checked', 'checked');
                            } else {
                                elt.removeAttr('checked');
                            }
                        } else if (elt.length > 1) {
                            // radio
                            elt.val([v]);
                            if (v == true) {
                                elt.prop('checked', 'checked');
                            } else {
                                elt.removeAttr('checked');
                            }
                        } else {
                            selector = '[name="' + k + '[]"]';
                            elt = (settings.restrict) ? self.find(selector) : $(selector);
                            elt.each(function () {
                                $(this).val(v);
                                if (v == true) {
                                    $(this).prop('checked', 'checked');
                                } else {
                                    $(this).removeAttr('checked');
                                }
                            });
                        }

                    } else { // by id

                        selector = '#' + k;
                        elt = (settings.restrict) ? self.find(selector) : $(selector);

                        if (elt.length == 1) {
                            elt.val((elt.attr("type") == "checkbox") ? [v] : v);
                            if (v == true) {
                                elt.prop('checked', 'checked');
                            } else {
                                elt.removeAttr('checked');
                            }
                        } else {
                            var radiofound = false;

                            // radio
                            elt = (settings.restrict) ? self.find('input:radio[name="' + k + '"]') : $('input:radio[name="' + k + '"]');
                            elt.each(function () {
                                radiofound = true;
                                if (this.value == v) { this.checked = true; }
                            });
                            // multi checkbox
                            if (!radiofound) {
                                elt = (settings.restrict) ? self.find('input:checkbox[name="' + k + '[]"]') : $('input:checkbox[name="' + k + '[]"]');
                                elt.each(function () {
                                    $(this).val(v);
                                    if (v == true) {
                                        $(this).prop('checked', 'checked');
                                    } else {
                                        $(this).removeAttr('checked');
                                    }
                                });
                            }
                        }
                    }
                });
            });
        }
    });
})(jQuery);