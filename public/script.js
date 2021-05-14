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
        let selector = "#"+ this.id;
        let elem_id = this.id;

        $(this).find('.close-listing').click(function(){
            //Promp user if they're sure and then go on with the delete request.
            let result = window.confirm("Are you sure you want to delete your listing?");
            if (result){
                let feedback = "Removal successful.";
                $(selector).remove();



                alert(feedback);
            }
        });

        $(this).find('.close-bid').click(function(){
            //Promp user if they're sure and then go on with the delete request.
            let result = window.confirm("Are you sure you want to withdraw your bid?");
            if (result){
                let feedback = "AJAX unsuccessful.";
                let success = true;
                // DELETE to our server and see response.
                //var origin   = window.location.origin; Returns base URL (https://example.com)

                $.ajax({
                    method: 'DELETE',
                    url: window.location.origin +"/bids/"+elem_id,
                    statusCode: {
                        200: function(responseObject, textStatus, jqXHR) {
                            // Successful response
                            if (responseObject.message) feedback = responseObject.message;
                        },
                        400: function(responseObject, textStatus, errorThrown) {
                            // Service Unavailable (503)
                            if (responseObject.message) feedback = responseObject.message;
                            success = false;
                        },
                        401: function(responseObject, textStatus, errorThrown) {
                            // Service Unavailable (503)
                            if (responseObject.message) feedback = responseObject.message;
                            success = false;
                        },
                        403: function(responseObject, textStatus, errorThrown) {
                            // Service Unavailable (503)
                            if (responseObject.message) feedback = responseObject.message;
                            success = false;
                        },
                        500: function(responseObject, textStatus, errorThrown) {
                            // Service Unavailable (503)
                            if (responseObject.message) feedback = responseObject.message;
                            success = false;
                        } 
                    }
                });

                //After our AJAX has had a response. 
                if (success) $(selector).remove();
                alert(feedback);
            }
        });

        return selector;
    }).get();
    var bidcommentform = $('#bid-or-comment');
    bidcommentform.submit(function(event){
        event.preventDefault();
        var bid = $('#bid').val();
        var comment = $('#comment').val();
        var userid = $('#userid_bc').val();
        var listid = $('#listid').val();
        console.log(bid);
        if(bid !== null && bid !== undefined && !isNaN(parseInt(bid)) && bid.trim().length!==0){
            var requestConfig = {
                method:'POST',
                url:'/bids/'+listid,
                data: {
                    bid:parseInt(bid)
                }
            };
            console.log(requestConfig);
            $.ajax(requestConfig).then(function(responseMessage){
                window.location.assign(`/listing/${listid}`);
            });
        }
        if(comment !== null && comment !== undefined &&  comment.trim().length!==0){
            var requestConfig = {
                method:'POST',
                url:'/comment/'+listid,
                data: {
                    comment:comment
                }
            };
            $.ajax(requestConfig).then(function(responseMessage){
                window.location.assign(`/listing/${listid}`);
            });
        }
    });
})(window.jQuery);