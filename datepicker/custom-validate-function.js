var fValidation = function (formElement, rules, messages) {
    var form = $(formElement).validate({
        rules: rules,
        messages: messages,
        highlight: function (input) {
            $(input).parents('.form-group:eq(0)').addClass('has-error');
        },
        unhighlight: function (input) {
            $(input).parents('.form-group:eq(0)').removeClass('has-error');
        },
        errorPlacement: function (error, element) {
            $(element).parents('div:eq(0)').append(error);
        }
    });
    return form;
};