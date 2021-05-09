(function ($){
    var log_reg = $(`#regis`),
        loginform = $('#login-form'),
        registerform = $('#register-form'),
        reg_log = $('#loginb');
    log_reg.click(function(){
        window.location.assign('/user/register');
    });

    reg_log.click(function(){
        window.location.assign('/');
    });

})(window.jQuery);