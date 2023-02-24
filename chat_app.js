// PS! Replace this with your own channel ID
const CLIENT_ID = "iAPwIcw0S6VOIlpm";

const drone = new ScaleDrone(CLIENT_ID, {
  data: {
    // Will be sent out as clientData via events
    name: getRandomName(),
    color: getRandomColor(),
  },
});

let members = [];

drone.on("open", (error) => {
  if (error) {
    return console.error(error);
  }
  console.log("Successfully connected to Scaledrone");

  const room = drone.subscribe("observable-room");
  room.on("open", (error) => {
    if (error) {
      return console.error(error);
    }
    console.log("Successfully joined room");
  });

  room.on("members", (m) => {
    members = m;
    updateMembersDOM();
  });

  room.on("member_join", (member) => {
    members.push(member);
    updateMembersDOM();
  });

  room.on("member_leave", ({ id }) => {
    const index = members.findIndex((member) => member.id === id);
    members.splice(index, 1);
    updateMembersDOM();
  });

  room.on("data", (text, member) => {
    if (member) {
      addMessageToListDOM(text, member);
    } else {
      // Message is from server
    }
  });
});

drone.on("close", (event) => {
  console.log("Connection was closed", event);
});

drone.on("error", (error) => {
  console.error(error);
});

function getRandomName() {
  const adjs = [
    "Peter",
    "Mark",
    "Julie",
    "Alonso",
    "David",
    "Felipe",
    "Christina",
    "Jennifer",
    "Ben",
    "Grace",
  ];

  const nouns = [
    "🐅",
    "🦓",
    "🦍",
    "🐫",
    "🐎",
    "🦘",
    "🐬",
    "🐟",
    "🦒",
    "🐝",
    "🦋",
  ];

  return (
    adjs[Math.floor(Math.random() * adjs.length)] +
    "_" +
    nouns[Math.floor(Math.random() * nouns.length)]
  );
}

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

// ------------- DOM STUFF --------------

const DOM = {
  members: document.querySelector(".members"),
  messages: document.querySelector(".messages"),
  form: document.querySelector(".msgForm"),
  input: document.querySelector(".msgFormInput"),
};

// Event listener for sending messages
DOM.form.addEventListener("submit", sendMessage);

//Sending messages
function sendMessage() {
  const value = DOM.input.value;
  if (value === "") {
    return;
  }
  DOM.input.value = "";
  drone.publish({
    room: "observable-room",
    message: value,
  });
}

// Who's online
function updateMembersDOM() {
  DOM.members.innerHTML =
    members.length < 2
      ? `${members.length} Online user in chat: ${members
          .map((value) => {
            return `<span style="color: ${value.clientData.color}">${value.clientData.name}</span>`;
          })
          .join(", ")}`
      : `${members.length} Online users in chat: ${members
          .map((value) => {
            return `<span style="color: ${value.clientData.color}">${value.clientData.name}</span>`;
          })
          .join(", ")}`;
}

/*
- Adding and creating msg to the dom
- Separate msg
*/

function createMessageElement(text, member) {
  // Define "me"
  const clientID = drone.clientId;
  const messageFromMe = member.id === clientID;

  // Check if the messages are from "me"
  const className = messageFromMe ? "message currentMember" : "message";
  const { name, color } = member.clientData;

  // Creating and adding MSG to DOM
  const msg = document.createElement("div");
  msg.className = "messageText";
  msg.appendChild(document.createTextNode(text));

  // Creating username profile with a name, color, and an icon
  const profile = document.createElement("div");
  profile.className = "profile";

  const character = document.createElement("div");
  character.appendChild(document.createTextNode(name));
  character.style.color = color;
  character.className = "name";

  profile.appendChild(character);

  // Add date & time to the msg
  // const msgElement = DOM.messages;

  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes()}`.padStart(2, "0");
  const date = new Intl.DateTimeFormat(navigator.language).format(now);

  const msgDateTime = document.createElement("div");

  msgDateTime.textContent = `${date}, ${time}`;
  msgDateTime.classList.add("time-date");

  // "User profile" - profile, message, time/date
  const element = document.createElement("div");
  element.appendChild(profile);
  element.appendChild(msg);
  element.className = className;
  element.append(msgDateTime);

  return element;
}

// Add new messages to chat window
function addMessageToListDOM(text, member) {
  // auto-scroll to the bottom of the chat when the message is added
  const element = DOM.messages;
  const wasTop =
    element.scrollTop === element.scrollHeight - element.clientHeight;
  element.appendChild(createMessageElement(text, member));
  if (wasTop) {
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }
}
