import { io } from "socket.io-client";
import "p5/lib/addons/p5.dom";
import "./styles.scss";

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

socket.on("pong.cast", (game: IPongView) => {
  game = game;
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
