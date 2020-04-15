
var express = require( "express" );
var router = express.Router();
var passport = require( "passport" );
var User = require( "../models/user" );
var Campground = require( "../models/campground" );
var middleware = require( "../middleware" );
var adminKey = process.env.ADMIN_SECRET_CODE;
var async = require( "async" );
var nodemailer = require( "nodemailer" );
var crypto = require( "crypto" );


// ROOT route
router.get( "/", function( req, res ){
	res.render( "landing" );
});


// SHOW register form

router.get( "/register", function( req, res ){
	res.render( "register", { page: 'register' });
});


// Handle registration

router.post( "/register", function( req, res ){
    var newUser = new User({ 
        username: req.body.username, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName,
        avatar: req.body.avatar, 
        email: req.body.email
    });
    // eval( require( "locus" ));
    if( req.body.adminCode === adminKey ){
        newUser.isAdmin = true;
    }
    User.register( newUser, req.body.password, function( err, user ){
        if( err ){
            console.log( err );
            req.flash( "error", err.message );
            return res.render( "register", { error: err.message });
        } 
        else {

            passport.authenticate( "local" )( req, res, function(){
                req.flash( "success", "Welcome to YelpCamp "+ user.username );
                res.redirect( "/campgrounds" );
            });
        }
    });
});


// LOG IN route - show login form

router.get( "/login", function( req, res ){
	res.render( "login", { page: 'login' } );
});


// Handle login

router.post( "/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds", 
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
    }), function(req, res){
});


// LOG OUT route

router.get( "/logout", function( req, res ){
    req.logout();
    req.flash( "success", "Logged you out." );
    res.redirect( "/campgrounds" );
});


// SHOW forgot password route

router.get( "/forgot", function( req, res ){
    res.render( "forgot" );
});


// Handle USER FORGOT password route

router.post( "/forgot", function( req, res, next ){
    async.waterfall([
        function( done ){
            crypto.randomBytes( 20, function( err, buf ){
                var token = buf.toString( "hex" );
                done( err, token );
            });
        }, 
        function( token, done ){
            User.findOne( { email: req.body.email }, function( err, foundUser ){
                console.log( "To email: " + req.body.email );
                console.log( "foundUser: " + foundUser );
                if( !foundUser ){
                    req.flash( "error", "No account with that email address exists. Please check spelling and try again." );
                    return res.redirect( "/forgot" );
                }

                foundUser.resetPasswordToken = token;
                foundUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                foundUser.save( function( err ){
                    done( err, token, foundUser );
                });
            });
        },
        function( token, foundUser, done ){
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: "yelpcampassistance@gmail.com",
                    pass: process.env.GMAILPW 
                }
            });
            console.log( "smtpTransport: " + smtpTransport );
            console.log( "smtpTransport+ : " + smtpTransport.service + ", " + smtpTransport.auth );

        var mailOptions = {
                to: foundUser.email,
                from: "yelpcampassistance@gmail.com",
                subject: "YelpCamp Password Reset",
                text: "You are receiving this email because you have requested the reset of your YelpCamp password. \n\n" + 
                    "Please click on the following link, or paste this into your browser to complete the process: \n\n" +
                    "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                    "If you did not request this, please ignore this email and your password will remain unchanged. \n"
            };
            smtpTransport.sendMail( mailOptions, function( err ){
                console.log( "mail sent" );
                req.flash( "success", "An email has been sent to " + foundUser.email + " with further instructions" );
                done( err, "done" );
            });
        }
    ], function( err ){
        if( err ){
            return next( err );
        } else {
            res.redirect( "/forgot" );
        }    
    });
});


// SHOW PASSWORD RESET form

router.get( "/reset/:token", function( req, res ){
    User.findOne( { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function( err, foundUser ){
        if( !foundUser ){
            req.flash( "error", "Password reset token is invalid or has expired." );
            return res.redirect( "/forgot" );
        } 
        else 
        {
            res.render( "reset", { token: req.params.token });
        }
    });
});


// PROCESS PASSWORD RESET form

router.post( "/reset/:token", function( req, res ){
    async.waterfall([
        function( done ){
            User.findOne( { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function( err, user ){
                if( !user ){
                    req.flash( "error", "Password reset token is invalid or has expired." );
                    return res.redirect( "back" );
                }
                if( req.body.password === req.body.confirm ){
                    user.setPassword( req.body.password, function( err ){
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
  
                        user.save( function( err ){
                            req.logIn( user, function( err ){
                                done( err, user );
                            });
                        });
                    });
                } else {
                    req.flash( "error", "Passwords do not match." );
                    return res.redirect( "back" );
                }
            });
        },
        function( user, done ){
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail", 
                auth: {
                    user: "yelpcampassistance@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "yelpcampassistance@gmail.com",
                subject: "Your password has been changed",
                text: "Hello,\n\n" +
                "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
            };
            smtpTransport.sendMail( mailOptions, function( err ){
                req.flash( "success", "Success! Your password has been changed." );
                done( err );
            });
        }
    ], function( err ){
      res.redirect( "/campgrounds" );
    });
});


// USER PROFILE show route

router.get( "/users/:id", function( req, res ) {
    User.findById( req.params.id, function( err, foundUser ){
        if( err ){
            req.flash( "error", "User not found." );
            res.redirect( "back" );
        } else {
            Campground.find().where( "author.id" ).equals( foundUser._id ).exec( function( err, foundCampgrounds ){
                if( err ){
                    req.flash( "error", "No campgrounds found for this user." );
                    res.redirect( "back" );
                } else {
                    res.render( "users/show", { user: foundUser, campgrounds: foundCampgrounds } );
                }
            });
        }
    });
});


module.exports = router;