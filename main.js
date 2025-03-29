// Ensure the DOM is fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {
    // index.html functionality
    const designBtn = document.getElementById('designBtn');
    if (designBtn) {
        designBtn.addEventListener('click', () => {
            const authorInput = document.getElementById('author');
            const quoteInput = document.getElementById('quote');

            // Check if elements exist
            if (!authorInput || !quoteInput) {
                alert('Required input fields are missing.');
                return;
            }

            const author = authorInput.value.trim();
            const quote = quoteInput.value.trim();

            if (validateInput(author, quote)) {
                localStorage.setItem(
                    'quoteData',
                    JSON.stringify({
                        author,
                        quote,
                    })
                );
                window.location.href = 'design.html';
            }
        });
    }

    function validateInput(author, quote) {
        if (!author) {
            alert('Please enter an author name');
            return false;
        }

        if (!quote) {
            alert('Please enter a quote');
            return false;
        }

        const words = quote.split(/\s+/).filter((word) => word.length > 0);
        if (words.length > 20) {
            alert('Quote must be 20 words or less');
            return false;
        }

        return true;
    }

    // design.html functionality
    const quoteData = JSON.parse(localStorage.getItem('quoteData'));
// Select the newly added input fields
const editQuoteInput = document.getElementById('editQuote');
const editAuthorInput = document.getElementById('editAuthor');

// Ensure elements exist
if (editQuoteInput && editAuthorInput) {
    // Set initial values
    editQuoteInput.value = quoteData.quote;
    editAuthorInput.value = quoteData.author;

    // Event listeners for real-time update
    editQuoteInput.addEventListener('input', () => {
        quoteData.quote = editQuoteInput.value;
        updatePreview();
    });

    editAuthorInput.addEventListener('input', () => {
        quoteData.author = editAuthorInput.value;
        updatePreview();
    });
}

    if (!quoteData) {
        // Redirect to index.html if no data is found
        if (window.location.pathname.includes('design.html')) {
            window.location.href = 'index.html';
        }
        return;
    }

    const preview = document.getElementById('quotePreview');
    const previewContainer = document.getElementById('previewContainer');
    const controls = {
        bgColor: document.getElementById('bgColor'),
        textColor: document.getElementById('textColor'),
        fontFamily: document.getElementById('fontFamily'),
        fontSize: document.getElementById('fontSize'),
        downloadBtn: document.getElementById('downloadBtn'),
    };

    // Check if all required elements exist
    if (!preview || Object.values(controls).some((control) => !control)) {
        console.error('Required elements are missing in design.html');
        return;
    }

    // Set initial values for controls
    controls.bgColor.value = '#1a1a1a'; // Dark background
    controls.textColor.value = '#ffffff'; // White text

    // Alignment Functionality
    const alignmentButtons = document.querySelectorAll('.alignment-btn');
    let currentAlignment = 'center'; // Default alignment

    alignmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            alignmentButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get alignment value
            currentAlignment = button.dataset.align;
            
            // Update preview text alignment
            updatePreview();
        });
    });

    // Background Image Functionality
    const backgroundImageOptions = document.querySelectorAll('.background-image-option');
    const clearBackgroundBtn = document.getElementById('clearBackgroundBtn');
    let currentBackgroundImage = null;

    backgroundImageOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            backgroundImageOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Get background image source
            currentBackgroundImage = option.dataset.src;
            
            // Update preview background
            updatePreview();
        });
    });

    // Clear background button
    clearBackgroundBtn.addEventListener('click', () => {
        // Remove active class from all options
        backgroundImageOptions.forEach(opt => opt.classList.remove('active'));
        
        // Reset background image
        currentBackgroundImage = null;
        
        // Update preview
        updatePreview();
    });

    // Function to preload background image
    function preloadBackgroundImage() {
        return new Promise((resolve) => {
            if (!currentBackgroundImage) {
                resolve();
                return;
            }
            
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
                console.error('Failed to load background image:', currentBackgroundImage);
                resolve();
            };
            img.src = currentBackgroundImage;
        });
    }

    // Preview Update Function
    function updatePreview() {
        preview.innerHTML = `
            <div class="quote-text" style="text-align: ${currentAlignment}">${quoteData.quote}</div>
            <div class="author-name" style="text-align: ${currentAlignment}">- ${quoteData.author}</div>
        `;
        
        // Set background
        if (currentBackgroundImage) {
            preview.style.backgroundImage = `url('${currentBackgroundImage}')`;
            preview.style.backgroundColor = 'transparent';
            console.log('Setting background image:', currentBackgroundImage);
        } else {
            preview.style.backgroundImage = 'none';
            preview.style.backgroundColor = controls.bgColor.value || '#1a1a1a';
        }
        
        preview.style.color = controls.textColor.value || '#ffffff';
        preview.style.fontFamily = controls.fontFamily.value || 'Space Mono, monospace';
        preview.style.fontSize = `${controls.fontSize.value || 24}px`;
    }

    // Initial preview setup
    updatePreview();
    document.getElementById('alignCenter').classList.add('active');

    // Event listeners for controls
    controls.bgColor.addEventListener('input', (e) => {
        if (!currentBackgroundImage) {
            preview.style.backgroundColor = e.target.value;
        }
    });

    controls.textColor.addEventListener('input', (e) => {
        preview.style.color = e.target.value;
    });

    controls.fontFamily.addEventListener('change', (e) => {
        preview.style.fontFamily = e.target.value;
    });

    controls.fontSize.addEventListener('input', (e) => {
        preview.style.fontSize = `${e.target.value}px`;
    });

// Download functionality with simplified approach
controls.downloadBtn.addEventListener('click', () => {
    if (typeof html2canvas === 'undefined') {
        alert('html2canvas library is not loaded. Please check your internet connection and reload the page.');
        return;
    }
    
    // Save the button's original text
    const downloadText = controls.downloadBtn.innerHTML;
    // Show loading state
    controls.downloadBtn.innerHTML = '<span class="btn-gradient">Creating image...</span>';
    controls.downloadBtn.disabled = true;
    
    try {
        // Simplify the options
        html2canvas(preview, {
            backgroundColor: controls.bgColor.value || '#1a1a1a',
            scale: 1
        }).then(function(canvas) {
            try {
                
                const link = document.createElement('a');
                link.download = 'quote-design.png';
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Restore button state
                controls.downloadBtn.innerHTML = downloadText;
                controls.downloadBtn.disabled = false;
            } catch (err) {
                console.error('Error in download stage:', err);
                alert('Error creating download. Try again with a simpler design.');
                controls.downloadBtn.innerHTML = downloadText;
                controls.downloadBtn.disabled = false;
            }
        }).catch(function(err) {
            console.error('Error in canvas stage:', err);
            alert('Could not generate image. Please try a different browser.');
            controls.downloadBtn.innerHTML = downloadText;
            controls.downloadBtn.disabled = false;
        });
    } catch (err) {
        console.error('Error initiating html2canvas:', err);
        alert('Could not start image generation process.');
        controls.downloadBtn.innerHTML = downloadText;
        controls.downloadBtn.disabled = false;
    }
});
});