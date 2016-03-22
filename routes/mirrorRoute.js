module.exports = function(app) {
  var url = require('url')
    , express = require('express')
    , mirrorRouter = express.Router()
    , path = require('path')
    , fs = require('fs')
    , Handlebars = require('handlebars')
    , request = require('request')
    , mongoose = require('mongoose')
    , nconf = require('nconf').file({ file: 'environment.json' }).env()
    , bingApiKey = nconf.get('BING_API_KEY');

  mirrorRouter.use(function(req, res, next) {
      next();
  });

  mirrorRouter.get('/', function(req, res, next) {
    res.render('./../views/partials/mirror', {
      bodyClass: 'mirror',
      helpers:{}
    });
  });

  mirrorRouter.get('/getTraffic', function(req, res, next) {
    var model = mongoose.model('Person');
    console.log("get Traffic route", req.query.homeAddress);
    console.log("get Traffic route",req.query.workAddress);
    var waypoint0 = "Seattle, WA";
    var waypoint1 = "Redmond, WA";
    
    request.get({
        url: `http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=${waypoint0}&wp.1=${waypoint1}&optmz=timeWithTraffic&key=${bingApiKey}`,
    },
    function(error, response, body) {
      if (error)
        console.log(error)
      else {
        body = JSON.parse(body);
        if(body && body.resourceSets && body.resourceSets[0]){
          var travelDuration = body.resourceSets[0].resources[0].travelDurationTraffic;
          var trafficCongestion = body.resourceSets[0].resources[0].trafficCongestion; //This can say "Heavy" or other things
          res.send({ "travelDuration": travelDuration, "trafficCongestion": trafficCongestion }); 
        }
      }
      res.end();
    })
  });

  app.use('/mirror', mirrorRouter);
};
