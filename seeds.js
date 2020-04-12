
var mongoose = require( "mongoose" );
mongoose.connect( "mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true } );

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log( "Database is connected!" );
});

var Campground = require( "./models/campground" );
var Comment = require( "./models/comment" );

var seedData = [
    {
        name: "Cloud's Rest", 
        image: "https://cdn.pixabay.com/photo/2017/06/17/03/17/gongga-snow-mountain-2411069__340.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
    }
]



function seedDB(){
    // remove all campgrounds
    Campground.remove( {}, function( err ){
        if( err ){
            console.log( err );
        } else {
            console.log( "database cleared" );
            // add some campgrounds
            // seedData.forEach( function( seed ){
            //     Campground.create( seed, function( err, campground ){
            //         if( err ){
            //             console.log( err );
            //         } else {
            //             console.log( "campground added" );
            //             Comment.create( 
            //                 {
            //                     text: "This place is great, but I wish there was WiFi",
            //                     author: "Homer" 
            //                 }, function( err, comment ){
            //                     if( err ){
            //                         console.log( err );
            //                     } else {
            //                         campground.comments.push( comment );
            //                         campground.save();
            //                         console.log( "comment added" );
            //                     }            
            //                 });
            //         }
            //     });
            // });
        }
    });
    
    
    // add some comments
}

module.exports = seedDB;

