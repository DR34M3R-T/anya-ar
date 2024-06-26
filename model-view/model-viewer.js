/* global AFRAME, THREE */
AFRAME.registerComponent('model-viewer', {
    schema: {
        gltfModel: { default: '' },
        title: { default: '' },
        uploadUIEnabled: { default: true }
    },
    init: function () {
        var el = this.el;

        el.setAttribute('renderer', { colorManagement: true });
        el.setAttribute('cursor', { rayOrigin: 'mouse', fuse: false });
        el.setAttribute('webxr', { optionalFeatures: 'hit-test, local-floor' });
        el.setAttribute('raycaster', { objects: '.raycastable' });

        this.onModelLoaded = this.onModelLoaded.bind(this);

        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);

        this.onTouchMove = this.onTouchMove.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.submitURLButtonClicked = this.submitURLButtonClicked.bind(this);

        this.onThumbstickMoved = this.onThumbstickMoved.bind(this);

        this.onEnterVR = this.onEnterVR.bind(this);
        this.onExitVR = this.onExitVR.bind(this);

        this.onMouseDownLaserHitPanel = this.onMouseDownLaserHitPanel.bind(this);
        this.onMouseUpLaserHitPanel = this.onMouseUpLaserHitPanel.bind(this);

        this.onOrientationChange = this.onOrientationChange.bind(this);

        this.initCameraRig();
        this.initEntities();
        this.initBackground();

        if (this.data.uploadUIEnabled) { this.initUploadInput(); }

        // Disable context menu on canvas when pressing mouse right button;
        this.el.sceneEl.canvas.oncontextmenu = function (evt) { evt.preventDefault(); };

        window.addEventListener('orientationchange', this.onOrientationChange);

        // VR controls.
        this.laserHitPanelEl.addEventListener('mousedown', this.onMouseDownLaserHitPanel);
        this.laserHitPanelEl.addEventListener('mouseup', this.onMouseUpLaserHitPanel);

        this.leftHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);
        this.rightHandEl.addEventListener('thumbstickmoved', this.onThumbstickMoved);

        // Mouse 2D controls.
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('wheel', this.onMouseWheel);

        // Mobile 2D controls.
        document.addEventListener('touchend', this.onTouchEnd);
        document.addEventListener('touchmove', this.onTouchMove);

        this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR);
        this.el.sceneEl.addEventListener('exit-vr', this.onExitVR);

        this.modelEl.addEventListener('model-loaded', this.onModelLoaded);
    },

    initUploadInput: function () {
        var uploadContainerEl = this.uploadContainerEl = document.createElement('div');
        var inputEl = this.inputEl = document.createElement('input');
        var submitButtonEl = this.submitButtonEl = document.createElement('button');
        var style = document.createElement('style');
        var css =
            '.a-upload-model  {box-sizing: border-box; display: inline-block; height: 34px; padding: 0; width: 70%;' +
            'bottom: 20px; left: 15%; right: 15%; position: absolute; color: white;' +
            'font-size: 12px; line-height: 12px; border: none;' +
            'border-radius: 5px}' +
            '.a-upload-model.hidden {display: none}' +
            '.a-upload-model-button {cursor: pointer; padding: 0px 2px 0 2px; font-weight: bold; color: #666; border: 3px solid #666; box-sizing: border-box; vertical-align: middle; width: 25%; max-width: 110px; border-radius: 10px; height: 34px; background-color: white; margin: 0;}' +
            '.a-upload-model-button:hover {border-color: #ef2d5e; color: #ef2d5e}' +
            '.a-upload-model-input {color: #666; vertical-align: middle; padding: 0px 10px 0 10px; text-transform: uppercase; border: 0; width: 75%; height: 100%; border-radius: 10px; margin-right: 10px}' +
            '@media only screen and (max-width: 800px) {' +
            '.a-upload-model {margin: auto;}' +
            '.a-upload-model-input {width: 70%;}}' +
            '@media only screen and (max-width: 700px) {' +
            '.a-upload-model {display: none}}';
        var inputDefaultValue = this.inputDefaultValue = 'Copy URL to glTF or glb model';

        if (AFRAME.utils.device.checkARSupport()) {
            css += '@media only screen and (max-width: 800px) {' +
                '.a-upload-model-input {width: 60%;}}';
        }

        uploadContainerEl.classList.add('a-upload-model');
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.getElementsByTagName('head')[0].appendChild(style);

        submitButtonEl.classList.add('a-upload-model-button');
        submitButtonEl.innerHTML = 'OPEN MODEL';
        submitButtonEl.addEventListener('click', this.submitURLButtonClicked);

        inputEl.classList.add('a-upload-model-input');
        inputEl.onfocus = function () {
            if (this.value !== inputDefaultValue) { return; }
            this.value = '';
        };
        inputEl.onblur = function () {
            if (this.value) { return; }
            this.value = inputDefaultValue;
        };

        this.el.sceneEl.addEventListener('infomessageopened', function () {
            uploadContainerEl.classList.add('hidden');
        });
        this.el.sceneEl.addEventListener('infomessageclosed', function () {
            uploadContainerEl.classList.remove('hidden');
        });

        inputEl.value = inputDefaultValue;

        uploadContainerEl.appendChild(inputEl);
        uploadContainerEl.appendChild(submitButtonEl);

        this.el.sceneEl.appendChild(uploadContainerEl);
    },

    update: function () {
        if (!this.data.gltfModel) { return; }
        this.modelEl.setAttribute('gltf-model', this.data.gltfModel);
    },

    submitURLButtonClicked: function (evt) {
        var modelURL = this.inputEl.value;
        if (modelURL === this.inputDefaultValue) { return; }
        this.el.setAttribute('model-viewer', 'gltfModel', modelURL);
    },

    initCameraRig: function () {
        var cameraRigEl = this.cameraRigEl = document.createElement('a-entity');
        var cameraEl = this.cameraEl = document.createElement('a-entity');
        var rightHandEl = this.rightHandEl = document.createElement('a-entity');
        var leftHandEl = this.leftHandEl = document.createElement('a-entity');

        cameraEl.setAttribute('camera', { fov: 60 });
        cameraEl.setAttribute('look-controls', {
            magicWindowTrackingEnabled: false,
            mouseEnabled: false,
            touchEnabled: false
        });

        rightHandEl.setAttribute('rotation', '0 90 0');
        rightHandEl.setAttribute('laser-controls', { hand: 'right' });
        rightHandEl.setAttribute('raycaster', { objects: '.raycastable' });
        rightHandEl.setAttribute('line', { color: '#118A7E' });

        leftHandEl.setAttribute('rotation', '0 90 0');
        leftHandEl.setAttribute('laser-controls', { hand: 'right' });
        leftHandEl.setAttribute('raycaster', { objects: '.raycastable' });
        leftHandEl.setAttribute('line', { color: '#118A7E' });

        cameraRigEl.appendChild(cameraEl);
        cameraRigEl.appendChild(rightHandEl);
        cameraRigEl.appendChild(leftHandEl);

        this.el.appendChild(cameraRigEl);
    },

    initBackground: function () {
        var backgroundEl = this.backgroundEl = document.querySelector('a-entity');
        backgroundEl.setAttribute('geometry', { primitive: 'sphere', radius: 65 });
        backgroundEl.setAttribute('material', {
            shader: 'background-gradient',
            colorTop: '#37383c',
            colorBottom: '#757575',
            side: 'back'
        });
        backgroundEl.setAttribute('hide-on-enter-ar', '');
    },

    initEntities: function () {
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
                    texture: "../assets/star/Blue_logoEffect-37g235u4w1.png",
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
                    texture: "../assets/star/Green_logoEffect-i26ci1o1ua.png",
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
                    texture: "../assets/star/Red_logoEffect-p41hd3cbel.png",
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
                    texture: "../assets/star/white_LogoEffect-h1obtu7c9x.png",
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
                    texture: "../assets/star/yellow_logo-w5xm846a3i.png",
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
        // Container for our entities to keep the scene clean and tidy.
        var containerEl = this.containerEl = document.createElement('a-entity');
        // Plane used as a hit target for laser controls when in VR mode
        var laserHitPanelEl = this.laserHitPanelEl = document.createElement('a-entity');
        // Models are often not centered on the 0,0,0.
        // We will center the model and rotate a pivot.
        var modelPivotEl = this.modelPivotEl = document.createElement('a-entity');
        // This is our glTF model entity.
        var modelEl = this.modelEl = document.createElement('a-entity');
        var model2El = this.model2El = document.createElement('a-entity');
        var effectEl = this.effectEl = document.createElement('a-entity');
        // The title / legend displayed above the model.
        var titleEl = this.titleEl = document.createElement('a-entity');
        // Scene ligthing.
        var lightEl = this.lightEl = document.createElement('a-entity');
        var sceneLightEl = this.sceneLightEl = document.createElement('a-entity');

        sceneLightEl.setAttribute('light', {
            type: 'hemisphere',
            intensity: 1
        });

        modelPivotEl.id = 'modelPivot';

        this.el.appendChild(sceneLightEl);

        modelEl.id = 'model';

        laserHitPanelEl.id = 'laserHitPanel';
        laserHitPanelEl.setAttribute('position', '0 0 -10');
        laserHitPanelEl.setAttribute('geometry', 'primitive: plane; width: 30; height: 20');
        laserHitPanelEl.setAttribute('material', 'color: red');
        laserHitPanelEl.setAttribute('visible', 'false');
        laserHitPanelEl.classList.add('raycastable');

        this.containerEl.appendChild(laserHitPanelEl);

        const ani_data = {
            loop: "once",
            clampWhenFinished: true
        };

        modelEl.setAttribute('gltf-model', '#anya');
        modelEl.setAttribute('rotation', '0 0 0');
        modelEl.setAttribute('scale', '1 1 1');
        modelEl.setAttribute('animation-mixer', ani_data);
        modelEl.setAttribute('shadow', 'cast: true; receive: false');
        modelPivotEl.appendChild(modelEl);

        model2El.setAttribute('gltf-model', '#snow');
        model2El.setAttribute('rotation', '0 0 0');
        model2El.setAttribute('scale', '1 1 1');
        model2El.setAttribute('animation-mixer', ani_data);
        model2El.setAttribute('shadow', 'cast: true; receive: false');
        modelPivotEl.appendChild(model2El);

        effectEl.id = "effect";
        effectEl.setAttribute('rotation', '0 0 0');
        effectEl.setAttribute('position', '0 0 0');
        modelPivotEl.appendChild(effectEl);

        titleEl.id = 'title';
        titleEl.setAttribute('text', 'value: ' + this.data.title + '; width: 6');
        titleEl.setAttribute('hide-on-enter-ar', '');
        titleEl.setAttribute('visible', 'false');

        this.containerEl.appendChild(titleEl);

        lightEl.id = 'light';
        lightEl.setAttribute('position', '-2 4 2');
        lightEl.setAttribute('light', {
            type: 'directional',
            castShadow: true,
            shadowMapHeight: 1024,
            shadowMapWidth: 1024,
            shadowCameraLeft: -7,
            shadowCameraRight: 5,
            shadowCameraBottom: -5,
            shadowCameraTop: 5,
            intensity: 0.0,
            target: 'modelPivot'
        });

        this.containerEl.appendChild(lightEl);
        this.containerEl.appendChild(modelPivotEl);
        modelPivotEl.object3D.position.set(0, -1, 0);

        this.el.appendChild(containerEl);
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
    },

    onThumbstickMoved: function (evt) {
        var modelPivotEl = this.modelPivotEl;
        var modelScale = this.modelScale || modelPivotEl.object3D.scale.x;
        modelScale -= evt.detail.y / 20;
        modelScale = Math.min(Math.max(0.5, modelScale), 2.5);
        modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);
        this.modelScale = modelScale;
    },

    onMouseWheel: function (evt) {
        var modelPivotEl = this.modelPivotEl;
        var modelScale = this.modelScale || modelPivotEl.object3D.scale.x;
        modelScale -= evt.deltaY > 0 ? 0.05 : -0.05;
        modelScale = Math.min(Math.max(0.5, modelScale), 2.5);
        // Clamp scale.
        modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);
        this.modelScale = modelScale;
    },

    onMouseDownLaserHitPanel: function (evt) {
        var cursorEl = evt.detail.cursorEl;
        var intersection = cursorEl.components.raycaster.getIntersection(this.laserHitPanelEl);
        if (!intersection) { return; }
        cursorEl.setAttribute('raycaster', 'lineColor', 'white');
        this.activeHandEl = cursorEl;
        this.oldHandX = undefined;
        this.oldHandY = undefined;
    },

    onMouseUpLaserHitPanel: function (evt) {
        var cursorEl = evt.detail.cursorEl;
        if (cursorEl === this.leftHandEl) { this.leftHandPressed = false; }
        if (cursorEl === this.rightHandEl) { this.rightHandPressed = false; }
        cursorEl.setAttribute('raycaster', 'lineColor', 'white');
        if (this.activeHandEl === cursorEl) { this.activeHandEl = undefined; }
    },

    onOrientationChange: function () {
        if (AFRAME.utils.device.isLandscape()) {
            this.cameraRigEl.object3D.position.z -= 1;
        } else {
            this.cameraRigEl.object3D.position.z += 1;
        }
    },

    tick: function () {
        var modelPivotEl = this.modelPivotEl;
        var intersection;
        var intersectionPosition;
        var laserHitPanelEl = this.laserHitPanelEl;
        var activeHandEl = this.activeHandEl;
        if (!this.el.sceneEl.is('vr-mode')) { return; }
        if (!activeHandEl) { return; }
        intersection = activeHandEl.components.raycaster.getIntersection(laserHitPanelEl);
        if (!intersection) {
            activeHandEl.setAttribute('raycaster', 'lineColor', 'white');
            return;
        }
        activeHandEl.setAttribute('raycaster', 'lineColor', '#007AFF');
        intersectionPosition = intersection.point;
        this.oldHandX = this.oldHandX || intersectionPosition.x;
        this.oldHandY = this.oldHandY || intersectionPosition.y;

        modelPivotEl.object3D.rotation.y -= (this.oldHandX - intersectionPosition.x) / 4;
        modelPivotEl.object3D.rotation.x += (this.oldHandY - intersectionPosition.y) / 4;

        this.oldHandX = intersectionPosition.x;
        this.oldHandY = intersectionPosition.y;
    },

    onEnterVR: function () {
        var cameraRigEl = this.cameraRigEl;

        this.cameraRigPosition = cameraRigEl.object3D.position.clone();
        this.cameraRigRotation = cameraRigEl.object3D.rotation.clone();

        debugger;
        if (!this.el.sceneEl.is('ar-mode')) {
            cameraRigEl.object3D.position.set(0, 0, 2);
        } else {
            cameraRigEl.object3D.position.set(0, 0, 0);
        }
    },

    onExitVR: function () {
        var cameraRigEl = this.cameraRigEl;

        cameraRigEl.object3D.position.copy(this.cameraRigPosition);
        cameraRigEl.object3D.rotation.copy(this.cameraRigRotation);

        cameraRigEl.object3D.rotation.set(0, 0, 0);
    },

    onTouchMove: function (evt) {
        if (evt.touches.length === 1) { this.onSingleTouchMove(evt); }
        if (evt.touches.length === 2) { this.onPinchMove(evt); }
    },

    onSingleTouchMove: function (evt) {
        var dX;
        var dY;
        var modelPivotEl = this.modelPivotEl;
        this.oldClientX = this.oldClientX || evt.touches[0].clientX;
        this.oldClientY = this.oldClientY || evt.touches[0].clientY;

        dX = this.oldClientX - evt.touches[0].clientX;
        dY = this.oldClientY - evt.touches[0].clientY;

        modelPivotEl.object3D.rotation.y -= dX / 200;
        this.oldClientX = evt.touches[0].clientX;

        modelPivotEl.object3D.rotation.x -= dY / 100;

        // Clamp x rotation to [-90,90]
        modelPivotEl.object3D.rotation.x = Math.min(Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x), Math.PI / 2);
        this.oldClientY = evt.touches[0].clientY;
    },

    onPinchMove: function (evt) {
        var dX = evt.touches[0].clientX - evt.touches[1].clientX;
        var dY = evt.touches[0].clientY - evt.touches[1].clientY;
        var modelPivotEl = this.modelPivotEl;
        var distance = Math.sqrt(dX * dX + dY * dY);
        var oldDistance = this.oldDistance || distance;
        var distanceDifference = oldDistance - distance;
        var modelScale = this.modelScale || modelPivotEl.object3D.scale.x;

        modelScale -= distanceDifference / 500;
        modelScale = Math.min(Math.max(0.5, modelScale), 2.5);
        // Clamp scale.
        modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);

        var Xm = evt.touches[0].clientX / 2 + evt.touches[1].clientX / 2;
        var Ym = evt.touches[0].clientY / 2 + evt.touches[1].clientY / 2;
        var oldXm = this.oldXm || Xm;
        var oldYm = this.oldYm || Ym;
        var dXm = oldXm - Xm;
        var dYm = oldYm - Ym;
        modelPivotEl.object3D.position.y += dYm / 200;
        modelPivotEl.object3D.position.x -= dXm / 200;

        this.modelScale = modelScale;
        this.oldDistance = distance;
        this.oldXm = Xm;
        this.oldYm = Ym;
    },

    onTouchEnd: function (evt) {
        this.oldClientX = undefined;
        this.oldClientY = undefined;

        if (evt.touches.length < 2) {
            this.oldDistance = undefined;
            this.oldXm = undefined;
            this.oldYm = undefined;
        }
    },

    onMouseDown: function (evt) {
        if (evt.buttons) { this.leftRightButtonPressed = evt.buttons === 3; }
        this.oldClientX = evt.clientX;
        this.oldClientY = evt.clientY;
    },

    onMouseUp: function (evt) {
        this.leftRightButtonPressed = false;
        if (evt.buttons === undefined || evt.buttons !== 0) { return; }
        this.oldClientX = undefined;
        this.oldClientY = undefined;
    },

    onMouseMove: function (evt) {
        if (this.leftRightButtonPressed) {
            this.dragModel(evt);
        } else {
            this.rotateModel(evt);
        }
    },

    dragModel: function (evt) {
        var dX;
        var dY;
        var modelPivotEl = this.modelPivotEl;
        if (!this.oldClientX) { return; }
        dX = this.oldClientX - evt.clientX;
        dY = this.oldClientY - evt.clientY;
        modelPivotEl.object3D.position.y += dY / 200;
        modelPivotEl.object3D.position.x -= dX / 200;
        this.oldClientX = evt.clientX;
        this.oldClientY = evt.clientY;
    },

    rotateModel: function (evt) {
        var dX;
        var dY;
        var modelPivotEl = this.modelPivotEl;
        if (!this.oldClientX) { return; }
        dX = this.oldClientX - evt.clientX;
        dY = this.oldClientY - evt.clientY;
        modelPivotEl.object3D.rotation.y -= dX / 100;
        modelPivotEl.object3D.rotation.x -= dY / 200;

        // Clamp x rotation to [-90,90]
        modelPivotEl.object3D.rotation.x = Math.min(Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x), Math.PI / 2);

        this.oldClientX = evt.clientX;
        this.oldClientY = evt.clientY;
    },

    onModelLoaded: function () {
        this.centerAndScaleModel();
    },

    centerAndScaleModel: function () {
        var box;
        var size;
        var center;
        var scale;
        var modelEl = this.modelEl;
        var titleEl = this.titleEl;
        var gltfObject = modelEl.getObject3D('mesh');

        // Reset position and scales.
        modelEl.object3D.position.set(0, 0, 0);
        modelEl.object3D.scale.set(1.0, 1.0, 1.0);
        this.cameraRigEl.object3D.position.z = 3.0;

        // Calculate model size.
        modelEl.object3D.updateMatrixWorld();
        box = new THREE.Box3().setFromObject(gltfObject);
        size = box.getSize(new THREE.Vector3());

        // Calculate scale factor to resize model to human scale.
        scale = 1.6 / size.y;
        scale = 2.0 / size.x < scale ? 2.0 / size.x : scale;
        scale = 2.0 / size.z < scale ? 2.0 / size.z : scale;

        // modelEl.object3D.scale.set(scale, scale, scale);

        // Center model at (0, 0, 0).
        modelEl.object3D.updateMatrixWorld();
        box = new THREE.Box3().setFromObject(gltfObject);
        center = box.getCenter(new THREE.Vector3());
        size = box.getSize(new THREE.Vector3());

        titleEl.object3D.position.x = 2.2 - center.x;
        titleEl.object3D.position.y = size.y + 0.5;
        titleEl.object3D.position.z = -2;
        titleEl.object3D.visible = false;

        // When in mobile landscape we want to bring the model a bit closer.
        if (AFRAME.utils.device.isLandscape()) { this.cameraRigEl.object3D.position.z -= 1; }
    }
});
