// Puzzle answers and the pattern shown on the card.
// kanye's game of life ahh patter.
const pattern = [
	[0, 1, 1, 0, 1, 1, 0],
	[1, 0, 0, 1, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 1],
	[0, 1, 0, 0, 0, 1, 0],
	[0, 0, 1, 0, 1, 0, 0],
	[0, 0, 0, 1, 0, 0, 0],
];

const numberAnswer = [ 4, 44, 42];
const passcodeAnswer = [4, 12345678];
const cardPasswords = ["alexisasiamark", "ravenasiamark", "password", "again", "4"];
const secretWords = ["gratitude", "4"];

const libraryAddress = {
	hex: "the longest comment in the source code. (dont include the <!-- and -->, just the text in between)",
	wall: 3,
	shelf: 2,
	volume: 31,
	page: 39,
};

// Turn the small puzzle pattern into visible grid cells (ant-man reference).
function drawBoard(board) {
	for (let row = 0; row < pattern.length; row++) {
		for (let column = 0; column < pattern[row].length; column++) {
			const cell = document.createElement("div");

			if (pattern[row][column] === 1) {
				cell.className = "cell on";
			} else {
				cell.className = "cell";
			}

			board.appendChild(cell);
		}
	}
}

// Game of Life simulation, grid size, and animation state.
const golCanvas = document.getElementById("golCanvas");
const golContext = golCanvas.getContext("2d");
const golCellSize = 8;
const golColumns = golCanvas.width / golCellSize;
const golRows = golCanvas.height / golCellSize;
let golGrid = buildGolGrid();
let golAnimationFrame = null;
let golLastUpdate = 0;

// Create a random grid where 1 is alive and 0 is dead.
function buildGolGrid() {
	return Array.from({ length: golColumns }, () =>
		Array.from({ length: golRows }, () => Math.floor(Math.random() * 2))
	);
}

// Draw all living cells on the canvas.
function drawGolGrid() {
	golContext.clearRect(0, 0, golCanvas.width, golCanvas.height);
	golContext.fillStyle = "#00ff88";

	for (let column = 0; column < golColumns; column++) {
		for (let row = 0; row < golRows; row++) {
			if (golGrid[column][row] === 1) {
				golContext.fillRect(
					column * golCellSize,
					row * golCellSize,
					golCellSize - 1,
					golCellSize - 1
				);
			}
		}
	}
}

// Apply Conway's rules to create the next generation, wrapping at the edges.
function nextGolGeneration() {
	const next = golGrid.map((column) => [...column]);

	for (let column = 0; column < golColumns; column++) {
		for (let row = 0; row < golRows; row++) {
			let neighbors = 0;

			for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
				for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
					if (columnOffset === 0 && rowOffset === 0) continue;

					const neighborColumn = (column + columnOffset + golColumns) % golColumns;
					const neighborRow = (row + rowOffset + golRows) % golRows;
					neighbors += golGrid[neighborColumn][neighborRow];
				}
			}

			if (golGrid[column][row] === 1) {
				next[column][row] = neighbors === 2 || neighbors === 3 ? 1 : 0;
			} else if (neighbors === 3) {
				next[column][row] = 1;
			}
		}
	}

	golGrid = next;
}

// Advance and redraw the simulation every 100 milliseconds.
function animateGol(timestamp) {
	if (timestamp - golLastUpdate >= 100) {
		nextGolGeneration();
		drawGolGrid();
		golLastUpdate = timestamp;
	}

	golAnimationFrame = requestAnimationFrame(animateGol);
}

// Start the simulation once Puzzle 2 is shown.
function startGol() {
	if (golAnimationFrame !== null) return;
	golLastUpdate = 0;
	golAnimationFrame = requestAnimationFrame(animateGol);
}

// Stop the simulation when leaving Puzzle 2.
function stopGol() {
	if (golAnimationFrame === null) return;
	cancelAnimationFrame(golAnimationFrame);
	golAnimationFrame = null;
}

// Randomize the cells when the player presses the button.
document.getElementById("randomizeGolBtn").addEventListener("click", () => {
	golGrid = buildGolGrid();
	drawGolGrid();
});
drawGolGrid();

// Draw the static pattern used on the puzzle board and card cover.
drawBoard(document.getElementById("board"));
drawBoard(document.getElementById("coverArt"));

// Elements and state used to open the card and reveal the puzzles.
const card = document.getElementById("card");
const stage = document.querySelector(".stage");
const inside = document.getElementById("inside");
const toggleButton = document.getElementById("toggleBtn");
const secretButton = document.getElementById("secretTrigger");
const musicVideo = document.getElementById("musicVideo");
const videoHintArrow = document.getElementById("videoHintArrow");
const hintNote = document.getElementById("hintNote");
let passwordGateOpened = false;

// Keep the card visuals, button labels, and hidden content in sync.
function setCardOpen(isOpen) {
	card.classList.toggle("open", isOpen);
	stage.classList.toggle("is-open", isOpen);
	inside.inert = !isOpen;

	if (isOpen) {
		toggleButton.textContent = "Close";
	} else {
		toggleButton.textContent = "Open";
	}

	toggleButton.setAttribute("aria-expanded", String(isOpen));
	musicVideo.classList.toggle("hidden", !isOpen || passwordGateOpened);
	videoHintArrow.classList.toggle("hidden", !isOpen || passwordGateOpened);
	hintNote.classList.toggle("hidden", !isOpen || passwordGateOpened);
	secretButton.classList.toggle("hidden", isOpen);
}

// Open or close the card from its main button.
function toggleCard() {
	setCardOpen(!card.classList.contains("open"));
}

// Reveal the password form when the hidden cover button is clicked.
function showPasswordGate() {
	passwordGateOpened = true;
	stage.classList.add("has-password-gate");
	document.getElementById("passwordGate").classList.remove("hidden");
	musicVideo.classList.add("hidden");
	setCardOpen(true);
	document.getElementById("passwordInput").focus();
}

// Check the card password and reveal the puzzle section.
function checkCardPassword() {
	const passwordInput = document.getElementById("passwordInput");
	const passwordMessage = document.getElementById("passwordMessage");

	if (cardPasswords.includes(passwordInput.value.trim())) {
		document.getElementById("passwordGate").classList.add("hidden");
		document.getElementById("puzzle").classList.remove("hidden");
		card.classList.add("wide");
		passwordMessage.textContent = "";
	} else {
		passwordMessage.textContent = "Incorrect password. Please try again.";
		passwordMessage.className = "msg bad";
		passwordInput.select();
	}
}

// Check Puzzle 1 and reveal Puzzle 2 when the answer is accepted.
function checkFirstPuzzle() {
	const answer = Number(document.getElementById("answer").value);
	const message = document.getElementById("msg1");

	if (numberAnswer.includes(answer)) {
		message.className = "msg ok";
		document.getElementById("p1").classList.add("hidden");
		document.getElementById("p2").classList.remove("hidden");
		startGol();
	} else {
		message.textContent = "Not quite. try again.";
		message.className = "msg bad";
	}
}

// Check Puzzle 2's passcode and reveal the Library of Babel puzzle.
function showLibraryPuzzle() {
	const passcode = Number(document.getElementById("num2").value);
	const message = document.getElementById("msg3");

	if (passcodeAnswer.includes(passcode)) {
		message.className = "msg ok";
		document.getElementById("aHex").textContent = libraryAddress.hex;
		document.getElementById("aWall").textContent = libraryAddress.wall;
		document.getElementById("aShelf").textContent = libraryAddress.shelf;
		document.getElementById("aVolume").textContent = libraryAddress.volume;
		document.getElementById("aPage").textContent = libraryAddress.page;
		stopGol();
		document.getElementById("p2").classList.add("hidden");
		document.getElementById("p3").classList.remove("hidden");
		document.getElementById("babelContainer").classList.remove("hidden");
	} else {
		message.textContent = "That number is not correct. Try again.";
		message.className = "msg bad";
	}
}

// Check the secret word and reveal the final message.
function unlockMessage() {
	const word = document.getElementById("word").value.trim().toLowerCase();
	const message = document.getElementById("msg2");

	if (secretWords.includes(word)) {
		document.getElementById("puzzle").classList.add("hidden");
		document.getElementById("message").classList.remove("hidden");
	} else {
		message.textContent = "That is not the word. Check the Library again.";
		message.className = "msg bad";
	}
}

// Connect the page buttons to their actions.
toggleButton.addEventListener("click", toggleCard);
secretButton.addEventListener("click", showPasswordGate);
document.getElementById("passwordBtn").addEventListener("click", checkCardPassword);
document.getElementById("checkBtn").addEventListener("click", checkFirstPuzzle);
document.getElementById("mapBtn").addEventListener("click", showLibraryPuzzle);
document.getElementById("unlockBtn").addEventListener("click", unlockMessage);
