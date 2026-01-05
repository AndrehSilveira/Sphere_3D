import React, { useEffect, useRef } from "react";
import './index.css';
import * as THREE from "three";
import flagUrls from "./flags"; // Importa as bandeiras (mude se quiser)

const Sphere = () => {
  const sphereRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 }); 
  const selectedFlag = useRef(null);
  const raycaster = new THREE.Raycaster(); 
  const mouse = new THREE.Vector2(); // Posição do mouse
  const flagData = useRef([]); // Para armazenar mapeamento das bandeiras (Mesh -> URL)

  useEffect(() => {
    const currentRef = sphereRef.current;

    // Configuração inicial: cena, câmera e renderizador
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

    scene.background = new THREE.Color(0xf0f0f0);

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(ambientLight, directionalLight);

    // Esfera central
    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32); // Raio de 5
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    // Bandeiras na superfície da esfera
    const sphereGroup = new THREE.Group();
    const radius = 5; // Raio da superfície
    const numLatitudes = 10; // Número de latitude

    flagUrls.forEach((url, index) => {
      const loader = new THREE.TextureLoader();
      loader.load(url, (texture) => {
        const flagMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const flagPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1), flagMaterial);

        // Corrigir espelhamento horizontal
        flagPlane.geometry.scale(-1, 1, 1); // Inverter o eixo X da geometria

        const latitude =
          ((index % numLatitudes) - numLatitudes / 2) * (Math.PI / numLatitudes);

        // Remover bandeiras muito próximas dos polos superiores/inferiores
        if (Math.abs(latitude) > Math.PI / 3) return; // Excluir acima de ~60° ou abaixo de ~-60°

        const numFlagsThisLatitude = flagUrls.length; // Distribuir uniformemente
        const longitude =
          ((index % numFlagsThisLatitude) / numFlagsThisLatitude) * Math.PI * 2;

        flagPlane.position.set(
          radius * Math.cos(latitude) * Math.cos(longitude),
          radius * Math.sin(latitude),
          radius * Math.cos(latitude) * Math.sin(longitude)
        );
        flagPlane.lookAt(0, 0, 0);

        sphereGroup.add(flagPlane);
        flagData.current.push({ mesh: flagPlane, url }); // Mapear Mesh -> URL
      });
    });

    scene.add(sphereGroup);
    camera.position.z = 15;

    // Função de animação da esfera
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Função de hover nas bandeiras
    const handleMouseMove = (event) => {
      const rect = currentRef.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sphereGroup.children);

      if (intersects.length > 0) {
        const flagPlane = intersects[0].object; // Selecionar a bandeira mais próxima

        // Aplicar escala à bandeira "hoverada"
        if (selectedFlag.current !== flagPlane) {
          if (selectedFlag.current) {
            selectedFlag.current.scale.set(1, 1, 1); // Resetar escala da bandeira anterior
          }
          flagPlane.scale.set(1.2, 1.2, 1.2); // Aumentar bandeira atual
          selectedFlag.current = flagPlane; // Atualizar a bandeira atual
        }
      } else if (selectedFlag.current) {
        selectedFlag.current.scale.set(1, 1, 1); 
        selectedFlag.current = null;
      }
    };

    // Duplo clique para abrir a bandeira
    const handleDoubleClick = (event) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sphereGroup.children);

      if (intersects.length > 0) {
        const clickedFlag = intersects[0].object;
        const flagInfo = flagData.current.find((flag) => flag.mesh === clickedFlag);

        if (flagInfo) {
          window.open(flagInfo.url, "_blank"); // Abrir imagem em uma nova aba
        }
      }
    };

    currentRef.addEventListener("mousemove", handleMouseMove);
    currentRef.addEventListener("dblclick", handleDoubleClick); // Clicar duas vezes para abrir a bandeira

    // Controle de rotação com o mouse
    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMoveWhileDragging = (e) => {
      if (isDragging.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;

        sphereGroup.rotation.y += deltaX * 0.01;
        sphereGroup.rotation.x += deltaY * 0.01;

        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    currentRef.addEventListener("mousedown", handleMouseDown);
    currentRef.addEventListener("mousemove", handleMouseMoveWhileDragging);
    currentRef.addEventListener("mouseup", handleMouseUp);

    // Renderizador para aumentar o tamanho da bandeira
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      currentRef.removeEventListener("mousemove", handleMouseMove);
      currentRef.removeEventListener("dblclick", handleDoubleClick); 
      currentRef.removeEventListener("mousedown", handleMouseDown);
      currentRef.removeEventListener("mousemove", handleMouseMoveWhileDragging);
      currentRef.removeEventListener("mouseup", handleMouseUp);
      if (currentRef.contains(renderer.domElement)) {
        currentRef.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={sphereRef} className="sphere-container"></div>
  );
};

export default Sphere;