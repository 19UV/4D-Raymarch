const PI = Math.PI;
const PI2 = Math.PI / 2;

var container;
var camera, scene, renderer;
var uniforms;

const movement_speed = 0.75;

var player_pos = [25.0, 0.0, 0.0, 0.2];
var player_vel = [0.0, 0.0, 0.0]; // Forward, Right, 4
var player_dir = [0.0, 0.0];

load_resources();

function load_resources() {
    var frag_request = new XMLHttpRequest();
    var yet_to_run = true;
    frag_request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200 && this.responseText != "" && yet_to_run) {
            document.getElementById("fragmentShader").innerHTML = this.responseText; // TODO: Moving Data Through DOM Slow, Improve
            yet_to_run = false;
            init();
        }
    };
    frag_request.open("GET", "frag_shader.frag", true);
    frag_request.send();
}

var pointer_locked = false;

function init() {
    container = document.getElementById( 'container' );

    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );
    
    uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2(0.0, 0.0) },
        u_cam_pos: { type: "v4", value: new THREE.Vector4() },
        u_direction: {type: "v2", value: new THREE.Vector2(0.0, 0.0)},
        SHADOWS: { type: "f", value: 0.0}
    };

    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    } );
    
    set_player_pos(player_pos);

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );

    container.appendChild( renderer.domElement );

    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false );
    
    renderer.domElement.addEventListener('click', function() {
        renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;

        renderer.domElement.requestPointerLock();
    });
    
    document.addEventListener('pointerlockchange', toggle_mouse, false);
    document.addEventListener('mozpointerlockchange', toggle_mouse, false);
    document.addEventListener('webkitpointerlockchange', toggle_mouse, false);
    
    document.onmousemove = function(e){
        if (pointer_locked) {
            var mouse_damper = 1.1;
            
            // float ztheta = u_mouse.x/u_resolution.x;
            // float xtheta = u_mouse.y/u_resolution.y;
            
            player_dir[0] += (e.movementX / mouse_damper) / window.innerWidth;
            player_dir[1] += (e.movementY / mouse_damper) / window.innerHeight;
            
            uniforms.u_direction.value.x = player_dir[0];
            uniforms.u_direction.value.y = player_dir[1];
            
            uniforms.u_mouse.value.x += e.movementX / mouse_damper;
            uniforms.u_mouse.value.y += e.movementY / mouse_damper;
        }
    }
    
    setup_controls();
    
    stats = createStats();
    document.body.appendChild(stats.domElement);
    
    animate();
}

function toggle_mouse() { // Fix so only changes when want to (double click on screen)
    pointer_locked = !pointer_locked;
}

function set_player_pos(array_vec) {
    uniforms.u_cam_pos.value.x = array_vec[0];
    uniforms.u_cam_pos.value.y = array_vec[1];
    uniforms.u_cam_pos.value.z = array_vec[2];
    uniforms.u_cam_pos.value.w = array_vec[3];
    player_pos = array_vec;
}

function onWindowResize( event ) {
    renderer.setSize( window.innerWidth, window.innerHeight );
    uniforms.u_resolution.value.x = renderer.domElement.width;
    uniforms.u_resolution.value.y = renderer.domElement.height;
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function setup_controls() {
    // W: 119, Forward
    // A: 97, Left
    // S: 115, Backward
    // D: 100, Right
    // R: 114, Forward4
    // F: 102, Back4
    console.log('Setting Up Keyboard Controls')
    document.addEventListener('keydown', function(e) {
        var keycode = e.keyCode || e.which;
        switch(keycode) {
            case 87: // W
                player_vel[0] = movement_speed;
                break;
            
            case 65: // A
                player_vel[1] = -movement_speed;
                break;
                
            case 83: // S
                player_vel[0] = -movement_speed;
                break;
                
            case 68: // D
                player_vel[1] = movement_speed;
                break;
                
            case 82: // R
                player_vel[2] = movement_speed;
                break;
                
            case 70: // F
                player_vel[2] = -movement_speed;
                break;
        }
    });
    
    document.addEventListener('keyup', function(e) {
        var keycode = e.keyCode || e.which;
        switch(keycode) {
            case 87: // W
                player_vel[0] = 0;
                break;
            
            case 65: // A
                player_vel[1] = 0;
                break;
                
            case 83: // S
                player_vel[0] = 0;
                break;
                
            case 68: // D
                player_vel[1] = 0;
                break;
                
            case 82: // R
                player_vel[2] = 0;
                break;
                
            case 70: // F
                player_vel[2] = 0;
                break;
        }
    })
}


function render() {
    uniforms.u_time.value += 0.05;
    
    var vec3_cam_pos = [player_pos[0], player_pos[1], player_pos[2]];
    var cam_w = player_pos[3];
    
    vec3_cam_pos = ray(vec3_cam_pos, [player_dir[0] - PI2, 0.0], player_vel[0]) // Forward
    vec3_cam_pos = ray(vec3_cam_pos, [player_dir[0], 0.0], player_vel[1] / 2.0) // Right
    
    set_player_pos([vec3_cam_pos[0], vec3_cam_pos[1], vec3_cam_pos[2], cam_w]); // May not be the best place to place
    
    renderer.render( scene, camera );
    stats.update();
}