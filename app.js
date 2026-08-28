let celestialEntities = [];
let baseSizes = new Map();
let currentScale = 0.5; // Tamaño mínimo por defecto al arrancar los objetos

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
  
  // Ocultar la capa del botón
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
        celestialEntities.push(entity);
        baseSizes.set(entity, objectSize);

        // Aplicar el tamaño inicial mínimo (0.5)
        const initialAppliedSize = objectSize * currentScale;
        entity.setAttribute('width', initialAppliedSize);
        entity.setAttribute('height', initialAppliedSize);

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
  let initialDistance = null;
  let baseScale = currentScale;

  window.addEventListener('touchstart', (event) => {
    if (event.touches.length === 2) {
      initialDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      baseScale = currentScale;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (event) => {
    if (event.touches.length === 2 && initialDistance) {
      const currentDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );

      const factor = currentDistance / initialDistance;
      // Límites de zoom: mínimo 0.5 y máximo 2.5
      currentScale = Math.min(2.5, Math.max(0.5, baseScale * factor));
      
      applyZoomToEntities();
    }
  }, { passive: true });

  window.addEventListener('touchend', (event) => {
    if (event.touches.length < 2) {
      initialDistance = null;
    }
  }, { passive: true });
}

function applyZoomToEntities() {
  celestialEntities.forEach(entity => {
    const baseSize = baseSizes.get(entity);
    const newSize = baseSize * currentScale;
    entity.setAttribute('width', newSize);
    entity.setAttribute('height', newSize);
  });
}
