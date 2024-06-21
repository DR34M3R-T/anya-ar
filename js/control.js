found = false;
function dbg() {
    console.log("target found");
    if (found) return;
    found = true;
    console.log("first found, playing.");

    // play sound
    var sound = document.getElementById('anyaVoice');
    sound.play();

    // play animation
    const a_anya = document.getElementById('a-anya');
    const a_snow = document.getElementById('a-snow');
    const ani_data = {
        loop: "once",
        clampWhenFinished: true
    };
    a_anya.setAttribute('animation-mixer', ani_data);
    a_snow.setAttribute('animation-mixer', ani_data);

    // effect timeout
    setTimeout((function () {
        o({
            x: 0,
            y: 2.06574,
            z: -.139365
        }, {
            x: .5,
            y: .5,
            z: .5
        }, .15)
    }
    ), 12550),
        setTimeout((function () {
            o({
                x: 0,
                y: 2.42392,
                z: -.052186
            }, {
                x: 1,
                y: 1,
                z: 1
            }, .45)
        }
        ), 12960),
        setTimeout((function () {
            o({
                x: .733442,
                y: 1.70214,
                z: .078421
            }, {
                x: 1,
                y: 1,
                z: 1
            }, .45)
        }
        ), 13340),
        setTimeout((function () {
            o({
                x: -.781238,
                y: 1.76574,
                z: -.139365
            }, {
                x: 1,
                y: 1,
                z: 1
            }, .45)
        }
        ), 13780);
}
document.addEventListener("DOMContentLoaded", function () {
    // orig effect player code from dist_cb55cecae636fcf3b460c013a34f03a9a60edba3-a1263fae866c7b95c8ebc1fc56f20f7a_bundle.js
    o = function (n, o, i) {
        var r = n
            , a = document.getElementById("effect");
        // console.log("position.x", e.x),
        console.log("cPosition.x", n.x),
            console.log("currentPosition", r);
        var s = document.createElement("a-entity");
        s.setAttribute("position", n),
            s.setAttribute("scale", o),
            s.setAttribute("particle-system", {
                color: "#FFFFFF",
                size: "" + i,
                texture: "./assets/star/Blue_logoEffect-37g235u4w1.png",
                positionSpread: "0 0 0",
                rotationAxis: "x",
                direction: "-1",
                duration: "0.3",
                particleCount: "25",
                maxParticleCount: "25",
                maxAge: "1.5",
                accelerationValue: "0, -0.2, 0",
                accelerationSpread: "-0.15 -0.15 -0.15",
                velocityValue: "0 0 0",
                velocitySpread: "-1 -1 -1",
                blending: 2
            }),
            a.appendChild(s);
        var l = document.createElement("a-entity");
        l.setAttribute("position", n),
            l.setAttribute("scale", o),
            l.setAttribute("particle-system", {
                color: "#FFFFFF",
                size: "" + i,
                texture: "./assets/star/Green_logoEffect-i26ci1o1ua.png",
                positionSpread: "0 0 0",
                rotationAxis: "x",
                direction: "-1",
                duration: "0.3",
                particleCount: "25",
                maxParticleCount: "25",
                maxAge: "1.5",
                accelerationValue: "0, -0.2, 0",
                accelerationSpread: "-0.1 -0.1 -0.1",
                velocityValue: "0 0 0",
                velocitySpread: "-1 -1 -1",
                blending: 2
            }),
            a.appendChild(l);
        var c = document.createElement("a-entity");
        c.setAttribute("position", n),
            c.setAttribute("scale", o),
            c.setAttribute("particle-system", {
                color: "#FFFFFF",
                size: "" + i,
                texture: "./assets/star/Red_logoEffect-p41hd3cbel.png",
                positionSpread: "0 0 0",
                rotationAxis: "x",
                direction: "-1",
                duration: "0.3",
                particleCount: "25",
                maxParticleCount: "25",
                maxAge: "1.5",
                accelerationValue: "0, -0.2, 0",
                accelerationSpread: "-0.1 -0.1 -0.1",
                velocityValue: "0 0 0",
                velocitySpread: "-1 -1 -1",
                blending: 2
            }),
            a.appendChild(c);
        var d = document.createElement("a-entity");
        d.setAttribute("position", n),
            d.setAttribute("scale", o),
            d.setAttribute("particle-system", {
                color: "#FFFFFF",
                size: "" + i,
                texture: "./assets/star/white_LogoEffect-h1obtu7c9x.png",
                positionSpread: "0 0 0",
                rotationAxis: "x",
                direction: "-1",
                duration: "0.3",
                particleCount: "25",
                maxParticleCount: "25",
                maxAge: "1.5",
                accelerationValue: "0, -0.2, 0",
                accelerationSpread: "-0.1 -0.1 -0.1",
                velocityValue: "0 0 0",
                velocitySpread: "-1 -1 -1",
                blending: 2
            }),
            a.appendChild(d);
        var u = document.createElement("a-entity");
        u.setAttribute("position", n),
            u.setAttribute("scale", o),
            u.setAttribute("particle-system", {
                color: "#FFFFFF",
                size: "" + i,
                texture: "./assets/star/yellow_logo-w5xm846a3i.png",
                positionSpread: "0 0 0",
                rotationAxis: "x",
                direction: "-1",
                duration: "0.3",
                particleCount: "25",
                maxParticleCount: "25",
                maxAge: "1.5",
                accelerationValue: "0, -0.2, 0",
                accelerationSpread: "-0.1 -0.1 -0.1",
                velocityValue: "0 0 0",
                velocitySpread: "-1 -1 -1",
                blending: 2
            }),
            console.log("Particle size:", i),
            a.appendChild(u)
    }
    const loading = document.querySelector('#loading');
    const cover = document.querySelector('#cover');
    const startBtn = document.querySelector('#startButton');
    const repeatBtn = document.querySelector('#repeatButton');

    const sceneEl = document.querySelector('a-scene');
    let arSystem;
    sceneEl.addEventListener('loaded', () => {
        arSystem = sceneEl.systems["mindar-image-system"];
    });
    const Target = document.querySelector('#mindar-container');
    // arReady event triggered when ready
    sceneEl.addEventListener("arReady", (event) => {
        arSystem.pause();
        startBtn.classList.remove('hidden');
        cover.classList.remove('hidden');
        loading.classList.add('hidden');
        console.log("MindAR is ready");
    });
    // arError event triggered when something went wrong. Mostly browser compatbility issue
    sceneEl.addEventListener("arError", (event) => {
        console.log("MindAR failed to start");
    });
    // detect target found
    Target.addEventListener("targetFound", event => {
        console.log("target found");
        if (found) return;
        found = true;
        console.log("first found, playing.");

        // play sound
        var sound = document.getElementById('anyaVoice');
        sound.play();

        // play animation
        const a_anya = document.getElementById('a-anya');
        const a_snow = document.getElementById('a-snow');
        const ani_data = {
            loop: "once",
            clampWhenFinished: true
        };
        a_anya.setAttribute('animation-mixer', ani_data);
        a_snow.setAttribute('animation-mixer', ani_data);

        // effect timeout
        setTimeout((function() {
            document.getElementById("whiteOut").style.opacity = 1
        }
        ), 10500),
        setTimeout((function() {
            document.getElementById("whiteOut").style.opacity = 0
        }
        ), 12e3),
        setTimeout((function() {
            o({
                x: 0,
                y: 2.06574,
                z: -.139365
            }, {
                x: .5,
                y: .5,
                z: .5
            }, .15)
        }
        ), 12550),
        setTimeout((function() {
            o({
                x: 0,
                y: 2.42392,
                z: -.052186
            }, {
                x: 1,
                y: 1,
                z: 1
            }, .45)
        }
        ), 12960),
        setTimeout((function() {
            o({
                x: .733442,
                y: 1.70214,
                z: .078421
            }, {
                x: 1,
                y: 1,
                z: 1
            }, .45)
        }
        ), 13340),
        setTimeout((function() {
            o({
                x: -.781238,
                y: 1.76574,
                z: -.139365
            }, {
                x: 1,
                y: 1,
                z: 1
            }, .45)
        }
        ), 13780);
        setTimeout((function() {
            arSystem.pause(keepVideo=true);
            repeatBtn.classList.remove('hidden');
        }
        ), 25000);
    });
    // detect target lost
    Target.addEventListener("targetLost", event => {
        console.log("target lost");
    });

    startBtn.addEventListener("click", (event) => {
        arSystem.unpause();
        startBtn.classList.add('hidden');
        cover.classList.add('hidden');
    });
    repeatBtn.addEventListener("click", (event)=>{
        location.reload();
    })
});