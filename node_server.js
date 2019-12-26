const http = require('http');
const fs = require('fs');

var http_server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    
    var requested_url = "";
    for (var i=1;i<req.url.length;i++) {requested_url += req.url[i]}
    if (req.url == '/') {requested_url = 'index.html'};
    
    fs.readFile('./' + requested_url, 'utf8', function(err, data) {
      var return_data = data;
      res.writeHead(200, {'Content-Type': 'text/html'});
      if (err) {
        console.log(err);
      }
      console.log(Date() + ", Fetching " + req.url);
      res.write(data);
      res.end();
    });
}).listen(8000);
console.log('Running Server')