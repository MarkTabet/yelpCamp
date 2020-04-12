
var express = require("express");
var router = express.Router();
var Campground = require( "../models/campground" );
var Comment = require( "../models/comment");
var middleware = require( "../middleware" );


// INDEX route - show all campgrounds

router.get( '/', function( req, res ) {
    // Get all campgrounds from db
    Campground.find( {}, function( err, allCampgrounds ){
        if( err ){
            console.log( err );
        } else {
            res.render( "campgrounds/index", {
                campgrounds: allCampgrounds
            });
        }
    });
});


// CREATE CAMPGROUND route - add new campground to database

router.post( "/", middleware.isLoggedIn, function( req, res ){
    // console.log( "you hit the post route" );
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {
        name: name,
        price: price,
        image: image,
        description: desc,
        author: author
    };

    // Create a new campground and save to DB
    Campground.create( newCampground, function( err, newlyCreated ){
        if( err ){
            console.log( err );
        } else {
            // redirect back to campgrounds page
            console.log( newlyCreated );
            res.redirect( "/campgrounds" );
        }
    });
});

// NEW CAMPGROUND route - show form to create a new campground

router.get( "/new", middleware.isLoggedIn, function( req, res ){
    res.render( "campgrounds/new" );
});


// SHOW route - shows more info about one campground

router.get( "/:id", function( req, res ){
    // find campground with provided ID
    Campground.findById( req.params.id ).populate( "comments" ).exec( function( err, foundCampground ) {
        if( err ){
            console.log( err );
        } else {
            // show template with info
            res.render( "campgrounds/show", {
                campground: foundCampground
            } );
        }
    } );
} );


// CAMPGROUND EDIT route - show edit form for a campground and submit to update

router.get( "/:id/edit", middleware.checkCampgroundOwnership, function( req, res ){
    Campground.findById( req.params.id, function( err, foundCampground ){
        if( err ){
            console.log( "Campground not found..." );
        } else {
            res.render( "campgrounds/edit", { campground: foundCampground });
        }
    });
});


// CAMPGROUND UPDATE route - Update a particular campground and redirect

router.put( "/:id", middleware.checkCampgroundOwnership, function( req, res ){
    // res.send( "This is the put route" );
    // find and update
    Campground.findByIdAndUpdate( req.params.id, req.body.campground, function( err, updatedCampground ){
        if( err ){
            res.redirect( "/campgrounds" );
        } else {
            res.redirect( "/campgrounds/" + req.params.id );
        }
    });
});


// CAMPGROUND DESTROY route - delete a particular campground and redirect

router.delete( "/:id", middleware.checkCampgroundOwnership, function( req, res, next ){
    // res.send( "You are trying to delete something" );
    Campground.findById( req.params.id, function( err, campground ){
        Comment.remove({
            "_id": {
                $in: campground.comments
            }
        }, function( err ){
            if( err ) {
                res.redirect( "/campgrounds" );
            } else {
                campground.remove();
                res.redirect( "/campgrounds" );
            }
        });
    });
});


module.exports = router;
