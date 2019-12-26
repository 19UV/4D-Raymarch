uniform vec4 u_cam_pos;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

const int MAX_MARCHING_STEPS = 500;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

vec3 fog_color = vec3(0.25);
float cam_w = 0.0;

vec4 sdPlane(in vec4 p, in vec4 pos, in vec3 color)
{
    vec4 obj_pos = p - pos;
    return vec4( color, abs( obj_pos.z ) );
}

vec4 sdSphere(in vec4 p, in vec4 pos, in float s, in vec3 color)
{
    vec4 obj_pos = p - pos;
    return vec4(color, length(obj_pos) - s);
}

vec4 sdBox( in vec4 p, in vec4 pos, in vec4 b, in vec3 color)
{
    vec4 obj_pos = p - pos;
    vec4 q = abs(obj_pos) - b;
    return vec4(color, length(max(q,vec4(0.0))) + min(max(max(q.x, q.y),max(q.z, q.w)),0.0));
}

#define WORLDLENGTH 3 // TODO: Make worldlength non-constant

vec4 sceneSDF(in vec4 p)
{
    vec4 world_matrix[WORLDLENGTH];
    
    world_matrix[0] = sdSphere(p, vec4(0.0, 2.5, 0.0, 0.0), 2.0, vec3(0.0, 0.0, 1.0));
    world_matrix[1] = sdSphere(p, vec4(0.0, -2.5, 0.0, 0.75), 1.0, vec3(0.0, 1.0, 0.0));
    world_matrix[2] = sdPlane(p, vec4(0.0, 0.0, -2.5, 0.0), vec3(0.85));
    
    vec4 closest_obj = vec4(100.0);
    
    for (int i=0;i<WORLDLENGTH;i++) // TODO: Change it so the value changes with the actual length
    {
    	if(world_matrix[i][3] < closest_obj.w)
        {
        	closest_obj = world_matrix[i];
        }
    }
    
    return closest_obj;
}

vec4 trace(vec3 ray_pos, vec3 direction, float start, float end)
{
    float depth = start;
    for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
        vec4 closest_obj = sceneSDF( vec4( ray_pos + depth * direction, cam_w ) );
        float dist = closest_obj.w;
        vec3 closest_color = closest_obj.xyz;
        if (dist < EPSILON) {
			return vec4(closest_color, depth);
        }
        depth += dist;
        if (depth >= end) {
            return vec4(fog_color, end);
        }
    }
    return vec4(fog_color, end);
}

#define LIGHTSLENGTH 2

float total_intensity(in vec3 pos)
{
	vec4 light[LIGHTSLENGTH];
    
    light[0] = vec4(0.0, 0.0, 25.0, 0.0);
    light[1] = vec4(50.0, 0.0, 3.0, 0.0); // Camera Light
    
    float intensity = 0.0;
    
    for (int i=0;i<LIGHTSLENGTH;i++)
    {
    	vec3 direction_to_light = normalize(light[i].xyz - pos);
        float distance_to_light = length(light[i] - vec4(pos, cam_w));
        float dist_coll = trace(pos, direction_to_light, EPSILON + 0.0001, distance_to_light).w;
        
        if(dist_coll >= distance_to_light)
        {
        	intensity += 1.0 / distance_to_light * distance_to_light;
        }
        
    }
    
    return intensity;
}

vec3 rayDirection(float fov, vec2 size, vec2 fragCoord)
{
    vec2 yz = fragCoord - size / 2.0;
    float x = size.y / tan(radians(fov) / 2.0);
    return normalize(vec3(-x, yz));
}

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution;
    
    vec3 cam_pos = vec3(u_cam_pos.xyz);
    cam_w = u_cam_pos.w;
    
    float ztheta = u_mouse.x/u_resolution.x;
    float xtheta = u_mouse.y/u_resolution.y;
    
    float sin_ztheta = sin(ztheta);
    float cos_ztheta = cos(ztheta);
    
    float sin_xtheta = sin(xtheta);
    float cos_xtheta = cos(xtheta);
    
    mat3 zrot = mat3(
        vec3(cos_ztheta, sin_ztheta, 0.),
        vec3(-sin_ztheta, cos_ztheta, 0.),
        vec3(0., 0., 1.)
    );
    
    mat3 xrot = mat3(
        vec3(cos_xtheta, 0., -sin_xtheta),
        vec3(0., 1., 0.),
        vec3(sin_xtheta, 0., cos_xtheta)
    );
    
    vec3 dir = rayDirection(45.0, u_resolution, gl_FragCoord.xy);
    dir = dir * xrot * zrot;
    
    vec4 trace_return = trace(cam_pos, dir, MIN_DIST, MAX_DIST);
    vec3 collision_pos = cam_pos + trace_return.w * dir;
    
    gl_FragColor = vec4(trace_return.xyz * total_intensity(collision_pos), 0.0);
}