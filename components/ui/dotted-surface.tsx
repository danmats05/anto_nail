'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

// Lavender #C9A8E0 → rgb(201,168,224) normalized to 0-1
const DOT_R = 201 / 255;
const DOT_G = 168 / 255;
const DOT_B = 224 / 255;

export function DottedSurface({ className, children, ...props }: DottedSurfaceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const sceneRef   = useRef<{
    renderer: THREE.WebGLRenderer;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const SEPARATION = 150;
    const AMOUNTX    = 40;
    const AMOUNTY    = 60;

    const scene = new THREE.Scene();
    // Fog fades to cream (#FAF8F4)
    scene.fog = new THREE.Fog(0xfaf8f4, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 180, 1100);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    canvas.appendChild(renderer.domElement);

    const positions: number[] = [];
    const colors: number[]    = [];

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions.push(
          ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          0,
          iy * SEPARATION - (AMOUNTY * SEPARATION) / 2,
        );
        colors.push(DOT_R, DOT_G, DOT_B);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const pos = geometry.attributes.position.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          pos[i * 3 + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    sceneRef.current = { renderer, animationId };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        scene.traverse((obj) => {
          if (obj instanceof THREE.Points) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
        sceneRef.current.renderer.dispose();
        if (canvas && sceneRef.current.renderer.domElement.parentNode === canvas) {
          canvas.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className={cn('relative', className)} {...props}>
      <div ref={canvasRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
      {children}
    </div>
  );
}
