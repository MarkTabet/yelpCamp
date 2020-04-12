
var express = require( "express" );
var router = express.Router({mergeParams: true});
var Campground = require( "../models/campground");
var Comment = require( "../models/comment");
var middleware = require( "../middleware" );


// NEW route - for showing form for adding a comment

router.get( "/new", middleware.isLoggedIn, function( req, res ){
    // lookup campground
    Campground.findById( req.params.id, function( err, campground ){
        if( err ){
            console.log( err );
        } else {
            res.render( "comments/new", { campground: campground });
        }
    });
});


// CREATE route - for adding a comment to the database

router.post( "/", middleware.isLoggedIn, function( req, res ){
    // find the campground
    Campground.findById( req.params.id, function( err, campground ){
        if( err ){
            console.log( err );
            res.redirect( "/campgrounds" );
        } else {
            Comment.create( req.body.comment, function( err, comment ){
                if( err ){
                    req.flash( "error", "Sorry, something went wrong. Your comment couldn't be added." );
                    console.log( err );
                } else {
                    // create new comment
                    // add username and user id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push( comment );
                    campground.save();
                    // redirect campground show page
                    console.log( comment );
                    req.flash( "success", "Your comment was successfully added." );
                    res.redirect( "/campgrounds/" + campground._id );
                }
            });
        }
    });
});


// EDIT route - for editing a comment

router.get( "/:comment_id/edit", middleware.checkCommentOwnership, function( req, res ){
    Comment.findById( req.params.comment_id, function( err, foundComment ) {
        if( err ){
            console.log( err );
            res.redirect( "back" );
        } else {
            // res.render( "comments/edit", { campground_id: req.params.id, comment: foundComment } );
            res.render( "comments/edit", { campground_id: req.params.id, campground: req.params, comment: foundComment } );
        }
    });
});


// UPDATE route - for updating a comment in the database

router.put( "/:comment_id", middleware.checkCommentOwnership, function( req, res ){
    // res.send( "you hit the update route for comments")
    Comment.findByIdAndUpdate( req.params.comment_id, req.body.comment, function( err, updatedComment ){
        if( err ){
            console.log( err );
            res.redirect( "back" );
        } else {
            res.redirect( "/campgrounds/" + req.params.id );
        }
    })
});


// COMMENT DESTROY route - for deleting a comment from the database

router.delete( "/:comment_id", middleware.checkCommentOwnership, function( req, res ){
    // res.send( "you have hit the destroy comment route" );
    Comment.findByIdAndRemove( req.params.comment_id, function( err ){
        if( err ){
            console.log( err );
            res.redirect( "back" );
        } else {
            req.flash( "success", "Your comment has been deleted." );
            res.redirect( "/campgrounds/" + req.params.id );
        }
    });
});


module.exports = router;
