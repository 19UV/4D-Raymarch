function length(vector) {
    var return_value = 0;
    for (var i=0;i<vector.length;i++) return_value += vector[i] * vector[i];
    return Math.sqrt(return_value);
}

function normalize(vector) {
     var vector_len = length(vector);
     var ret = [];
     for (var i=0;i<vector.length;i++) ret.push(vector[i] / vector_len);
     return ret;
}

function createStats() {
    var stats = new Stats();
    stats.setMode(0);
    
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    
    return stats;
}

function ray(origin, direction, distance) { // 3D
    var return_value = origin;
    return_value[0] += Math.sin(direction[0]) * (Math.cos(direction[1]) * distance);
    return_value[1] += Math.cos(direction[0]) * (Math.cos(direction[1]) * distance);
    return_value[2] += Math.sin(direction[1]) * distance;
    return return_value;
}