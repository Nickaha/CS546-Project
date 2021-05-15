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
    var bidListingButtons = $("div.card[id]").map(function(){
        let selector = "#"+ this.id;
        let elem_id = this.id;
        let expires = $(this).find('.expdate');
        if (expires) console.log(expires.text());

        $(this).find('.change').submit( function (event){
            event.preventDefault();
            let changeinput = $(this).find('.changeinput');
            
            //Client side validation.
            if (changeinput.val() === ""){
                // Do nothing for an empty form.
                return;
            }
            if ( Date.parse(changeinput.val()) - (new Date()) < 0){
                alert("New date is too soon or has already passed.");
                return;
            }
            if (expires.text().trim() === changeinput.val().trim()){
                //Do nothing for the same date.
                return;
            }

            let result = window.confirm("Update your bid's end date?");
            if (result){
                //Server-side: AJAX call.
                $.ajax({
                    method: 'PATCH',
                    url: window.location.origin+"/listing/"+elem_id,
                    data: {
                        datetime: changeinput.val()
                    },
                    success: function(data){
                        //Client-side update to reflect changes.
                        expires.html(changeinput.val());
                        alert("Updated successfully.");
                    },
                    error: function(jqxhr) {
                        alert( `Failed to update listing: ${JSON.parse(jqxhr.responseText).message}` );
                    }
                });
            }  
        } );

        $(this).find('.close-listing').click(function(){
            //Promp user if they're sure and then go on with the delete request.
            let result = window.confirm("Are you sure you want to delete your listing?");
            if (result){
                $.ajax({
                    method: 'DELETE',
                    url: window.location.origin +"/listing/"+elem_id,
                    success: function(data){
                        $(selector).html("Deleted successfully.");
                    },
                    error: function(jqxhr) {
                        alert( JSON.parse(jqxhr.responseText).message );
                    }
                });
            }
        });

        $(this).find('.close-listing2').click(function(){
            //Promp user if they're sure and then go on with the delete request.
            let result = window.confirm("Accept current bid and end listing?");
            if (result){
                $.ajax({
                    method: 'DELETE',
                    url: window.location.origin +"/listing/"+elem_id,
                    success: function(data){
                        $(selector).html("Auction finished successfully.");
                        alert( "Auction Complete! The Chuck E Cheese Coins will be deposited in your account." );
                    },
                    error: function(jqxhr) {
                        alert( `Failed to accept bid: ${JSON.parse(jqxhr.responseText).message}` );
                    }
                });
            }
        });

        $(this).find('.close-bid').click(function(){
            //Promp user if they're sure and then go on with the delete request.
            let result = window.confirm("Are you sure you want to withdraw your bid?");
            if (result){
                // DELETE to our server and see response.
                //var origin   = window.location.origin; Returns base URL (https://example.com)

                $.ajax({
                    method: 'DELETE',
                    url: window.location.origin +"/bids/"+elem_id,
                    success: function(data){
                        $(selector).html("Withdrawn successfully.");
                    },
                    error: function(jqxhr) {
                        alert( JSON.parse(jqxhr.responseText).message );
                    }
                });

                //After our AJAX has had a response. 
                //if (success) $(selector).remove();
                //console.log(success);
                //alert(feedback);
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
                },
                success: function(data){
                    window.location.assign(`/listing/${listid}`);
                },
                error: function(jqxhr) {
                    let error = JSON.parse(jqxhr.responseText).message;
                    alert( error );
                }
            };
            $.ajax(requestConfig);


            /*
            console.log(requestConfig);
            $.ajax(requestConfig).then(function(responseMessage){
                console.log(responseMessage);
                window.location.assign(`/listing/${listid}`);
            });
            */
        }
        if(comment !== null && comment !== undefined &&  comment.trim().length!==0){
            var requestConfig = {
                method:'POST',
                url:'/comment/'+listid,
                data: {
                    comment:comment
                },
                success: function(data){
                    window.location.assign(`/listing/${listid}`);
                },
                error: function(jqxhr) {
                    let error = JSON.parse(jqxhr.responseText).message;
                    alert( error );
                }
            };
            $.ajax(requestConfig);
            /*$.ajax(requestConfig).then(function(responseMessage){
                window.location.assign(`/listing/${listid}`);
            }); */
        }
    });
})(window.jQuery);