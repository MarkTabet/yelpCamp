
var express      = require("express");
var router       = express.Router();
var Campground   = require( "../models/campground" );
var Comment      = require( "../models/comment");
var middleware   = require( "../middleware" );
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

var multer = require('multer');
var storage = multer.diskStorage({
    filename: function( req, file, callback ){
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function( req, file, cb ){
    // accept image files only
    if( !file.originalname.match(/\.(jpg|jpeg|png|gif)$/i) ){
        return cb( new Error( 'Only image files are allowed!' ), false );
    }
    cb( null, true );
};
var upload = multer( { storage: storage, fileFilter: imageFilter} );

// var cloudinary = require( 'cloudinary' ).v2;
// var cloudinary = require( 'cloudinary' ).v2;
var cloudinary = require( 'cloudinary' );

cloudinary.config({ 
    cloud_name: 'mark2code',
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// INDEX route - show all campgrounds

router.get( '/', function( req, res ) {
    if(req.query.search){
        const regex = new RegExp( escapeRegex( req.query.search ), "gi" );
        Campground.find( { name: regex }, function( err, allCampgrounds ){
           if( err || !allCampgrounds.length ){
                req.flash( "error", "No campgrounds matched your search. Please try again." );
                res.redirect( "back" );
           } else {
              res.render("campgrounds/index",{ campgrounds: allCampgrounds, page: "campgrounds" });
           }
        });
    } else {
        // Get all campgrounds from db
        Campground.find( {}, function( err, allCampgrounds ){
            if( err ){
                console.log( err );
            } else {
                res.render( "campgrounds/index", {
                    campgrounds: allCampgrounds,
                    page: 'campgrounds'
                });
            }
        });
    }
});


// CREATE CAMPGROUND route - add new campground to database

router.post( "/", middleware.isLoggedIn, upload.single( "image" ), function( req, res ){

    var newCampground = new Campground({
        name: req.body.campground.name,
        price: req.body.campground.price,
        description: req.body.campground.description,
        location: req.body.campground.location,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    });

    cloudinary.v2.uploader.upload( req.file.path, function( err, result ){
        newCampground.image = result.secure_url;
        newCampground.image_id = result.public_id;
        geocoder.geocode( req.body.campground.location, function( err, data ){
            if (err || !data.length) {
                req.flash('error', 'Invalid address');
                return res.redirect('back');
            }
            newCampground.lat = data[0].latitude;
            newCampground.lng = data[0].longitude;
            newCampground.location = data[0].formattedAddress;
            
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

router.put( "/:id", middleware.checkCampgroundOwnership, upload.single( "image" ), function( req, res ){
    Campground.findById( req.params.id, async function( err, foundCampground ){
        if( err ){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            // if the user selected a new image for the campround it needs to be deleted
            if( req.file ){
                try {
                    await cloudinary.v2.uploader.destroy( foundCampground.image_id );
                    var result = await cloudinary.v2.uploader.upload( req.file.path );
                    foundCampground.image = result.secure_url;
                    foundCampground.image_id = result.public_id;
                } catch( err ) {
                    req.flash( "error", err.message );
                    res.redirect( "back" );
                }
            }
            geocoder.geocode( req.body.campground.location, function( err, data ){
                if (err || !data.length) {
                    req.flash('error', 'Invalid address');
                    return res.redirect('back');
                }
                foundCampground.lat = data[0].latitude;
                foundCampground.lng = data[0].longitude;
                foundCampground.location = data[0].formattedAddress;

                foundCampground.save();
        
                req.flash("success","Successfully Updated!");
                res.redirect( "/campgrounds/" + foundCampground._id );
            });
        }
    });
});


// CAMPGROUND DESTROY route - delete a particular campground and redirect

router.delete( "/:id", middleware.checkCampgroundOwnership, function( req, res, next ){
    Campground.findById( req.params.id, async function( err, campground ){
        if( err ){
            req.flash( "error", err.message );
            return res.redirect( "back" );
        }
        try {
            await cloudinary.v2.uploader.destroy( campground.image_id );
            campground.remove();
                // Comment.remove( { "_id": { $in: campground.comments } } {
                Comment.deleteMany( { _id: { $in: campground.comments } }, function( err ){
                if( err ){
                    console.log( err );
                }
            });
            req.flash( "success", "Campground deleted successfully." );
            res.redirect( "/campgrounds" );
        } catch( err ) {
            req.flash( "error", err.message );
            return res.redirect( "back" );
        }
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;
