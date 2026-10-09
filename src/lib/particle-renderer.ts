import { createParticleMotionRenderer, type ParticleMotionFrame, type ParticleMotionRenderer } from "./particle-motion";

/** One batched GPU draw per ink; the 2D fallback is static on touch devices. */
export type ParticleRenderer = {
  kind: "webgl" | "2d";
  resize(width: number, height: number, dpr: number): void;
  clear(): void;
  fill(points: Float32Array, count: number, color: string, alpha: number): void;
  prepareMotion?(targets: Float32Array): boolean;
  renderMotion?(frame: ParticleMotionFrame): void;
  dispose(): void;
};

export function createParticleRenderer(canvas: HTMLCanvasElement, forceStatic = false): ParticleRenderer | null {
  const gl = forceStatic ? null : canvas.getContext("webgl", {
    alpha: true, antialias: false, depth: false, stencil: false,
    powerPreference: "low-power", preserveDrawingBuffer: true,
  });
  if (!gl) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return {
      kind: "2d",
      resize(w, h, dpr) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); },
      clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); },
      fill(points, count, color, alpha) {
        ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
        for (let i = 0; i < count; i += 3) {
          ctx.moveTo(points[i] + points[i + 2], points[i + 1]);
          ctx.arc(points[i], points[i + 1], points[i + 2], 0, Math.PI * 2);
        }
        ctx.fill();
      },
      dispose() {},
    };
  }
  const vertex = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertex, `
    attribute vec3 point;
    uniform vec2 viewport;
    uniform float dpr;
    varying float radius;
    varying float size;
    void main() {
      gl_Position = vec4(point.x / viewport.x * 2.0 - 1.0, 1.0 - point.y / viewport.y * 2.0, 0.0, 1.0);
      radius = point.z * dpr;
      size = max(2.0, ceil(radius * 2.0 + 2.0));
      gl_PointSize = size;
    }
  `);
  gl.compileShader(vertex);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fragment, `
    precision mediump float;
    uniform vec4 ink;
    varying float radius;
    varying float size;
    void main() {
      float distance = length((gl_PointCoord - 0.5) * size);
      float coverage = clamp(radius + 0.5 - distance, 0.0, 1.0);
      float alpha = ink.a * coverage;
      gl_FragColor = vec4(ink.rgb * alpha, alpha);
    }
  `);
  gl.compileShader(fragment);
  const program = gl.createProgram()!;
  gl.attachShader(program, vertex); gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "point"); gl.linkProgram(program);
  gl.deleteShader(vertex); gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return null; }
  gl.useProgram(program);
  const viewport = gl.getUniformLocation(program, "viewport");
  const ratio = gl.getUniformLocation(program, "dpr");
  const ink = gl.getUniformLocation(program, "ink");
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  let capacity = 0;
  let motion: ParticleMotionRenderer | null = null;
  const colors = new Map<string, number[]>();
  const probe = document.createElement("canvas").getContext("2d")!;
  function color(value: string) {
    let rgb = colors.get(value);
    if (!rgb) {
      probe.fillStyle = value;
      // Canvas normalizes the CSS inks used by the portfolio to hex or rgb().
      const normalized = probe.fillStyle;
      if (normalized.startsWith("#")) {
        const hex = normalized.slice(1);
        const full = hex.length === 3 ? [...hex].map(char => char + char).join("") : hex;
        rgb = [0, 2, 4].map(offset => parseInt(full.slice(offset, offset + 2), 16) / 255);
      } else rgb = (normalized.match(/[\d.]+/g) || ["21", "21", "21"]).slice(0, 3).map(channel => Number(channel) / 255);
      // Transition colors are bounded; do not retain every interpolated shade.
      if (colors.size > 64) colors.clear();
      colors.set(value, rgb);
    }
    return rgb;
  }
  return {
    kind: "webgl",
    resize(w, h, dpr) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.useProgram(program);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(viewport, w, h); gl.uniform1f(ratio, dpr);
    },
    clear() { gl.clear(gl.COLOR_BUFFER_BIT); },
    fill(points, count, value, alpha) {
      if (!count) return;
      gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      for (let i = 1; i < 7; i++) gl.disableVertexAttribArray(i);
      if (points.byteLength > capacity) {
        capacity = points.byteLength; gl.bufferData(gl.ARRAY_BUFFER, capacity, gl.DYNAMIC_DRAW);
      }
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, points.subarray(0, count));
      const rgb = color(value);
      gl.uniform4f(ink, rgb[0], rgb[1], rgb[2], alpha);
      gl.drawArrays(gl.POINTS, 0, count / 3);
    },
    prepareMotion(targets) {
      motion ??= createParticleMotionRenderer(gl, color);
      if (!motion) return false;
      motion.prepare(targets);
      return true;
    },
    renderMotion(frame) { motion?.render(frame); },
    dispose() { motion?.dispose(); gl.deleteBuffer(buffer); gl.deleteProgram(program); },
  };
}
