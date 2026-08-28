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
});

function loadSessionData() {
  fetch('session.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('celestial-container');
      
      data.forEach(obj => {
        const entity = document.createElement('a-image');
        entity.setAttribute('src', obj.image);
        
        // Cálculo original usando azimut y altitud del JSON
        const phi = THREE.MathUtils.degToRad(90 - obj.altitude);
        const theta = THREE.MathUtils.degToRad(obj.azimuth);
        const radius = 10;

        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = -radius * Math.sin(phi) * Math.cos(theta);

        entity.setAttribute('position', `${x} ${y} ${z}`);
        entity.setAttribute('rotation', `0 ${obj.azimuth} ${obj.rotation}`);
        entity.setAttribute('width', '1.5');
        entity.setAttribute('height', '1.5');

        container.appendChild(entity);

        // Forzar que la imagen mire siempre hacia el centro (0, 0, 0) donde está la cámara
        entity.addEventListener('loaded', () => {
          entity.object3D.lookAt(0, y, 0); // Mantiene la altura y gira hacia el centro
          entity.object3D.rotateZ(THREE.MathUtils.degToRad(obj.rotation));
        });
      });
    })
    .catch(error => console.error('Error cargando el archivo session.json:', error));
}
