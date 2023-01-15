import { io } from "socket.io-client";
import P5 from "p5";
import "p5/lib/addons/p5.dom";
import "./styles.scss";
import { IPongView, Pong } from "./types";
import { io } from "socket.io-client";

let game: IPongView;
let pong = new Pong(600, 400, { id: "1" }, { id: "2" });

const conversation = document.getElementById("messagesFrom");
const btn = document.querySelector("#sendMessage");
const input = document.querySelector("#message");
const btnJoin = document.querySelector("#join-btn");
const inputPlayerName: HTMLInputElement = document.querySelector(
  "#player-name"
);
const playerList = document.querySelector("#player-list");

const socket = io("https://ho8kd6-3000.preview.csb.app/");

socket.on("connect", () => {
  console.log("test", socket.id);
});

socket.on("chat-message", (payload: { message: any; name: string }) => {
  conversation.innerHTML += `
  <div class="float-child-green"><p>
  <label style="font-size:10px;">${payload.name}</label></br>
  ${payload.message}
  </p></div>`;
  // console.log("new message", data);
  // document.body.innerHTML = "<p><strong>" + newMessage + "</strong></p>";
});

socket.on("pong.members", (members) => {
  playerList.innerHTML = members
    .map(
      (member: { id: string; name: string }) =>
        `<p ${member.id === socket.id ? 'style="color:red;"' : ""}>${
          member.name
        }</p>`
    )
    .join("");
});

socket.on("pong.cast", (newGame: IPongView) => {
  game = newGame;
});

input.addEventListener("keydown", (e) => {
  e.stopPropagation();
});

btn.addEventListener("click", () => {
  if (input.value) {
    conversation.innerHTML += `
    <div class="float-child-blue"><p>
    <label style="font-size:10px;">${inputPlayerName.value}</label></br>
    ${input.value}
    </p></div>`;
    socket.emit("chat-message", input.value);
    input.value = "";
  }
});

btnJoin.addEventListener("click", (e) => {
  if (inputPlayerName.value) {
    socket.emit("pong.join", inputPlayerName.value);
    inputPlayerName.setAttribute("readonly", "true");
    btnJoin.setAttribute("disabled", "true");
  }
});

// Creating the sketch itself
const sketch = (p5: P5) => {
  p5.setup = () => {
    // Creating and positioning the canvas
    const canvas = p5.createCanvas(600, 400);
    canvas.parent("app");
    p5.background("black");
  };

  p5.draw = () => {
    p5.background(0);
    if (game) {
      // left paddle
      p5.fill(...([128, 0, 0] as const));
      p5.rectMode(game.left.rectMode);
      p5.rect(...game.left.rect);
      // right paddle
      p5.fill(...game.right.fill);
      // }
      p5.rectMode(game.right.rectMode);
      p5.rect(...game.right.rect);
      // puck
      p5.fill(...game.puck.fill);
      p5.ellipse(...game.puck.ellipse);
      // score
      p5.fill(255);
      p5.textSize(32);
      p5.text(...game.leftScore.text);
      p5.text(...game.rightScore.text);
    }
  };

  p5.keyReleased = () => {
    socket.emit("pong.move", null);
  };

  p5.keyPressed = () => {
    socket.emit("pong.move", p5.key);
  };
};
new P5(sketch);
