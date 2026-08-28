document.getElementById('start-btn').addEventListener('click', async () => {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      if (response !== 'granted') {
        alert('Se requieren permisos de sensores para la orientación.');
        return;
      }
    } catch (error) {
      console.error(error);
    }
  }
  document.getElementById('permission-overlay').style.display = 'none';
  loadSessionData();
  initZoom();
});

function loadSessionData() {
  fetch('session.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('celestial-container');
      
      data.forEach(obj => {
        const entity = document.createElement('a-image');
        entity.setAttribute('src', obj.image);
        
        const phi = THREE.MathUtils.degToRad(90 - obj.altitude);
        const theta = THREE.MathUtils.degToRad(obj.azimuth);
        const radius = 10;

        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = -radius * Math.sin(phi) * Math.cos(theta);

        entity.setAttribute('position', `${x} ${y} ${z}`);

        const objectSize = obj.size || 3;
        entity.setAttribute('width', objectSize);
        entity.setAttribute('height', objectSize);

        container.appendChild(entity);

        entity.addEventListener('loaded', () => {
          setTimeout(() => {
            entity.object3D.lookAt(0, y, 0);
            entity.object3D.rotateZ(THREE.MathUtils.degToRad(obj.rotation || 0));
          }, 100);
        });
      });
    })
    .catch(error => console.error('Error cargando el archivo session.json:', error));
}

function initZoom() {
  let currentScale = 1;

  // Zoom con la rueda del ratón (Escritorio)
  window.addEventListener('wheel', (event) => {
    const container = document.getElementById('celestial-container');
    if (event.deltaY < 0) {
      currentScale += 0.1;
    } else {
      currentScale = Math.max(0.1, currentScale - 0.1);
    }
    container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
  });

  // Zoom táctil optimizado con passive: true para evitar bloqueos del navegador
  let initialDistance = null;

  window.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (!initialDistance) {
        initialDistance = currentDistance;
        return;
      }

      const container = document.getElementById('celestial-container');
      const diff = currentDistance - initialDistance;

      if (Math.abs(diff) > 5) { // Sensibilidad mejorada
        if (diff > 0) {
          currentScale += 0.015;
        } else {
          currentScale = Math.max(0.1, currentScale - 0.015);
        }
        initialDistance = currentDistance;
        container.setAttribute('scale', `${currentScale} ${currentScale} ${currentScale}`);
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    initialDistance = null;
  }, { passive: true });
}
