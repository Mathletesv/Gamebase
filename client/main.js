const socket = io.connect();
let thisid;
let x = 250, y = 250;
let xvel = 0, yvel = 0;
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
			ctx.rect(coords[0], coords[1], 20, 20);
			ctx.fill();
			ctx.fillStyle = "black";
		}
		else {
			ctx.beginPath();
			ctx.fillRect(coords[0], coords[1], 20, 20);
		}
	}
}

function ticker() {
	delta = (new Date() - time) / 1000;
	x += xvel * delta;
	y += yvel * delta;
	time = new Date();
	socket.emit("tick", x, y, thisid, update);
	requestAnimationFrame(ticker);
}

function getId(id) {
	thisid = id;
	console.log(id);
	requestAnimationFrame(ticker);
}

socket.emit("addPlayer", getId);

document.addEventListener("keydown", function(e) {
	switch (e.key) {
		case "ArrowUp":
			yvel = -speed;
			break;
		case "ArrowDown":
			yvel = speed;
			break;
		case "ArrowRight":
			xvel = speed;
			break;
		case "ArrowLeft":
			xvel = -speed;
			break;
	}
})

document.addEventListener("keyup", function(e) {
	if (e.key == "ArrowUp" || e.key == "ArrowDown") {
		yvel = 0;
	}
	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		xvel = 0;
	}
})