function CrudGrid(options) {
    this.successToast = function (msg) {
        $.toast({
            heading: "Success",
            text: "Data deleted successfully!",
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
            url: "/api/v1/crud/" + this.options.model + "/" + url,
            data: JSON.stringify(param),
            dataType: "json",
            success: successFx,
            error: error
        });
    };
    this.defaults = {
        enableForm: false,
        showAddNewButton: false,
        showeditButton: true,
        showdeleteButton: true,
        enableActionBar: true,
        fields: [{ name: "Account", title: '', type: 'text', align: '' }],
        hideColumns: ['isDeleted'],
        endpoint: '',
        searchBox: '.searchBox',
        model: '',
        tblClass: 'table table-bordered table-striped table-hover dataTable',
        rowClass: '',
        tdClass: '',
        showAction: true,
        actions: {
            edititem: {
                text: 'edit',
                command: 'edit',
                icon: 'fa fa-edit',
                className: '',
                callback: $.noop
            },
            deleteitem: {
                text: 'delete',
                command: 'delete',
                icon: 'fa fa-trash',
                className: '',
                callback: $.noop
            }

        },
        events: {
            ondelete: null,
            onedit: null,
            onnew: null,
            onpaginate: null
        },
        pagination: {
            total: 0,
            page: 1,
            maxVisible: 10,
            leaps: true,
            href: 'javascript:void(0);',
            hrefVariable: '{{number}}',
            next: 'Next',
            prev: 'Prev',
            firstLastUse: false,
            first: '<span aria-hidden="true">&larr;</span>',
            last: '<span aria-hidden="true">&rarr;</span>',
            wrapClass: 'pagination',
            activeClass: 'active',
            disabledClass: 'disabled',
            nextClass: 'next',
            prevClass: 'prev',
            lastClass: 'last',
            firstClass: 'first'
        },
        metadata: {
           
        },
        containers: {}
    };
    this.options = $.extend(true, this.defaults, options);

    // this.fields = [];//removed
    this.displayFields = [];
    this.rowdata = [];
    this.rowtotal = 1;
    this.gridElem;
    this.containers = this.options.containers;
    // {
    //     listContainer:null,
    //     formContainer:null,
    //     paginationContainer:null,
    // }
    this._currentpage = 1;

    this.registerEvents = function () {
        this.initPagination(1);
        var grid = this.gridElem;
        var crudGrid = this;
        console.log(crudGrid);
        $(document).off("change", "#" + this.containers.itemperpage[0].id).on("change", "#" + this.containers.itemperpage[0].id, function () {

            //crudGrid.refresh();
            var search = crudGrid.options.searchBox.val();
            crudGrid.reload(crudGrid, 1, this.value, search, "");
            //crudGrid.paginate(crudGrid, grid);
        });

        function hideActionBar() {
            $(".actionbar button").hide();
        }
        function showActionBar() {
            $(".actionbar button").show();
        }

        $(document).off("click", ".actionbar li").on("click", ".actionbar li", function () {
            var array = [];
            $(this).parents("div:eq(2)").find('table:eq(0)').find("input:checkbox.itemCheckbox:checked").each(function (x, i) {
                array.push(i.value);
            });
            crudGrid.actionbarDelete.call(crudGrid, array.join(','));
            $(this).parents("div:eq(2)").find('table:eq(0)').find("input:checkbox.headerCheckbox").prop('checked', false);
        });

        $(document).off("change", "input:checkbox.headerCheckbox").on("change", "input:checkbox.headerCheckbox", function () {

            if ($(this).is(":checked")) {
                $(this).parents('table:eq(0)').find("input:checkbox.itemCheckbox").prop('checked', true);
                if ($(this).parents('table:eq(0)').find("input:checkbox.itemCheckbox").length > 0)
                    showActionBar();
            } else {
                $(this).parents('table:eq(0)').find("input:checkbox.itemCheckbox").prop('checked', false);
                hideActionBar();
            }
        });
        $(document).off("change", "input:checkbox.itemCheckbox").on("change", "input:checkbox.itemCheckbox", function () {

            var totalcheckbox = $(this).parents('table:eq(0)').find("input:checkbox.itemCheckbox").length;
            var totalCheckedcheckbox = $(this).parents('table:eq(0)').find("input:checkbox.itemCheckbox:checked").length;
            if (totalcheckbox == totalCheckedcheckbox) {
                $(this).parents('table:eq(0)').find("input:checkbox.headerCheckbox").prop('checked', true);
            } else {

                $(this).parents('table:eq(0)').find("input:checkbox.headerCheckbox").prop('checked', false);
            }
            if ($(this).is(":checked"))
                showActionBar();
            if (totalCheckedcheckbox == 0)
                hideActionBar();
        });
        //$(document).off("click", "td a[command=edit]").on("click", "td a[command=edit]", function () {
        //    //console.log("edit button fired");
        //    var grid = $(this).parents("table:eq(0)").data('grid');
        //    grid.onEdit(this);

        //});

        //$(document).off("click", "td a[command=delete]").on("click", "td a[command=delete]", function () {
        //    //console.log("delete button fired");
        //    var grid = $(this).parents("table:eq(0)").data('grid');
        //    grid.onDelete(crudGrid, this);
        //});

        $.each(crudGrid.options.actions, function (index, item) {
            if (item.command == 'edit') {
                $(document).off("click", "td a[command=edit]").on("click", "td a[command=edit]", function () {
                    //console.log("edit button fired");
                    var grid = $(this).parents("table:eq(0)").data('grid');
                    grid.onEdit(this);

                });
            }
            else if (item.command == 'delete') {
                $(document).off("click", "td a[command=delete]").on("click", "td a[command=delete]", function () {
                    //console.log("delete button fired");
                    var grid = $(this).parents("table:eq(0)").data('grid');
                    grid.onDelete(crudGrid, this);
                });
            } else {
                $(document).off("click", "td a[command=" + item.command + "]").on("click", "td a[command=" + item.command + "]", function () {
                    //console.log("delete button fired");
                    var row = $(this).parents("tr:eq(0)").data('item');
                    item.callback(row);
                });
            }
        });

        $(grid).parents(".body:eq(0)").find("button[command=new]").off("click").on("click", function () {
            //console.log("new button fired");
            var grid = $(this).parents("div:eq(2)").find("table:eq(0)").data('grid');
            grid.new(this);

        });

        $(grid).parents(".body:eq(0)").find(" button[command=search]").off("click").on("click", function () {
            //console.log("search button fired");
            crudGrid.search(crudGrid);
        });
        crudGrid.options.searchBox.keyup(function (e) {
            if (e.keyCode == 8) {
                if ($(this).val() == "") {

                    crudGrid.search(crudGrid);
                }
            }
            if (e.keyCode == 48) {
                if ($(this).val() == "") {

                    crudGrid.search(crudGrid);
                }
            }
            if (e.keyCode == 13) {
                crudGrid.search(crudGrid);
            }
        });
    };


}

var reflector = function (obj) {

    this.getProperties = function () {
        var properties = [];
        for (var prop in obj) {
            if (typeof obj[prop] != 'function') {
                properties.push(prop);
            }
        }
        return properties;
    };
    this.getAllMethods = function () {
        var methods = [];
        for (var method in obj) {
            if (typeof obj[method] == 'function') {
                methods.push(method);
            }
        }
        return methods;
    };
    this.getOwnMethods = function () {
        var methods = [];
        for (var method in obj) {
            if (typeof obj[method] == 'function'
                && obj.hasOwnProperty(method)) {
                methods.push(method);
            }
        }
        return methods;
    };
};

CrudGrid.prototype.loadDependencies = function () {
    var dependecies = [];
    var metadata = this.options.metadata;

    $.each(metadata, function (key, element) {

        $.each(element, function (key1, value) {
            //console.log('key: ' + key1 + '\n' + 'value: ' + element);
            if (key1 == "isdependent" && value == true) {
                dependecies.push(key);
            }
        });
    });

    if (dependecies.length > 0) {
        this.ajaxCall("dependencies", {}, function (response) {

            //console.log(grid);
            if (response.Data.length > 0) {

                $.each(response.Data, function (index, items) {
                    var input = dependecies[index];
                    var meta = metadata[input];
                    meta.data = items;

                });

            } else {
            }
        }, function (error) {

        });
    }

};

CrudGrid.prototype.generateActionBar = function () {
    var actionBar = {
        ddnewbtn: $('<button type="button" class="btn  btn-lg  btn-primary btn-large  waves-effect"></button>'),
        searchTxtbox: $('<label>Search:<input class="form-control input-sm search" placeholder="" type="search"></label>'),
        barWrapper: $("<div class='dataTables_filter'></div>"),
        filterWrapper: $("<div class='col-md-2'></div>")
    }

};

CrudGrid.prototype.renderSearchBar = function () {
    var actionBar = '<div class="actionbar col-md-6 pull-left"><div class="btn-group">';
    actionBar += '<button style="display:none;" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Action <span class="caret"></span></button>';
    actionBar += '<ul class="dropdown-menu">';
    actionBar += '<li><a href="javascript:void(0);" command="action-delete">Delete</a></li>';
    //actionBar += '<li><a href="javascript:void(0)">Another action</a></li>';
    //actionBar += '<li><a href="javascript:void(0)">Something else here</a></li>';
    //actionBar += '<li role="separator" class="divider"></li>';
    //actionBar += '<li><a href="javascript:void(0)">Separated link</a></li>';
    actionBar += '</ul></div></div>';
    var searchBar = '<div class="searchbar navbar-form navbar-left col-md-6 pull-right" ><div class="form-group"><input type="text"  class="form-control searchBox"  placeholder="Search" class="searchbox"></div><button command="search" class="btn btn-default" type="button"><span class="fa  fa-search"></span></button>';
    if (this.options.enableForm || this.options.showAddNewButton)
        searchBar += '<button class="btn btn-primary" type="button" command="new"><span class="fa fa-plus"></span></button>';
    searchBar += '</div>';
    if (this.options.enableActionBar)
        $(actionBar + searchBar).insertBefore($(this.gridElem));
    else
        $(searchBar).insertBefore($(this.gridElem));
    this.options.searchBox = $(this.gridElem).prev('div').find(".searchBox");
};

CrudGrid.prototype.refresh = function () {
    var limit = this.containers.itemperpage.val();
    this._currentpage = 1;
    //var totalpage = Math.ceil(this.rowtotal / limit);
    //var ul = this.containers.paginationContainer;
    // $(ul).bootpag({ total: totalpage, page: 1, maxVisible: 10 });
    var search = this.options.searchBox.val();
    var grid = this;
    this.ajaxCall("list", { offset: 1, limit: limit, search: search, filter: '' }, function (response) {

        //console.log(grid);
        if (response.Code == 200) {
            if (response.Data.length > 0) {
                grid.rowdata = response.Data;
                grid.rowtotal = response.Data[0].RowTotal;
            } else {
                grid.rowdata = [];
                grid.rowtotal = 0;
            }
            grid.renderData();
        }
    }, function (error) {

    });
};

CrudGrid.prototype.reload = function (grid, offset, limit, search, filterby) {
    //console.log(offset, limit, search, filterby);
    //$ajaxCall
    this.ajaxCall("list", { offset: offset, limit: limit, search: search, filter: '' }, function (response) {

        if (response.Code == 200) {
            if (response.Data.length > 0) {
                grid.rowdata = response.Data;
                grid.rowtotal = response.Data[0].RowTotal;
            } else {
                grid.rowdata = [];
                grid.rowtotal = 0;
            }

            grid.renderData();
        }

    }, function (error) {

    });
};

CrudGrid.prototype.renderData = function () {

    this.renderRows.call(this);
    this.applyOddEven.call(this);
    this.paginate(this);
    $(this.gridElem).data('grid', this);


};

CrudGrid.prototype.renderGrid = function (el) {
    // var data = [];
    this.gridElem = el;

    //for (var i = 1; i < 5; i++) {
    //    this.rowdata.push({ id: i, productName: 'product ' + i, imagePath: 100 * i, IsActive: true, phoneNo: 123456, description: false });
    //}

    // CrudGrid.prototype.sayHello.call(this)
    var r = new reflector(this.options.metadata);
    this.reflectedFields = r.getProperties();
    // console.log(fields);
    var cols = [];

    for (var i = 0; i < this.reflectedFields.length; i++) {
        for (var z = 0; z < this.options.show.length; z++) {
            if (this.reflectedFields[i].toLowerCase() == this.options.show[z].toLowerCase()) {
                var coldef = { name: this.reflectedFields[i], metadata: this.options.metadata[this.reflectedFields[i]] };
                cols.push(coldef);
                break;
            }
        }
    }
    this.displayFields = cols;// this.options.fields;
    this.reload(this, 1, 10, "", "");
    this.loadDependencies();
    this.renderSearchBar();
    this.renderHeader.call(this);
    $(this.gridElem).addClass(this.options.tblClass);
    //console.log(this.options)
    this.registerEvents();

};

CrudGrid.prototype.renderCommands = function () {
    var commands = "";
    //edit
    commands += "<td >";
    //if (this.options.showeditButton)
    //    commands += "<a command='edit' class='command' href='javascript:void(0);'><i class='fa fa-edit'></i></a>";
    //delete
    //commands += "<a command='delete' class='command' href='javascript:void(0);'><i class='fa fa-trash'></i></a></td>";
    // this.options.actions.edit.text;
    var showedit = this.options.showeditButton;
    var showdelete = this.options.showdeleteButton;
    $.each(this.options.actions, function (index, item) {
        if (item.command == 'edit') {
            if (showedit) {
                commands += "<a command='edit' class='command' href='javascript:void(0);'><i class='" + item.icon + "'></i></a>";
            }
        } else if (item.command == 'delete') {
            if (showdelete) {
                commands += "<a command='delete' class='command' href='javascript:void(0);'><i class='fa fa-trash'></i></a>";
            }
        } else {

            commands += "<a command='" + item.command + "' class='" + item.className + "' href='javascript:void(0);'><i class='" + item.icon + "'></i></a>";
        }
        //text: 'edit',
        //command:'edit',
        //icon: 'icon-edit',
        //className: '',
        //callback: function () { }
    });
    commands += "</td >";
    return commands;
};

CrudGrid.prototype.renderHeader = function () {
    var header = [];

    //for (var i = 0; i < this.displayFields.length; i++) {
    //    var added = false;
    //    for (var z = 0; z < this.options.show.length; z++) {
    //        if (this.displayFields[i].toLowerCase() == this.options.show[z].toLowerCase()) {
    //            header.push(this.options.show[z]);
    //            added = true;
    //            break;
    //        }
    //    }
    //    if (!added) {
    //        header.push(this.displayFields[i]);
    //    }
    //}
    var thead = "<thead>";
    for (var i = 0; i < this.displayFields.length; i++) {
        ////if customized else as it is
        //if (this.displayFields[i].metadata.grid_header_title != undefined) {

        //    if (this.displayFields[i].metadata.grid_header_type != undefined) {
        //        var headertype = this.displayFields[i].metadata.grid_header_type;

        //    } else {
        //        thead += "<td>" + this.displayFields[i].metadata.grid_header_title + "</td>";
        //    }
        //} else {
        //    thead += "<td>" + this.displayFields[i].name + "</td>";
        //}
        thead += this.renderHeaderColumn(this.displayFields[i]);
    }
    if (this.options.showAction) {
        thead += "<td></td>";
    }
    thead += "</thead>";
    //TODO command button
    $(this.gridElem).find("thead").remove();
    $(this.gridElem).append(thead);
};


CrudGrid.prototype.renderRows = function () {
    $(this.gridElem).find("tbody").html("");
    if (this.rowdata.length == 0) {
        var colspan = parseInt(this.displayFields.length + 1);
        var tr = $("<tr>").append("<td colspan=" + colspan + ">No Record Founds</td>");
        if ($(this.gridElem).find("tbody").length > 0)
            $(this.gridElem).find("tbody").append(tr);
        else
            $(this.gridElem).append("<tbody>").append(tr);
        return;
    }
    for (var i = 0; i < this.rowdata.length; i++) {
        CrudGrid.prototype.renderRow.call(this, this.rowdata[i]);
        // _createRow(elem, rowdata[i]);
    }
};

CrudGrid.prototype.renderRow = function (data) {
    var row = data;
    var tds = CrudGrid.prototype.renderColumns.call(this, row);
    //TODO command button
    var tr = $("<tr>").append(tds).data('item', row);
    if ($(this.gridElem).find("tbody").length == 0)
        $(this.gridElem).append("<tbody>").append(tr);
    else
        $(this.gridElem).find("tbody").append(tr);
};

CrudGrid.prototype.renderColumns = function (row) {
    var tds = "";
    for (var i = 0; i < this.displayFields.length; i++) {
        //TODO::bind as its type image,checkbox hiden
        //console.log(row, row[this.displayFields[i].name])
        // tds += "<td>" + row[this.displayFields[i].name] + "</td>";
        var val = row[this.displayFields[i].name];
        tds += this.renderColumn(this.displayFields[i], val);
    }
    if (this.options.showAction) {
        tds += this.renderCommands();
    }
    return tds;
};

CrudGrid.prototype.renderHeaderColumn = function (columndef) {
    var td = "";
    var coltype = columndef.metadata.grid_header_type == undefined ? "text" : columndef.metadata.grid_header_type;
    var value = columndef.metadata.grid_header_title == undefined ? columndef.name : columndef.metadata.grid_header_title;
    switch (coltype) {
        case "text":
            td += "<td>" + value + "</td>";
            break;
        case "checkbox":
            td += "<td><input class='headerCheckbox' type='checkbox' value='" + value + "' /></td>";
            break;
        default:
            td += "<td>" + value + "</td>";
            break;
    }
    return td;

};
CrudGrid.prototype.renderColumn = function (columndef, value) {
    var td = "";
    var coltype = columndef.metadata.grid_header_type == undefined ? "text" : columndef.metadata.grid_header_type;
    switch (coltype) {
        case "text":
            td += "<td>" + value + "</td>";
            break;
        case "checkbox":
            td += "<td><input type='checkbox' class='itemCheckbox' value='" + value + "' /></td>";
            break;
        default:
    }
    return td;

};
CrudGrid.prototype.applyOddEven = function () {
    $(this.gridElem).find("tbody>tr:odd").addClass("odd");
    $(this.gridElem).find("tbody>tr:even").addClass("even");
};

CrudGrid.prototype.paginate = function (crudgrid, grid) {
    //var rowtotal = 5000;
    var limit = crudgrid.containers.itemperpage.val();
    var totalpage = Math.ceil(crudgrid.rowtotal / limit);
    var ul = crudgrid.containers.paginationContainer;
    $(ul).bootpag({ total: totalpage, page: crudgrid._currentpage, maxVisible: 10 }).addClass("pull-left");
    if (this.options.events.onpaginate != null) {
        this.options.events.onpaginate();
    }
    //var search = crudgrid.options.searchBox.val();
    // crudgrid.reload(crudgrid, 1, limit, search, "");
};

CrudGrid.prototype.initPagination = function (cp) {
    //var rowtotal = 5000;// data.[0].TotalRows;
    var limit = this.containers.itemperpage.val();
    var totalpage = Math.ceil(this.rowtotal / limit);
    // initPaging(totalpage, _currentpage);
    var ul = this.containers.paginationContainer;
    var crudGrid = this;
    $(ul).bootpag({ total: totalpage, page: cp, maxVisible: 10 }).on("page", function (pgevent, num) {
        crudGrid._currentpage = num;
        var limit = crudGrid.containers.itemperpage.val();
        var offset = (num * limit) - limit + 1;
        //event.reload(offset, limit, "", "");
        var search = crudGrid.options.searchBox.val();
        crudGrid.reload(crudGrid, offset, limit, search, "");
        // $(".content4").html("Page " + num); // or some ajax content loading...
    });
    if (this.options.events.onpaginate != null) {
        this.options.events.onpaginate();
    }
};

CrudGrid.prototype.save = function () {
    this.containers.formContainer.hide();
    this.containers.listContainer.show();
    this.containers.paginationContainer.show();
};

CrudGrid.prototype.findPrimaryKey = function () {
    var primaryKey;
    $.each(this.options.metadata, function (key, element) {
        $.each(element, function (key1, element) {
            //console.log('key: ' + key1 + '\n' + 'value: ' + element);
            if (key1 == "primary" && element == true) {
                primaryKey = key;
            }
        });
    });
    return primaryKey;
};

CrudGrid.prototype.onDelete = function (crudGrid, atag) {
    if (this.options.events.ondelete == null) {
        //console.log($(atag).parents("tr:eq(0)").data())
        if (confirm("Are you sure?")) {
            var primaryKey = CrudGrid.prototype.findPrimaryKey.call(crudGrid);
            var row = $(atag).parents("tr:eq(0)").data('item');
            crudGrid.containers.formContainer.hide();
            crudGrid.ajaxCall("delete", { id: row[primaryKey] }, function (response) {
                var limit = crudGrid.containers.itemperpage.val();
                var search = crudGrid.options.searchBox.val("");
                crudGrid.reload(crudGrid, 1, limit, "", "");
                crudGrid.successToast();

            }, function (error) {
                crudGrid.errorToast();
            });
        }
    } else {
        this.options.events.ondelete(atag);
    }
};
CrudGrid.prototype.actionbarDelete = function (ids) {
    //console.log($(atag).parents("tr:eq(0)").data())
    var cg = this;
    if (confirm("Are you sure?")) {

        this.ajaxCall("delete", { id: ids }, function (response) {
            var limit = cg.containers.itemperpage.val();
            var search = cg.options.searchBox.val("");
            cg.reload(cg, 1, limit, "", "");
            cg.successToast();
        }, function (error) {

        });
    }
};

CrudGrid.prototype.deleteSelected = function () {

};

CrudGrid.prototype.onClick = function () {

};

CrudGrid.prototype.createFormDataReady = function (detail) {

    var data = {};
    var formId = this.formBuilder.forms.formId;
    $.each(detail, function (_, kv) {
        // console.log(_,kv)
        var x = formId + '-' + _.toLowerCase();
        data[x] = kv;

    });
    return data;
};

CrudGrid.prototype.onEdit = function (atag) {
    if (this.options.events.onedit == null) {
        var row = $(atag).parents("tr:eq(0)").data('item');
        var model = CrudGrid.prototype.createFormDataReady.call(this, row);
        //console.log(model);
        //console.log(this.containers)
        $("form[name=" + this.formBuilder.forms.formId + "]").autofill(model);
        this.formBuilder.forms.headerTitle.text("edit " + this.options.model);
        this.containers.formContainer.show();
        this.containers.listContainer.hide();
        this.containers.paginationContainer.hide();
        $('.selectpicker').selectpicker('refresh');
    } else {
        this.options.events.onedit(atag);
    }
};

CrudGrid.prototype.search = function (crudgrid) {
    // console.log("searching");
    var limit = crudgrid.containers.itemperpage.val();
    var search = crudgrid.options.searchBox.val();
    crudgrid.reload(crudgrid, 1, limit, search, "");
};

CrudGrid.prototype.new = function () {
    if (this.options.events.onnew == null) {
        // console.log(this.containers)
        this.formBuilder.forms.headerTitle.text("add new " + this.options.model);
        this.containers.formContainer.show();
        this.containers.listContainer.hide();
        this.containers.paginationContainer.hide();
        this.formBuilder.clearForm(this.formBuilder.forms.formId);
    } else {
        this.options.events.onnew();
    }
};

CrudGrid.prototype.setForm = function (form) {
    this.formBuilder = form;
};

$.fn.bootpag = function (options) {

    var $owner = this,
        settings = $.extend({
            total: 0,
            page: 1,
            maxVisible: null,
            leaps: true,
            href: 'javascript:void(0);',
            hrefVariable: '{{number}}',
            next: '&raquo;',
            prev: '&laquo;',
            firstLastUse: false,
            first: '<span aria-hidden="true">&larr;</span>',
            last: '<span aria-hidden="true">&rarr;</span>',
            wrapClass: 'pagination',
            liClass: 'page-item',
            anchorClass: 'page-link',
            activeClass: 'active',
            disabledClass: 'disabled',
            nextClass: 'next',
            prevClass: 'prev',
            lastClass: 'last',
            firstClass: 'first'
        },
        $owner.data('settings') || {},
        options || {});

    if (settings.total <= 0)
        return this;

    if (!$.isNumeric(settings.maxVisible) && !settings.maxVisible) {
        settings.maxVisible = parseInt(settings.total, 10);
    }

    $owner.data('settings', settings);

    function renderPage($bootpag, page) {

        page = parseInt(page, 10);
        var lp,
            maxV = settings.maxVisible == 0 ? 1 : settings.maxVisible,
            step = settings.maxVisible == 1 ? 0 : 1,
            vis = Math.floor((page - 1) / maxV) * maxV,
            $page = $bootpag.find('li');
        settings.page = page = page < 0 ? 0 : page > settings.total ? settings.total : page;
        $page.removeClass(settings.activeClass);
        lp = page - 1 < 1 ? 1 :
                settings.leaps && page - 1 >= settings.maxVisible ?
                    Math.floor((page - 1) / maxV) * maxV : page - 1;

        if (settings.firstLastUse) {
            $page
                .first()
                .toggleClass(settings.disabledClass, page === 1);
        }

        var lfirst = $page.first();
        if (settings.firstLastUse) {
            lfirst = lfirst.next();
        }

        lfirst
            .toggleClass(settings.disabledClass, page === 1)
            .attr('data-lp', lp)
            .find('a').attr('href', href(lp));

        var step = settings.maxVisible == 1 ? 0 : 1;

        lp = page + 1 > settings.total ? settings.total :
                settings.leaps && page + 1 < settings.total - settings.maxVisible ?
                    vis + settings.maxVisible + step : page + 1;

        var llast = $page.last();
        if (settings.firstLastUse) {
            llast = llast.prev();
        }

        llast
            .toggleClass(settings.disabledClass, page === settings.total)
            .attr('data-lp', lp)
            .find('a').attr('href', href(lp));

        $page
            .last()
            .toggleClass(settings.disabledClass, page === settings.total);


        var $currPage = $page.filter('[data-lp=' + page + ']');

        var clist = "." + [settings.nextClass,
                           settings.prevClass,
                           settings.firstClass,
                           settings.lastClass].join(",.");
        if (!$currPage.not(clist).length) {
            var d = page <= vis ? -settings.maxVisible : 0;
            $page.not(clist).each(function (index) {
                lp = index + 1 + vis + d;
                $(this)
                    .attr('data-lp', lp)
                    .toggle(lp <= settings.total)
                    .find('a').html(lp).attr('href', href(lp));
            });
            $currPage = $page.filter('[data-lp=' + page + ']');
        }
        $currPage.not(clist).addClass(settings.activeClass);
        $owner.data('settings', settings);
    }

    function href(c) {

        return settings.href.replace(settings.hrefVariable, c);
    }

    return this.each(function () {

        var $bootpag, lp, me = $(this),
            p = ['<ul class="', settings.wrapClass, ' bootpag">'];

        if (settings.firstLastUse) {
            p = p.concat(['<li data-lp="1" class="', settings.liClass + ' ' + settings.firstClass,
                   '"><a href="', href(1), '"', 'class="', settings.anchorClass, '"', '>', settings.first, '</a></li>']);
        }
        if (settings.prev) {
            p = p.concat(['<li data-lp="1" class="', settings.liClass + ' ' + settings.prevClass,
                   '"><a href="', href(1), '"', 'class="', settings.anchorClass, '"', '>', settings.prev, '</a></li>']);
        }
        for (var c = 1; c <= Math.min(settings.total, settings.maxVisible) ; c++) {
            p = p.concat(['<li class="' + settings.liClass + '" data-lp="', c, '"><a href="', href(c), '"', 'class="', settings.anchorClass, '"', '>', c, '</a></li>']);
        }
        if (settings.next) {
            lp = settings.leaps && settings.total > settings.maxVisible
                ? Math.min(settings.maxVisible + 1, settings.total) : 2;
            p = p.concat(['<li  class="' + settings.liClass + '" data-lp="', lp, '" class="',
                         settings.nextClass, '"><a href="', href(lp), '"', 'class="', settings.anchorClass, '"',
                         '>', settings.next, '</a></li>']);
        }
        if (settings.firstLastUse) {
            p = p.concat(['<li class="' + settings.liClass + ' last" data-lp="', settings.total, '" ><a href="',
                         href(settings.total), '"', 'class="', settings.anchorClass, '"', '>', settings.last, '</a></li>']);
        }
        p.push('</ul>');
        me.find('ul.bootpag').remove();
        me.append(p.join(''));
        $bootpag = me.find('ul.bootpag');

        me.find('li').off('click').click(function paginationClick() {

            var me = $(this);
            if (me.hasClass(settings.disabledClass) || me.hasClass(settings.activeClass)) {
                return;
            }
            var page = parseInt(me.attr('data-lp'), 10);
            $owner.find('ul.bootpag').each(function () {
                renderPage($(this), page);
            });

            $owner.trigger('page', page);
        });
        renderPage($bootpag, settings.page);
    });
}

$.fn.crudgrid = function (options) {

    return this.each(function (index, elem) {
        var $this = $(this);
        var x = {};
        x[$this[0].id] = new CrudGrid(options);

        x[$this[0].id].renderGrid($this);
        if (options.enableForm) {
            var form = {};
            form[$this[0].id] = new FormBuilder({
                renderAt: "#formhere",
                showVertical: false,
                makeColumn: 1,
                //fields: options.form.fields,
                grid: x[$this[0].id],
            });
            form[$this[0].id].renderForm();
            x[$this[0].id].setForm(form[$this[0].id]);
        }
        // form.execute('clearForm',{a:1,b:2,c:3});
    });

};



