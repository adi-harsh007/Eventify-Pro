import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vs = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fs = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
varying vec2 vUv;

// --- Simplex noise implementation ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Generate organic branching lightning using noise
float lightning(vec2 uv, float t) {
    float n1 = snoise(vec2(uv.y * 5.0, t * 1.5)) * 0.15;
    float n2 = snoise(vec2(uv.y * 12.0, t * 2.0 + 10.0)) * 0.05;
    float n3 = snoise(vec2(uv.y * 25.0, t * 3.0 + 20.0)) * 0.02;

    float offset = n1 + n2 + n3;
    
    // Core structure
    float distanceToCenter = abs(uv.x - 0.5 + offset);
    
    // Compute intense glowing core
    float glow = 0.005 / max(distanceToCenter, 0.0001);
    float core = 0.001 / max(distanceToCenter, 0.0001);
    
    // Sharp high intensity fading out
    return pow(glow, 1.2) + pow(core, 2.0);
}


void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    // The pointer uniform goes from -1 to 1.
    // We map it to 0..1 to apply attractive behavior to the UV
    vec2 pointerUV = uPointer * 0.5 + 0.5;
    
    // Attraction logic -> The lightning shifts towards the mouse slightly
    vec2 delta = pointerUV - uv;
    float dist = length(delta);
    
    // Warping the UVs towards the pointer to curve the lightning
    float pullFade = smoothstep(0.8, 0.0, dist);
    vec2 warpedUV = uv + (delta * pullFade * 0.15);
    
    // Add multiple branches of lightning
    float l1 = lightning(warpedUV, uTime * 0.5);
    float l2 = lightning(warpedUV + vec2(0.1, 0.0), uTime * 0.4 + 100.0) * 0.5; // Fainter branch
    
    float intensity = l1 + l2;
    
    // Colorize: Golden / Amber lightning as requested for this theme
    vec3 baseCol = vec3(1.0, 0.6, 0.1); 
    vec3 coreCol = vec3(1.0, 0.9, 0.6); // Hot inner core
    
    vec3 finalColor = baseCol * intensity + coreCol * pow(intensity, 3.0);
    
    // Add ambient dark space
    // Vignette
    float vig = uv.x * uv.y * 15.0;
    vig = pow(vig * (1.0 - uv.x) * (1.0 - uv.y), 0.25);
    
    // Fade out everything to black in background
    gl_FragColor = vec4(finalColor * vig, 1.0);
}
`;

const ShaderPlane = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { size, viewport } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uPointer: { value: new THREE.Vector2(0, 0) }
    }), [size]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            // Dampen mouse movement to pointer uniform
            materialRef.current.uniforms.uPointer.value.x = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uPointer.value.x,
                state.pointer.x,
                0.1
            );
            // Reverse Y since the webGL and window coords vary inherently based on coordinate plane mapping logic
            materialRef.current.uniforms.uPointer.value.y = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uPointer.value.y,
                -state.pointer.y,
                0.1
            );
        }
    });

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vs}
                fragmentShader={fs}
                uniforms={uniforms}
                // allow blending to background if needed by container
                transparent={true}
            />
        </mesh>
    );
};

export const LightningBackground = () => {
    return (
        <div className="fixed inset-0 w-full h-screen z-[0] pointer-events-auto">
            <Canvas
                camera={{ position: [0, 0, 1] }}
                gl={{ powerPreference: "high-performance", alpha: true }}
                style={{ width: '100vw', height: '100vh', background: 'black' }}
            >
                <ShaderPlane />
            </Canvas>
        </div>
    );
};
