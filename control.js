found = false
document.addEventListener("DOMContentLoaded", function () {
    const sceneEl = document.querySelector('a-scene');
    let arSystem;
    sceneEl.addEventListener('loaded', function () {
        arSystem = sceneEl.systems["mindar-image-system"];
    });
    const Target = document.querySelector('#mindar-container');
    // arReady event triggered when ready
    sceneEl.addEventListener("arReady", (event) => {
        console.log("MindAR is ready")
    });
    // arError event triggered when something went wrong. Mostly browser compatbility issue
    sceneEl.addEventListener("arError", (event) => {
        console.log("MindAR failed to start")
    });
    // detect target found
    Target.addEventListener("targetFound", event => {
        if (found) return;
        found = true;
        console.log("target found");
        const a_anya = document.getElementById('a-anya');
        const a_snow = document.getElementById('a-snow');
        const ani_data = {
            loop: "once",
            clampWhenFinished: true
        };
        a_anya.setAttribute('animation-mixer', ani_data);
        a_snow.setAttribute('animation-mixer', ani_data);
        var sound = document.getElementById('anyaVoice');
        sound.play();
    });
    // detect target lost
    Target.addEventListener("targetLost", event => {
        console.log("target lost");
    });
});