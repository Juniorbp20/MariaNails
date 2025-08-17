let currentPage = 1;
const BASE_API_URL = 'http://localhost:3000/api/galeria';

// Elementos del DOM
const galleryContainer = document.getElementById('gallery-container');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loader = document.getElementById('loader');

// Mostrar loader
function showLoader() {
  if (loader) loader.style.display = 'block';
  galleryContainer.innerHTML = '';
}

// Ocultar loader
function hideLoader() {
  if (loader) loader.style.display = 'none';
}

// Mostrar mensaje de error
function showError(message) {
  galleryContainer.innerHTML = `
    <div class="error-message">
      <p>❌ ${message}</p>
      <button onclick="location.reload()">Reintentar</button>
    </div>
  `;
}

// Cargar galería con paginación
// Cambiar a 30 imágenes por página (6x5)
const IMAGES_PER_PAGE = 30;

async function loadGallery(page) {
  try {
    const response = await fetch(`${BASE_API_URL}?page=${page}&per_page=${IMAGES_PER_PAGE}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error desconocido del servidor');
    }

    renderGallery(data);
    updatePagination(data);
    
  } catch (error) {
    console.error('Error al cargar galería:', error);
    showError(`No se pudieron cargar las imágenes: ${error.message}`);
  } finally {
    hideLoader();
  }
}

// Renderizar imágenes
function renderGallery(data) {
  if (!data.images || data.images.length === 0) {
    galleryContainer.innerHTML = `
      <div class="empty-gallery">
        <p>No se encontraron imágenes</p>
        <p>Por favor, verifica la carpeta de galería</p>
      </div>
    `;
    return;
  }

  galleryContainer.innerHTML = data.images.map(img => `
    <div class="gallery-item">
      <img 
        src="${img}" 
        loading="lazy" 
        alt="Diseño de uñas" 
        onerror="this.onerror=null;this.src='img/placeholder.jpg';"
      >
      <div class="overlay">
        <p>${getImageName(img)}</p>
      </div>
    </div>
  `).join('');
}

// Obtener nombre legible de la imagen
function getImageName(imgPath) {
  return imgPath
    .split('/').pop()
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Actualizar controles de paginación
function updatePagination(data) {
  pageInfo.textContent = `Página ${data.currentPage} de ${data.totalPages}`;
  prevBtn.disabled = data.currentPage === 1;
  nextBtn.disabled = data.currentPage === data.totalPages;
  
  // Actualizar estado de los botones
  prevBtn.classList.toggle('disabled', data.currentPage === 1);
  nextBtn.classList.toggle('disabled', data.currentPage === data.totalPages);
}

// Event Listeners mejorados
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadGallery(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

nextBtn.addEventListener('click', () => {
  currentPage++;
  loadGallery(currentPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si estamos en la página correcta
  if (galleryContainer) {
    loadGallery(currentPage);
  }
});

// Exportar para pruebas (opcional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadGallery, getImageName };
}