const app = require('http').createServer(response);
const fs = require('fs');
const io = require('socket.io')(app);
const speed = 150;

let id = "0";

app.listen(8000);

function response(req, res) {
	let file = "";
	if (req.url == "/") {
		file = __dirname + '/client/index.html';
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

let players = {}
let time = new Date();
let delta;

io.on("connection", function(socket) {
	
	socket.on("addPlayer", function(callback) {
		id = (parseInt(id) + 1).toString();
		socket.userid = id;
		players[id] = {
			"x": 250,
			"y": 250,
			"xvel": 0,
			"yvel": 0,
			"shape": "square"
			};
		callback(id);
	});

	socket.on("keydown", function(id, key) {
		if (!(id in players)) {
			socket.emit("playerNotFound");
			return;
		}
		switch (key) {
			case "up":
				players[id]["yvel"] = -speed;
				return;
			case "down":
				players[id]["yvel"] = speed;
				return;
			case "right":
				players[id]["xvel"] = speed;
				return;
			case "left":
				players[id]["xvel"] = -speed;
				return;
			case "shape":
				players[id]["shape"] = (players[id]["shape"] == "circle" ? "square" : "circle");
		}
	});

	socket.on("keyup", function(id, key) {
		if (!(id in players)) {
			socket.emit("playerNotFound");
			return;
		}
		if (key == "vertical") players[id]["yvel"] = 0;
		else if (key == "horizontal") players[id]["xvel"] = 0;
	});

	socket.on("disconnect", function() {
		delete players[socket.userid];
	})
});

function tick() {
	delta = (new Date() - time) / 1000;
	for (let id in players) {
		player = players[id];
		player["x"] += player["xvel"] * delta;
		player["x"] = Math.max(Math.min(490, player["x"]), 10);
		player["y"] += player["yvel"] * delta;
		player["y"] = Math.max(Math.min(490, player["y"]), 10);
	}
	io.emit("tick", players);
	time = new Date();
}

setInterval(function () {
	tick();
}, 15);