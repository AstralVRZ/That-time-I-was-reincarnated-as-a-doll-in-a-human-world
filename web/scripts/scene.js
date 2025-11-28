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
  elysiumImg = loadImage("./art/characters/elysiumportrait.png");
}

function setup() {
  const canvas = createCanvas(1000, 650);
  canvas.parent("canvas");
  imageMode(CENTER);
  angleMode(RADIANS);

  let context = canvas.elt.getContext('2d');
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;

}

function draw() {
  background(15, 15, 30);
  translate(width / 2, height / 2);
  if (currentDialogue === 0) {
    drawSummoningScene();
  }
  if (currentDialogue === 1) {
    drawMeetingScene();
  }
}

let nyarly = false;
let wizDespawned = false;
let hitGround = false;
function drawSummoningScene(effect) {
  if (effect === "spawn_nyarly") {
    nyarly = true
  }
  if (effect === "despawn_wiz") {
    wizDespawned = true;
  }
  if (effect === "hit_ground") {
    hitGround = true;
    nyarly = false;
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

  const nyarlySize = 128;
  if (nyarly === true && hitGround === false) {
    image(nyalryImg, 0, 0, nyarlySize, nyarlySize);
  }
  if (hitGround === true && nyarly === false) {
    // rotate nyarly horizontally to simulate lying down
    push();
    rotate(HALF_PI);
    image(nyalryImg, 0, 0, nyarlySize, nyarlySize);
    pop();
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

let onground = true;
let walkAway = false;
let elysiumX = -200; 
let targetElysiumX = -200;
let nyarlyX = 0;
let targetNyarlyX = 0;
let moveSpeed = 0.05;
let moveSpeedAway = 0.01;

function drawMeetingScene(effect) {
  if (onground === true) {
    push();
    rotate(HALF_PI);
    image(nyalryImg, 0, 0, 128, 128);
    pop();
    
    image(elysiumImg, elysiumX, 0, 128, 128);
  } else if (walkAway === false) {
    image(nyalryImg, 0, 0, 128, 128);
    elysiumX = lerp(elysiumX, targetElysiumX, moveSpeed);
    image(elysiumImg, elysiumX, 0, 128, 128);
  } else {
    nyarlyX = lerp(nyarlyX, targetNyarlyX, moveSpeedAway);
    image(nyalryImg, nyarlyX, 0, 128, 128);
    elysiumX = lerp(elysiumX, targetElysiumX, moveSpeedAway);
    image(elysiumImg, elysiumX, 0, 128, 128);
  }
  if (effect === "help_up") {
    onground = false;
    targetElysiumX = -50; // Set target position to trigger movement
  }
  if (effect === "walk_away") {
    walkAway = true;
    targetElysiumX = 600; // Move Elysium off-screen to the right
    targetNyarlyX = 600; // Move Nyarly off-screen to the left

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
    if (currentDialogue === 0) {
      drawSummoningScene(data.lines[lineIndex].screen_effect);
    } else if (currentDialogue === 1) {
      drawMeetingScene(data.lines[lineIndex].screen_effect);
    }
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
  hitGround = false;

  onground = true;
  elysiumX = -200; 
  targetElysiumX = -200;
  nyarlyX = 0;
  targetNyarlyX = 0;
  walkAway = false;

}

progressDialogue();