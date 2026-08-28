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
        
        // Conversión simplificada de Azimut/Alt a coordenadas cartesianas relativas
        const phi = THREE.MathUtils.degToRad(90 - obj.altitude);
        const theta = THREE.MathUtils.degToRad(obj.azimuth);
        const radius = 10; // Distancia virtual del objeto

        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = -radius * Math.sin(phi) * Math.cos(theta);

        //entity.setAttribute('position', `${x} ${y} ${z}`);
        entity.setAttribute('position', `0 0 -3`);
        //entity.setAttribute('rotation', `0 ${obj.azimuth} ${obj.rotation}`);
        entity.setAttribute('rotation', `0 0 0`);
        entity.setAttribute('width', '3');
        entity.setAttribute('height', '3');

        container.appendChild(entity);
      });
    });
}
