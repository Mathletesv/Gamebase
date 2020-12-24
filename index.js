const app = require('http').createServer(response);
const fs = require('fs');
const io = require('socket.io')(app);
const speed = 50;

let id = "0";

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
	socket.on("tick", function(delta, id, update) {
		player = players[id];
		player["x"] += player["xvel"] * delta;
		player["x"] = Math.max(Math.min(480, player["x"]), 0)
		player["y"] += player["yvel"] * delta;
		player["y"] = Math.max(Math.min(480, player["y"]), 0)
		players[id] = player;
		update(players);
	});
	
	socket.on("addPlayer", function(callback) {
		id = (parseInt(id) + 1).toString();
		players[id] = {
			"x": 250,
			"y": 250,
			"xvel": 0,
			"yvel": 0,
			};
		callback(id);
	});

	socket.on("keydown", function(id, key) {
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
		}
	});

	socket.on("keyup", function(id, key) {
		if (key == "vertical") players[id]["yvel"] = 0;
		else if (key == "horizontal") players[id]["xvel"] = 0;
	});
})