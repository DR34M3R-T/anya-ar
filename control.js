document.addEventListener("DOMContentLoaded", function() {
	const sceneEl = document.querySelector('a-scene');
	let arSystem;
	sceneEl.addEventListener('loaded', function () {
	  arSystem = sceneEl.systems["mindar-image-system"];
	});
	const exampleTarget = document.querySelector('#mindar-container');
	// arReady event triggered when ready
	sceneEl.addEventListener("arReady", (event) => {
	  console.log("MindAR is ready")
	});
	// arError event triggered when something went wrong. Mostly browser compatbility issue
	sceneEl.addEventListener("arError", (event) => {
	  console.log("MindAR failed to start")
	});
	// detect target found
	exampleTarget.addEventListener("targetFound", event => {
	  console.log("target found");
      arSystem.start();
	});
	// detect target lost
	exampleTarget.addEventListener("targetLost", event => {
	  console.log("target lost");
	});
});