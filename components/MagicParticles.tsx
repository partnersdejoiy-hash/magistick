"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Interactive 3D particle field — the "magic" hero moment.
 *
 * Warm ember/gold dust drifting in real depth (varying z), with a camera
 * that leans gently toward the cursor. Depth, not gimmick.
 *
 * Performance budget:
 * - Lazy-loaded (next/dynamic, ssr:false) — three.js never touches the
 *   server bundle or the initial page chunk.
 * - DPR capped at 1.5, low-power GPU preference, no antialiasing.
 * - Particle count scales with viewport width (220–700).
 * - RAF skips work when the hero is offscreen or the tab is hidden.
 * - Everything disposed on unmount (geometry, material, texture, renderer).
 * - Fully skipped under prefers-reduced-motion — the static CSS
 *   AmbientField underneath remains as the elegant fallback.
 */
export default function MagicParticles({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const W = () => Math.max(1, host.clientWidth);
    const H = () => Math.max(1, host.clientHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(W(), H());
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 60);
    camera.position.set(0, 0, 9);

    // Soft round sprite, generated procedurally — no external assets.
    const sprite = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d");
      if (!ctx) return null;
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    const COUNT = Math.max(220, Math.min(700, Math.floor(W() * 0.85)));
    const base = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const phases = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const palette = [
      new THREE.Color("#D9480F"), // ember
      new THREE.Color("#D6A43C"), // gold
      new THREE.Color("#B27A3B"), // warm bronze
      new THREE.Color("#A08c5b"), // muted sand
    ];
    for (let i = 0; i < COUNT; i++) {
      base[i * 3] = (Math.random() - 0.5) * 24;
      base[i * 3 + 1] = (Math.random() - 0.5) * 14;
      base[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const col = palette[(Math.random() * palette.length) | 0];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.25 + Math.random() * 0.7;
    }
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(new Float32Array(base), 3);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.17,
      map: sprite ?? undefined,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // A second, sparser layer of larger, fainter motes for depth.
    const FAR = Math.floor(COUNT / 5);
    const farGeo = new THREE.BufferGeometry();
    const farPos = new Float32Array(FAR * 3);
    for (let i = 0; i < FAR; i++) {
      farPos[i * 3] = (Math.random() - 0.5) * 30;
      farPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      farPos[i * 3 + 2] = -6 - Math.random() * 8;
    }
    farGeo.setAttribute("position", new THREE.BufferAttribute(farPos, 3));
    const farMat = new THREE.PointsMaterial({
      size: 0.5,
      map: sprite ?? undefined,
      color: new THREE.Color("#D6A43C"),
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const farPoints = new THREE.Points(farGeo, farMat);
    scene.add(farPoints);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (r.width === 0) return;
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let inView = true;
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 },
    );
    io.observe(host);

    const onResize = () => {
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      renderer.setSize(W(), H());
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    let dead = false;

    const tick = () => {
      if (dead) return;
      raf = requestAnimationFrame(tick);
      if (document.hidden || !inView) return; // pause: zero GPU when unseen

      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;

      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < COUNT; i++) {
        const p = phases[i];
        const s = speeds[i];
        arr[i * 3] = base[i * 3] + Math.cos(t * s * 0.7 + p) * 0.3;
        arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * s + p) * 0.4;
      }
      posAttr.needsUpdate = true;

      points.rotation.y = t * 0.018 + mouse.x * 0.14;
      points.rotation.x = mouse.y * 0.08;
      farPoints.rotation.y = -t * 0.008;

      camera.position.x += (mouse.x * 1.1 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 0.7 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      geo.dispose();
      mat.dispose();
      farGeo.dispose();
      farMat.dispose();
      sprite?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    />
  );
}
