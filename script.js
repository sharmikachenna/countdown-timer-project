/* =======================================================
   COUNTDOWN TIMER SCRIPT
   =======================================================
   ➤ This file controls the countdown timer’s full behavior:
     - Start, pause/resume, and reset countdown
     - Convert selected time into a countdown display
     - Flash animation + sound alert when time is up
     - Works with built-in AM/PM of system date-time picker
========================================================== */

// ==== GET ALL HTML ELEMENTS NEEDED FOR CONTROL ====
const startBtn = document.getElementById("startBtn");      // "Start" button
const pauseBtn = document.getElementById("pauseBtn");      // "Pause / Resume" button
const resetBtn = document.getElementById("resetBtn");      // "Reset" button
const dateTimeInput = document.getElementById("datetime"); // Date & Time picker input
const message = document.getElementById("message");        // Text area for "Time's up!"
const alarm = document.getElementById("alarmSound");       // Audio element for alarm sound

// ==== VARIABLES TO KEEP TRACK OF TIMER STATE ====
let timer;             // Stores the interval reference (used to stop the countdown)
let targetTime;        // Stores the future date & time user selected
let remainingMs = 0;   // Stores remaining time (milliseconds)
let isRunning = false; // Indicates if countdown is currently running
let isPaused = false;  // Indicates if countdown is currently paused

/* =======================================================
   FUNCTION: update(ms)
   PURPOSE: Updates the countdown display on screen
   ======================================================= */
function update(ms) {
  if (ms < 0) ms = 0; // If negative (after finish), set to 0 to avoid weird values

  // Convert milliseconds into days, hours, minutes, seconds
  const days = Math.floor(ms / 86400000);          // 1 day = 86,400,000 ms
  const hours = Math.floor(ms / 3600000) % 24;     // 1 hr = 3,600,000 ms
  const minutes = Math.floor(ms / 60000) % 60;     // 1 min = 60,000 ms
  const seconds = Math.floor(ms / 1000) % 60;      // 1 sec = 1,000 ms

  // Put all time values in an array for looping
  const values = [days, hours, minutes, seconds];

  // Display each value in its respective element (00 format)
  ["days", "hours", "minutes", "seconds"].forEach((id, i) => {
    document.getElementById(id).textContent = values[i].toString().padStart(2, "0");
  });
}

/* =======================================================
   EFFECT FUNCTIONS (For Flash & Alarm)
   ======================================================= */

// Add a flashing animation effect when countdown ends
function flash() {
  document.querySelectorAll(".time-block").forEach(block => {
    block.classList.add("flash");                      // Start flash animation
    setTimeout(() => block.classList.remove("flash"),  // Remove after 1 second
      1000);
  });
}

// Play the alarm sound once countdown finishes
function play() {
  alarm.currentTime = 0;   // Restart sound from beginning
  alarm.play().catch(() => {}); // Try playing (catch errors if user blocked sound)
}

// Stop the alarm sound immediately
function stop() {
  alarm.pause();           // Pause the sound
  alarm.currentTime = 0;   // Reset to start of audio
}

/* =======================================================
   FUNCTION: getTarget()
   PURPOSE: Convert user-selected date & time into milliseconds
   ======================================================= */
function getTarget() {
  if (!dateTimeInput.value) return null;  // If input is empty, return null

  // Create a Date object directly from the datetime-local value
  // Example input value → "2026-02-15T20:58"
  // new Date(...) automatically interprets AM/PM from system setting
  return new Date(dateTimeInput.value).getTime();
}

/* =======================================================
   FUNCTION: start()
   PURPOSE: Start the countdown timer
   ======================================================= */
function start() {
  clearInterval(timer); // Clear any previous running timer
  stop();               // Stop alarm if it’s still playing
  targetTime = getTarget(); // Get the future target time from input

  // Validate input time
  if (!targetTime) return alert("Please select a valid date and time!");
  if (targetTime <= Date.now()) return alert("Please choose a future time!");

  // Set states
  isRunning = true;
  isPaused = false;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pause";
  message.textContent = "";

  // Main countdown interval runs every 0.25 seconds
  timer = setInterval(() => {
    const diff = targetTime - Date.now(); // Calculate remaining time in ms

    // If time is over
    if (diff <= 0) {
      clearInterval(timer);             // Stop countdown
      update(0);                        // Set all to 00
      message.textContent = "⏰ Time's up!"; // Display message
      flash();                          // Trigger flash animation
      play();                           // Play alarm sound
      isRunning = false;                // Mark timer as stopped
      pauseBtn.disabled = true;         // Disable pause button
      pauseBtn.textContent = "Pause";   // Reset button text
      return;
    }

    // If still running, keep updating
    remainingMs = diff;  // Store remaining time
    update(diff);        // Refresh display
  }, 250); // Update 4 times per second for smooth countdown
}

/* =======================================================
   FUNCTION: pause()
   PURPOSE: Pause the countdown temporarily
   ======================================================= */
function pause() {
  if (!isRunning) return;     // If not running, do nothing
  clearInterval(timer);       // Stop the countdown loop
  isPaused = true;            // Mark as paused
  isRunning = false;          // Not actively running
  stop();                     // Stop alarm sound if playing
  pauseBtn.textContent = "Resume"; // Change button label to "Resume"
}

/* =======================================================
   FUNCTION: resume()
   PURPOSE: Continue countdown after being paused
   ======================================================= */
function resume() {
  if (!isPaused) return;          // If not paused, do nothing
  isPaused = false;
  isRunning = true;
  pauseBtn.textContent = "Pause"; // Change back button text

  // Recalculate target time by adding remaining time to current time
  targetTime = Date.now() + remainingMs;

  // Restart the interval loop again
  timer = setInterval(() => {
    const diff = targetTime - Date.now(); // Calculate new difference
    if (diff <= 0) {                      // If time runs out
      clearInterval(timer);
      update(0);
      message.textContent = "⏰ Time's up!";
      flash();
      play();
      isRunning = false;
      pauseBtn.disabled = true;
      pauseBtn.textContent = "Pause";
      return;
    }
    remainingMs = diff;
    update(diff); // Keep updating countdown
  }, 250);
}

/* =======================================================
   FUNCTION: reset()
   PURPOSE: Completely reset timer & UI
   ======================================================= */
function reset() {
  clearInterval(timer);   // Stop running countdown
  stop();                 // Stop alarm if playing
  isRunning = isPaused = false;
  remainingMs = 0;
  targetTime = null;
  update(0);              // Reset display to "00"
  message.textContent = "";  // Clear message
  pauseBtn.textContent = "Pause"; // Restore pause button label
  pauseBtn.disabled = true;      // Disable pause until next start
  dateTimeInput.value = "";      // Clear user-selected date and time
}

/* =======================================================
   BUTTON EVENT CONNECTIONS
   ======================================================= */
startBtn.onclick = start; // Start countdown when Start button clicked
pauseBtn.onclick = () =>  // Toggle pause/resume on same button
  pauseBtn.textContent === "Pause" ? pause() : resume();
resetBtn.onclick = reset; // Reset everything when Reset button clicked

/* =======================================================
   INITIAL PAGE SETUP (Runs once when page loads)
   ======================================================= */
window.onload = () => {
  pauseBtn.disabled = true; // Disable pause until countdown starts
  update(0);                // Display all 00 at beginning
};
