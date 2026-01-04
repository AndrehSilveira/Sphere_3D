import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import flagUrls from "./flags"; // Importa URLs das bandeiras

const Sphere = () => {
  const sphereRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 }); // Última posição do mouse

  useEffect(() => {
    const currentRef = sphereRef.current;

    // Configuração básica: cena, câmera e renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    currentRef.appendChild(renderer.domElement);

    // Fundo claro
    scene.background = new THREE.Color(0xf0f0f0);

    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(ambientLight, directionalLight);

    // Criar esfera branca opaca
    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32); // Raio de 5, subdivisão alta para suavidade
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Branco
      side: THREE.FrontSide, // Renderizar apenas a frente
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    // Criar grupo para bandeiras
    const sphereGroup = new THREE.Group();
    
    const radius = 5; // Raio da esfera
    const numLatitudes = 10; // Número de faixas horizontais de latitude

    flagUrls.forEach((url, index) => {
      const loader = new THREE.TextureLoader();
      loader.load(url, (texture) => {
        // Espelhar imagem horizontalmente
        texture.repeat.set(-1, 1);
        texture.offset.set(1, 0);

        const flagMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide, // Visível dos dois lados
        });
        const flagPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), flagMaterial);

        // Coordenadas esféricas ajustadas (latitude e longitude)
        const latitude =
          ((index % numLatitudes) - numLatitudes / 2) * (Math.PI / numLatitudes); // Linhas horizontais

        // Excluir bandeiras nos polos
        if (latitude === Math.PI / 2 || latitude === -Math.PI / 2) return; // Excluir polo norte e sul

        const isNearPole = Math.abs(latitude) > Math.PI / 3;
        const numFlagsThisLatitude = isNearPole ? 6 : flagUrls.length; // Máximo de 6 bandeiras próximo aos polos

        const longitude =
          ((index % numFlagsThisLatitude) / numFlagsThisLatitude) * Math.PI * 2;

        flagPlane.position.set(
          radius * Math.cos(latitude) * Math.cos(longitude), // X
          radius * Math.sin(latitude), // Y
          radius * Math.cos(latitude) * Math.sin(longitude) // Z
        );

        flagPlane.lookAt(0, 0, 0); // Alinhar à superfície da esfera
        sphereGroup.add(flagPlane);
      });
    });

    scene.add(sphereGroup); // Adicionar grupo à cena
    camera.position.z = 15;

    // Atualizar renderização
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Controle de rotação
    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (isDragging.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        sphereGroup.rotation.y += deltaX * 0.01; // Rotação horizontal
        sphereGroup.rotation.x += deltaY * 0.01; // Rotação vertical

        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    currentRef.addEventListener("mousedown", handleMouseDown);
    currentRef.addEventListener("mousemove", handleMouseMove);
    currentRef.addEventListener("mouseup", handleMouseUp);

    // Tornar renderizador responsivo
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Limpeza
    return () => {
      window.removeEventListener("resize", handleResize);
      currentRef.removeEventListener("mousedown", handleMouseDown);
      currentRef.removeEventListener("mousemove", handleMouseMove);
      currentRef.removeEventListener("mouseup", handleMouseUp);
      if (currentRef.contains(renderer.domElement)) {
        currentRef.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={sphereRef} style={{ width: "100%", height: "100%" }}></div>;
};

export default Sphere;