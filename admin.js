// Admin Panel JavaScript
let currentGalleryItems = [];

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function checkAuth() {
    try {
        if (!window.vitalStaysApi.isConfigured()) {
            showLogin();
            showLoginError('Faltan las variables públicas de Supabase en Vercel.');
            return;
        }

        const session = await window.vitalStaysApi.getSession();
        if (session && (await window.vitalStaysApi.isCurrentUserAdmin())) {
            await showDashboard();
            return;
        }

        showLogin();
    } catch (error) {
        console.error('Error al validar sesión:', error);
        showLogin();
        showLoginError(error.message || 'No se pudo validar la sesión.');
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

async function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    clearLoginError();
    await loadApartments();
}

function showLoginError(message) {
    const errorBox = document.getElementById('loginError');
    errorBox.textContent = message;
    errorBox.style.display = 'block';
}

function clearLoginError() {
    const errorBox = document.getElementById('loginError');
    errorBox.textContent = '';
    errorBox.style.display = 'none';
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        clearLoginError();
        await window.vitalStaysApi.signInAdmin(username, password);
        await showDashboard();
    } catch (error) {
        console.error('Error de login:', error);
        showLoginError(error.message || 'No se pudo iniciar sesión.');
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async function (e) {
    e.preventDefault();
    await window.vitalStaysApi.signOutAdmin();
    window.location.href = 'index.html';
});

// Load and display apartments
async function loadApartments() {
    const container = document.getElementById('apartmentsList');
    container.innerHTML = '<p>Cargando apartamentos...</p>';

    try {
        const apartments = await window.vitalStaysApi.listApartments();

        if (!apartments.length) {
            container.innerHTML = '<p>No hay apartamentos registrados todavía.</p>';
            return;
        }

        container.innerHTML = apartments.map(apt => `
        <div class="apartment-admin-card">
            <img src="${escapeHtml(apt.image)}" alt="${escapeHtml(apt.name)}" onerror="this.src='${window.vitalStaysApi.fallbackImage}'">
            <div class="apartment-admin-info">
                <h3>${escapeHtml(apt.name)}</h3>
                <p class="location">📍 ${escapeHtml(apt.location)}</p>
                <p class="features">🛏️ ${apt.bedrooms} hab. • 🚿 ${apt.bathrooms} baños • 📐 ${apt.size}m²</p>
                <p class="price">$${apt.price}/mes</p>
                ${apt.badge ? `<span class="badge-small ${apt.badge === 'Nuevo' ? 'new' : ''}">${apt.badge}</span>` : ''}
            </div>
            <div class="apartment-admin-actions">
                <button class="btn-edit" onclick="editApartment(${apt.id})">✏️ Editar</button>
                <button class="btn-delete" onclick="deleteApartment(${apt.id})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
    } catch (error) {
        console.error('Error al cargar apartamentos:', error);
        container.innerHTML = '<p>No se pudieron cargar los apartamentos.</p>';
    }
}

// Modal handlers
const modal = document.getElementById('apartmentModal');
const addNewBtn = document.getElementById('addNewBtn');
const closeModal = document.querySelector('.close-modal');
const cancelBtn = document.getElementById('cancelBtn');

addNewBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Apartamento';
    document.getElementById('apartmentForm').reset();
    document.getElementById('apartmentId').value = '';
    currentGalleryItems = [];
    renderGalleryPreviews();
    document.getElementById('galleryFilePicker').value = '';
    updateMainImagePreview('');
    modal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Update main image URL preview
function updateMainImagePreview(url) {
    const preview = document.getElementById('mainImagePreview');
    if (url && url.trim()) {
        preview.src = url.trim();
        preview.style.display = 'block';
        preview.onerror = function () { preview.style.display = 'none'; };
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
}

// Handle gallery file selection — converts each file to base64 and adds thumbnail
function handleGalleryFiles(input) {
    Array.from(input.files).forEach(file => {
        currentGalleryItems.push({
            id: generateId(),
            url: URL.createObjectURL(file),
            file
        });
    });
    renderGalleryPreviews();
    input.value = ''; // reset so same files can be selected again
}

// Add a gallery thumbnail preview (used on new selection and when editing)
function renderGalleryPreviews() {
    const container = document.getElementById('galleryPreviews');
    container.innerHTML = '';

    currentGalleryItems.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:relative;width:80px;height:60px;flex-shrink:0;';

        const img = document.createElement('img');
        img.src = item.url;
        img.style.cssText = 'width:80px;height:60px;object-fit:cover;border-radius:6px;display:block;';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.style.cssText = 'position:absolute;top:-5px;right:-5px;background:#8b1538;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;line-height:1;padding:0;';
        removeBtn.onclick = function () {
            if (item.file) {
                URL.revokeObjectURL(item.url);
            }
            currentGalleryItems = currentGalleryItems.filter(galleryItem => galleryItem.id !== item.id);
            renderGalleryPreviews();
        };

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        container.appendChild(wrapper);
    });
}

function getGalleryImageUrls() {
    return currentGalleryItems.filter(item => !item.file).map(item => item.url);
}

function getGalleryFiles() {
    return currentGalleryItems.filter(item => item.file).map(item => item.file);
}

// Save apartment (add or edit)
document.getElementById('apartmentForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const id = document.getElementById('apartmentId').value;
    const mainImage = document.getElementById('aptImage').value.trim();
    const galleryImages = getGalleryImageUrls();

    const apartmentData = {
        id: id ? parseInt(id) : undefined,
        name: document.getElementById('aptName').value,
        location: document.getElementById('aptLocation').value,
        price: parseInt(document.getElementById('aptPrice').value),
        bedrooms: parseInt(document.getElementById('aptBedrooms').value),
        bathrooms: parseInt(document.getElementById('aptBathrooms').value),
        size: parseInt(document.getElementById('aptSize').value),
        image: mainImage,
        images: [mainImage, ...galleryImages.filter(url => url !== mainImage)].filter(Boolean),
        description: document.getElementById('aptDescription').value,
        badge: document.getElementById('aptBadge').value
    };

    if (!apartmentData.image && !galleryImages.length && !getGalleryFiles().length) {
        alert('Debes indicar una imagen principal o subir al menos una imagen a la galería.');
        submitButton.disabled = false;
        return;
    }

    try {
        await window.vitalStaysApi.saveApartment(apartmentData, getGalleryFiles());
        currentGalleryItems = [];
        modal.style.display = 'none';
        await loadApartments();
    } catch (error) {
        console.error('Error al guardar apartamento:', error);
        alert(error.message || 'No se pudo guardar el apartamento.');
    } finally {
        submitButton.disabled = false;
    }
});

// Edit apartment
async function editApartment(id) {
    try {
        const apartment = await window.vitalStaysApi.getApartmentById(id);
        if (!apartment) return;

        document.getElementById('modalTitle').textContent = 'Editar Apartamento';
        document.getElementById('apartmentId').value = apartment.id;
        document.getElementById('aptName').value = apartment.name;
        document.getElementById('aptLocation').value = apartment.location;
        document.getElementById('aptPrice').value = apartment.price;
        document.getElementById('aptBedrooms').value = apartment.bedrooms;
        document.getElementById('aptBathrooms').value = apartment.bathrooms;
        document.getElementById('aptSize').value = apartment.size;
        document.getElementById('aptImage').value = apartment.image || '';
        document.getElementById('aptDescription').value = apartment.description || '';
        document.getElementById('aptBadge').value = apartment.badge || '';

        updateMainImagePreview(apartment.image || '');

        currentGalleryItems = (apartment.images || [])
            .filter(src => src && src !== apartment.image)
            .map(src => ({ id: generateId(), url: src, file: null }));
        renderGalleryPreviews();

        modal.style.display = 'flex';
    } catch (error) {
        console.error('Error al cargar apartamento para edición:', error);
        alert('No se pudo cargar el apartamento.');
    }
}

// Delete apartment
async function deleteApartment(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este apartamento?')) {
        try {
            await window.vitalStaysApi.deleteApartment(id);
            await loadApartments();
        } catch (error) {
            console.error('Error al eliminar apartamento:', error);
            alert(error.message || 'No se pudo eliminar el apartamento.');
        }
    }
}

// Initialize on page load
checkAuth();

