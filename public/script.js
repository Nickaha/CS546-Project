(function ($){
    var log_reg = $(`#regis`),
        reg_log = $('#loginb');
    log_reg.click(function(){
        window.location.assign('/user/register');
    });

    reg_log.click(function(){
        window.location.assign('/');
    });

    // Get into each listing and add an event listener for the delete button.
    var listingRemoveButtons = $("div.card[id]").map(function(){
        var id = "#"+ this.id;

        $(this).find('.close-listing').click(function(){
            //Promp user if they're sure and then go on with the delete request.
            let result = window.confirm("Are you sure you want to delete your listing?");
            if (result){
                let feedback = "Removal successful.";
                $(id).remove();



                alert(feedback);
            }
        });

        $(this).find('.close-bid').click(function(){
            //Promp user if they're sure and then go on with the delete request.
            let result = window.confirm("Are you sure you want to withdraw your bid?");
            if (result){
                let feedback = "Bid successfully removed.";
                $(id).remove();



                alert(feedback);
            }
        });

        return id;
    }).get();
    var bidcommentform = $('#bid-or-comment');
    bidcommentform.submit(function(event){
        event.preventDefault();
        var bid = $('#bid').val();
        var comment = $('#comment').val();
        var userid = $('#userid_bc').val();
        var listid = $('#listid').val();
        if(bid !== null || bid !== undefined){
            var requestConfig = {
                method:'POST',
                url:''
            }
        }
    });
})(window.jQuery);