const socket = io.connect();
let thisid;
let players = {};
let time = new Date();
let delta = 0;
let speed = 50;
let ctx = document.getElementById("game").getContext("2d");
const downevents = {
	"ArrowUp": "up",
	"ArrowDown": "down",
	"ArrowLeft": "left",
	"ArrowRight": "right",
	"w": "up",
	"a": "left",
	"s": "down",
	"d": "right",
	"z": "shape",
	"j": "shape"
}

function update(input) {
	players = input;
	ctx.clearRect(0, 0, 500, 500);
	for (let id in players) {
		if (id == thisid) {
			ctx.fillStyle = "green";
		}
		else {
			ctx.fillStyle = "black";
		}
		ctx.beginPath();
		if (players[id].shape == "circle") {
			ctx.arc(players[id].x, players[id].y, 10, 0, Math.PI * 2);
		}
		else if (players[id].shape == "square") {
			ctx.rect(players[id].x - 10, players[id].y - 10, 20, 20);
		}
		ctx.fill();
	}
}

function ticker() {
	delta = (new Date() - time) / 1000;
	/*x += xvel * delta;
	x = Math.max(Math.min(480, x), 0);
	y += yvel * delta;
	y = Math.max(Math.min(480, y), 0);*/
	time = new Date();
	socket.emit("tick", delta, thisid, update);
	requestAnimationFrame(ticker);
}

function getId(id) {
	thisid = id;
	console.log(id);
}

socket.emit("addPlayer", getId);
requestAnimationFrame(ticker);

document.addEventListener("keydown", function(e) {
	if (e.key in downevents) {
		eval('socket.emit(\"keydown\", thisid, \"' + downevents[e.key] + '\");');
	}
})

document.addEventListener("keyup", function(e) {
	if (e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "w" || e.key == "s") {
		socket.emit("keyup", thisid, "vertical");
	}
	if (e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "a" || e.key == "d") {
		socket.emit("keyup", thisid, "horizontal");
	}
})

setTimeout(function() {
	socket.on("playerNotFound", function() {
		socket.emit("addPlayer", getId);
	});
}, 1000);