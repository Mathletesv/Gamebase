const socket = io.connect();
let thisid;
let players = {};
let time = new Date();
let delta = 0;
let speed = 50;
let ctx = document.getElementById("game").getContext("2d");

function update(input) {
	players = input;
	ctx.clearRect(0, 0, 500, 500);
	for (let [id, coords] of Object.entries(players)) {
		if (id == thisid) {
			ctx.fillStyle = "green";
			ctx.beginPath();
			ctx.rect(coords["x"], coords["y"], 20, 20);
			ctx.fill();
			ctx.fillStyle = "black";
		}
		else {
			ctx.beginPath();
			ctx.fillRect(coords["x"], coords["y"], 20, 20);
		}
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
	switch (e.key) {
		case "ArrowUp":
			socket.emit("keydown", thisid, "up");
			return;
		case "ArrowDown":
			socket.emit("keydown", thisid, "down");
			return;
		case "ArrowRight":
			socket.emit("keydown", thisid, "right");
			return;
		case "ArrowLeft":
			socket.emit("keydown", thisid, "left");
			return;
		case "w":
			socket.emit("keydown", thisid, "up");
			return;
		case "s":
			socket.emit("keydown", thisid, "down");
			return;
		case "d":
			socket.emit("keydown", thisid, "right");
			return;
		case "a":
			socket.emit("keydown", thisid, "left");
			return;
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

socket.on("playerNotFound", function() {
	socket.emit("addPlayer", getId);
})