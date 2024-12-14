// JavaScript code for the fretboard trainer

document.addEventListener('DOMContentLoaded', function () {

    // Dropdown elements
    const scaleDropdown = document.getElementById('scale-select');
    const tonicDropdown = document.getElementById('tonic-select');
    const intervalContainer = document.getElementById('interval-checkboxes');
    const fretboardCanvas = document.getElementById('fretboard-canvas');
    const ctx = fretboardCanvas.getContext('2d');
    const timerDisplay = document.getElementById('timer'); // Timer display element
    const startButton = document.getElementById('startButton'); // Start button for the timer
    const stopButton = document.getElementById('stopButton');
    const timeInput = document.getElementById('timeInput'); // Input for time duration
    const resultDiv = document.getElementById('result'); // Result display element
    const scaleDegreeDisplay = document.getElementById('scale-degree-list'); // New element for showing scale degree accuracy
const missedScaleDegreeDisplay = document.getElementById('missed-scale-degree-list'); // New element for showing scale degree accuracy

const dirLabel = document.getElementById('mselection-label1'); 
const ascLabel = document.getElementById('asc');
const disLabel = document.getElementById('dis');
const arrow = document.getElementById('arr');



    let currentTonic = "A";
    let thisRoundTonic = "A";
    let targetNotes = ["A", "B", "C", "D", "E", "F", "G"];
    let scaleNotesWithDegrees = [{note: 'A', degree: 'Root'}, {note: 'B', degree: 'M2'}, {note: 'C#', degree: 'M3'}, {note: 'D', degree: '4'}, {note: 'E', degree: '5'}, {note: 'F#', degree: 'M6'}, {note: 'G#', degree: 'M7'}];
    // List of scales and tonics
    const scales = ["Major", "Minor", "Minor Blues", "Minor Pentatonic", "Major Pentatonic", "Harmonic Minor", "Harmonic Major"];
    const tonics = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "Random"];
    const intervals = ["Root", "m2", "M2", "m3", "M3", "4", "#4", "5", "m6", "M6", "m7", "M7"];

    let timerInterval; // To hold the interval ID for the timer

    const disableCondition = 'Random';
    // Get references for the new elements
    const challengeTimerContainer = document.getElementById('challenge-timer-container');
    const correctCountDisplay = document.getElementById('correct-count');
    const incorrectCountDisplay = document.getElementById('incorrect-count');
    let correctCount = 0;
    let incorrectCount = 0;
    let isChallengeMode = false; // Tracks if we're in challenge mode
    let isTimerActive = false; // Tracks if the timer is running


// Circle class to handle drawing circles
    class Circle {
        constructor(ctx, x, y, radius, color) {
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
        }

        draw() {
            const circle = new Path2D();
            circle.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = this.color;
            this.ctx.fill(circle);
            this.ctx.stroke(circle);
        }

        clear(timeout = 2000) {
            setTimeout(() => {
                this.ctx.drawImage(fretboardImage, 0, 0, fretboardCanvas.width, fretboardCanvas.height);
            }, timeout);
        }
    }

    let scaleDegreeCounts = {
        'Root': 0,
        'm2': 0,
        'M2': 0,
        'm3': 0,
        'M3': 0,
        '4': 0,
        '#4': 0,
        '5': 0,
        'm6': 0,
        'M6': 0,
        'm7': 0,
        'M7': 0
    };

    let missedScaleDegreeCounts = {
        'Root': 0,
        'm2': 0,
        'M2': 0,
        'm3': 0,
        'M3': 0,
        '4': 0,
        '#4': 0,
        '5': 0,
        'm6': 0,
        'M6': 0,
        'm7': 0,
        'M7': 0
    };

    // Function to reset the scale degree counters
    function resetScaleDegreeCounts() {
        for (let degree in scaleDegreeCounts) {
            scaleDegreeCounts[degree] = 0;
        }
    }

// Function to reset the missed scale degree counters
    function resetMissedScaleDegreeCounts() {
        for (let degree in missedScaleDegreeCounts) {
            missedScaleDegreeCounts[degree] = 0;
        }
    }


    // Function to update the display of scale degree counts
    function updateScaleDegreeDisplay() {
        let displayText = '';
        for (let combo of scaleNotesWithDegrees) {
            displayText += `${combo['degree']}: ${scaleDegreeCounts[combo['degree']]}, `;
        }
        scaleDegreeDisplay.textContent = displayText.trim().slice(0, -1); // Remove the last comma and update the display
    }

// Function to update the display of scale degree counts
    function updateMissedScaleDegreeDisplay() {
        let displayText = '';
        for (let combo of scaleNotesWithDegrees) {
            displayText += `${combo['degree']}: ${missedScaleDegreeCounts[combo['degree']]}, `;
        }
        missedScaleDegreeDisplay.textContent = displayText.trim().slice(0, -1); // Remove the last comma and update the display
    }

fretboardCanvas.addEventListener('click', handleTrainingUserClick);

// Function to render the list dynamically
function renderScaleDegrees(accurateCounts, missesCounts) {
    const container = document.getElementById('scale-degree-list');
    container.innerHTML = ""; // Clear any previous content

    // Create the list dynamically
    const ul = document.createElement('ul');

    // Create row for scale degrees
    const degreeRow = document.createElement('li');
    for (let combo of scaleNotesWithDegrees) {
        const degreeEl = document.createElement('span');
        degreeEl.className = 'degree';
        degreeEl.innerHTML = `${combo['degree']}`;
        degreeRow.appendChild(degreeEl);
    }
    ul.appendChild(degreeRow);

    // Create row for correct counts
    const correctRow = document.createElement('li');
    for (let combo of scaleNotesWithDegrees) {
        const accuracyEl = document.createElement('span');
        accuracyEl.className = 'accuracy';
        accuracyEl.innerHTML = `✅ ${accurateCounts[combo['degree']] || 0}`;
        correctRow.appendChild(accuracyEl);
    }
    ul.appendChild(correctRow);

    // Create row for missed counts (only if there are misses)
    if (Object.keys(missesCounts).length > 0) {
        const missedRow = document.createElement('li');
        for (let combo of scaleNotesWithDegrees) {
            const missesEl = document.createElement('span');
            missesEl.className = 'misses';
            missesEl.innerHTML = `❌ ${missesCounts[combo['degree']] || 0}`;
            missedRow.appendChild(missesEl);
        }
        ul.appendChild(missedRow);
    }

    container.appendChild(ul);
}

renderScaleDegrees(scaleDegreeCounts, []);



    // Show/hide the timer and start button based on mode selection
    const radioButtons = document.querySelectorAll('input[name="mode-option"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'challenge') {
if (currentTonic === 'Random'){
    let scaleButton = document.getElementById('scaleButton');
		scaleButton.disabled = true;
                
}
                challengeTimerContainer.style.display = 'inline'; // Show timer and start button in challenge mode
                isChallengeMode = true;
		fretboardCanvas.removeEventListener('click', handleTrainingUserClick);
resetScaleDegreeCounts(); // Reset and initialize scale degrees tracking
	resetMissedScaleDegreeCounts();
renderScaleDegrees(scaleDegreeCounts, missedScaleDegreeCounts);

            } else {
		
		let scaleButton = document.getElementById('scaleButton');
		scaleButton.disabled = false;
		let contextMessageDiv = document.getElementById('context-message'); 
		contextMessageDiv.innerHTML = ''
                challengeTimerContainer.style.display = 'inline'; // Hide timer and start button in training mode
                isChallengeMode = false;
                resetClickCounters(); // Reset counters when switching to training mode
		fretboardCanvas.removeEventListener('click', handleUserClick);
		fretboardCanvas.addEventListener('click', handleTrainingUserClick);
resetScaleDegreeCounts(); // Reset and initialize scale degrees tracking
	resetMissedScaleDegreeCounts();
renderScaleDegrees(scaleDegreeCounts, []);

            }

 // Check and replace dropdown value if needed
        if (this.value !== 'challenge' && tonicDropdown.value === disableCondition) {
            tonicDropdown.value = 'A'; // Replace the value
        }
// Disable selecting run direction

document.querySelectorAll('input[name="pattern-direction"]').forEach(input => {
       if (this.value !== 'challenge'){
        input.disabled = true;
        input.style.display = 'none';
        dirLabel.style.display = 'none';
ascLabel.parentElement.style.display = 'none';
disLabel.parentElement.style.display = 'none';
arrow.style.display = 'none';
        if (this.checked) {
           
            input.checked = false;  // Uncheck the radio buttons
}}
else{
 input.style.display = 'inline-block';  // Show the radio buttons
        dirLabel.style.display = 'inline-block';
ascLabel.parentElement.style.display = 'inline-block';
disLabel.parentElement.style.display = 'inline-block';
arrow.style.display = 'inline-block';
        input.disabled = false;
        
        if (input.value === 'ascending'){
input.checked = true;
}
}   

    });

// Disable Random if Training is selected
        tonicDropdown.querySelectorAll('option').forEach(option => {
            if (this.value !== 'challenge' && option.value === disableCondition) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
        });
    });

    // Function to reset the correct and incorrect counters
    function resetClickCounters() {
        correctCount = 0;
        incorrectCount = 0;
        correctCountDisplay.textContent = correctCount;
        incorrectCountDisplay.textContent = incorrectCount;
    }

    // Add options to scale dropdown
    scales.forEach(scale => {
        const option = document.createElement('option');
        option.value = scale;
        option.textContent = scale;
        scaleDropdown.appendChild(option);
    });

    // Add options to tonic dropdown
    tonics.forEach(tonic => {
        const option = document.createElement('option');
        option.value = tonic;
        option.textContent = tonic;
        tonicDropdown.appendChild(option);
        if (option.value ==='Random'){
option.disabled = true;
}
    });

    // Add checkboxes for intervals
    intervals.forEach(interval => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'interval';
        checkbox.value = interval;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(interval));
        intervalContainer.appendChild(label);
    });

    // Event listeners for dropdown selections
    scaleDropdown.addEventListener('change', function () {
        console.log('Scale selected:', scaleDropdown.value);
    });

    tonicDropdown.addEventListener('change', function () {
	currentTonic = tonicDropdown.value;
if (currentTonic === 'Random'){
let scaleButton = document.getElementById('scaleButton');
		scaleButton.disabled = true;
}
       
	});

    // Load fretboard image onto canvas
    const fretboardImage = new Image();
    fretboardImage.src = 'fretboard-24-frets.jpg'; // Ensure this path is correct
    fretboardImage.onload = function () {
        ctx.drawImage(fretboardImage, 0, 0, fretboardCanvas.width, fretboardCanvas.height);
    };

    // Fretboard data with both notes and octaves
    const notes_per_string = [
        [['E', 2], ['F', 2], ['F#', 2], ['G', 2], ['G#', 2], ['A', 2], ['A#', 2], ['B', 2], ['C', 3], ['C#', 3], ['D', 3], ['D#', 3], ['E', 3], ['F', 3], ['F#', 3], ['G', 3], ['G#', 3], ['A', 3], ['A#', 3], ['B', 3], ['C', 4], ['C#', 4], ['D', 4], ['D#', 4], ['E', 4]],
        [['A', 2], ['A#', 2], ['B', 2], ['C', 3], ['C#', 3], ['D', 3], ['D#', 3], ['E', 3], ['F', 3], ['F#', 3], ['G', 3], ['G#', 3], ['A', 3], ['A#', 3], ['B', 3], ['C', 4], ['C#', 4], ['D', 4], ['D#', 4], ['E', 4], ['F', 4], ['F#', 4], ['G', 4], ['G#', 4], ['A', 4]],
        [['D', 3], ['D#', 3], ['E', 3], ['F', 3], ['F#', 3], ['G', 3], ['G#', 3], ['A', 3], ['A#', 3], ['B', 3], ['C', 4], ['C#', 4], ['D', 4], ['D#', 4], ['E', 4], ['F', 4], ['F#', 4], ['G', 4], ['G#', 4], ['A', 4], ['A#', 4], ['B', 4], ['C', 5], ['C#', 5], ['D', 5]],
        [['G', 3], ['G#', 3], ['A', 3], ['A#', 3], ['B', 3], ['C', 4], ['C#', 4], ['D', 4], ['D#', 4], ['E', 4], ['F', 4], ['F#', 4], ['G', 4], ['G#', 4], ['A', 4], ['A#', 4], ['B', 4], ['C', 5], ['C#', 5], ['D', 5], ['D#', 5], ['E', 5], ['F', 5], ['F#', 5], ['G', 5]],
        [['B', 3], ['C', 4], ['C#', 4], ['D', 4], ['D#', 4], ['E', 4], ['F', 4], ['F#', 4], ['G', 4], ['G#', 4], ['A', 4], ['A#', 4], ['B', 4], ['C', 5], ['C#', 5], ['D', 5], ['D#', 5], ['E', 5], ['F', 5], ['F#', 5], ['G', 5], ['G#', 5], ['A', 5], ['A#', 5], ['B', 5]],
        [['E', 4], ['F', 4], ['F#', 4], ['G', 4], ['G#', 4], ['A', 4], ['A#', 4], ['B', 4], ['C', 5], ['C#', 5], ['D', 5], ['D#', 5], ['E', 5], ['F', 5], ['F#', 5], ['G', 5], ['G#', 5], ['A', 5], ['A#', 5], ['B', 5], ['C', 6], ['C#', 6], ['D', 6], ['D#', 6], ['E', 6]]
    ];


    // Fretboard data from your previous code
    const x1_coords = [0, 32, 86, 138, 184, 231, 276, 317, 357, 396, 433, 466, 500, 532, 560, 589, 614, 640, 664, 685, 707, 728, 748, 766, 784];
    const x2_coords = [30, 87, 139, 188, 231, 272, 318, 355, 394, 430, 465, 495, 528, 558, 586, 612, 634, 659, 680, 703, 724, 743, 764, 780, 798];

    const y_ranges = [
        [201, 180],  // Low E string
        [163.5, 146.3],  // A string
        [130, 111],  // D string
        [93, 76],    // G string
        [58, 43],    // B string
        [22, 8]      // High E string
    ];

    // Function to detect which note was clicked based on x, y coordinates
    function findNoteByClick(x, y) {
        let clickedString = null;
        let clickedFret = null;

        // Determine the string based on y-coordinate
        for (let i = 0; i < y_ranges.length; i++) {
            const [y1, y2] = y_ranges[i];
            if (y >= y2 && y <= y1) {
                clickedString = i;
                break;
            }
        }

        if (clickedString === null) return null; // No string clicked

        // Determine the fret based on x-coordinate
        for (let i = 0; i < x1_coords.length; i++) {
            if (x >= x1_coords[i] && x <= x2_coords[i]) {
                clickedFret = i;
                break;
            }
        }

        if (clickedFret === null) return null; // No fret clicked

        // Return both the note and the octave
        const [note, octave] = notes_per_string[clickedString][clickedFret];
        return {
            note,
            octave,
            string: clickedString,
            fret: clickedFret
        };
    }

    // Function to check if the clicked note is correct
    function findIfNoteIsCorrect(noteTuple, targetNotes) {
        const [note] = noteTuple; // Extract just the note
        return targetNotes.includes(note); // Compare only the note
    }

    // Function to provide click feedback
  function showClickFeedback(fret, string, isCorrect) {
    const fillColor = isCorrect ? 'green' : 'red';
    // Draw a circle that will disappear after a short time
    drawCircle(string, fret, fillColor, false);
}

// Function to redraw all remaining circles
function resetFretboard() {
    // Clear the canvas
    ctx.drawImage(fretboardImage, 0, 0, fretboardCanvas.width, fretboardCanvas.height); // Redraw the fretboard
circles=[];
}

// Modify the showClickFeedback function to utilize drawCircle
function drawReferenceNote(fret, string) {
    const fillColor = 'blue';
    // Draw a circle that will stay until reset
    drawCircle(string-1, fret, fillColor, true);
}

// Array to store circles
let circles = [];

let currentAscendingIndex = 0;      // Track position in the ascending pattern
let ascendingNotesList = [];        // Store the current ascending pattern
let currentReferenceNote = null;    // Store the current reference note
let foundIntervals = [];            // Track intervals found in the current pattern
let isTimerRunning = false;         // Track if the timer is active

// Main function to start the challenge mode
function startChallengeMode() {
    isTimerRunning = true; // Start the timer
    foundIntervals = [];    // Reset found intervals for the new round

    // Step 1: Select a random tonic and generate target notes
    selectNewTonicAndNotes();

    // Step 2: Draw an initial reference note on the fretboard
    drawRandomReferenceNote();

    // Step 3: Set up a single click event listener for user interactions
    fretboardCanvas.addEventListener('click', handleUserClick);
}

// Function to handle user clicks on the fretboard
function handleUserClick(event) {
    if (!isTimerRunning) return; // If timer has stopped, ignore clicks

    const rect = fretboardCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    

    const clickedNote = findNoteByClick(x, y);
    if (!clickedNote) {
        resultDiv.textContent = 'Click outside of frets';
        return;
    }

    const { note, octave, string, fret } = clickedNote;
     // Add safety check here
    if (currentAscendingIndex >= ascendingNotesList.length) {
        
	circles = []; // Clear circles before resetting
        selectNewTonicAndNotes();
        resetFretboard();
        drawRandomReferenceNote();
        return;
    }


const patternDirection = document.querySelector('input[name="pattern-direction"]:checked').value;
    const isCorrectNote = patternDirection === 'ascending'
        ? isHigherPitch([currentReferenceNote.note, currentReferenceNote.octave], [note, octave])
        : isLowerPitch([currentReferenceNote.note, currentReferenceNote.octave], [note, octave]);


    const targetNote = ascendingNotesList[currentAscendingIndex];
let targetDegree = targetNote.degree; // Retrieve the expected degree

  // Ensure currentAscendingIndex is within bounds before accessing
    if (patternDirection === 'ascending') {
        if (currentAscendingIndex + 1 === targetNotes.length) {
            targetDegree = ascendingNotesList[0]?.degree; // Optional chaining
        } else if (currentAscendingIndex + 1 < ascendingNotesList.length) {
            targetDegree = ascendingNotesList[currentAscendingIndex + 1]?.degree; // Optional chaining
        }
    } else {
        if (currentAscendingIndex === 0) {
            targetDegree = ascendingNotesList[0]?.degree; // Optional chaining
        } else if (currentAscendingIndex - 1 >= 0) {
            targetDegree = ascendingNotesList[currentAscendingIndex - 1]?.degree; // Optional chaining
        }
    }

    
    // Add additional safety check
    if (!targetNote) {
        
	circles = []; // Clear circles before resetting
        selectNewTonicAndNotes();
        resetFretboard();
        drawRandomReferenceNote();
        return;
    }

    // Check if the clicked note is correct and is following the previously selected note

console.log( "these are the notes: ", targetNotes);
console.log( "we hit note ", note);
console.log(" we hit a note in the scale? ", targetNotes.indexOf(note));
console.log(" our index plus 1 is ", currentAscendingIndex +1);


    if ((patternDirection === 'ascending')  && (targetNotes.indexOf(note) !== -1) && (((targetNotes.indexOf(note) == currentAscendingIndex + 1) || (currentAscendingIndex + 1 == targetNotes.length))  && isHigherPitch([currentReferenceNote.note, currentReferenceNote.octave], [note, octave]))) {
        showClickFeedback(fret, string, true); // Correct click feedback
        let scaleNoteObj = scaleNotesWithDegrees.find(item => item.note === note);


                    
                      if (scaleNoteObj) {
    scaleDegreeCounts[scaleNoteObj.degree]++;
} 

else {
    console.warn(`Note "${note}" not found in scaleNotesWithDegrees:`, scaleNotesWithDegrees);
}



        if (!foundIntervals.includes(targetNote.degree)) {
            foundIntervals.push(targetNote.degree); // Track the interval if it's a new correct one
            //updateScaleDegreeDisplay(); // Update display with found intervals
          renderScaleDegrees(scaleDegreeCounts, missedScaleDegreeCounts);
        }

        currentReferenceNote = { note, octave }; // Update the reference note to the clicked note

currentAscendingIndex = patternDirection === 'ascending'
        ? currentAscendingIndex + 1
        : currentAscendingIndex - 1;

        //currentAscendingIndex++; // Move to the next note in the ascending list

        // If we reach the tonic again, i.e. a pattern is completed
        if (targetNotes.indexOf(note)==0) {
            selectNewTonicAndNotes(); // Select new notes for the next pattern
            resetFretboard();
            drawRandomReferenceNote(); // Update the reference note for the new round
        }
    } 
else if ((patternDirection !== 'ascending')  && (targetNotes.indexOf(note) !== -1) &&  (((targetNotes.indexOf(note) == currentAscendingIndex - 1) || currentAscendingIndex === 0)  &&  !isHigherPitch([currentReferenceNote.note, currentReferenceNote.octave], [note, octave])))
{
showClickFeedback(fret, string, true); // Correct click feedback
         scaleNoteObj = scaleNotesWithDegrees.find(item => item.note === note);

                    
                      if (scaleNoteObj) {
    scaleDegreeCounts[scaleNoteObj.degree]++;
} 

if (!foundIntervals.includes(targetNote.degree)) {
            foundIntervals.push(targetNote.degree); // Track the interval if it's a new correct one
            //updateScaleDegreeDisplay(); // Update display with found intervals
renderScaleDegrees(scaleDegreeCounts, missedScaleDegreeCounts);
        }

        currentReferenceNote = { note, octave }; // Update the reference note to the clicked note

currentAscendingIndex = patternDirection === 'ascending'
        ? currentAscendingIndex + 1
        : currentAscendingIndex - 1;

        //currentAscendingIndex++; // Move to the next note in the ascending list

        // If we reach the tonic again, i.e. a pattern is completed
        if (targetNotes.indexOf(note)==0) {
            selectNewTonicAndNotes(); // Select new notes for the next pattern
            resetFretboard();
            drawRandomReferenceNote(); // Update the reference note for the new round
        }


}

else {
        showClickFeedback(fret, string, false); // Incorrect click feedback

if (targetDegree) {
    missedScaleDegreeCounts[targetDegree]++;  // Store incorrect degree
} 
//updateMissedScaleDegreeDisplay();
renderScaleDegrees(scaleDegreeCounts, missedScaleDegreeCounts);
    }
}

// Function to select a new tonic and generate the ascending notes list
function selectNewTonicAndNotes() {
    const tonics = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
thisRoundTonic = currentTonic;
if (currentTonic === 'Random'){
    thisRoundTonic = pickRandomElement(tonics);
}

   let selectedValue = document.querySelector('input[name="note-finding-option"]:checked').value;

// Generate scale notes based on the selected scale or interval pattern
if (selectedValue === 'scale') {
            handleScaleSelection(thisRoundTonic);
        } else if (selectedValue === 'interval') {
            handleIntervalSelection(thisRoundTonic);
        } else {
            console.log('No option selected or an unexpected value.');
        }


    ascendingNotesList = scaleNotesWithDegrees; // Set the notes for this round
    
    foundIntervals = []; // Clear any previously found intervals
}

// Helper function to get the closest octave of the target note
function getClosestOctave(startNote, startOctave, targetNote) {

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Find the indexes of the start note and target note within the octave
    const startIndex = notes.indexOf(startNote);
    const targetIndex = notes.indexOf(targetNote);
    
    // Calculate the closest target octave
    let targetOctave = startOctave;

  if (targetIndex < startIndex) {
        // If the end note is earlier in the scale than the start note, it means we'll move to the next octave
        targetOctave++;
    }

    return [targetNote.note,targetOctave];
}

// Function to check if a specific [note, octave] pair exists in notes_per_string
function doesNoteExist(note, octave) {
    return notes_per_string.some(stringNotes => 
        stringNotes.some(([n, o]) => n === note && o === octave)
    );
}


// State variables to store the starting note and degree
let startingNote = null;
let startingDegree = null;
// Function to draw a reference note at a random position
function drawRandomReferenceNote() {
    resetFretboard(); // Clear the previous reference note from the canvas
    let validPositionFound = false;
    let randomPosition = [];
   const patternDirection = document.querySelector('input[name="pattern-direction"]:checked').value;
    const randomNote = patternDirection === 'ascending'
        ? pickRandomElement(ascendingNotesList.slice(0, -1))
        : pickRandomElement(ascendingNotesList.slice(1));

startingNote = randomNote.note;        // Store the note for the starting message
    startingDegree = randomNote.degree;    // Store the degree for the starting message




    //const randomNote = pickRandomElement(ascendingNotesList.slice(0, -1)); // Exclude last note in list
    while (!validPositionFound) {

    randomPosition = pickRandomNotePosition([randomNote.note]);
    let nextTarget = getClosestOctave(randomPosition.note, randomPosition.octave, ascendingNotesList[0]); //Find the octave of target note to see if it exists on guitar
    validPositionFound = doesNoteExist(nextTarget[0], nextTarget[1]);
    
}

    currentAscendingIndex = ascendingNotesList.indexOf(randomNote);

    if (randomPosition) {

        drawReferenceNote(randomPosition.fret, randomPosition.string); // Draw the new reference
        currentReferenceNote = randomPosition; // Set the current reference note
// Display the context message in the new div
let scaleName = null;
const direction = patternDirection === 'ascending' ? 'ascending' : 'descending';
        const contextMessageDiv = document.getElementById('context-message');
let selectedValue = document.querySelector('input[name="note-finding-option"]:checked');



// Generate scale notes based on the selected scale or interval pattern
if (selectedValue && selectedValue.value === 'scale') {
        scaleName = scaleDropdown.value;
        
        
        // Use backticks for template literals
        contextMessageDiv.innerHTML = `Complete a ${direction} run of ${thisRoundTonic} ${scaleName}, starting from ${startingNote} (${startingDegree} degree)`;
        
    } else if (selectedValue && selectedValue.value === 'interval') {
        const selectedIntervals = Array.from(document.querySelectorAll('input[name="interval"]:checked'))
            .map(interval => interval.value);

        scaleNotesWithDegrees = getScaleNotesWithDegrees(selectedIntervals, thisRoundTonic);
        targetNotes = scaleNotesWithDegrees.map(item => item.note); // Extract just the notes
        
        if (Array.isArray(selectedIntervals)) {
            // Use backticks here as well
            contextMessageDiv.innerHTML = `Complete a ${direction} run in ${thisRoundTonic} of (${scaleNotesWithDegrees.map(item => item.degree).join(', ')}) starting from ${startingNote} (${startingDegree} degree)`;
        }
    }        
        
        
        
    } else {
        console.error(`No valid position found for note ${randomNote.note}`);
    }
}

// Function to stop the challenge and reset the board when the timer ends
function stopChallengeMode() {
    isTimerRunning = false;
    fretboardCanvas.removeEventListener('click', handleUserClick);
    resetFretboard(); // Clear any remaining circles
}

// Helper function to compare pitches and ensure ascending order
function isHigherPitch(noteOctave1, noteOctave2) {
    const noteToSemitone = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
    const [note1, octave1] = noteOctave1;
    const [note2, octave2] = noteOctave2;

    const pitch1 = (12 * octave1) + noteToSemitone[note1];
    const pitch2 = (12 * octave2) + noteToSemitone[note2];
    return pitch2 > pitch1;
}

// Function to draw a circle over specific fret and string
function drawCircle(string, fret, color = 'blue', keep = false) {
    const x_center = (x1_coords[fret] + x2_coords[fret]) / 2; // Calculate x-center
   
    const y_center = (y_ranges[string][0] + y_ranges[string][1]) / 2; // Calculate y-center

    // Create a circle object to store its properties
    const circle = {
        x: x_center,
        y: y_center,
        radius: 8,
        color: color,
        keep: keep // Flag to determine if it should be kept
    };

    // Add the circle to the array
    circles.push(circle);

    // Draw the circle immediately
    ctx.fillStyle = color;
    const circlePath = new Path2D();
    circlePath.arc(x_center, y_center, circle.radius, 0, Math.PI * 2);
    ctx.fill(circlePath);
    ctx.stroke(circlePath);

    // If it's not a kept circle, clear it after a timeout
    if (!keep) {
        setTimeout(() => {
            // Remove the circle from the array
            circles = circles.filter(c => c !== circle);
            redrawCircles(); // Redraw remaining circles
        }, 200); // Change this value to adjust duration before removal
    }
}

// Function to redraw all remaining circles
function redrawCircles() {
    // Clear the canvas
    ctx.drawImage(fretboardImage, 0, 0, fretboardCanvas.width, fretboardCanvas.height); // Redraw the fretboard

    // Draw all circles in the circles array
    circles.forEach(circle => {
        ctx.fillStyle = circle.color;
        const circlePath = new Path2D();
        circlePath.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fill(circlePath);
        ctx.stroke(circlePath);
    });
}

    // Function to return scale notes and their degrees based on intervals and tonic
    function getScaleNotesWithDegrees(intervals, tonic) {
        const noteToSemitone = {
            'C': 0, 'C#': 1,
            'D': 2, 'D#': 3,
            'E': 4,
            'F': 5, 'F#': 6,
            'G': 7, 'G#': 8,
            'A': 9, 'A#': 10,
            'B': 11
        };

        const semitoneToNote = Object.fromEntries(Object.entries(noteToSemitone).map(([k, v]) => [v, k]));

        const intervalMapping = {
            'Root': 0,
            'm2': 1,
            'M2': 2,
            'm3': 3,
            'M3': 4,
            '4': 5,
            '#4': 6,
            '5': 7,
            'm6': 8,
            'M6': 9,
            'm7': 10,
            'M7': 11
        };

        if (!(tonic in noteToSemitone)) {
            return `Error: ${tonic} is not a valid tonic note.`;
        }

        let scaleNotes = [];
        let currentNote = tonic;

        for (let interval of intervals) {
            const intervalSemitones = intervalMapping[interval];
            const currentNoteIndex = noteToSemitone[tonic];
            const nextNoteIndex = (currentNoteIndex + intervalSemitones) % 12;
            const nextNote = semitoneToNote[nextNoteIndex];

            scaleNotes.push({
                note: nextNote,
                degree: interval
            });

            currentNote = nextNote;
        }
        return scaleNotes;
    }

    // Function to get the selected radio button value
    function getSelectedRadioValue() {
        const selectedOption = document.querySelector('input[name="note-finding-option"]:checked');
        return selectedOption ? selectedOption.value : null; // Return the value or null if none is selected
    }

    // Modify handleIntervalSelection and handleScaleSelection to store both notes and degrees
    function handleIntervalSelection(tonic) {
        
        const selectedIntervals = Array.from(document.querySelectorAll('input[name="interval"]:checked'))
            .map(interval => interval.value);

        scaleNotesWithDegrees = getScaleNotesWithDegrees(selectedIntervals, tonic);

        targetNotes = scaleNotesWithDegrees.map(item => item.note); // Extract just the notes

        if (Array.isArray(scaleNotesWithDegrees)) {
            resultDiv.innerHTML = scaleNotesWithDegrees.map(item => `${item.note} (${item.degree})`).join(', ');
        } else {
            resultDiv.innerHTML = scaleNotesWithDegrees;
        }
    }

function isLowerPitch(noteOctave1, noteOctave2) {
    // Define semitone mapping for notes
    const noteToSemitone = {
        'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 
        'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };

    // Extract note and octave from the first pair
    const [note1, octave1] = noteOctave1;
    // Extract note and octave from the second pair
    const [note2, octave2] = noteOctave2;

    // Calculate total pitch values
    const pitch1 = (12 * octave1) + noteToSemitone[note1];
    const pitch2 = (12 * octave2) + noteToSemitone[note2];

    // Return whether the first pitch is lower than the second
    return pitch1 < pitch2;
}

function pickRandomElement(list) {
    // Check if the list is not empty
    if (list.length === 0) {
        return null; // Return null or handle empty list case as needed
    }

    // Generate a random index from 0 to list.length - 1
    const randomIndex = Math.floor(Math.random() * list.length);

    // Return the element at the random index
    return list[randomIndex];
}

function findNotePositions(note, octave = null) {
    const positions = [];

    // Iterate through each string (array of frets)
    for (let stringIndex = 0; stringIndex < notes_per_string.length; stringIndex++) {
        const string = notes_per_string[stringIndex];

        // Iterate through each fret on the string
        for (let fretIndex = 0; fretIndex < string.length; fretIndex++) {
            const [currentNote, currentOctave] = string[fretIndex];

            // If the note matches (and optionally the octave if provided), store the string/fret pair
            if (currentNote === note && (octave === null || currentOctave === octave)) {
                positions.push({ string: stringIndex + 1, fret: fretIndex, note: currentNote, octave: currentOctave });
            }
        }
    }

    return positions;
}
function pickRandomNotePosition(notesList) {
    if (notesList.length === 0) {
        return null;
    }

    // Step 1: Pick a random note from the list of notes
    const selectedNote = pickRandomElement(notesList);

    // Step 2: Find all positions (string/fret) for the selected note
    const notePositions = findNotePositions(selectedNote);

    // Step 3: If there are no positions, return null (note not found)
    if (notePositions.length === 0) {
        return null;
    }

    // Step 4: Pick a random position from the available positions
    const randomPosition = pickRandomElement(notePositions);

    // Step 5: Return the picked note and its octave from the selected position
    return { note: randomPosition.note, octave: randomPosition.octave, string: randomPosition.string, fret: randomPosition.fret };
}



    function handleScaleSelection(tonic) {
        const scales = {
            "Major": ['Root', 'M2', 'M3', '4', '5', 'M6', 'M7'],
            "Minor": ['Root', 'M2', 'm3', '4', '5', 'm6', 'm7'],
            "Harmonic Minor": ['Root', 'M2', 'm3', '4', '5', 'm6', 'M7'],
            "Minor Pentatonic": ['Root', 'm3', '4', '5', 'm7'],
            "Major Pentatonic": ['Root', 'M2', 'M3', '5', 'M6'],
            "Harmonic Major": ['Root', 'M2', 'M3', '4', '5', 'm6', 'M7'],
            "Minor Blues": ['Root', 'm3', '4', '#4', '5', 'm7']
        };
      
        const selectedIntervals = scales[scaleDropdown.value];

        scaleNotesWithDegrees = getScaleNotesWithDegrees(selectedIntervals, tonic);

        targetNotes = scaleNotesWithDegrees.map(item => item.note); // Extract just the notes

        if (Array.isArray(scaleNotesWithDegrees)) {
            resultDiv.innerHTML = scaleNotesWithDegrees.map(item => `${item.note} (${item.degree})`).join(', ');
        } else {
            resultDiv.innerHTML = scaleNotesWithDegrees;
        }
    }

    // Event listener for button click to get scale notes
    const scaleButton = document.getElementById('scaleButton');
    scaleButton.addEventListener('click', () => {
        const selectedValue = getSelectedRadioValue();
        const selectedMode = document.querySelector('input[name="mode-option"]:checked').value;

     if (selectedMode === 'challenge'){
        if (selectedValue === 'scale') {
            handleScaleSelection(thisRoundTonic);
        } else if (selectedValue === 'interval') {
            handleIntervalSelection(thisRoundTonic);
        } else {
            console.log('No option selected or an unexpected value.');
        }
}
else{
if (selectedValue === 'scale') {
            handleScaleSelection(currentTonic);
        } else if (selectedValue === 'interval') {
            handleIntervalSelection(currentTonic);
        } else {
            console.log('No option selected or an unexpected value.');
        }

}
    });

    // Function to start the timer
    function startTimer(duration) {
        let remainingTime = duration; // Set remaining time to the input duration
        clearInterval(timerInterval); // Clear any existing timer

        isTimerActive = true; // Timer is active

        // Reset counters at the start of the timer
        resetClickCounters();

        // Update the timer every second
        timerInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(timerInterval); // Stop the timer when it reaches zero
                isTimerActive = false; // Timer is no longer active
		stopChallengeMode();
resetFretboard();                
timerDisplay.textContent = "Time's up!";
            } else {
                timerDisplay.textContent = `Time: ${remainingTime} seconds`; // Update the timer display
                remainingTime -= 1; // Decrement the remaining time
            }
        }, 1000);
    }




// Function to handle Training user clicks on the fretboard
function handleTrainingUserClick(event) {
    
    const rect = fretboardCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
let selectedValue = document.querySelector('input[name="note-finding-option"]:checked').value;

// Generate scale notes based on the selected scale or interval pattern
if (selectedValue === 'scale') {
            handleScaleSelection(currentTonic);
console.log("mphka scales");
        } else if (selectedValue === 'interval') {
            handleIntervalSelection(currentTonic);
console.log("mphka intervals");
        } else {
            console.log('No option selected or an unexpected value.');
        }
console.log("nghka");
    

    const clickedNote = findNoteByClick(x, y);
    if (!clickedNote) {
        resultDiv.textContent = 'Click outside of frets';
        return;
    }

    const { note, octave, string, fret } = clickedNote;
  


    const isCorrectNote = targetNotes.indexOf(note) !== -1
        ? true
        : false;


    // Check if the clicked note is correct and is following the previously selected note

console.log( "these are the notes: ", targetNotes);
console.log( "we hit note ", note);
console.log(" we hit a note in the scale? ", targetNotes.indexOf(note));



    if (isCorrectNote) {
        showClickFeedback(fret, string, true); // Correct click feedback
        let scaleNoteObj = scaleNotesWithDegrees.find(item => item.note === note);



                    
                      if (scaleNoteObj) {
    scaleDegreeCounts[scaleNoteObj.degree]++;
} 
renderScaleDegrees(scaleDegreeCounts,[]);

                     } 

else {
        showClickFeedback(fret, string, false); // Incorrect click feedback

}

}






    // Event listener for start button
    startButton.addEventListener('click', () => {
        const countdownDuration = parseInt(timeInput.value);
        resetScaleDegreeCounts(); // Reset and initialize scale degrees tracking
	resetMissedScaleDegreeCounts();
renderScaleDegrees(scaleDegreeCounts, missedScaleDegreeCounts);
        if (!isNaN(countdownDuration) && countdownDuration > 0) {
            startTimer(countdownDuration); // Start timer with the input duration
	    startChallengeMode();
        } else {
            alert("Please enter a valid number greater than 0.");
        }
    });





// Event listener for start button
    stopButton.addEventListener('click', () => {
                resetScaleDegreeCounts(); // Reset and initialize scale degrees tracking
	resetMissedScaleDegreeCounts();
stopChallengeMode();
timerDisplay.textContent='';
clearInterval(timerInterval); // Clear any existing timer

        isTimerActive = false; // Timer is not active

    });





});
