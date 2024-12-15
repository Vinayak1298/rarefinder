var Colors = {
	red: 0xf25346,
	white: 0xd8d0d1,
	pink: 0xf5986e,
	blue: 0x68c3c0,
	grey: 0x5f5f5f
};
var isPaused = false; // Variable to track the paused state
var raycaster = new THREE.Raycaster(); // Create raycaster
var mouse = new THREE.Vector2(); // Track mouse position
const randomNum = Math.floor(Math.random() * 8000000000) + 1;
console.log(randomNum);
window.addEventListener('wheel', function(event) {
    if (event.deltaY < 0) {
        // Scroll Up (Zoom In)
        camera.fov = Math.max(minFOV, camera.fov - zoomSpeed); 
    } else {
        // Scroll Down (Zoom Out)
        camera.fov = Math.min(maxFOV, camera.fov + zoomSpeed);
    }
    camera.updateProjectionMatrix(); 
	renderer.render(scene, camera);// Update the projection matrix after FOV change
}, false);


function togglePause() {
    isPaused = !isPaused; // Toggle the paused state
    if (!isPaused) {
        loop(); // Resume the loop if it's unpaused
    }
}

var zoomSpeed = 1; // Adjust zoom speed (higher = faster zoom)
var minFOV = 10; // Minimum FOV (zoomed in)
var maxFOV = 75; // Maximum FOV (zoomed out)





function showCustomAlert() {
    document.getElementById("alertOverlay").style.display = "flex"; // Show the alert
}

function closeAlert() {
    document.getElementById("alertOverlay").style.display = "none"; // Hide the alert
}

window.addEventListener("click", function (event) {
    // Convert mouse position to normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Use raycaster to detect intersection
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // Check if the clicked object is the green particle
        var clickedObject = intersects[0].object;
        if (clickedObject.material.color.getHex() === 0x00ff00) {
			onParticleClick();
        }
    }
});

document.addEventListener("keydown", function(event) {
    if (event.key === 'p' || event.key === 'P') {
        togglePause(); // Toggle pause on pressing 'P'
    }
}, false);

var mousePos = {
	x: 0,
	y: 0
};
window.addEventListener("load", init, false);

function init() {
	createScene();
	createLights();
	createPlane();
	createParticle();
	createSea();
	document.addEventListener("mousemove", handleMouseMove, false);
	loop();
}

var scene,
	fieldOfView,
	aspectRatio,
	nearPlane,
	farPlane,
	renderer,
	container,
	controls;
var HEIGHT, WIDTH;
function createScene() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;

	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);

	// scene.fog= new THREE.Fog(0xf58585,100,780);

	camera.position.x = 0;
	camera.position.z = 220;
	camera.position.y = 150;
	camera.rotation.x = -Math.PI / 6;
	renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMap.enabled = true;
	container = document.getElementById("world");
	container.appendChild(renderer.domElement);
	renderer.render(scene, camera);

	window.addEventListener("resize", handleWindowResize, false);
}

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function handleMouseMove(event) {
	var tx = -1 + event.clientX / WIDTH * 2;
	var ty = 1 - event.clientY / HEIGHT * 2;

	mousePos = {
		x: tx,
		y: ty
	};
}

var ambientLight, hemisphereLight, shadowLight;

function createLights() {
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
	shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
	shadowLight.position.set(150, 420, 350);
	shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	ambientLight = new THREE.AmbientLight(0xff8d8d, 0.5);
	scene.add(ambientLight);
	scene.add(hemisphereLight);
	scene.add(shadowLight);
}

var AirPlane = function() {
	this.mesh = new THREE.Object3D();

	var geomCockpit = new THREE.BoxGeometry(130, 60, 230, 1, 1, 1);
	var matCockpit = new THREE.MeshPhongMaterial({
		color: Colors.red,
		shading: THREE.FlatShading
	});
	geomCockpit.vertices[4].z += 40;
	geomCockpit.vertices[4].y -= 40;
	geomCockpit.vertices[1].z += 40;
	geomCockpit.vertices[1].y -= 40;
	this.cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	this.cockpit.castShadow = true;
	this.cockpit.receiveShadow = true;
	this.mesh.add(this.cockpit);

	var geomSideWing = new THREE.BoxGeometry(100, 3, 130, 1, 1, 1);
	var matSideWing = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		shading: THREE.FlatShading
	});
	geomSideWing.vertices[5].z += 70;
	geomSideWing.vertices[7].z += 70;
	geomSideWing.vertices[4].z -= 70;
	geomSideWing.vertices[6].z -= 70;
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	sideWing.position.z += 40;
	sideWing.position.y -= 10;
	sideWing.rotation.y = Math.PI / 2;
	this.mesh.add(sideWing);

	var geomExha = new THREE.CylinderGeometry(20, 5, 30, 10);
	var matExha = new THREE.MeshPhongMaterial({
		color: Colors.white,
		shading: THREE.FlatShading
	});
	var Exha = [];
	Exha[0] = new THREE.Mesh(geomExha, matExha);
	Exha[0].castShadow = true;
	Exha[0].receiveShadow = true;
	Exha[0].position.z += 120;
	Exha[0].position.x -= 30;
	Exha[0].rotation.x = Math.PI / 2;

	Exha[1] = new THREE.Mesh(geomExha, matExha);
	Exha[1].castShadow = true;
	Exha[1].receiveShadow = true;
	Exha[1].position.z += 120;
	Exha[1].position.x += 30;
	Exha[1].rotation.x = Math.PI / 2;
	this.mesh.add(Exha[0], Exha[1]);

	var geomExha_i = new THREE.CylinderGeometry(17, 17, 30, 33);
	var matExha_i = new THREE.MeshPhongMaterial({
		color: Colors.grey,
		shading: THREE.FlatShading
	});
	var Exha_i = [];
	Exha_i[0] = new THREE.Mesh(geomExha_i, matExha_i);
	Exha_i[0].castShadow = true;
	Exha_i[0].receiveShadow = true;
	Exha_i[0].position.z += 105;
	Exha_i[0].position.x -= 30;
	Exha_i[0].rotation.x = Math.PI / 2;

	Exha_i[1] = new THREE.Mesh(geomExha_i, matExha_i);
	Exha_i[1].castShadow = true;
	Exha_i[1].receiveShadow = true;
	Exha_i[1].position.z += 105;
	Exha_i[1].position.x += 30;
	Exha_i[1].rotation.x = Math.PI / 2;
	this.mesh.add(Exha_i[0], Exha_i[1]);

	var geomWin = new THREE.BoxGeometry(80, 30, 30, 1, 1, 1);
	var matWin = new THREE.MeshPhongMaterial({
		color: Colors.pink,
		shading: THREE.FlatShading
	});
	var Win;
	geomWin.vertices[4].y -= 10;
	geomWin.vertices[1].y -= 10;
	geomWin.vertices[6].z -= 30;
	geomWin.vertices[3].z -= 30;
	geomWin.vertices[7].z += 30;
	geomWin.vertices[2].z += 30;
	Win = new THREE.Mesh(geomWin, matWin);
	Win.castShadow = true;
	Win.receiveShadow = true;
	Win.position.y += 10;
	this.mesh.add(Win);
};

Sea = function() {
	var geom = new THREE.CylinderGeometry(500, 500, 2900, 33, 34);
	geom.mergeVertices();
	var l = geom.vertices.length;
	this.waves = [];

	for (var i = 0; i < l; i++) {
		var v = geom.vertices[i];

		this.waves.push({
			y: v.y,
			x: v.x,
			z: v.z,
			ang: Math.random() * Math.PI * 2,
			amp: 20 + Math.random() * 15,
			speed: 0.016 + Math.random() * 0.032
		});
	}

	var mat = new THREE.MeshPhongMaterial({
		color: 0x54b2a9,
		opacity: 0.9,
		shading: THREE.FlatShading
	});

	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;
	this.mesh.rotation.z += Math.PI / 2;
	this.mesh.position.y -= 700;
};

Sea.prototype.moveWaves = function() {
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	for (var i = 0; i < l; i++) {
		var v = verts[i];
		var vprops = this.waves[i];
		v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

		vprops.ang += vprops.speed;
	}

	this.mesh.geometry.verticesNeedUpdate = true;

	sea.mesh.rotation.z += 0.005;
};

var airplane;

function createPlane() {
	airplane = new AirPlane();
	airplane.mesh.scale.set(0.25, 0.25, 0.25);
	airplane.mesh.position.y = 0;
	airplane.mesh.position.z = 0;
	scene.add(airplane.mesh);
}

function createSea() {
	sea = new Sea();
	sea.moveWaves();
	scene.add(sea.mesh);
}

function updatePlane() {

	
	var targetX = normalize(mousePos.x, -1, 1, -100, 100);
	var targetZ = normalize(mousePos.y, -1, 1, 100, -200);
	airplane.mesh.position.x += (targetX - airplane.mesh.position.x) * 0.1;
	airplane.mesh.position.z += (targetZ - airplane.mesh.position.z) * 0.1;
	if (targetZ > 0) {
		sea.mesh.rotation.x += 0.002 + targetZ / 100000;
		for (var i = 0; i < p.length; i++) {
			p[i].mesh.rotation.x += 0.001 + targetZ / 300000;
		}
	} else {
		sea.mesh.rotation.x += 0.005 + -targetZ / 10000;
		for (var i = 0; i < p.length; i++) {
			p[i].mesh.rotation.x += 0.001 + -targetZ / 30000;
		}
	}

	airplane.mesh.rotation.z = 0;

	
}


function showCustomAlert(message) {
    // Create the overlay
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "10000";

    // Create the alert box
    var alertBox = document.createElement("div");
    alertBox.style.backgroundColor = "#fff";
    alertBox.style.padding = "30px";
    alertBox.style.borderRadius = "10px";
    alertBox.style.textAlign = "center";
    alertBox.style.width = "300px";
    alertBox.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.3)";
    alertBox.style.animation = "fadeIn 0.3s ease";

    // Add the message
    var messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.style.fontSize = "18px";
    messageElement.style.margin = "15px 0";
    messageElement.style.color = "#555";
    alertBox.appendChild(messageElement);

    // Create the close button
    var closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.backgroundColor = "#4CAF50";
    closeButton.style.color = "white";
    closeButton.style.padding = "10px 20px";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "5px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "16px";
    closeButton.style.transition = "background-color 0.3s";
    closeButton.onclick = function() {
        // Close the alert when the button is clicked
        document.body.removeChild(overlay);
    };

    // Add the button to the alert box
    alertBox.appendChild(closeButton);

    // Append the alert box to the overlay
    overlay.appendChild(alertBox);

    // Append the overlay to the body
    document.body.appendChild(overlay);

    // Optional: add animation for fadeIn
    var style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Example usage of the custom alert
function onParticleClick() {
    showCustomAlert("You win!"); // Display the custom win message
    togglePause(); // Pause the animation
}


function normalize(v, vmin, vmax, tmin, tmax) {
	var nv = Math.max(Math.min(v, vmax), vmin);
	var dv = vmax - vmin;
	var pc = (nv - vmin) / dv;
	var dt = tmax - tmin;
	var tv = tmin + pc * dt;
	return tv;
}

var Particle = function() {
	this.mesh = new THREE.Object3D();
	this.radius = 1400;
	this.side = 3;
	this.s = Math.PI * getRandomInt(0, 360) / 180;
	this.t = Math.PI * getRandomInt(0, 360) / 180;
	geom = new THREE.BoxGeometry(this.side, this.side, this.side, 1, 1, 1);
	mat = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		shading: THREE.FlatShading
	});
	var xAxis = this.radius * Math.cos(this.s) * Math.sin(this.t);
	var yAxis = this.radius * Math.sin(this.s) * Math.sin(this.t);
	var zAxis = this.radius * Math.cos(this.t);
	this.par = new THREE.Mesh(geom, mat);
	this.par.position.x = xAxis;
	this.par.position.y = yAxis;
	this.par.position.z = zAxis;
	this.mesh.add(this.par);
};

var p = [];

//console.log(randomNum)
function createParticle() {
    for (var i = 0; i < 1000; i++) {
        p[i] = new Particle();
		//console.log(randomNum);
        // Add green color to a random particle based on probability
        if (randomNum == 1) {
            p[i].mesh.children[0].material.color.set(0x00ff00); // Set particle color to green
            //console.log("Math.random()");
           

            // Event listener for green particle click
            p[i].mesh.children[0].addEventListener('click', function(event) {
                //console.log("you clicked");
                if (event.target.material.color.getHex() === 0x00ff00) {
					onParticleClick();
                }
            });
        }

        // Add the particle to the scene
        scene.add(p[i].mesh);
    }
}



function loop() {
    if (isPaused) return; // Do nothing if the animation is paused

    var a = 0.01;
    airplane.mesh.position.y += Math.sin(a);
    renderer.render(scene, camera);
	
    updatePlane();
	
	//console.log("randomNum"+ randomNum);
	
	
	if (randomNum < 2) {
		i =Math.floor(Math.random()*1000)
		p[i].mesh.children[0].material.color.set(0x00ff00); // Set particle color to green
		//console.log("Math.random()");
	   

		// Event listener for green particle click
		p[i].mesh.children[0].addEventListener('click', function(event) {
			//console.log("you clicked");
			if (event.target.material.color.getHex() === 0x00ff00) {
				onParticleClick();
			}
		});
	}

    requestAnimationFrame(loop); 
	
	// Keep the loop going if not paused

}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
