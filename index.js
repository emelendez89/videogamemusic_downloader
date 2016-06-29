var request = require('request'),
cheerio = require('cheerio'),
_ = require("underscore"),
http = require('http'),
fs = require('fs');
//download = require('download-file');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var websitelink;
var allAbsoluteLinks = [];
// var websitelink = "http://downloads.khinsider.com/game-soundtracks/album/the-legend-of-zelda-majora-s-mask-original-soundtrack";
var uniqueLinks = [];
var download_counter = 0;
// console.log("Visiting page " + websitelink);

rl.question('websitelink: ', (answer) => {
    websitelink = answer;
    rl.close();

    request(websitelink, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            $ = cheerio.load(body);
            var table = $('table');
            
            var absoluteLinks = $("a[href^='http']");
            

            var filtered = $(absoluteLinks).filter(function(){
                return websitelink == $(this).attr('href').substring(0,websitelink.length);
            });

            filtered.each(function() {
                allAbsoluteLinks.push($(this).attr('href'));
                    // console.log($(this).attr('href'));
            });

            uniqueLinks = _.uniq(allAbsoluteLinks,true);
            // console.log(uniqueLinks);
            console.log("Found " + uniqueLinks.length + " absolute links");
            // var options = {
            //     directory: "C:/test"
            // }

            for (var i = 0; i < uniqueLinks.length; i++) {
                request(uniqueLinks[i],function (error, response, body){
                    $ = cheerio.load(body);
                    var audioLink = $('audio');
                    var filename = audioLink.attr('src').split("/")[6];
                    console.log("downloading... "+filename);
                    http.get(audioLink.attr('src'),function(otherResponse){
                        var file = fs.createWriteStream("C:/test/"+filename);
                        otherResponse.on('data', function(chunk){
                            file.write(chunk);
                        }).on('end', function(){
                            download_counter++;
                            console.log("Finished "+file.path+" "+download_counter+"/"+uniqueLinks.length);
                            file.end();
                        });
                    });
                    // console.log("downloading..."+uniqueLinks[i]);
                    // download(audioLink.attr('src'), options, function(err){
                    //     if (err) throw err
                    //     console.log("boom")
                    // });
                });
            };
            

            

            // for (var i = uniqueLinks.length - 1; i >= 0; i--) {
            
            // };
        } else {
         console.log("Error: " + error);
       }
    });
});