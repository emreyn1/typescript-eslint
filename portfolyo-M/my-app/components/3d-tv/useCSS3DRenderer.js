import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';

/**
 * CSS3DRenderer hook for React Three Fiber
 * R3F doesn't natively support CSS3DRenderer, so we need to manually manage it
 */
export function useCSS3DRenderer() {
  const { gl, scene, camera, size } = useThree();
  const cssRendererRef = useRef(null);

  useEffect(() => {
    // Create CSS3D renderer
    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(size.width, size.height);
    
    // Position CSS renderer on top of WebGL renderer
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    // Pointer events will be managed dynamically based on iframe visibility
    cssRenderer.domElement.style.pointerEvents = 'none'; // Default: don't block model
    cssRenderer.domElement.style.zIndex = '10';
    cssRenderer.domElement.setAttribute('data-css3d', 'true');
    
    // Get the canvas container (gl.domElement's parent)
    const canvasContainer = gl.domElement.parentElement;
    if (canvasContainer) {
      canvasContainer.appendChild(cssRenderer.domElement);
    }
    
    cssRendererRef.current = cssRenderer;

    // Handle resize
    const handleResize = () => {
      if (cssRendererRef.current) {
        cssRendererRef.current.setSize(size.width, size.height);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
      if (cssRendererRef.current && cssRendererRef.current.domElement.parentElement) {
        cssRendererRef.current.domElement.parentElement.removeChild(cssRendererRef.current.domElement);
      }
    };
  }, [gl, size]);

  // Update size when it changes
  useEffect(() => {
    if (cssRendererRef.current) {
      cssRendererRef.current.setSize(size.width, size.height);
    }
  }, [size.width, size.height]);

  // Render CSS3D in sync with R3F's render loop
  useFrame(() => {
    if (cssRendererRef.current && scene && camera) {
      cssRendererRef.current.render(scene, camera);
    }
  });

  return cssRendererRef.current;
}
