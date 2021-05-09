(function ($){
    var log_reg = $(`#regis`),
        loginform = $('#login-form'),
        registerform = $('#register-form'),
        reg_log = $('#loginb');
    log_reg.click(function(){
        loginform.attr("hidden",true);
        registerform.attr("hidden",false);
    });

    reg_log.click(function(){
        loginform.attr("hidden",false);
        registerform.attr("hidden",true);
    });
})(window.jQuery);