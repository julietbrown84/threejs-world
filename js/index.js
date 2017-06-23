'use strict';

let scene,
    camera,
    renderer,
    controls,
    mouseDown,
    world,
    night = false;

let sheep,
    rock,
    castle,
    sky;

let width,
    height;


//SCREEN & MOUSE VARIABLES
var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };
 
function init(event){
    document.addEventListener('mousemove', handleMouseMove, false);
    addLights();
    grassPlane();
    pyrimids();
    drawingImagePng();
    modellingJsonLoader();
    drawRock();
    drawCastle();
    drawSky();
}

// HANDLE MOUSE EVENTS
var mousePos = { x: 0, y: 0 };

function handleMouseMove(event) {
    var tx = -1 + (event.clientX / WIDTH)*2;
    var ty = 1 - (event.clientY / HEIGHT)*2;
    mousePos = {x:tx, y:ty};
}

window.addEventListener('load', init, false);

function createScene() {
    WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf7d9aa, 100,950);

    camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.1, 1000);
    camera.lookAt(scene.position);
    camera.position.x = 0;
    camera.position.z = 10;
    camera.position.y = 1.5;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
  
    // move orbit around (comment out at the moment)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;

    world = document.querySelector('.world');
    world.appendChild(renderer.domElement);
  
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', handleWindowResize);
}

// HANDLE SCREEN EVENTS
function handleWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// LIGHTS
function addLights() {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
  const directionalLight1 = new THREE.DirectionalLight(0xffd798, 0.8);
  const directionalLight2 = new THREE.DirectionalLight(0xc9ceff, 0.5);


  directionalLight1.castShadow = true;
  directionalLight1.position.set(150, 350, 350);

  directionalLight2.castShadow = true;
  directionalLight2.position.set(150, 350, 350);

  // add light
  scene.add(hemisphereLight);
  scene.add(directionalLight1)
  scene.add(directionalLight2);
}

// GRASS
function grassPlane() {
  var grassPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(30, 60),
    new THREE.MeshLambertMaterial({color: 'seagreen'})
  );

  grassPlane.rotation.x = -1.57079633; // Radians
  scene.add(grassPlane);
}

// PYRIMIDS
function pyrimids() {
    // left 
    var geometry = new THREE.CylinderGeometry(1, 1*3, 1*3, 4 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff});
    var cylinder = new THREE.Mesh( geometry, material );

    cylinder.position.set(-3.2, 1.3, 0);
    cylinder.scale.set(1, 1, 1);
    scene.add( cylinder );

    // right
    var geometry = new THREE.CylinderGeometry( 1, 1*3, 1*3, 4 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff });
    var rightCylinder = new THREE.Mesh( geometry, material );

    rightCylinder.position.set(3, 1.3, 0.3);
    rightCylinder.scale.set(1, 1, 1);
    rightCylinder.rotation.x += 0.1;
    rightCylinder.rotation.y += 0.1;
    scene.add(rightCylinder);
}

// DRAWING IMAGE PNG
function drawingImagePng() {
    THREE.ImageUtils.crossOrigin = '';
    var spriteMap = new THREE.TextureLoader().load('test.png');
    var spriteMaterial = new THREE.SpriteMaterial({map: spriteMap, color: 0xffffff});
    var sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(6, 5, 5);
    sprite.position.set(0, 3.5, 0.3);
    scene.add(sprite); 
}

function spriteMove(speed) {
    this.vAngle += speed;
    this.group.position.y = Math.sin(this.vAngle) + 1.38;
        // const legRotation = Math.sin(this.vAngle) * Math.PI / 20 + 0.4;
        // this.leftPart.rotation.z = leftPartRotation;
}

// LOAD brain.json AND POSITION
function modellingJsonLoader() {
    var brainLoader = new THREE.ObjectLoader();

    brainLoader.load("brain.json",function (brain) {
        brain.scale.set( .1, .1, .1 );
        brain.position.set(-0.7, 3, 1);
        brain.rotation.x = rad(-20);
        scene.add(brain);
    });

    var shovelLoader= new THREE.JSONLoader();

    shovelLoader.load('cat.json', function(shovel) {
        mesh = new THREE.Mesh(shovel);
        shovel.scale.set( .1, .1, .1 );
        shovel.position.set(-0.9, 3, 1);
        shovel.rotation.x = rad(-20);
        scene.add(mesh);
    });
}

// DRAWING CLASSES
function drawCastle() {
    castle = new Castle();
    scene.add(castle.group)
}

function drawRock() {
    rock = new Rocks();
    scene.add(rock.group);
}

function drawSky() {
    sky = new Sky();
    sky.showNightSky(night);
    scene.add(sky.group);
}


function onMouseDown(event) {
    mouseDown = true;
}

function onMouseUp() {
    mouseDown = false;
}

function animate() {
    requestAnimationFrame(animate);
     
    render();
}

function render() {
    sky.moveSky();
    rock.jumpOnMouseDown();

    renderer.render(scene, camera);
}

class Castle {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.y = -2;
        this.group.scale.set(2, -2, -3);
        
        this.material = new THREE.MeshStandardMaterial({
          color:  0xacb3fb
          // roughness: 1,
          // shading: THREE.FlatShading
        });
        
        this.vAngle = 0;
        this.drawCastleParts();
        
        this.group.traverse((part) => {
            part.castShadow = true;
            part.receiveShadow = true;
        });
    }

    drawCastleParts() {
        // need to refactor and make dynamic
        var geometry = new THREE.PlaneGeometry( 32, 3, 32, 60 );
        var material = new THREE.MeshBasicMaterial( {color: 0xacb3fb} );
        var castlePlane = new THREE.Mesh( geometry, material);
        castlePlane.position.set(3, 1, -20);
        castlePlane.scale.set(1, 1, 1);
        scene.add(castlePlane);

        const castleGeometry = new THREE.PlaneGeometry(2, 4);
        const castleMaterial = new THREE.MeshBasicMaterial({color: 0xacb3fb});
        const castleSmallRectangleOne = new THREE.Mesh(castleGeometry, castleMaterial);
        castleSmallRectangleOne.position.set(3, 1, -20);
        castleSmallRectangleOne.scale.set(1, 1, 1);
        scene.add(castleSmallRectangleOne);

        const castleGeometryTwo = new THREE.PlaneGeometry(3, 4);
        const castleMaterialTwo = new THREE.MeshBasicMaterial({color: 0xacb3fb});
        const castleSmallRectangleTwo = new THREE.Mesh(castleGeometryTwo, castleMaterialTwo);
        castleSmallRectangleTwo.position.set(8, 1, -20);
        castleSmallRectangleTwo.scale.set(1, 1, 1);
        scene.add(castleSmallRectangleTwo);

        const castleGeometryThree = new THREE.PlaneGeometry(3, 4);
        const castleMaterialThree = new THREE.MeshBasicMaterial({color: 0xacb3fb});
        const castleSmallRectangleThree = new THREE.Mesh(castleGeometryThree, castleMaterialThree);
        castleSmallRectangleThree.position.set(12, 1, -20);
        castleSmallRectangleThree.scale.set(1, 1, 1);
        scene.add(castleSmallRectangleThree);

        const castleGeometryFour = new THREE.PlaneGeometry(3, 4);
        const castleMaterialFour = new THREE.MeshBasicMaterial({color: 0xacb3fb});
        const castleSmallRectangleFour = new THREE.Mesh(castleGeometryFour, castleMaterialFour);
        castleSmallRectangleFour.position.set(-1, 1, -20);
        castleSmallRectangleFour.scale.set(1, 1, 1);
        scene.add(castleSmallRectangleFour);

        const castleGeometryFive = new THREE.PlaneGeometry(3, 4);
        const castleMaterialFive = new THREE.MeshBasicMaterial({color: 0xacb3fb});
        const castleSmallRectangleFive = new THREE.Mesh(castleGeometryFive, castleMaterialFive);
        castleSmallRectangleFive.position.set(-8, 1, -20);
        castleSmallRectangleFive.scale.set(1, 1, 1);
        scene.add(castleSmallRectangleFive);

        const castleGeometryWindow = new THREE.PlaneGeometry(2, 1);
        const castleMaterialWindow = new THREE.MeshBasicMaterial({color: 0xffffff});
        const castleSmallRectangleWindowOne = new THREE.Mesh(castleGeometryWindow, castleMaterialWindow);
        castleSmallRectangleWindowOne.position.set(-8, 2, -20);
        castleSmallRectangleWindowOne.scale.set(1, 1, 1);
        scene.add(castleSmallRectangleWindowOne);
    }
}

class Rocks {
    constructor() {
        this.group = new THREE.Group();
        this.group.position.y = -2;
        this.group.scale.set(2, 2, 1);


        this.material = new THREE.MeshStandardMaterial({
            color: 0xacb3fb,
            roughness: 1,
            shading: THREE.FlatShading
        });
        
        this.vAngle = 0;
        this.drawParts();
        
        this.group.traverse((part) => {
            part.castShadow = true;
            part.receiveShadow = true;
        });
    }

    drawParts() {
        const partGeometry = new THREE.IcosahedronGeometry(0.5, 0);
        this.leftPart = new THREE.Mesh(partGeometry, this.material);
        this.leftPart.position.set(-3, 1.4, 2);
        this.leftPart.scale.set(1, 1, 1);
        this.leftPart.rotation.x = -90;
        this.group.add(this.leftPart);

        this.rightPart = this.leftPart.clone();
        this.rightPart.position.x = -this.leftPart.position.x;
        this.group.add(this.rightPart);
    }

    jump(speed) {
        this.vAngle += speed;
        this.group.position.y = Math.sin(this.vAngle) + 1.38;
        // const legRotation = Math.sin(this.vAngle) * Math.PI / 20 + 0.4;
        // this.leftPart.rotation.z = leftPartRotation;
    }

    jumpOnMouseDown() {
        if (mouseDown) {
            this.jump(5);
        } else {
            if (this.group.position.y <= 0.4) return;
            this.jump(0);
        }
    }
}

// RADIUS
function rad(degrees) {
  return degrees * (Math.PI / 180);
}

class Sky {
    constructor() {
        this.group = new THREE.Group();
        this.daySky = new THREE.Group();
        this.nightSky = new THREE.Group();
        this.colors = {
          day: [0xFFFFFF, 0xEFD2DA, 0xC1EDED, 0xCCC9DE],
          night: [0x5DC7B5, 0xF8007E, 0xFFC363, 0xCDAAFD, 0xDDD7FE],
        };
    
        this.drawSky('day');
        this.drawSky('night');
        this.drawNightLights();

        this.group.add(this.daySky);
        this.group.add(this.nightSky);
    }

    drawSky(phase) {
        for (let i = 0; i < 30; i ++) {
            const geometry = new THREE.IcosahedronGeometry(0.4, 0);
            const material = new THREE.MeshStandardMaterial({
                color: this.colors[phase][Math.floor(Math.random() * this.colors[phase].length)],
                roughness: 1,
                shading: THREE.FlatShading
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set((Math.random() - 0.5) * 30,
                             (Math.random() - 0.5) * 30,
                             (Math.random() - 0.5) * 30);

            if (phase === 'day') {
                this.daySky.add(mesh);
            } else {
                this.nightSky.add(mesh);
            }
        }
    }

    drawNightLights() {
        const geometry = new THREE.SphereGeometry(0.1, 5, 5);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFF51B6,
            roughness: 1,
            shading: THREE.FlatShading
        });
        
        for (let i = 0; i < 3; i ++) {
            const light = new THREE.PointLight(0xF55889, 2, 30);
            const mesh = new THREE.Mesh(geometry, material);

            light.add(mesh);
            light.position.set((Math.random() - 2) * 6,
                             (Math.random() - 2) * 6,
                             (Math.random() - 2) * 6);

            light.updateMatrix();
            light.matrixAutoUpdate = false;
          
            this.nightSky.add(light);
        }
    }

    showNightSky(condition) {
        if (condition) {
          this.daySky.position.set(100, 100, 100);
          this.nightSky.position.set(0, 0, 0);
        } else {
          this.daySky.position.set(0, 0, 0);
          this.nightSky.position.set(100, 100, 100);
        }
    }

    moveSky() {
        this.group.rotation.x += 0.001;
        this.group.rotation.y -= 0.004;
    }
}

const toggleBtn = document.querySelector('.toggle');
toggleBtn.addEventListener('click', toggleNight);

const worldMusic = document.querySelector('.world-music');
const btnMusic = document.querySelector('.toggle-music');
let playMusic = false;
btnMusic.addEventListener('click', toggleMusic);
worldMusic.volume = 0.3;
worldMusic.loop = true;

function toggleNight() {
  night = !night;
  toggleBtn.classList.toggle('toggle-night');
  world.classList.toggle('world-night');
  sky.showNightSky(night);
}

function toggleMusic() {
  playMusic = !playMusic;
  btnMusic.classList.toggle('music-off');
  playMusic ? worldMusic.play() : worldMusic.pause();
}

createScene();
animate();