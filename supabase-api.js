(function () {
    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop';
    const DEFAULT_APARTMENTS = [
        { id: 1, name: 'Apartamento Moderno en el Centro', price: 1200, city: 'Madrid', location: 'Madrid, España', neighborhood: 'Centro', bedrooms: 2, bathrooms: 2, size: 85, image: 'images/apartment1.jpg', images: ['images/apartment1.jpg', 'images/apartment1-1.jpg', 'images/apartment1-2.jpg'], rating: 5.0, reviews: 24, type: 'Apartamento', badge: 'Destacado', description: 'Apartamento moderno y luminoso, ideal para profesionales de la salud.' },
        { id: 2, name: 'Apartamento Espacioso con Vista', price: 1500, city: 'Barcelona', location: 'Barcelona, España', neighborhood: 'Eixample', bedrooms: 3, bathrooms: 2, size: 120, image: 'images/apartment2.jpg', images: ['images/apartment2.jpg', 'images/apartment2-1.jpg', 'images/apartment2-2.jpg'], rating: 4.5, reviews: 18, type: 'Apartamento', badge: 'Nuevo', description: 'Espacioso apartamento con excelente ubicación y mucha luz natural.' },
        { id: 3, name: 'Apartamento Céntrico y Acogedor', price: 1000, city: 'Valencia', location: 'Valencia, España', neighborhood: 'Ruzafa', bedrooms: 1, bathrooms: 1, size: 60, image: 'images/apartment3.jpg', images: ['images/apartment3.jpg', 'images/apartment3-1.jpg', 'images/apartment3-2.jpg'], rating: 4.0, reviews: 12, type: 'Apartamento', badge: '', description: 'Perfecto para estancias cómodas con acceso rápido a zonas clave.' },
        { id: 4, name: 'Loft Moderno en Malasaña', price: 1800, city: 'Madrid', location: 'Madrid, España', neighborhood: 'Malasaña', bedrooms: 2, bathrooms: 2, size: 95, image: 'images/apartment4.jpg', images: ['images/apartment4.jpg'], rating: 4.8, reviews: 32, type: 'Loft', badge: '', description: 'Loft moderno con acabados premium y excelente conectividad.' },
        { id: 5, name: 'Dúplex Acogedor', price: 900, city: 'Sevilla', location: 'Sevilla, España', neighborhood: 'Triana', bedrooms: 2, bathrooms: 1, size: 75, image: 'images/apartment5.jpg', images: ['images/apartment5.jpg'], rating: 4.3, reviews: 15, type: 'Dúplex', badge: '', description: 'Dúplex funcional y acogedor, ideal para una estancia prolongada.' },
        { id: 6, name: 'Penthouse con Vistas al Mar', price: 2200, city: 'Barcelona', location: 'Barcelona, España', neighborhood: 'Barceloneta', bedrooms: 3, bathrooms: 3, size: 150, image: 'images/apartment6.jpg', images: ['images/apartment6.jpg'], rating: 4.9, reviews: 45, type: 'Penthouse', badge: '', description: 'Penthouse exclusivo con vistas al mar y grandes espacios.' },
        { id: 7, name: 'Estudio Minimalista', price: 750, city: 'Madrid', location: 'Madrid, España', neighborhood: 'Lavapiés', bedrooms: 1, bathrooms: 1, size: 45, image: 'images/apartment7.jpg', images: ['images/apartment7.jpg'], rating: 4.2, reviews: 8, type: 'Estudio', badge: '', description: 'Estudio minimalista y práctico en zona céntrica.' },
        { id: 8, name: 'Casa con Jardín', price: 2500, city: 'Valencia', location: 'Valencia, España', neighborhood: 'Campanar', bedrooms: 4, bathrooms: 3, size: 200, image: 'images/apartment8.jpg', images: ['images/apartment8.jpg'], rating: 4.7, reviews: 28, type: 'Casa', badge: '', description: 'Casa amplia con jardín privado y espacios familiares.' },
        { id: 9, name: 'Apartamento Cerca del Hospital', price: 1100, city: 'Madrid', location: 'Madrid, España', neighborhood: 'Chamberí', bedrooms: 2, bathrooms: 1, size: 70, image: 'images/apartment9.jpg', images: ['images/apartment9.jpg'], rating: 4.6, reviews: 21, type: 'Apartamento', badge: '', description: 'Ubicación estratégica para profesionales que trabajan en hospitales cercanos.' },
        { id: 10, name: 'Apartamento Luminoso', price: 1350, city: 'Barcelona', location: 'Barcelona, España', neighborhood: 'Gràcia', bedrooms: 2, bathrooms: 1, size: 75, image: 'images/apartment10.jpg', images: ['images/apartment10.jpg'], rating: 4.4, reviews: 19, type: 'Apartamento', badge: '', description: 'Apartamento luminoso con distribución funcional y ambiente tranquilo.' }
    ];

    let supabaseClient = null;
    let clientPromise = null;

    function unique(list) {
        return [...new Set((list || []).filter(Boolean))];
    }

    function getConfig() {
        return window.__SUPABASE_CONFIG__ || {};
    }

    function isConfigured() {
        const config = getConfig();
        return Boolean(config.supabaseUrl && config.supabaseAnonKey);
    }

    function deriveLocation(location) {
        const parts = String(location || '').split(',').map(part => part.trim()).filter(Boolean);
        const last = parts[parts.length - 1] || '';
        const city = last.toLowerCase() === 'españa' && parts.length > 1 ? parts[parts.length - 2] : last;
        return {
            city,
            neighborhood: parts.length > 1 ? parts[0] : ''
        };
    }

    function normalizeApartment(apartment) {
        const locationData = deriveLocation(apartment.location);
        const images = Array.isArray(apartment.images) ? apartment.images.filter(Boolean) : [];
        const mainImage = apartment.image || images[0] || FALLBACK_IMAGE;
        return {
            id: apartment.id,
            name: apartment.name || '',
            price: Number(apartment.price || 0),
            city: apartment.city || locationData.city,
            location: apartment.location || '',
            neighborhood: apartment.neighborhood || locationData.neighborhood,
            bedrooms: Number(apartment.bedrooms || 0),
            bathrooms: Number(apartment.bathrooms || 0),
            size: Number(apartment.size || 0),
            image: mainImage,
            images: unique([mainImage, ...images]),
            rating: apartment.rating === null || apartment.rating === undefined ? null : Number(apartment.rating),
            reviews: apartment.reviews === null || apartment.reviews === undefined ? null : Number(apartment.reviews),
            type: apartment.type || 'Apartamento',
            badge: apartment.badge || '',
            description: apartment.description || ''
        };
    }

    async function getClient() {
        if (supabaseClient) return supabaseClient;
        if (clientPromise) return clientPromise;

        clientPromise = new Promise((resolve, reject) => {
            try {
                if (!window.supabase || !window.supabase.createClient) {
                    throw new Error('La librería de Supabase no está cargada.');
                }

                const config = getConfig();
                if (!config.supabaseUrl || !config.supabaseAnonKey) {
                    throw new Error('Falta la configuración pública de Supabase.');
                }

                supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                });

                resolve(supabaseClient);
            } catch (error) {
                clientPromise = null;
                reject(error);
            }
        });

        return clientPromise;
    }

    async function listApartments(options = {}) {
        const limit = options.limit || null;
        if (!isConfigured()) {
            return DEFAULT_APARTMENTS.slice(0, limit || DEFAULT_APARTMENTS.length).map(normalizeApartment);
        }

        const client = await getClient();
        let query = client.from('apartments').select('*').order('id', { ascending: true });
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(normalizeApartment);
    }

    async function getApartmentById(id) {
        if (!id) return null;

        if (!isConfigured()) {
            const apartment = DEFAULT_APARTMENTS.find(item => String(item.id) === String(id));
            return apartment ? normalizeApartment(apartment) : null;
        }

        const client = await getClient();
        const { data, error } = await client.from('apartments').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return data ? normalizeApartment(data) : null;
    }

    async function getSession() {
        if (!isConfigured()) return null;
        const client = await getClient();
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        return data.session || null;
    }

    async function getCurrentUser() {
        if (!isConfigured()) return null;
        const client = await getClient();
        const { data, error } = await client.auth.getUser();
        if (error) throw error;
        return data.user || null;
    }

    async function isAdminUser(userId) {
        if (!userId || !isConfigured()) return false;
        const client = await getClient();
        const { data, error } = await client.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return Boolean(data);
    }

    async function isCurrentUserAdmin() {
        const user = await getCurrentUser();
        return isAdminUser(user && user.id);
    }

    async function requireAdminSession() {
        const user = await getCurrentUser();
        if (!user) throw new Error('Debes iniciar sesión como administrador.');
        const isAdmin = await isAdminUser(user.id);
        if (!isAdmin) throw new Error('Este usuario no tiene permisos de administrador.');
        return user;
    }

    async function signInAdmin(email, password) {
        if (!isConfigured()) throw new Error('Configura Supabase antes de usar el panel admin.');
        const client = await getClient();
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const user = data.user || null;
        if (!(await isAdminUser(user && user.id))) {
            await client.auth.signOut();
            throw new Error('El usuario existe pero no está registrado en la tabla de administradores.');
        }
        return user;
    }

    async function signOutAdmin() {
        if (!isConfigured()) return;
        const client = await getClient();
        await client.auth.signOut();
    }

    async function uploadApartmentImages(files) {
        const cleanFiles = (files || []).filter(Boolean);
        if (!cleanFiles.length) return [];

        await requireAdminSession();
        const client = await getClient();
        const config = getConfig();
        const bucket = config.supabaseBucket || 'apartment-images';
        const urls = [];

        for (const file of cleanFiles) {
            const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
            const path = `apartments/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
            const { error } = await client.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
            if (error) throw error;
            const { data } = client.storage.from(bucket).getPublicUrl(path);
            urls.push(data.publicUrl);
        }

        return urls;
    }

    async function saveApartment(apartmentInput, newGalleryFiles) {
        await requireAdminSession();
        const client = await getClient();
        const uploadedUrls = await uploadApartmentImages(newGalleryFiles);
        const existingImages = Array.isArray(apartmentInput.images) ? apartmentInput.images.filter(Boolean) : [];
        const provisionalMain = apartmentInput.image || existingImages[0] || uploadedUrls[0] || '';
        const normalized = normalizeApartment({
            ...apartmentInput,
            image: provisionalMain,
            images: unique([provisionalMain, ...existingImages, ...uploadedUrls])
        });

        const payload = {
            name: normalized.name,
            location: normalized.location,
            city: normalized.city,
            neighborhood: normalized.neighborhood,
            price: normalized.price,
            bedrooms: normalized.bedrooms,
            bathrooms: normalized.bathrooms,
            size: normalized.size,
            image: normalized.image,
            images: normalized.images,
            description: normalized.description,
            badge: normalized.badge || '',
            type: normalized.type || 'Apartamento',
            rating: normalized.rating,
            reviews: normalized.reviews
        };

        const response = normalized.id
            ? await client.from('apartments').update(payload).eq('id', normalized.id).select().single()
            : await client.from('apartments').insert(payload).select().single();

        if (response.error) throw response.error;
        return normalizeApartment(response.data);
    }

    async function deleteApartment(id) {
        await requireAdminSession();
        const client = await getClient();
        const { error } = await client.from('apartments').delete().eq('id', id);
        if (error) throw error;
    }

    async function submitRentalInquiry(formData) {
        if (!isConfigured()) throw new Error('Configura Supabase para guardar solicitudes.');
        const client = await getClient();
        const payload = {
            apartment_id: formData.apartmentId ? Number(formData.apartmentId) : null,
            apartment_name: formData.apartmentName || '',
            apartment_area: formData.apartmentArea || '',
            full_name: formData.fullName || '',
            email: formData.email || '',
            phone: formData.phone || '',
            dni: formData.dni || '',
            birth_date: formData.birthDate || null,
            nationality: formData.nationality || '',
            move_in_date: formData.moveInDate || null,
            rental_period: formData.rentalPeriod || '',
            occupation: formData.occupation || '',
            workplace: formData.workplace || '',
            monthly_income: formData.monthlyIncome ? Number(formData.monthlyIncome) : null,
            employment_type: formData.employmentType || '',
            num_occupants: formData.numOccupants ? Number(formData.numOccupants) : null,
            has_pets: formData.hasPets === 'si',
            pets_details: formData.petsDetails || null,
            emergency_contact: formData.emergencyContact || '',
            reference_notes: formData.references || null,
            additional_comments: formData.additionalComments || null
        };

        const { data, error } = await client.from('rental_inquiries').insert(payload).select('id').single();
        if (error) throw error;
        return data;
    }

    window.vitalStaysApi = {
        fallbackImage: FALLBACK_IMAGE,
        defaultApartments: DEFAULT_APARTMENTS.map(normalizeApartment),
        isConfigured,
        getClient,
        listApartments,
        getApartmentById,
        getSession,
        getCurrentUser,
        isCurrentUserAdmin,
        requireAdminSession,
        signInAdmin,
        signOutAdmin,
        saveApartment,
        deleteApartment,
        submitRentalInquiry
    };
})();
