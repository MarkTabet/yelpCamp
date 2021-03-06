
var Campground = require( "../models/campground");
var Comment = require( "../models/comment");

var middlewareObj = {};


middlewareObj.checkCampgroundOwnership = function( req, res, next ){
    if( req.isAuthenticated() ){
        // find campground
        Campground.findById( req.params.id, function( err, foundCampground ) {
            if ( err ) {
                res.redirect( "back" );
            } else {
                // does the user own the campground? (or is an admin)
                if( foundCampground.author.id.equals( req.user._id ) || req.user.isAdmin ){
                    next();
                } else {
                    req.flash( "error", "You don't have permission to do that." );
                    res.redirect( "back" );
                }
            }
        });
    } else {
        req.flash( "error", "You need to log in to do that." );
        res.redirect( "back" );
    }
}

    
middlewareObj.checkCommentOwnership = function( req, res, next ){
    if( req.isAuthenticated() ){
        // find comment
        Comment.findById( req.params.comment_id, function( err, foundComment ) {
            if ( err ) {
                req.flash( "error", "Campground not found." );
                res.redirect( "back" );
            } else {
                // if so, does the user own the comment? (or is an admin)
                if( foundComment.author.id.equals( req.user._id ) || req.user.isAdmin ){
                    next();
                } else {
                    req.flash( "error", "You don't have permission to change other people's comments." );
                    res.redirect( "back" );
                }
            }
        });
    } else {
        req.flash( "error", "You need to log in to do that." );
        res.redirect( "back" );
    }
}
    

middlewareObj.isLoggedIn = function( req, res, next ){
    if( req.isAuthenticated() ){
        return next();
    }
    req.flash( "error", "You need to log in to do that." );
    res.redirect( "/login" );
}


module.exports = middlewareObj;
