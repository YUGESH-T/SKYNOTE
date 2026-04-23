"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { TimeOfDay, WeatherCondition } from "@/lib/weather-data";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeatherVisualizationProps {
  weatherCondition: WeatherCondition;
  timeOfDay: TimeOfDay;
  localHour: number;
}

type CloudPalette = {
  color: number;
  emissive: number;
  opacity: number;
};

type SceneTheme = {
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  ambientIntensity: number;
  keyLightIntensity: number;
  rimLightIntensity: number;
  starOpacity: number;
};

type CameraPose = {
  position: THREE.Vector3;
  target: THREE.Vector3;
};

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const renderable = child as THREE.Mesh | THREE.Points;
    if ("geometry" in renderable && renderable.geometry) {
      renderable.geometry.dispose();
    }

    const material = "material" in renderable ? renderable.material : undefined;
    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

function createOrb({
  color,
  radius,
  opacity,
  position,
}: {
  color: number;
  radius: number;
  opacity: number;
  position: [number, number, number];
}) {
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  orb.position.set(...position);
  return orb;
}

function createParticleField({
  count,
  spread,
  color,
  size,
  opacity,
}: {
  count: number;
  spread: [number, number, number];
  color: number;
  size: number;
  opacity: number;
}) {
  const positions: number[] = [];

  for (let index = 0; index < count; index += 1) {
    positions.push(
      (Math.random() - 0.5) * spread[0],
      (Math.random() - 0.5) * spread[1],
      (Math.random() - 0.5) * spread[2]
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

function createCloudBank(
  count: number,
  palette: CloudPalette,
  depth = 5,
  scaleBoost = 1
): THREE.Group {
  const bank = new THREE.Group();
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: palette.color,
    emissive: palette.emissive,
    emissiveIntensity: 0.28,
    opacity: palette.opacity,
    transparent: true,
    roughness: 0.85,
    metalness: 0.04,
    depthWrite: false,
  });

  for (let index = 0; index < count; index += 1) {
    const cloudGroup = new THREE.Group();

    for (let partIndex = 0; partIndex < 7; partIndex += 1) {
      const part = new THREE.Mesh(
        new THREE.IcosahedronGeometry(
          (Math.random() * 0.95 + 0.45) * scaleBoost,
          2
        ),
        cloudMaterial
      );
      part.position.set(
        (Math.random() - 0.5) * 2.6 * scaleBoost,
        (Math.random() - 0.5) * 1.15 * scaleBoost,
        (Math.random() - 0.5) * 1.4 * scaleBoost
      );
      part.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      cloudGroup.add(part);
    }

    cloudGroup.position.set(
      (Math.random() - 0.5) * 10,
      Math.random() * 3 - 1.2,
      (Math.random() - 0.5) * depth - depth / 2
    );
    bank.add(cloudGroup);
  }

  return bank;
}

function createAtmosphereRing(color: number, radius: number, opacity: number) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.BackSide,
      depthWrite: false,
    })
  );
}

function createHorizonPlane({
  color,
  emissive,
  opacity,
  y,
  rotationX = -Math.PI / 2.15,
  scale = 42,
}: {
  color: number;
  emissive: number;
  opacity: number;
  y: number;
  rotationX?: number;
  scale?: number;
}) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(scale, 72),
    new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity,
      roughness: 1,
      metalness: 0,
      depthWrite: false,
    })
  );
  mesh.rotation.x = rotationX;
  mesh.position.y = y;
  mesh.position.z = -6;
  return mesh;
}

function createArc({
  radius,
  tube,
  color,
  opacity,
  position,
  rotation,
}: {
  radius: number;
  tube: number;
  color: number;
  opacity: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 18, 100, Math.PI * 0.78),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
}

function createMoon({
  position,
}: {
  position: [number, number, number];
}) {
  const moonGroup = new THREE.Group();

  const moonCore = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
  );
  moonCore.position.set(...position);

  const moonGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.95, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0xbfdbfe,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  moonGlow.position.set(...position);

  const crescentCut = new THREE.Mesh(
    new THREE.SphereGeometry(1.28, 48, 48),
    new THREE.MeshBasicMaterial({
      color: 0x020617,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );
  crescentCut.position.set(position[0] + 0.42, position[1] + 0.02, position[2] + 0.12);

  moonGroup.add(moonGlow, moonCore, crescentCut);
  return moonGroup;
}

function getCameraPose(
  condition: WeatherCondition,
  timeOfDay: TimeOfDay
): CameraPose {
  if (condition === "Thunderstorm") {
    return {
      position:
        timeOfDay === "night"
          ? new THREE.Vector3(-3, 0.05, 13.8)
          : new THREE.Vector3(-2.7, 0.25, 13.3),
      target: new THREE.Vector3(0, -0.35, -5.9),
    };
  }

  if (condition === "Sunny") {
    return {
      position:
        timeOfDay === "morning"
          ? new THREE.Vector3(-2.1, 1.8, 11.8)
          : timeOfDay === "afternoon"
            ? new THREE.Vector3(-1.4, 1.25, 11.2)
            : new THREE.Vector3(-1.9, 1, 12.4),
      target: new THREE.Vector3(0.15, 0.9, -4.7),
    };
  }

  return {
    position:
      timeOfDay === "night"
        ? new THREE.Vector3(2.4, 0.45, 13.1)
        : new THREE.Vector3(1.8, 0.8, 12.5),
    target: new THREE.Vector3(0, 0.15, -5),
  };
}

function getSceneTheme(
  condition: WeatherCondition,
  timeOfDay: TimeOfDay
): SceneTheme {
  const baseByTime: Record<TimeOfDay, SceneTheme> = {
    morning: {
      skyColor: 0xfbbf24,
      fogColor: 0xf59e0b,
      fogDensity: 0.02,
      ambientColor: 0xfffbeb,
      ambientIntensity: 1.16,
      keyLightIntensity: 1.1,
      rimLightIntensity: 0.7,
      starOpacity: 0.05,
    },
    afternoon: {
      skyColor: 0x38bdf8,
      fogColor: 0x60a5fa,
      fogDensity: 0.022,
      ambientColor: 0xf8fafc,
      ambientIntensity: 1.02,
      keyLightIntensity: 0.95,
      rimLightIntensity: 0.68,
      starOpacity: 0,
    },
    night: {
      skyColor: 0x020617,
      fogColor: 0x0f172a,
      fogDensity: 0.034,
      ambientColor: 0xcbd5e1,
      ambientIntensity: 0.72,
      keyLightIntensity: 0.48,
      rimLightIntensity: 0.92,
      starOpacity: 0.68,
    },
  };

  const theme = { ...baseByTime[timeOfDay] };

  switch (condition) {
    case "Sunny":
      return {
        ...theme,
        skyColor:
          timeOfDay === "morning"
            ? 0xf59e0b
            : timeOfDay === "afternoon"
              ? 0x0ea5e9
              : 0x0f172a,
        fogColor:
          timeOfDay === "morning"
            ? 0xfbbf24
            : timeOfDay === "afternoon"
              ? 0x38bdf8
              : 0x082f49,
        ambientIntensity: timeOfDay === "night" ? 0.84 : 1.28,
        keyLightIntensity: timeOfDay === "night" ? 0.62 : 1.26,
        rimLightIntensity: timeOfDay === "night" ? 0.98 : 0.76,
        starOpacity: timeOfDay === "night" ? 0.82 : theme.starOpacity,
      };
    case "Cloudy":
      return {
        ...theme,
        skyColor: timeOfDay === "night" ? 0x020617 : 0x64748b,
        fogColor: timeOfDay === "night" ? 0x1e293b : 0x94a3b8,
        fogDensity: timeOfDay === "night" ? 0.036 : 0.026,
      };
    case "Rainy":
      return {
        ...theme,
        skyColor: timeOfDay === "night" ? 0x020617 : 0x1e293b,
        fogColor: timeOfDay === "night" ? 0x020617 : 0x334155,
        fogDensity: timeOfDay === "night" ? 0.05 : 0.038,
        ambientIntensity: timeOfDay === "night" ? 0.6 : 0.84,
        keyLightIntensity: timeOfDay === "night" ? 0.42 : 0.72,
        rimLightIntensity: 0.84,
        starOpacity: timeOfDay === "night" ? 0.28 : theme.starOpacity,
      };
    case "Snowy":
      return {
        ...theme,
        skyColor: timeOfDay === "night" ? 0x082f49 : 0xe0f2fe,
        fogColor: timeOfDay === "night" ? 0x0c4a6e : 0xe0f2fe,
        ambientIntensity: timeOfDay === "night" ? 0.86 : 1.14,
        starOpacity: timeOfDay === "night" ? 0.72 : theme.starOpacity,
      };
    case "Thunderstorm":
      return {
        ...theme,
        skyColor: 0x020617,
        fogColor: timeOfDay === "night" ? 0x020617 : 0x1e293b,
        fogDensity: timeOfDay === "night" ? 0.058 : 0.046,
        ambientIntensity: timeOfDay === "night" ? 0.5 : 0.74,
        keyLightIntensity: timeOfDay === "night" ? 0.3 : 0.52,
        rimLightIntensity: 1,
        starOpacity: timeOfDay === "night" ? 0.16 : 0.04,
      };
    case "Fog":
      return {
        ...theme,
        skyColor: timeOfDay === "night" ? 0x1e293b : 0xcbd5e1,
        fogColor: timeOfDay === "night" ? 0x334155 : 0xe2e8f0,
        fogDensity: timeOfDay === "night" ? 0.054 : 0.042,
      };
    case "Haze":
      return {
        ...theme,
        skyColor: timeOfDay === "night" ? 0x451a03 : 0xfbbf24,
        fogColor: timeOfDay === "night" ? 0x78350f : 0xf59e0b,
        fogDensity: timeOfDay === "night" ? 0.038 : 0.028,
        starOpacity: timeOfDay === "night" ? 0.18 : theme.starOpacity,
      };
  }
}

export default function WeatherVisualization({
  weatherCondition,
  timeOfDay,
  localHour,
}: WeatherVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const weatherGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const secondaryParticlesRef = useRef<THREE.Points | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const horizonRef = useRef<THREE.Group | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const atmosphereRingRef = useRef<THREE.Mesh | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const animationFrameRef = useRef<number | null>(null);
  const lightningTimeoutRef = useRef<number | null>(null);
  const sunLightRef = useRef<THREE.PointLight | null>(null);
  const lightningRef = useRef<THREE.PointLight | null>(null);
  const weatherConditionRef = useRef(weatherCondition);
  const timeOfDayRef = useRef(timeOfDay);
  const localHourRef = useRef(localHour);
  const cameraPoseRef = useRef(getCameraPose(weatherCondition, timeOfDay));
  const sceneThemeRef = useRef(getSceneTheme(weatherCondition, timeOfDay));

  const isMobile = useIsMobile();
  const [reducedMotion, setReducedMotion] = useState(false);
  const canRenderScene = useMemo(
    () => !isMobile && !reducedMotion,
    [isMobile, reducedMotion]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    weatherConditionRef.current = weatherCondition;
    timeOfDayRef.current = timeOfDay;
    localHourRef.current = localHour;
    cameraPoseRef.current = getCameraPose(weatherCondition, timeOfDay);
    sceneThemeRef.current = getSceneTheme(weatherCondition, timeOfDay);
  }, [localHour, timeOfDay, weatherCondition]);

  useEffect(() => {
    if (!canRenderScene || !supportsWebGL()) {
      return;
    }

    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const initialPose = getCameraPose(weatherConditionRef.current, timeOfDayRef.current);
    const initialTheme = getSceneTheme(weatherConditionRef.current, timeOfDayRef.current);
    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(initialPose.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.08;
    controls.maxPolarAngle = Math.PI / 2 + 0.22;
    controls.minPolarAngle = Math.PI / 2 - 0.22;
    controls.target.copy(initialPose.target);

    const ambientLight = new THREE.AmbientLight(
      initialTheme.ambientColor,
      initialTheme.ambientIntensity
    );
    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      initialTheme.keyLightIntensity
    );
    const rimLight = new THREE.DirectionalLight(
      0x7dd3fc,
      initialTheme.rimLightIntensity
    );
    keyLight.position.set(5, 5, 4);
    rimLight.position.set(-6, -2, -5);
    scene.add(ambientLight, keyLight, rimLight);

    const atmosphere = createAtmosphereRing(initialTheme.skyColor, 28, 0.22);
    scene.add(atmosphere);

    const stars = createParticleField({
      count: 220,
      spread: [48, 28, 24],
      color: 0xe0f2fe,
      size: 0.09,
      opacity: initialTheme.starOpacity,
    });
    scene.add(stars);

    scene.fog = new THREE.FogExp2(
      initialTheme.fogColor,
      initialTheme.fogDensity
    );

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    controlsRef.current = controls;
    ambientLightRef.current = ambientLight;
    atmosphereRingRef.current = atmosphere;
    starsRef.current = stars;

    const animate = () => {
      const currentScene = sceneRef.current;
      const currentRenderer = rendererRef.current;
      const currentCamera = cameraRef.current;
      const currentControls = controlsRef.current;
      const ambient = ambientLightRef.current;
      const atmosphereMesh = atmosphereRingRef.current;

      if (!currentScene || !currentRenderer || !currentCamera || !currentControls) {
        return;
      }

      const delta = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.elapsedTime;
      const pose = cameraPoseRef.current;
      const theme = sceneThemeRef.current;
      const weatherGroup = weatherGroupRef.current;
      const particles = particlesRef.current;
      const secondaryParticles = secondaryParticlesRef.current;
      const starsField = starsRef.current;
      const horizon = horizonRef.current;

      currentCamera.position.lerp(
        new THREE.Vector3(
          pose.position.x + Math.sin(elapsedTime * 0.08) * 0.12,
          pose.position.y + Math.sin(elapsedTime * 0.11) * 0.06,
          pose.position.z
        ),
        0.022
      );
      currentControls.target.lerp(pose.target, 0.028);

      if (currentScene.fog instanceof THREE.FogExp2) {
        currentScene.fog.color.lerp(new THREE.Color(theme.fogColor), 0.03);
        currentScene.fog.density +=
          (theme.fogDensity - currentScene.fog.density) * 0.03;
      }

      if (ambient) {
        ambient.color.lerp(new THREE.Color(theme.ambientColor), 0.03);
        ambient.intensity +=
          (theme.ambientIntensity - ambient.intensity) * 0.03;
      }

      keyLight.intensity +=
        (theme.keyLightIntensity - keyLight.intensity) * 0.03;
      rimLight.intensity +=
        (theme.rimLightIntensity - rimLight.intensity) * 0.03;

      if (atmosphereMesh) {
        const material = atmosphereMesh.material as THREE.MeshBasicMaterial;
        material.color.lerp(new THREE.Color(theme.skyColor), 0.03);
      }

      if (starsField) {
        const starMaterial = starsField.material as THREE.PointsMaterial;
        starMaterial.opacity +=
          (theme.starOpacity - starMaterial.opacity) * 0.04;

        if (starMaterial.opacity > 0.02) {
          starsField.rotation.y = elapsedTime * 0.02;
          starsField.rotation.x = Math.sin(elapsedTime * 0.08) * 0.06;
        }
      }

      if (horizon) {
        horizon.position.y = Math.sin(elapsedTime * 0.09) * 0.08 - 4.7;
      }

      if (particles) {
        const positions = particles.geometry.getAttribute(
          "position"
        ) as THREE.BufferAttribute;
        for (let index = 0; index < positions.count; index += 1) {
          let x = positions.getX(index);
          let y = positions.getY(index);
          let z = positions.getZ(index);

          if (weatherConditionRef.current === "Snowy") {
            x += Math.sin(elapsedTime * 0.6 + index) * 0.002 + 0.003;
            y -= 0.026;
            z += Math.cos(elapsedTime * 0.4 + index) * 0.001;
          } else if (weatherConditionRef.current === "Rainy") {
            x += 0.016;
            y -= 0.18;
          } else if (weatherConditionRef.current === "Thunderstorm") {
            x += 0.014;
            y -= 0.2;
          } else if (
            weatherConditionRef.current === "Fog" ||
            weatherConditionRef.current === "Haze" ||
            weatherConditionRef.current === "Sunny"
          ) {
            x += Math.sin(elapsedTime * 0.25 + index) * 0.001;
            y += Math.cos(elapsedTime * 0.35 + index) * 0.001;
          }

          if (y < -12) y = 12;
          if (x > 14) x = -14;
          if (x < -14) x = 14;

          positions.setX(index, x);
          positions.setY(index, y);
          positions.setZ(index, z);
        }
        positions.needsUpdate = true;
      }

      if (secondaryParticles) {
        secondaryParticles.rotation.y = elapsedTime * 0.06;
        secondaryParticles.rotation.z = Math.sin(elapsedTime * 0.09) * 0.08;
      }

      if (weatherGroup) {
        weatherGroup.rotation.y = Math.sin(elapsedTime * 0.15) * 0.08;
        weatherGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.03;

        if (weatherConditionRef.current === "Sunny" && weatherGroup.children[0]) {
          const sunCore = weatherGroup.children[0] as THREE.Mesh;
          sunCore.scale.setScalar(Math.sin(elapsedTime * 1.15) * 0.045 + 1);
        }

        if (weatherConditionRef.current === "Thunderstorm") {
          weatherGroup.position.x = Math.sin(elapsedTime * 0.55) * 0.18;
        } else if (weatherConditionRef.current === "Haze") {
          weatherGroup.position.x = Math.sin(elapsedTime * 0.18) * 0.4;
        } else {
          weatherGroup.position.x = 0;
        }

        weatherGroup.children.forEach((child, childIndex) => {
          child.position.y += Math.sin(elapsedTime * 0.7 + childIndex) * 0.0009;
          child.rotation.y += delta * 0.03 * (childIndex % 2 === 0 ? 1 : -1);
        });
      }

      currentControls.update();
      currentRenderer.render(currentScene, currentCamera);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mount || !cameraRef.current || !rendererRef.current) {
        return;
      }

      cameraRef.current.aspect = mount.clientWidth / mount.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (lightningTimeoutRef.current) {
        window.clearTimeout(lightningTimeoutRef.current);
      }

      if (weatherGroupRef.current) {
        disposeObject(weatherGroupRef.current);
        scene.remove(weatherGroupRef.current);
        weatherGroupRef.current = null;
      }

      if (particlesRef.current) {
        disposeObject(particlesRef.current);
        scene.remove(particlesRef.current);
        particlesRef.current = null;
      }

      if (secondaryParticlesRef.current) {
        disposeObject(secondaryParticlesRef.current);
        scene.remove(secondaryParticlesRef.current);
        secondaryParticlesRef.current = null;
      }

      if (horizonRef.current) {
        disposeObject(horizonRef.current);
        scene.remove(horizonRef.current);
        horizonRef.current = null;
      }

      if (starsRef.current) {
        disposeObject(starsRef.current);
        scene.remove(starsRef.current);
        starsRef.current = null;
      }

      if (lightningRef.current) {
        scene.remove(lightningRef.current);
      }

      if (sunLightRef.current) {
        scene.remove(sunLightRef.current);
      }

      if (atmosphereRingRef.current) {
        disposeObject(atmosphereRingRef.current);
        scene.remove(atmosphereRingRef.current);
        atmosphereRingRef.current = null;
      }

      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);

      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
      ambientLightRef.current = null;
    };
  }, [canRenderScene]);

  useEffect(() => {
    if (!canRenderScene || !sceneRef.current) {
      return;
    }

    const scene = sceneRef.current;

    if (lightningTimeoutRef.current) {
      window.clearTimeout(lightningTimeoutRef.current);
    }

    if (weatherGroupRef.current) {
      disposeObject(weatherGroupRef.current);
      scene.remove(weatherGroupRef.current);
    }

    if (particlesRef.current) {
      disposeObject(particlesRef.current);
      scene.remove(particlesRef.current);
    }

    if (secondaryParticlesRef.current) {
      disposeObject(secondaryParticlesRef.current);
      scene.remove(secondaryParticlesRef.current);
    }

    if (horizonRef.current) {
      disposeObject(horizonRef.current);
      scene.remove(horizonRef.current);
    }

    if (lightningRef.current) {
      scene.remove(lightningRef.current);
    }

    if (sunLightRef.current) {
      scene.remove(sunLightRef.current);
    }

    const weatherGroup = new THREE.Group();
    const horizonGroup = new THREE.Group();
    weatherGroupRef.current = weatherGroup;
    horizonRef.current = horizonGroup;
    particlesRef.current = null;
    secondaryParticlesRef.current = null;
    lightningRef.current = null;
    sunLightRef.current = null;

    if (weatherCondition === "Sunny") {
      const sunX = ((localHourRef.current - 12) / 7) * 4.5;
      const sunY =
        timeOfDayRef.current === "morning"
          ? 3.2
          : timeOfDayRef.current === "afternoon"
            ? 4.6
            : -1.8;
      const sunPosition: [number, number, number] = [sunX, sunY, -8];

      const sunLight = new THREE.PointLight(
        timeOfDayRef.current === "night" ? 0xdbeafe : 0xfff7cc,
        timeOfDayRef.current === "night" ? 1.2 : 2.8,
        90
      );
      sunLight.position.set(...sunPosition);
      scene.add(sunLight);
      sunLightRef.current = sunLight;

      horizonGroup.add(
        createHorizonPlane({
          color:
            timeOfDayRef.current === "morning"
              ? 0xfde68a
              : timeOfDayRef.current === "afternoon"
                ? 0xbfdbfe
                : 0x0f172a,
          emissive:
            timeOfDayRef.current === "night" ? 0x1d4ed8 : 0xf59e0b,
          opacity: timeOfDayRef.current === "night" ? 0.2 : 0.26,
          y: -4.7,
        })
      );

      if (timeOfDayRef.current === "night") {
        weatherGroup.add(
          createMoon({
            position: [3.6, 3.8, -8.6],
          })
        );
      } else {
        const sunColor =
          timeOfDayRef.current === "morning" ? 0xf59e0b : 0xfbbf24;

        weatherGroup.add(
          createOrb({
            color: sunColor,
            radius: 1.95,
            opacity: 0.96,
            position: sunPosition,
          })
        );
        weatherGroup.add(
          createOrb({
            color: 0xfef08a,
            radius: 2.85,
            opacity: 0.26,
            position: sunPosition,
          })
        );
      }

      if (timeOfDayRef.current !== "night") {
        weatherGroup.add(
          createArc({
            radius: 8.6,
            tube: 0.08,
            color: 0xfef3c7,
            opacity: 0.22,
            position: [0, -4.5, -7.5],
            rotation: [Math.PI / 2.22, 0, 0],
          })
        );
      }

      particlesRef.current = createParticleField({
        count: 160,
        spread: [22, 10, 14],
        color: timeOfDayRef.current === "night" ? 0xbfdbfe : 0xfef3c7,
        size: 0.12,
        opacity: timeOfDayRef.current === "night" ? 0.07 : 0.12,
      });
      scene.add(particlesRef.current);
    } else if (weatherCondition === "Cloudy") {
      horizonGroup.add(
        createHorizonPlane({
          color: timeOfDayRef.current === "night" ? 0x1e293b : 0x94a3b8,
          emissive: 0x334155,
          opacity: 0.26,
          y: -4.8,
        })
      );
      weatherGroup.add(
        createCloudBank(
          7,
          { color: 0xe2e8f0, emissive: 0x1e293b, opacity: 0.82 },
          6,
          1.15
        )
      );
    } else if (weatherCondition === "Rainy") {
      horizonGroup.add(
        createHorizonPlane({
          color: timeOfDayRef.current === "night" ? 0x020617 : 0x0f172a,
          emissive: 0x0f172a,
          opacity: 0.3,
          y: -4.95,
        })
      );
      weatherGroup.add(
        createCloudBank(
          8,
          { color: 0x94a3b8, emissive: 0x0f172a, opacity: 0.72 },
          8,
          1.08
        )
      );
      particlesRef.current = createParticleField({
        count: 2600,
        spread: [28, 26, 16],
        color: 0x93c5fd,
        size: 0.05,
        opacity: 0.9,
      });
      secondaryParticlesRef.current = createParticleField({
        count: 180,
        spread: [20, 6, 14],
        color: 0xffffff,
        size: 0.18,
        opacity: 0.06,
      });
      scene.add(particlesRef.current, secondaryParticlesRef.current);
    } else if (weatherCondition === "Snowy") {
      horizonGroup.add(
        createHorizonPlane({
          color: timeOfDayRef.current === "night" ? 0x164e63 : 0xe0f2fe,
          emissive: 0x7dd3fc,
          opacity: 0.34,
          y: -4.9,
        })
      );
      weatherGroup.add(
        createCloudBank(
          5,
          { color: 0xf8fafc, emissive: 0x334155, opacity: 0.55 },
          7,
          1.05
        )
      );
      particlesRef.current = createParticleField({
        count: 1700,
        spread: [26, 24, 18],
        color: 0xffffff,
        size: 0.09,
        opacity: 0.82,
      });
      secondaryParticlesRef.current = createParticleField({
        count: 160,
        spread: [18, 8, 14],
        color: 0xbfe9ff,
        size: 0.18,
        opacity: 0.12,
      });
      scene.add(particlesRef.current, secondaryParticlesRef.current);
    } else if (weatherCondition === "Thunderstorm") {
      horizonGroup.add(
        createHorizonPlane({
          color: 0x020617,
          emissive: 0x312e81,
          opacity: 0.34,
          y: -5,
        })
      );
      weatherGroup.add(
        createCloudBank(
          9,
          { color: 0x475569, emissive: 0x312e81, opacity: 0.82 },
          9,
          1.16
        )
      );
      particlesRef.current = createParticleField({
        count: 2300,
        spread: [28, 24, 18],
        color: 0x7dd3fc,
        size: 0.045,
        opacity: 0.82,
      });
      scene.add(particlesRef.current);

      const lightning = new THREE.PointLight(0xe0f2fe, 0, 120, 2);
      lightning.position.set(0, 0, 3);
      lightningRef.current = lightning;
      scene.add(lightning);

      const flash = () => {
        if (!lightningRef.current) {
          return;
        }

        lightningRef.current.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.2) * 8,
          (Math.random() - 0.5) * 10
        );
        lightningRef.current.power = 70 + Math.random() * 90;

        window.setTimeout(() => {
          if (lightningRef.current) {
            lightningRef.current.power = 0;
          }
        }, 90);

        lightningTimeoutRef.current = window.setTimeout(
          flash,
          1800 + Math.random() * 2800
        );
      };

      flash();
    } else if (weatherCondition === "Fog") {
      horizonGroup.add(
        createHorizonPlane({
          color: timeOfDayRef.current === "night" ? 0x334155 : 0xcbd5e1,
          emissive: 0x94a3b8,
          opacity: 0.22,
          y: -4.8,
        })
      );
      weatherGroup.add(
        createCloudBank(
          8,
          { color: 0xcbd5e1, emissive: 0x334155, opacity: 0.48 },
          7,
          1.18
        )
      );
      particlesRef.current = createParticleField({
        count: 280,
        spread: [28, 14, 16],
        color: 0xe2e8f0,
        size: 0.24,
        opacity: 0.14,
      });
      scene.add(particlesRef.current);
    } else if (weatherCondition === "Haze") {
      horizonGroup.add(
        createHorizonPlane({
          color: timeOfDayRef.current === "night" ? 0x451a03 : 0xfbbf24,
          emissive: 0xf59e0b,
          opacity: 0.2,
          y: -4.85,
        })
      );
      weatherGroup.add(
        createCloudBank(
          7,
          { color: 0xf1f5f9, emissive: 0x78350f, opacity: 0.4 },
          7,
          1.1
        )
      );
      particlesRef.current = createParticleField({
        count: 240,
        spread: [28, 14, 16],
        color: 0xfde68a,
        size: 0.22,
        opacity: 0.18,
      });
      scene.add(particlesRef.current);
    }

    scene.add(horizonGroup);
    scene.add(weatherGroup);

    return () => {
      if (lightningTimeoutRef.current) {
        window.clearTimeout(lightningTimeoutRef.current);
      }
    };
  }, [canRenderScene, localHour, timeOfDay, weatherCondition]);

  if (!canRenderScene || !supportsWebGL()) {
    return (
      <div className="weather-fallback-layer relative h-full w-full overflow-hidden rounded-lg">
        <div className="weather-fallback-glow absolute inset-0" />
      </div>
    );
  }

  return <div ref={mountRef} className="h-full w-full overflow-hidden rounded-lg" />;
}
