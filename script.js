// JavaScript for Apartment Rental Website

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }
});

// Function to filter apartments on listings page
function filterApartments() {
    // Check if we're on the listings page with dynamic data
    if (typeof apartmentsData !== 'undefined') {
        // Use the listings.js filter function
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const priceFilter = document.getElementById('price-filter').value;

        const filtered = apartmentsData.filter(apartment => {
            let show = true;

            // Filter by search term (name or location)
            if (searchTerm) {
                const name = apartment.name ? apartment.name.toLowerCase() : '';
                const location = apartment.location ? apartment.location.toLowerCase() : '';
                if (!name.includes(searchTerm) && !location.includes(searchTerm)) {
                    show = false;
                }
            }

            // Filter by price
            if (priceFilter && show) {
                const maxPrice = parseInt(priceFilter);
                if (apartment.price > maxPrice) {
                    show = false;
                }
            }

            return show;
        });

        // Re-render the apartments with filtered data
        renderApartments(filtered);
    } else {
        // Fallback for static HTML cards
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const priceFilter = document.getElementById('price-filter').value;
        const apartments = document.querySelectorAll('.apartment-card');

        apartments.forEach(apartment => {
            const title = apartment.querySelector('h3').textContent.toLowerCase();
            const price = parseInt(apartment.dataset.price);

            let showApartment = true;

            if (searchTerm && !title.includes(searchTerm)) {
                showApartment = false;
            }

            if (priceFilter) {
                const maxPrice = parseInt(priceFilter);
                if (price > maxPrice) {
                    showApartment = false;
                }
            }

            apartment.style.display = showApartment ? 'block' : 'none';
        });
    }
}

// Function to clear all filters
function clearFilters() {
    document.getElementById('search').value = '';
    document.getElementById('price-filter').value = '';

    // Check if we're on the listings page with dynamic data
    if (typeof renderApartments !== 'undefined') {
        // Re-render all apartments
        renderApartments(apartmentsData);
    } else {
        // Fallback for static HTML cards
        filterApartments();
    }
}

// Add event listener for clear filters button
document.addEventListener('DOMContentLoaded', function () {
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
});

// Function to change main image on apartment detail page
function changeImage(src) {
    document.getElementById('main-image').src = src;
}

// Function to contact owner - redirects to contact form with apartment info
function contactOwner() {
    const apartmentTitle = document.getElementById('apartment-title').textContent;
    const apartmentLocation = document.getElementById('apartment-location').textContent
        .replace('Ubicación: ', '')
        .replace(/^📍\s*/, '');
    const apartmentId = getUrlParameter('id');

    // Redirect to contact page with apartment information
    window.location.href = `contacto.html?id=${apartmentId}&name=${encodeURIComponent(apartmentTitle)}&area=${encodeURIComponent(apartmentLocation)}`;
}

// Function to get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildRatingMarkup(apartment) {
    if (!apartment.rating) return '';
    return `<div class="card-rating"><div class="stars">${'<span class="star filled">★</span>'.repeat(Math.floor(apartment.rating))}${apartment.rating % 1 >= 0.5 ? '<span class="star half">★</span>' : ''}${'<span class="star">★</span>'.repeat(5 - Math.ceil(apartment.rating))}</div><span class="rating-text">${apartment.rating.toFixed(1)}${apartment.reviews ? ` (${apartment.reviews} reseñas)` : ''}</span></div>`;
}

async function loadFeaturedApartments() {
    const container = document.getElementById('featured-list');
    if (!container || !window.vitalStaysApi) return;

    try {
        const apartments = await window.vitalStaysApi.listApartments({ limit: 3 });
        const fallbackImg = window.vitalStaysApi.fallbackImage;

        container.innerHTML = apartments.map(apt => {
            const badgeHTML = apt.badge ? `<div class="card-badge${apt.badge === 'Nuevo' ? ' new' : ''}">${apt.badge}</div>` : '';
            return `
                <div class="apartment-card">
                    ${badgeHTML}
                    <img src="${escapeHtml(apt.image || '')}" alt="${escapeHtml(apt.name)}" onerror="this.src='${fallbackImg}'">
                    <div class="card-content">
                        <div class="card-header">
                            <h3>${escapeHtml(apt.name)}</h3>
                            <div class="card-location">📍 ${escapeHtml(apt.location)}</div>
                            ${buildRatingMarkup(apt)}
                        </div>
                        <div class="card-features">
                            <span>🛏️ ${apt.bedrooms} Habitación${apt.bedrooms !== 1 ? 'es' : ''}</span>
                            <span>🚿 ${apt.bathrooms} Baño${apt.bathrooms !== 1 ? 's' : ''}</span>
                            <span>📐 ${apt.size} m²</span>
                        </div>
                        <div class="card-footer">
                            <div class="price">$${apt.price.toLocaleString()}<span>/mes</span></div>
                            <a href="apartment-detail.html?id=${encodeURIComponent(apt.id)}" class="btn btn-small">Ver Detalles</a>
                        </div>
                    </div>
                </div>`;
        }).join('');
    } catch (error) {
        console.error('Error al cargar destacados:', error);
    }
}

function bindThumbnailClickHandlers() {
    const thumbnails = document.querySelectorAll('.thumbnail-images img');
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.onclick = function () {
            currentSlide(index + 1);
        };
    });
}

function updateMetaTag(selector, content) {
    const tag = document.querySelector(selector);
    if (tag && content) {
        tag.setAttribute('content', content);
    }
}

// Function to load apartment detail data from Supabase
async function loadApartmentImages() {
    const apartmentId = getUrlParameter('id');
    if (!apartmentId) return;

    const fallback = window.vitalStaysApi ? window.vitalStaysApi.fallbackImage : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop';
    const apartment = window.vitalStaysApi ? await window.vitalStaysApi.getApartmentById(apartmentId) : null;

    if (!apartment) return;

    document.title = `${apartment.name || 'Apartamento'} - Vital Stays`;
    updateMetaTag('meta[property="og:title"]', document.title);
    updateMetaTag('meta[name="twitter:title"]', document.title);
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
        const summary = apartment.description || `Apartamento en ${apartment.location || 'ubicación premium'} con galería de imágenes y detalles completos.`;
        descriptionTag.setAttribute('content', summary.slice(0, 155));
        updateMetaTag('meta[property="og:description"]', summary.slice(0, 155));
        updateMetaTag('meta[name="twitter:description"]', summary.slice(0, 155));
    }

    // Populate text fields
    const titleEl = document.getElementById('apartment-title');
    const priceEl = document.getElementById('apartment-price');
    const locationEl = document.getElementById('apartment-location');
    const descriptionEl = document.getElementById('apartment-description');
    const featuresEl = document.getElementById('apartment-features');

    if (titleEl) titleEl.textContent = apartment.name || '';
    if (priceEl) priceEl.textContent = `$${(apartment.price || 0).toLocaleString()}/mes`;
    if (locationEl) locationEl.textContent = `\uD83D\uDCCD ${apartment.location || ''}`;
    if (descriptionEl) descriptionEl.textContent = apartment.description || 'Sin descripci\u00f3n disponible.';
    if (featuresEl) {
        featuresEl.innerHTML = `
            <li>\uD83D\uDECF\uFE0F ${apartment.bedrooms} Habitaci\u00f3n${apartment.bedrooms !== 1 ? 'es' : ''}</li>
            <li>\uD83D\uDEBF ${apartment.bathrooms} Ba\u00f1o${apartment.bathrooms !== 1 ? 's' : ''}</li>
            <li>\uD83D\uDCD0 ${apartment.size} m\u00b2</li>
        `;
    }

    // Build image list: use images[] if available, else single image field
    const imageList = (apartment.images && apartment.images.length > 0)
        ? apartment.images
        : (apartment.image ? [apartment.image] : [fallback]);

    updateMetaTag('meta[property="og:image"]', imageList[0]);
    updateMetaTag('meta[name="twitter:image"]', imageList[0]);

    // Set main image
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = imageList[0];
        mainImage.onerror = function () { this.src = fallback; };
    }

    // Build thumbnails dynamically
    const thumbnailContainer = document.querySelector('.thumbnail-images');
    if (thumbnailContainer) {
        thumbnailContainer.innerHTML = imageList.map((img, i) =>
            `<img src="${img}" alt="Imagen ${i + 1}" onerror="this.src='${fallback}'">`
        ).join('');
    }

    // Build dots dynamically
    const dotsContainer = document.querySelector('.dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = imageList.map((_, i) =>
            `<span class="dot" onclick="currentSlide(${i + 1})"></span>`
        ).join('');
    }

    slideIndex = 1;
    bindThumbnailClickHandlers();
}

// Slideshow variables
let slideIndex = 1;
let slideTimer = null;

// Function to show slides
function showSlides(n) {
    let i;
    const slides = document.querySelectorAll('.thumbnail-images img');
    const dots = document.querySelectorAll('.dot');

    if (!slides || slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    for (i = 0; i < slides.length; i++) {
        slides[i].className = slides[i].className.replace(" active", "");
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex - 1].className += " active";
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].className += " active";
    }

    // Update main image to match current slide
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = slides[slideIndex - 1].src;
    }
}

// Function to auto-advance slides
function autoSlides() {
    const slides = document.querySelectorAll('.thumbnail-images img');
    if (!slides || slides.length === 0) return;

    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }
    showSlides(slideIndex);

    // Continue auto-play every 3 seconds
    slideTimer = setTimeout(autoSlides, 3000);
}

// Function to change slide (manual control)
function changeSlide(n) {
    // Clear auto-play timer when manually changing
    if (slideTimer) {
        clearTimeout(slideTimer);
    }
    showSlides(slideIndex += n);
    // Restart auto-play
    slideTimer = setTimeout(autoSlides, 3000);
}

// Function to set current slide
function currentSlide(n) {
    // Clear auto-play timer when manually selecting
    if (slideTimer) {
        clearTimeout(slideTimer);
    }
    showSlides(slideIndex = n);
    // Restart auto-play
    slideTimer = setTimeout(autoSlides, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function () {
    // Add event listeners for filters if on listings page
    const searchInput = document.getElementById('search');
    const priceFilter = document.getElementById('price-filter');

    if (searchInput && priceFilter) {
        searchInput.addEventListener('input', filterApartments);
        priceFilter.addEventListener('change', filterApartments);
    }

    // Load apartment images if on detail page
    if (document.getElementById('main-image')) {
        await loadApartmentImages();
        setTimeout(() => {
            showSlides(slideIndex);
            slideTimer = setTimeout(autoSlides, 3000);
        }, 100);
    }

    await loadFeaturedApartments();

    // Add event listener for user menu button
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openAuthModal();
        });
    }

    // Close modal when clicking outside
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.addEventListener('click', function (e) {
            if (e.target === authModal) {
                closeAuthModal();
            }
        });
    }
});

// ===== SEARCH FUNCTIONALITY =====

// Search from hero section
function searchFromHero() {
    const location = document.getElementById('heroLocationSearch').value;
    const price = document.getElementById('heroPriceSearch').value;

    // Build query string
    let queryParams = [];
    if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
    if (price) queryParams.push(`maxPrice=${price}`);

    // Redirect to listings page with search parameters
    const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
    window.location.href = `listings.html${queryString}`;
}

// ===== AUTHENTICATION MODAL FUNCTIONS =====

// Open authentication modal
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        showLoginForm(); // Show login form by default
    }
}

// Close authentication modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show login form
function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
}

// Show register form
function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Simple validation
    if (!email || !password) {
        alert('Por favor, completa todos los campos');
        return;
    }

    // Store user session (in a real app, this would be handled by a backend)
    const user = {
        email: email,
        loginDate: new Date().toISOString()
    };

    if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        sessionStorage.setItem('user', JSON.stringify(user));
    }

    // Close modal and show success message
    closeAuthModal();
    alert('¡Inicio de sesión exitoso! Bienvenido de vuelta.');

    // Update UI to show logged in state
    updateUserUI(email);
}

// Handle register form submission
function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPasswordConfirm').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, completa todos los campos');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (!acceptTerms) {
        alert('Debes aceptar los términos y condiciones');
        return;
    }

    // Store user data (in a real app, this would be handled by a backend)
    const user = {
        name: name,
        email: email,
        registerDate: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(user));

    // Close modal and show success message
    closeAuthModal();
    alert('¡Registro exitoso! Bienvenido a RentaApartamentos.');

    // Update UI to show logged in state
    updateUserUI(email);
}

// Update UI to show logged in user
function updateUserUI(email) {
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        const userName = email.split('@')[0];
        userMenuBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>${userName}</span>
        `;
    }
}

// Social login functions (placeholders for future implementation)
function loginWithGoogle() {
    alert('Inicio de sesión con Google próximamente disponible.\n\nEsta funcionalidad requiere integración con Google OAuth.');
}

function loginWithFacebook() {
    alert('Inicio de sesión con Facebook próximamente disponible.\n\nEsta funcionalidad requiere integración con Facebook Login.');
}

function loginWithApple() {
    alert('Inicio de sesión con Apple próximamente disponible.\n\nEsta funcionalidad requiere integración con Sign in with Apple.');
}
