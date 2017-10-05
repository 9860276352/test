var mediaService = function () {
    var removeFile = function (param, successCallback, errorfx) {
        $.ajax({
            type: "POST",
            async: false,
            url: "/api/v1/image/remove",
            data: "=" + param,
            success: successCallback,
            error: errorfx
        });
    }
    return {
        //upload:uploadFile,
        remove: removeFile
    }
}();
var _serializeArray = $.fn.serializeArray;

//Now extend it with newer "unchecked checkbox" functionality:
$.fn.extend({
    serializeArray: function () {
        //Important: Get the results as you normally would...
        var results = _serializeArray.call(this);

        //Now, find all the checkboxes and append their "checked" state to the results.
        this.find('input[type=checkbox]').each(function (id, item) {
            var $item = $(item);
            results.push({ name: $item.attr('name'), value: $item.is(":checked") });
        });
        return results;
    }
});
var myDropzone;
function FormBuilder(options) {
    var _self = this;
    this.successToast = function (msg) {
        $.toast({
            heading: "Success",
            text: "Data saved successfully!",
            position: 'bottom-right',
            stack: false,
            bgColor: '#80A001',
            allowToastClose: false,
            loader: true, // Change it to false to disable loader
            loaderBg: '#9EC600' // To change the background

        });
    };
    this.errorToast = function (msg) {
        $.toast({
            heading: 'Error',
            text: 'Something went wrong :(',
            showHideTransition: 'fade',
            position: 'bottom-right',
            stack: false,
            icon: 'error'
        });
    };
    this.ajaxCall = function (url, param, successFx, error) {
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            async: false,
            url: "/api/v1/crud/" + this.forms.grid.options.model + "/" + url,
            data: JSON.stringify(param),
            dataType: "json",
            success: successFx,
            error: error
        });
    };

    this.defaults = {
        renderAt: null,//this element hold the container
        container: $("<div class='col-lg-12'></div>"),
        header: $("<div class='header'></div>"),
        headerTitle: $("<h2></h2>"),
        headerActionBar: "",// $("<ul class='header-dropdown m-r--5'><li class='dropdown'><a href='javascript:void(0);' class='dropdown-toggle' data-toggle='dropdown' role='button' aria-haspopup='true' aria-expanded='false'><i class='material-icons'>more_vert</i></a></li></ul>"),
        headerActions: [],
        wrapper: $("<div class='body'></div>"),
        showVertical: true,
        showHorizontal: false,
        makeColumn: 1,
        verticalClass: "",
        horizontalClass: "",
        grid: null,
        fields: [],
        save: function () {

        },
        cancel: function () {

        },
        create: function () {

        },
        detail: function () {

        }
    };

    this.forms = $.extend(this.defaults, options);

    this.forms.formId = "form-" + Math.floor(Date.now() / 100);

    String.format = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            if (arguments[i + 1] == undefined)
                s = s.replace(reg, "");
            else
                s = s.replace(reg, arguments[i + 1]);
        }
        return s;
    };

    this.vertical = {
        image: function (name, uploadUrl, className) {
            return String.format("<div class='imageuploader dropzone needsclick dz-clickable'><div class='dz-message'><h3>Drop files here or click to upload.</h3></div><div class='fallback'><input name='file' type='file' class='{0}'  multiple /> </div></div><input type='hidden' name='{1}' value='' />", className, name);
        },
        price: function (name, value, validation) {
            if (typeof (_self.forms.grid.options.productSetting) == "undefined") {
                return String.format("<span class='input-group'><span class='input-group-addon currency'>$</span><input type='text'  name='{0}' class='form-control'  value='{1}' {2} /></span> ", name, value, validation);
            } else {
                return String.format("<span class='input-group'><span class='input-group-addon currency'>" + _self.forms.grid.options.productSetting.ProductDefaultCurrency + "</span><input type='text'  name='{0}' class='form-control'  value='{1}' {2} /></span> ", name, value, validation);

            }
        },
        editor: function (name, value, validation) {
            return String.format("<textarea  name='{0}' class='form-control editor'  value='{1}' {2} ></textarea> ", name, value, validation);

        },
        tags: function (name, values, validation) {
            return String.format("<input type='text' data-role='tagsinput' name='{0}' class='form-control tags'  value='{1}' {2} /> ", name, values, validation);
        },
        textarea: function (name, value, validation) {
            return String.format("<textarea  name='{0}' class='form-control'  value='{1}' {2} ></textarea> ", name, value, validation);

        },
        buttonWrapper: function (buttons) {
            return String.format("<div class='row clearfix'><div class='pull-right'>{0}</div></div>", buttons);
        },
        div: function (content) {
            return String.format("<div class='form-group '>{0}</div>", content);
        },
        inputWrapper: function (input) {

            return String.format("<div class='form-line'>{0}</div>", input);
        },
        textbox: function (type, label, name, value, validation) {
            return String.format("<input type='{0}' name='{1}' class='form-control' placeholder='Enter {2}' value='{3}' {4} /> ", type, name, label, value, validation);
        },
        hidden: function (name, value, isprimary) {
            return String.format("<input type='hidden' name='{0}' value='{1}' primary={2} /> ", name, value, isprimary);
        },
        button: function (type, name, className, text, command) {
            return String.format("<button type='{0}' name='{1}' class='btn {2}' command='{4}' >{3}</button> ", type, name, className, text, command);
        },
        checkbox: function (name, className, ischecked) {
            if (ischecked)
                return String.format("<input  class='filled-in {0}' type='checkbox' name='{1}' checked='checked' /> ", className, name);
            else
                return String.format("<input  class='filled-in {0}' name='{1}' type='checkbox' /> ", className, name);

        },
        label: function (text) {
            return String.format(" <label >{0}</label> ", text);
        },
        select: function (name, options, select) {
            var optionsmarkup = "";
            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                if (i == 0)
                    optionsmarkup += "<option value='0'>Please Select</option>";

                if (select == option.Id)
                    optionsmarkup += "<option selected='selected' value='" + option.Id + "'>" + option.Value + "</option>";
                else
                    optionsmarkup += "<option value='" + option.Id + "'>" + option.Value + "</option>";
            }
            return String.format(" <select name={0} >{1}</select> ", name, optionsmarkup);
        },
        radio: function (name, ischecked) {
            if (ischecked)
                return String.format("<input  name='{0}' type='radio' checked='checked'> ", name);
            else
                return String.format("<input  name='{0}' type='radio'> ", name);

        },
        toggleSwitch: function () { },
        datepicker: function (type, name, value) {
            return String.format("<input type='date' name='{1}' class='datepicker form-control'  value='{2}' /> ", type, name, value);
        }

    };

    this.horizontal = {
        image: function (name, uploadUrl, className) {
            return String.format("<div class='imageuploader dropzone needsclick dz-clickable'><div class='dz-message'><h3>Drop files here or click to upload.</h3></div><div class='fallback'><input name='file' type='file' class='{0}'  multiple /></div></div><input type='hidden' name='{1}' value='' />", className, name);
        },
        price: function (name, value, validation) {

            if (typeof (_self.forms.grid.options.productSetting) == "undefined") {
                return String.format("<span class='input-group'><span class='input-group-addon currency'>$</span><input type='text'  name='{0}' class='form-control'  value='{1}' {2} /></span> ", name, value, validation);
            } else {
                return String.format("<span class='input-group'><span class='input-group-addon currency'>" + _self.forms.grid.options.productSetting.ProductDefaultCurrency + "</span><input type='text'  name='{0}' class='form-control'  value='{1}' {2} /></span> ", name, value, validation);

            }
        },
        editor: function (name, value, validation) {
            return String.format("<textarea  name='{0}' class='form-control editor'  value='{1}' {2} ></textarea> ", name, value, validation);

        },
        tags: function (name, values, validation) {
            return String.format("<input type='text' data-role='tagsinput' name='{0}' class='form-control tags'  value='{1}' {2} /> ", name, values, validation);
        },
        textarea: function (name, value, validation) {
            return String.format("<textarea  name='{0}' class='form-control'  value='{1}' {2} ></textarea> ", name, value, validation);

        },
        buttonWrapper: function (buttons) {
            return String.format("<div class='row clearfix'><div class='pull-right'>{0}</div></div>", buttons);
        },
        inputWrapper: function (content, islabel) {
            if (islabel)
                return String.format("<div class='control-label col-sm-3' >{0}</div>", content);
            else
                return String.format("<div class='col-md-9'>{0}</div>", content);
        },
        div: function (content) {
            return String.format("<div class='form-group row'>{0}</div>", content);
        },
        inputLine: function (input) {

            return String.format("<div class='form-line'>{0}</div>", input);
        },
        // textbox: function (type, name, value, validation) {
        //     return String.format("<input type='{0}' name='{1}' class='form-control' placeholder='Enter {1}' value='{2}' {3} /> ", type, name, value, validation);
        // },
        textbox: function (type, label, name, value, validation) {
            return String.format("<input type='{0}' name='{1}' class='form-control' placeholder='Enter {2}' value='{3}' {4} /> ", type, name, label, value, validation);
        },
        hidden: function (name, value, isprimary) {
            return String.format("<input type='hidden' name='{0}' value='{1}' primary={2} /> ", name, value, isprimary);
        },

        button: function (type, name, className, text, command) {
            return String.format("<button type='{0}' name='{1}' class='btn {2}' command='{4}'>{3}</button> ", type, name, className, text, command);
        },
        checkbox: function (name, className, ischecked) {
            if (ischecked)
                return String.format("<input  class='filled-in {0}' type='checkbox' name='{1}' checked='checked'> ", className, name);
            else
                return String.format("<input  class='filled-in {0}' name='{1}' type='checkbox'> ", className, name);

        },
        label: function (text) {
            return String.format(" <label >{0}</label> ", text);
        },
        select: function (name, options, select) {
            var optionsmarkup = "";
            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                if (i == 0)
                optionsmarkup += "<option value='0'>Please Select</option>";

                if (select == option.Id)
                    optionsmarkup += "<option selected='selected' value='" + option.Id + "'>" + option.Value + "</option>";
                else
                    optionsmarkup += "<option value='" + option.Id + "'>" + option.Value + "</option>";
            }
            return String.format(" <select class='selectpicker' name={0} >{1}</select> ", name, optionsmarkup);
        },
        radio: function (name, ischecked) {
            if (ischecked)
                return String.format("<input  name='{0}' type='radio' checked='checked'> ", name);
            else
                return String.format("<input  name='{0}' type='radio'> ", name);

        },
        toggleSwitch: function () { },
        datepicker: function (type, name, value) {
            return String.format("<input type='date' name='{1}' class='datepicker form-control'  value='{2}' /> ", type, name, value);
        }
    };

    this.vforminputmaker = function (type, label, name, value, validation, className, selectedVal, isprimary) {

        var lbl = this.vertical.label(label);
        var input = "";
        switch (type) {

            case "image":
                input = this.vertical.image(name, "", "");
            case "price":
                input = this.vertical.price(name, "", "");
                break;
            case "hidden":
                input = this.vertical.hidden(name, value, isprimary);
                break;
            case "editor":
                input = this.vertical.editor(name, value, validation);
                break;
            case "tags":
                input = this.vertical.tags(name, value, validation);
                break;
            case "textarea":
                input = this.vertical.textarea(name, value, validation);
                break;
            case "text":
                input = this.vertical.textbox(type, label, name, value, validation);
                break;
            case "button":
                input = this.vertical.button("button", className, value);
                break;
            case "submit":
                input = this.vertical.button("submit", className, value);
                break;
            case "radio":
                input = this.vertical.radio(name, value);
                break;
            case "checkbox":
                input = this.vertical.checkbox(name, className, value);
                break;
            case "select":
                input = this.vertical.select(name, value, selectedVal);
                break;
            case "datepicker":
                input = this.vertical.datepicker("datepicker", name, value);
                break;
            case "toggleswitch":
                input = this.vertical.toggleSwitch();
                break;
            default:
                input = this.vertical.textbox(type, label, name, value);
        };
        if (type == "checkbox" || type == "radio") {
            //var txboxwrapper =  this.vertical.inputWrapper(input);
            var formdiv = this.vertical.div(input);
            return lbl + formdiv;
        } else if (type == "hidden") {
            var formdiv = this.vertical.div(input);
            return formdiv;
        } else {
            // var txboxwrapper =  this.vertical.inputWrapper(input);
            var formdiv = this.vertical.div(lbl + input);
            return formdiv;
        }
    };

    this.hforminputmaker = function (type, label, name, value, validation, className, selectedVal, isprimary) {

        var lbl = this.horizontal.label(label);
        var input = "";
        switch (type) {
            case "hidden":
                input = this.horizontal.hidden(name, value, isprimary);
                break;
            case "price":
                input = this.horizontal.price(name, "", "");
                break;
            case "image":
                input = this.horizontal.image(name, "", "");
                break;
            case "editor":
                input = this.horizontal.editor(name, value, validation);
                break;
            case "tags":
                input = this.horizontal.tags(name, value, validation);
                break;
            case "textarea":
                input = this.horizontal.textarea(name, value, validation);
                break;
            case "text":
                input = this.horizontal.textbox(type, label, name, value, validation);
                break;
            case "button":
                input = this.horizontal.button("button", className, value);
                break;
            case "submit":
                input = this.horizontal.button("submit", className, value);
                break;
            case "radio":
                input = this.horizontal.radio(name, value);
                break;
            case "checkbox":
                input = this.horizontal.checkbox(name, className, value);
                break;
            case "select":
                input = this.horizontal.select(name, value, selectedVal);
                break;
            case "datepicker":
                input = this.horizontal.datepicker("datepicker", name, value);
                break;
            case "toggleswitch":
                input = this.horizontal.toggleSwitch();
                break;
            default:
                input = this.horizontal.textbox(type, label, name, value);
        };
        // var line =  this.horizontal.inputLine(input);
        //wrapping with form group
        // var formdiv =  this.horizontal.div(input);
        //giving class for position
        var txboxwrapper = this.horizontal.inputWrapper(input, false);
        if (type == "hidden") {
            var lblWrapper = this.horizontal.inputWrapper("", true);
            var formdiv = this.horizontal.div(lblWrapper + txboxwrapper);
            // return "<div class='row clearfix'>" + lblWrapper + txboxwrapper + "</div>";
            return formdiv;
        } else {
            var lblWrapper = this.horizontal.inputWrapper(lbl, true);
            var formdiv = this.horizontal.div(lblWrapper + txboxwrapper);
            // return "<div class='row clearfix'>" + lblWrapper + txboxwrapper + "</div>";
            return formdiv;
        }
    };

    this.columMaker = function (fb) {
        var counter = fb.forms.makeColumn;
        var className = "col-md-" + 12 / fb.forms.makeColumn;
        var setRoom = function (input) {
            var html = "";
            if (counter == fb.forms.makeColumn) {
                html += "<div class='row'>";
            }
            html += "<div class=" + className + ">";
            html += input;
            html += "</div>";
            counter--;
            if (counter == 0) {
                html += "</div>";
                counter = fb.forms.makeColumn;

            }
            return html;
        };
        var isAlterFields = function (datafieldCount) {

            return !datafieldCount % fb.forms.makeColumn == 0;
        }
        return {
            isAlter: isAlterFields,
            counter: counter,
            allocate: setRoom
        }
    }(this);

    this.validationBuilder = function () {
        var addValidation = function (formName, rules) {
            var fValidator = $('form[name=' + formName + ']').validate({
                //rules: {
                //    'date': {
                //        customdate: true
                //    },
                //    'creditcard': {
                //        creditcard: true
                //    }
                //},
                ignore: ":hidden",
                rules: rules,
                highlight: function (input) {
                    //for horizontal form
                    $(input).parents('.form-group:eq(0)').addClass('has-error');
                    //for vertical form
                    // $(input).parents('div:eq(0)').addClass('has-error');
                },
                unhighlight: function (input) {
                    // if()
                    $(input).parents('.form-group:eq(0)').removeClass('has-error');
                    // $(input).parents('div:eq(0)').removeClass('has-error');
                },
                errorPlacement: function (error, element) {
                    $(element).parents('div:eq(0)').append(error);
                }
            });
            return fValidator;
        };
        var makeRule = function (name, rules) {
            var rule = "";
            rule[name] = rules;
            return rule;
        };
        return {
            add: addValidation,
            createRule: makeRule
        };
    }();

    this.registerEvents = function () {

        var formBuilder = this;


        $(this.forms.renderAt).find("button[command=save]").off("click").on("click", function () {
            //console.log("save button fired");
            //formBuilder.save( this);
            FormBuilder.prototype.save.call(formBuilder, this);

            return false;
        });

        $(this.forms.renderAt).find("button[command=cancel]").off("click").on("click", function () {
            //console.log("cancel button fired");
            formBuilder.cancel(this);
        });
        Dropzone.autoDiscover = false;
        if ($(".imageuploader").length > 0) {
            myDropzone = new Dropzone("div.imageuploader", {
                addRemoveLinks: true,
                maxFiles: 1,
                url: "/imageresizer"
            });
            myDropzone.on("maxfilesexceeded", function (file) {
                //alert("No more files!");
                this.removeAllFiles();
                this.addFile(file);
            });
            myDropzone.preload = function (files) {
                var x = files.split(',');
                $.each(x, function (index, item) {
                    var file = {
                        name: item,
                        status: Dropzone.ADDED,
                        accepted: true,
                        serverpath: item
                    };
                    myDropzone.emit("addedfile", file);
                    myDropzone.emit("thumbnail", file, item);
                    myDropzone.emit("complete", file);
                    myDropzone.files.push(file);
                    $(".dz-image").find('img').width(120);
                });
            };
            
            myDropzone.on("sending", function (file, xhr, formData) {
                formData.append("name", "akshay");
            });
            myDropzone.on("removedfile", function (file, done) {
                //myDropzone.removeFile(file);
                console.log(file.serverpath)
                mediaService.remove(file.serverpath, function (response) {

                }, null);
            });
            myDropzone.on("accept", function (file, done) {
                if (file.name == "justinbieber.jpg") {
                    done("Naha, you don't.");
                } else {
                    done();
                }
            });
            myDropzone.on('resetFiles', function () {
                if (this.files.length != 0) {
                    for (i = 0; i < this.files.length; i++) {
                        this.files[i].previewElement.remove();
                    }
                    this.files.length = 0;
                }
            });
            myDropzone.on("success", function (file, response) {
                var imgName = response;
                console.log(file)
                ///$(file.previewElement).find(".dz-success-mark").remove();
                //$(file.previewElement).find(".dz-error-mark").remove();
                file.serverpath = response.url;
                //file.serverpath = response.Data;
                file.previewElement.classList.add("dz-success");
                console.log($(file.previewElement).parents("div[class^=col]:eq(0)"));
                $(file.previewElement).parents("div[class^=col]:eq(0)").find("input:hidden").val(response.url);

                //file.previewElement.addEventListener("click", function () {
                //    imguploader.removeFile(file);
                //});
                // }
            });
            var preloadImage = function (files) {
                var x = files.split(',');
                $.each(x, function (index, item) {

                    var file = {
                        name: item,
                        status: Dropzone.ADDED,
                        accepted: true
                    };
                    myDropzone.emit("addedfile", file);
                    myDropzone.emit("thumbnail", file,  item);
                    myDropzone.emit("complete", file);
                    myDropzone.files.push(file);
                    $(".dz-image").find('img').width(120);
                });
            };
        }
        //var imguploader=$(".imageuploader").dropzone({
        //    url: "/api/v1/media/upload",
        //    paramName: "file", // The name that will be used to transfer the file
        //    maxFilesize: 2, // MB
        //    //autoProcessQueue: false ,//auto submit false
        //    addRemoveLinks: true,
        //    sending: function(file, xhr, formData) {
        //        formData.append("ping", "pong");
        //    },
        //    accept: function(file, done) {
        //        console.log(file, done)
        //        if (file.name == "justinbieber.jpg") {
        //            done("Naha, you don't.");
        //        } else {
        //            done();
        //        }
        //    },
        //    //removedfile: function (file,flag) {
        //    //    console.log(file);
        //    //    if (flag == undefined) {
        //    //        this.removeFile(file, 1);
        //    //    }
        //    //},
        //    success: function (file, response) {
        //        var imgName = response;
        //        console.log(file)
        //        ///$(file.previewElement).find(".dz-success-mark").remove();
        //        //$(file.previewElement).find(".dz-error-mark").remove();
        //        if (response.Code == 200) {
        //            file.serverpath = response.Data;
        //            file.previewElement.classList.add("dz-success");
        //           // var btn = $("<button type='button'  data-dz-remove>remove</button>");
        //           // btn.data('fn', response.Data);
        //           // btn.data('file', file);
        //           // btn.click(function () {
        //           //     imguploader.removeFile($(this).data('file'))
        //           //     console.log(imguploader,1)
        //           // });
        //           //$(file.previewElement).append(btn);
        //            console.log($(file.previewElement).parents("div[class^=col]:eq(0)"));
        //            $(file.previewElement).parents("div[class^=col]:eq(0)").find("input:hidden").val(response.Data);
        //            console.log("Successfully uploaded :" + response.Data);
        //            //file.previewElement.addEventListener("click", function () {
        //            //    imguploader.removeFile(file);
        //            //});
        //        }
        //    },
        //    error: function (file, response) {
        //        file.previewElement.classList.add("dz-error");
        //    }

        //})

        //myDropzone.processQueue();  
        //initializing tinymce
        //  tinymce.init({ selector: '.editor' });
        tinymce.init({
            selector: ".editor",
            setup: function (editor) {
                editor.on('change', function () {
                    //console.log('editor change');
                    tinymce.triggerSave();
                });
            }
        });
        $(".datepicker").datepicker();
        $(".selectpicker").selectpicker();
        $(document).off("change",".selectpicker").on('change', '.selectpicker',function () {
            var selected = $(this).find("option:selected").val();
            $('.selectpicker').selectpicker('val', selected);
        });
        //tinymce.editors['form-14846340409-description'].getContent()
    }
}

FormBuilder.prototype.createForm = function (name, method, action, forms, className) {
    return String.format("<form name='{0}' method={1} action='{2}' class='{4}'>{3}</form>", name, method, action, forms, className);
};

FormBuilder.prototype.readMetaData = function () {
    return String.format("<form name='{0}' method={1} action='{2}' class='{4}'>{3}</form>", name, method, action, forms, className);
};

FormBuilder.prototype.findPrimaryKey = function () {
    var primaryKey;
    $.each(this.forms.grid.options.metadata, function (key, element) {
        // console.log('key: ' + key + '\n' + 'value: ' + element);
        $.each(element, function (key1, element) {
            // console.log('key: ' + key1 + '\n' + 'value: ' + element);
            if (key1 == "primary" && element == true) {
                primaryKey = key;
            }
        });
    });
    return primaryKey;
};

FormBuilder.prototype.createHorizontalForm = function () {
    var i = 1;
    var formfields = "";
    var ffields = this.forms.grid.reflectedFields;
    var fid = this.forms.formId;
    var metadatas = this.forms.grid.options.metadata;
    var validationrules = {};
    var primaryKey = FormBuilder.prototype.findPrimaryKey.call(this);
    for (var i = 0; i < ffields.length; i++) {

        //console.log(metadatas);
        //console.log(metadatas[ffields[i]]);
        var inputmedadata = metadatas[ffields[i]];
        var label = ffields[i];

        var lc_label = label.toLowerCase();
        //customized fields 
        var extendedlabel = inputmedadata.form_label == undefined ? label : inputmedadata.form_label;


        var inputname = fid + "-" + lc_label;
        if (!$.isEmptyObject(inputmedadata.rules))
            validationrules[inputname] = inputmedadata.rules;
        var intputdata = inputmedadata.data ? inputmedadata.data : "";//data for select or rbl
        if (primaryKey == label) {
            //console.log('primary')
            //type, label, name, value, validation, className, selectedVal,isprimary
            formfields += this.hforminputmaker("hidden", label, inputname, 0, "", "", "", 1);
            continue;
        }

        if (this.forms.makeColumn == 1) {
            var input = this.hforminputmaker(inputmedadata.input, extendedlabel, inputname, intputdata, "");
            formfields += input;
        } else {

            var input = this.hforminputmaker(inputmedadata.input, extendedlabel, inputname, intputdata, "");
            var x = this.columMaker.allocate(input);
            formfields += x;
            // console.log(x);
            this.columMaker.counter--;
            // console.log(columMaker.counter);
        }
    }

    var datafieldCount = ffields.length;
    if (this.columMaker.isAlter(datafieldCount)) {
        //closing form row div
        formfields += "</div>";
    }
    var btnsave = this.horizontal.button("submit", fid, "btn-primary waves-effect", "Save", 'save'); //forminputmaker("button", "save", "Save", "btn-primary");
    var btnCancel = this.horizontal.button("button", fid, "", "Cancel", 'cancel');
    var btns = this.horizontal.buttonWrapper(btnsave + btnCancel);
    var actionUrl = "/api/v1/crud/" + this.forms.grid.options.model + "/save";
    var form = this.createForm(fid, "post", actionUrl, formfields, 'form-horizontal');
    this.forms.wrapper.append(form);
    this.forms.wrapper.append(btns);
    this.forms.header.append(this.forms.headerTitle);
    //this.forms.headerActionBar.find("li:eq(0)").append("<ul class='dropdown-menu pull-right'><li><a class=' waves-effect waves-block' href='javascript:void(0);'>action one </a></li></ul>");
    this.forms.header.append(this.forms.headerActionBar);
    this.forms.container.append(this.forms.header);
    this.forms.container.append(this.forms.wrapper);
    // console.log(this.forms.container);
    $(this.forms.renderAt).append(this.forms.container);
    var fvalid = this.validationBuilder.add(fid, validationrules);
    $(this.forms.renderAt).find("button[command=save]").data('fv', fvalid);

};

FormBuilder.prototype.createVerticalForm = function () {
    var i = 1;
    var formfields = "";

    //console.log(this.forms.grid);
    var ffields = this.forms.grid.reflectedFields;
    var fid = this.forms.formId;
    var metadatas = this.forms.grid.options.metadata;
    var primaryKey = FormBuilder.prototype.findPrimaryKey.call(this);
    var validationrules = {};
    for (var i = 0; i < ffields.length; i++) {

        //console.log(metadatas);
        //console.log(metadatas[ffields[i]]);
        var inputmedadata = metadatas[ffields[i]];
        var label = ffields[i];
        var lc_label = label.toLowerCase();
        //customized fields 
        var extendedlabel = inputmedadata.form_label == undefined ? label : inputmedadata.form_label;


        var inputname = fid + "-" + lc_label;
        if (!$.isEmptyObject(inputmedadata.rules))
            validationrules[inputname] = inputmedadata.rules;
        var intputdata = inputmedadata.data ? inputmedadata.data : "";//data for select or rbl

        if (primaryKey == label) {
            //console.log('primary')
            //type, label, name, value, validation, className, selectedVal,isprimary
            formfields += this.vforminputmaker("hidden", label, inputname, 0, "", "", "", 1);
            continue;
        }

        //     var label=ffields[i].toLowerCase();
        //     var inputname = fid + "-" + label;
        //if (!$.isEmptyObject(inputmedadata.rules))
        //    validationrules[inputname] = inputmedadata.rules;
        if (this.forms.makeColumn == 1) {

            var input = this.vforminputmaker(inputmedadata.input, extendedlabel, inputname, intputdata, "");
            // var input = this.vforminputmaker("text", "heloo", "value", "required");
            //console.log(input)
            // forms.container.append(input);
            formfields += input;
        } else {

            var input = this.vforminputmaker(inputmedadata.input, extendedlabel, inputname, intputdata, "");
            // var input = this.vforminputmaker("text", "heloo", "value", "required");
            //console.log(input);
            var x = this.columMaker.allocate(input);
            formfields += x;
            // console.log(x);
            this.columMaker.counter--;

            // console.log(columMaker.counter);
        }
    }

    var datafieldCount = ffields.length;
    if (this.columMaker.isAlter(datafieldCount)) {
        //closing form row div
        formfields += "</div>";
    }
    var btnsave = this.vertical.button("submit", fid, "btn-primary waves-effect", "Save", 'save'); //forminputmaker("button", "save", "Save", "btn-primary");
    var btnCancel = this.vertical.button("button", fid, "", "Cancel", 'cancel');
    var btns = this.vertical.buttonWrapper(btnsave + btnCancel);
    var actionUrl = "/api/v1/crud/" + this.forms.grid.options.model + "/save";
    var form = this.createForm(fid, "post", actionUrl, formfields + btns);
    this.forms.wrapper.append(form);
    this.forms.header.append(this.forms.headerTitle);
    // this.forms.headerActionBar.find("li:eq(0)").append("<ul class='dropdown-menu pull-right'><li><a class=' waves-effect waves-block' href='javascript:void(0);'>action one </a></li></ul>");
    this.forms.header.append(this.forms.headerActionBar);
    this.forms.container.append(this.forms.header);
    this.forms.container.append(this.forms.wrapper);
    //console.log(this.forms.container);
    $(this.forms.renderAt).append(this.forms.container);
    //var rule = { 'heloo': { required: true } };
    //console.log(fid,validationrules);
    //consol.log()
    this.validationBuilder.add(fid, validationrules);
};

FormBuilder.prototype.renderForm = function () {
    console.log(this.forms.grid.options.metadata)
    if (this.forms.showVertical) {
        this.createVerticalForm();
    } else {
        this.createHorizontalForm();
    }
    this.registerEvents();

};

FormBuilder.prototype.clearForm = function (formName) {
    $("form[name=" + formName + "]").find("input").val("");
    $("form[name=" + formName + "]").find("input:hidden[primary=1]").val("0");
    $("form[name=" + formName + "]").find("select").val("0");
    $("form[name=" + formName + "]").find("input:checkbox,input:radio").prop("checked", false);
    $("form[name=" + formName + "]").find("textarea").val("");
    $("form[name=" + formName + "]").find('.selectpicker').selectpicker('val', 0);
    if (typeof (tinymce) != "undefined") {
        $.each(tinymce.editors, function (index, item) {
            item.setContent('');
        });
    }
    if (typeof ($.fn.tagsinput) == "function") {
        $('.tags').tagsinput('removeAll');
    }
    if (typeof (Dropzone) != "undefined") {
        $.each(Dropzone.instances, function (indx, dropzone) {
            dropzone.emit('resetFiles');
            dropzone.emit('reset');
        });
    }
    console.log('cleared');

};

FormBuilder.prototype.cancel = function (btn) {
    var fname = $(btn).prop('name');
    this.clearForm(fname);
    var validator = $("form[name=" + fname + "]").validate();
    validator.resetForm();
    var grd = this.forms.grid.containers;
    grd.formContainer.hide();
    grd.listContainer.show();
    grd.paginationContainer.show();

};

FormBuilder.prototype.save = function (button) {
    var fm = $(button).data('fv');
    var formName = $(button).prop('name');
    var fbuilder = this;
    if (fm.form()) {

        var model = {};

        $.each($('form[name=' + formName + ']').serializeArray(), function (_, kv) {
            var x = kv.name.replace(formName + '-', '');
            //if (model.hasOwnProperty(x)) {
            //    model[kv.name] = $.makeArray(model[x]);
            //} else {
            model[x] = kv.value;
            //}
        });
        this.ajaxCall("save", model, function (response) {
            if (response.Code == 200) {
                var grd = fbuilder.forms.grid.containers;
                grd.formContainer.hide();
                grd.listContainer.show();
                grd.paginationContainer.show();
                CrudGrid.prototype.refresh.call(fbuilder.forms.grid);
                fbuilder.successToast("");
            } else {
                console.log(response.Message);
               // alert(response.Message);
                fbuilder.errorToast();
            }

        }, function (error) {

        });

    } else {

    }


};

FormBuilder.prototype.execute = function (name) {
    var args = Array.prototype.slice.call(arguments, 1);
    //console.log(args);
    if (this[name])
        return this[name].apply(this, args);
    return false;
}