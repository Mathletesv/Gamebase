const app = require('http').createServer(response);
const fs = require('fs');
const io = require('socket.io')(app);
const { v4: uuidv4 } = require('uuid');

app.listen(8000);

function response(req, res) {
	let file = "";
	if (req.url == "/") {
		file = __dirname + '/index.html';
	} else {
		file = __dirname + req.url;
	}
	fs.readFile(file, function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Failed to load this file');
		}
		res.writeHead(200);
		res.end(data);
	})
};

players = {}

io.on("connection", function(socket) {
	socket.on("tick", function(posx, posy, id, update) {
		players[id] = [posx, posy];
		update(players);
	});
	
	socket.on("addPlayer", function(callback) {
		id = uuidv4();
		players[id] = [250, 250];
		callback(id);
	})
})