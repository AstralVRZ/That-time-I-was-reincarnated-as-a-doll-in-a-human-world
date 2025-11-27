// Summoning circle shenanigans
let circleSize = 0;
const maxCircleSize = 128;
const growthRate = 1.5;
let rotationAngle = 0;
const rotationSpeed = 0.02;

// Sprites
let circleImg;
let wizardImg = [];
let nyalryImg;

// Dialogue tracker
const dialogueArray = ["summoning.json", "meeting.json"];
let currentDialogue = 0;



function preload() {
  circleImg = loadImage("./art/summoning/pentagram-concept.png");
  wizardImg = [loadImage("./art/evilwizard1.png"), loadImage("./art/evilwizard2.png"), loadImage("./art/evilwizard3.png")];
  nyalryImg = loadImage("./art/nyarly.png");
}

function setup() {
  const canvas = createCanvas(1000, 650);
  canvas.parent("canvas");
  imageMode(CENTER);
  angleMode(RADIANS);
}

function draw() {
  background(15, 15, 30);
  if (currentDialogue === 0) {
    drawSummoningScene();
  }
}

let nyarly = false;
let wizDespawned = false;
function drawSummoningScene(effect) {
  translate(width / 2, height / 2);
  if (effect === "spawn_nyarly") {
    nyarly = true
  }
  if (effect === "despawn_wiz") {
    wizDespawned = true;
  }

  if (wizDespawned === false) {
    rotationAngle += rotationSpeed;
    circleSize = min(maxCircleSize, circleSize + growthRate);


    push();
    rotate(rotationAngle);
    const scaledSize = map(circleSize, 0, maxCircleSize, 0, circleImg.width);
    image(circleImg, 0, 0, scaledSize * 2, scaledSize * 2);
    pop();
  }

  if (nyarly === true) {
    const nyarlySize = 64;
    image(nyalryImg, 0, 0, nyarlySize, nyarlySize);
  }
  if (wizDespawned === false) {
    const wizardRadius = circleSize / 2 + 90;
    const wizardSize = 128;
    const baseAngle = -HALF_PI;
    for (let i = 0; i < 3; i++) {
      const angle = baseAngle + (TWO_PI / 3) * i;
      const x = cos(angle) * wizardRadius;
      const y = sin(angle) * wizardRadius;
      image(wizardImg[i], x, y, wizardSize, wizardSize);
    }
  }
}

async function fetchDialogue(file) {
  return fetch(`./dialogue/${file}`)
    .then(response => response.json())
    .then(data => {
      console.log('Dialogue data:', data);
      return data;
    })
    .catch(error => {
      console.error('Error fetching dialogue data:', error);
      return null;
    });
}


let lineIndex = 0;

async function progressDialogue() {
  let data = await fetchDialogue(dialogueArray[currentDialogue]);
  if (!data) return;
  const totalLines = data.lines.length;
  const charactercontainer = document.getElementById('charactercontainer');
  const name = document.getElementById('charactername');
  const portrait = document.getElementById('characterimage');
  const dialogueText = document.getElementById('dialoguetext');

  if (data.lines[lineIndex].no_portrait === true) {
    charactercontainer.style.display = 'none';
  } else {
    charactercontainer.style.display = 'flex';
  }
  if (data.lines[lineIndex].screen_effect) {
    drawSummoningScene(data.lines[lineIndex].screen_effect);
  }
  name.innerHTML = data.lines[lineIndex].character;
  if (data.lines[lineIndex].portrait === "")
    portrait.src = `./art/unknown.png`;
  else
    portrait.src = `./art/characters/${data.lines[lineIndex].portrait}`;
  dialogueText.innerHTML = data.lines[lineIndex].text;
  lineIndex += 1;
  if (lineIndex >= totalLines) {
    currentDialogue += 1;
    lineIndex = 0;
    if (currentDialogue >= dialogueArray.length) {
      currentDialogue = 0
      resetStates();
    }
  }
}

function resetStates() {
  nyarly = false;
  wizDespawned = false;
}

progressDialogue();