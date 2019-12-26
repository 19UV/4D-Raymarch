var container;
var camera, scene, renderer;
var uniforms;

var player_pos = [25.0, 0.0, 0.0, 0.2];

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
        u_cam_pos: { type: "v4", value: new THREE.Vector4() }
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
            
            uniforms.u_mouse.value.x += e.movementX / mouse_damper;
            uniforms.u_mouse.value.y += e.movementY / mouse_damper;
        }
    }
    
    stats = createStats();
    document.body.appendChild(stats.domElement);
    
    animate();
}

function toggle_mouse() {
    pointer_locked = !pointer_locked;
}

function set_player_pos(array_vec) {
    uniforms.u_cam_pos.value.x = array_vec[0];
    uniforms.u_cam_pos.value.y = array_vec[1];
    uniforms.u_cam_pos.value.z = array_vec[2];
    uniforms.u_cam_pos.value.w = array_vec[3];
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

function render() {
    uniforms.u_time.value += 0.05;
    
    
    
    renderer.render( scene, camera );
    stats.update();
}