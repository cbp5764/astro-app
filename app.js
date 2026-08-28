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
        
        // Coordenadas fijas para verificar visibilidad directa
        entity.setAttribute('position', '0 0 -3');
        entity.setAttribute('rotation', '0 0 0');
        entity.setAttribute('width', '3');
        entity.setAttribute('height', '3');

        container.appendChild(entity);
      });
    })
    .catch(error => console.error('Error cargando el archivo session.json:', error));
}
