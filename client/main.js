const socket = io.connect();
let thisid;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = document.getElementById("chatbox");
ctx.font = "24px Times New Roman";
let name = "Unnamed";
let color = "black";
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

function scaler() {
	const winw = window.innerWidth;
	const winh = window.innerHeight;
	const xvalue = winw / canvas.width;
	const yvalue = winh / canvas.height;
	const scale = Math.min(xvalue, yvalue);
	canvas.style.transform = 'scale(' + scale + ')';
	canvas.style.left = (winw - canvas.width) / 2 + 'px';
	canvas.style.top = (winh - canvas.height) / 2 + 'px';
	input.style.left = (winw - 175) / 2 + 'px';
	input.style.top = 2 * winh / 3 + 'px';
}

scaler();
window.onresize = scaler;

function update(players) {
	ctx.clearRect(0, 0, 16000, 9000);
	for (let player of players) {
		ctx.fillStyle = player.color;
		ctx.beginPath();
		if (player.shape == "circle") {
			ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
		}
		else if (player.shape == "square") {
			ctx.rect(player.x - 20, player.y - 20, 40, 40);
		}
		ctx.fill();
		let width = ctx.measureText(player.name).width;
		ctx.fillText(player.name, player.x - width / 2, player.y + 40);
		width = ctx.measureText(player.chat).width;
		ctx.fillText(player.chat, player.x - width / 2, player.y - 30);
	}
}

function getId(id) {
	thisid = id;
}

socket.emit("addPlayer", getId);

document.addEventListener("keydown", function(e) {
	if (input == document.activeElement) {
		if (e.key == "Enter") {
			let msg = input.value;
			if (msg.startsWith("/name ")) {
				name = msg.slice(6);
				socket.emit("nameChange", thisid, name);
			}
			else if (msg.startsWith("/help")) {
				alert("Movement: Arrow Keys or WASD.\nShape-Shifting: z or j\nName Changing: n\nColor Changing: c\nChat: enter");
			}
			else if (msg.startsWith("/color ")) {
				color = msg.slice(7);
				socket.emit("colorChange", thisid, color);
			}
			else {
				socket.emit("chatMsg", thisid, msg);
			}
			input.value = "";
			input.blur();
			input.style.display = "none";
		}
	}
	else if (e.key == "Enter") {
		input.style.display = "block";
		input.focus();
	}
	else if (e.key == "n") {
		name = prompt("What would you like your username to be?");
		socket.emit("nameChange", thisid, name);
	}
	else if (e.key == "c") {
		color = prompt("What would you like your color to be?");
		socket.emit("colorChange", thisid, color);
	}
	else if (e.key in downevents) {
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

socket.on("tick", function (data) {
	update(data);
})