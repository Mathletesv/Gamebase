const app = require('http').createServer(response);
const fs = require('fs');
const io = require('socket.io')(app);
const { v4: uuidv4 } = require('uuid');
const speed = 200;

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
let playerCount = 0;

io.on("connection", function(socket) {
	
	socket.on("addPlayer", function(callback) {
		if (socket.userid in players) {
			return;
		}
		let id = uuidv4();
		socket.userid = id;
		players[id] = {
			"x": 800,
			"y": 450,
			"xvel": 0,
			"yvel": 0,
			"shape": "square",
			"name": "Unnamed",
			"chat": "",
			"color": "black"
		};
		callback(id);
		playerCount++;
		console.log(playerCount);
	});

	socket.on("chatMsg", function(id, msg) {
		if (!(id in players)) {
			socket.emit("playerNotFound");
			return;
		}
		players[id]["chat"] = msg;
	})

	socket.on("colorChange", function(id, color) {
		if (!(id in players)) {
			socket.emit("playerNotFound");
			return;
		}
		if (color.toLowerCase() == "white" || color.toLowerCase() == "#ffffff") {
			return;
		}
		players[id]["color"] = color;
	})

	socket.on("nameChange", function (id, name) {
		if (!(id in players)) {
			socket.emit("playerNotFound");
			return;
		}
		players[id]["name"] = name;
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
		playerCount--;
		delete players[socket.userid];
	});
});

function tick() {
	delta = (new Date() - time) / 1000;
	for (let id in players) {
		player = players[id];
		player["x"] += player["xvel"] * delta;
		player["x"] = Math.max(Math.min(1580, player["x"]), 20);
		player["y"] += player["yvel"] * delta;
		player["y"] = Math.max(Math.min(880, player["y"]), 20);
	}
	io.emit("tick", Object.values(players));
	time = new Date();
}

setInterval(function () {
	tick();
}, 15);