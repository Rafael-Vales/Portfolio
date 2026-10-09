/** Fixed particle targets: the GPU interpolates every particle without per-frame uploads. */
export type ParticleMotionFrame = {
  width: number;
  height: number;
  dpr: number;
  phase: number;
  intro: boolean;
  introTime: number;
  formation: number;
  highlights: boolean;
  logoBlend: number;
  basinOffset: number;
  floor: number;
  loaderSize: number;
  scrollProgress: number;
  pointerX: number;
  pointerY: number;
  pointerStrength: number;
  baseInk: string;
  veeInk: string;
  accentInk: string;
};
export type ParticleMotionRenderer = {
  prepare(targets: Float32Array): void;
  render(frame: ParticleMotionFrame): void;
  dispose(): void;
};

export function createParticleMotionRenderer(gl: WebGLRenderingContext, color: (ink: string) => number[]): ParticleMotionRenderer | null {
  const vertex = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertex, `
    precision highp float;
    attribute vec3 portrait;
    attribute vec3 night;
    attribute vec3 logo;
    attribute vec3 basin;
    attribute vec4 origin;
    attribute vec4 detail;
    attribute vec2 navbar;
    uniform vec2 viewport, pointer;
    uniform float scrollProgress, pointerStrength;
    uniform float dpr, phase, introTime, formation, highlights, logoBlend, basinOffset, floorY, loaderSize;
    uniform bool isIntro;
    uniform vec3 baseInk, veeInk, accentInk;
    varying float radius, size;
    varying vec4 ink;
    float ease(float v) { float t = clamp(v, 0.0, 1.0); return t*t*t*(t*(t*6.0-15.0)+10.0); }
    void main() {
      vec2 face = mix(portrait.xy, night.xy, highlights);
      vec2 pile = basin.xy + vec2(0.0, basinOffset);
      vec2 position = face;
      float t = 0.0;
      bool falling = false;
      if (phase >= 6.0 && phase < 8.0) {
        t = clamp((phase - 6.0 - basin.z) / (2.0 - basin.z), 0.0, 1.0);
        position.x = mix(face.x, pile.x, ease(t));
        position.y = mix(face.y, pile.y, t*t*(3.0-2.0*t));
        falling = true;
      } else if (phase >= 8.0 && phase < 10.0) {
        t = ease((phase-8.0)/2.0);
        position = mix(pile, logo.xy, t);
        position.x += sin(t*3.14159265)*detail.x;
      } else if (phase >= 10.0 && phase < 16.0) {
        position = logo.xy;
      } else if (phase >= 16.0 && phase < 18.0) {
        t = clamp((phase-16.0-basin.z)/(2.0-basin.z), 0.0, 1.0);
        position.x = mix(logo.x, pile.x, ease(t));
        position.y = mix(logo.y, pile.y, t*t*(3.0-2.0*t));
        falling = true;
      } else if (phase >= 18.0) {
        t = ease((phase-18.0)/2.0);
        position = mix(pile, face, t);
        position.x += sin(t*3.14159265)*detail.x;
      }
      radius = mix(portrait.z, night.z, highlights*(1.0-logoBlend));
      radius *= mix(1.0, logo.z, logoBlend);
      vec3 tint = mix(baseInk, veeInk, detail.y);
      if (isIntro) {
        t = ease(formation);
        vec2 start = viewport*0.5 + origin.xy*loaderSize;
        position = mix(start, face, t);
        position.x += sin(t*3.14159265)*detail.x*0.35;
        float birth = smoothstep(0.0, 1.0, (introTime/0.85-origin.w)*6.0);
        float startRadius = origin.z*loaderSize/400.0*birth*detail.w;
        radius = mix(startRadius, mix(portrait.z, night.z, highlights), t);
        float sheen = (1.0-smoothstep(0.2, 0.5, formation))*
          (1.0-smoothstep(0.02, 0.12, abs(origin.w-mod(introTime*0.32,1.3))))*
          (1.0-step(7.0,detail.z));
        tint = mix(baseInk, accentInk, sheen);
      }
      if (falling) position.y = min(position.y, floorY - radius - 2.0);
      // Scroll deforms the current figure into the header, only when scroll changes.
      position = mix(position, navbar, scrollProgress);
      position.x += sin(scrollProgress*3.14159265)*detail.x*0.15;
      if (!isIntro && pointerStrength > 0.0) {
        vec2 delta = position-pointer;
        float distance = length(delta);
        float reach = min(viewport.x*0.18, 85.0);
        float influence = 1.0-smoothstep(0.0, reach, distance);
        position += delta/max(distance, 0.01)*influence*32.0*pointerStrength*(1.0-scrollProgress);
        if (falling || abs(phase-8.0)<0.001 || abs(phase-18.0)<0.001) {
          position.y = min(position.y, floorY-radius-2.0);
          position.x = clamp(position.x, 8.0, viewport.x-8.0);
        }
      }
      float clearance = smoothstep(24.0, 152.0, position.y);
      radius *= (1.0-scrollProgress*0.14)*(1.0-scrollProgress*clearance);
      gl_Position = vec4(position.x/viewport.x*2.0-1.0, 1.0-position.y/viewport.y*2.0, 0.0, 1.0);
      radius *= dpr;
      size = max(2.0, ceil(radius*2.0+2.0));
      gl_PointSize = size;
      ink = vec4(tint, 1.0-smoothstep(0.8, 1.0, scrollProgress));
    }
  `);
  gl.compileShader(vertex);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragment, `
    precision mediump float;
    varying float radius, size;
    varying vec4 ink;
    void main() {
      float coverage = clamp(radius+0.5-length((gl_PointCoord-0.5)*size),0.0,1.0);
      float alpha = ink.a*coverage*step(0.025,radius);
      gl_FragColor = vec4(ink.rgb*alpha,alpha);
    }
  `);
  gl.compileShader(fragment);
  const program = gl.createProgram()!;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  const attributes = [
    ["portrait", 3], ["night", 3], ["logo", 3],
    ["basin", 3], ["origin", 4], ["detail", 4], ["navbar", 2],
  ] as const;
  attributes.forEach(([name], index) => gl.bindAttribLocation(program, index, name));
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const buffer = gl.createBuffer()!;
  const floatsPerParticle = 22;
  const uniforms = Object.fromEntries([
    "viewport", "dpr", "phase", "introTime", "formation", "highlights",
    "logoBlend", "basinOffset", "floorY", "loaderSize", "isIntro",
    "baseInk", "veeInk", "accentInk", "scrollProgress", "pointer", "pointerStrength",
  ].map(name => [name, gl.getUniformLocation(program, name)]));
  let count = 0;
  function bind() {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    let offset = 0;
    attributes.forEach(([, size], index) => {
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(index, size, gl.FLOAT, false, floatsPerParticle * 4, offset * 4);
      offset += size;
    });
  }
  return {
    prepare(targets) {
      bind();
      gl.bufferData(gl.ARRAY_BUFFER, targets, gl.STATIC_DRAW);
      count = targets.length / floatsPerParticle;
    },
    render(f) {
      bind();
      gl.uniform2f(uniforms.viewport, f.width, f.height);
      gl.uniform1f(uniforms.dpr, f.dpr);
      gl.uniform1f(uniforms.phase, f.phase);
      gl.uniform1f(uniforms.introTime, f.introTime);
      gl.uniform1f(uniforms.formation, f.formation);
      gl.uniform1f(uniforms.highlights, f.highlights ? 1 : 0);
      gl.uniform1f(uniforms.logoBlend, f.logoBlend);
      gl.uniform1f(uniforms.basinOffset, f.basinOffset);
      gl.uniform1f(uniforms.floorY, f.floor);
      gl.uniform1f(uniforms.loaderSize, f.loaderSize);
      gl.uniform1f(uniforms.scrollProgress, f.scrollProgress);
      gl.uniform2f(uniforms.pointer, f.pointerX, f.pointerY);
      gl.uniform1f(uniforms.pointerStrength, f.pointerStrength);
      gl.uniform1i(uniforms.isIntro, f.intro ? 1 : 0);
      for (const name of ["baseInk", "veeInk", "accentInk"] as const) {
        const rgb = color(f[name]);
        gl.uniform3f(uniforms[name], rgb[0], rgb[1], rgb[2]);
      }
      gl.drawArrays(gl.POINTS, 0, count);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
