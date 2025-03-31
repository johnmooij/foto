document.addEventListener('DOMContentLoaded', function() {
    // Get the current page category from the HTML filename
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    // Remove loading message
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Fetch the gallery data
    fetch('gallery-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if we have data for this category
            if (data[currentPage] && data[currentPage].length > 0) {
                // Add each image to the gallery
                data[currentPage].forEach((imagePath, index) => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    galleryItem.setAttribute('data-index', index);
                    
                    const img = document.createElement('img');
                    img.src = imagePath;
                    img.alt = `${currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} foto ${index + 1}`;
                    
                    // Handle image loading errors
                    img.onerror = function() {
                        this.onerror = null;
                        this.src = 'assets/images/placeholder.jpg'; // Fallback image
                        console.error(`Failed to load image: ${imagePath}`);
                    };
                    
                    galleryItem.appendChild(img);
                    galleryGrid.appendChild(galleryItem);
                });
                
                // Set up the lightbox after images are loaded
                setupLightbox();
            } else {
                // No images found for this category
                galleryGrid.innerHTML = `<p class="no-images">Geen afbeeldingen gevonden voor ${currentPage}.</p>`;
            }
        })
        .catch(error => {
            console.error('Error loading gallery data:', error);
            galleryGrid.innerHTML = `<p class="error-message">Er is een fout opgetreden bij het laden van de afbeeldingen: ${error.message}</p>`;
        });
    
    function setupLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.close');
        const prevBtn = document.querySelector('.prev');
        const nextBtn = document.querySelector('.next');
        
        let currentIndex = 0;
        const images = Array.from(galleryItems).map(item => {
            return {
                src: item.querySelector('img').src,
                alt: item.querySelector('img').alt
            };
        });
        
        // Open lightbox when clicking on a gallery item
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', function() {
                currentIndex = index;
                openLightbox(images[currentIndex].src, images[currentIndex].alt);
            });
        });
        
        // Close lightbox
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Navigate through images
        prevBtn.addEventListener('click', showPrevImage);
        nextBtn.addEventListener('click', showNextImage);
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.style.display || lightbox.style.display === 'none') return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        });
        
        function openLightbox(src, alt) {
            lightboxImg.src = src;
            lightboxImg.alt = alt;
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        }
        
        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
        
        function showPrevImage() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt;
        }
        
        function showNextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt;
        }
    }
});