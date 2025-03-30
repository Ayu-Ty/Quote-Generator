document.addEventListener('DOMContentLoaded', () => {
    const MAX_WORDS = 20;
    let history = []; // For undo/redo
    let historyIndex = -1;

    // --- Helper Functions ---
    function countWords(str) {
        return str.trim().split(/\s+/).filter(Boolean).length;
    }

    function updateWordCount(textArea, displayElement) {
        const words = countWords(textArea.value);
        displayElement.textContent = `${words} / ${MAX_WORDS} words`;
        displayElement.style.color = words > MAX_WORDS ? '#ff6666' : '#aaa'; 
        return words <= MAX_WORDS;
    }

    function saveState() {
        const quotePreview = document.getElementById('quotePreview');
        if (!quotePreview) return null;
        const currentState = {
            quote: quoteData.quote,
            author: quoteData.author,
            bgColor: controls.bgColor?.value,
            textColor: controls.textColor?.value,
            fontFamily: controls.fontFamily?.value,
            fontSize: controls.fontSize?.value,
            alignment: currentAlignment,
            backgroundImage: currentBackgroundImage,
            bgImageStyle: quotePreview.style.backgroundImage,
            aspectRatio: document.querySelector('input[name="aspectRatio"]:checked')?.value,
            isBold: quotePreview.querySelector('.quote-text')?.classList.contains('bold'),
            isItalic: quotePreview.querySelector('.quote-text')?.classList.contains('italic')
        };
        return currentState;
    }

    function pushHistory(state) {
         if (historyIndex < history.length - 1) {
            // If we undo and then make a new change, discard the 'redo' future
            history = history.slice(0, historyIndex + 1);
        }
        history.push(state);
        historyIndex = history.length - 1;
        updateHistoryButtons();
    }

     function restoreState(state) {
        if (!state) return;

        // Update quoteData and input fields
        quoteData.quote = state.quote;
        quoteData.author = state.author;
        if (editQuoteInput) editQuoteInput.value = state.quote;
        if (editAuthorInput) editAuthorInput.value = state.author;
        if(editWordCountEl) updateWordCount(editQuoteInput, editWordCountEl); // Update word count for restored text

        // Update controls
        if (controls.bgColor) controls.bgColor.value = state.bgColor;
        if (controls.textColor) controls.textColor.value = state.textColor;
        if (controls.fontFamily) controls.fontFamily.value = state.fontFamily;
        if (controls.fontSize) {
            controls.fontSize.value = state.fontSize;
            if(fontSizeValueEl) fontSizeValueEl.textContent = state.fontSize; // Update slider display
        }

        // Update alignment
        currentAlignment = state.alignment;
        alignmentButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.align === currentAlignment);
        });

        // Update background
        currentBackgroundImage = state.backgroundImage;
        backgroundImageOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.src === currentBackgroundImage);
        });
        if (clearBackgroundBtn) clearBackgroundBtn.disabled = !currentBackgroundImage; // Enable/disable clear button

        // Update aspect ratio
         const aspectRatioInput = document.querySelector(`input[name="aspectRatio"][value="${state.aspectRatio}"]`);
         if (aspectRatioInput) aspectRatioInput.checked = true;

         // Update text format buttons
        if (boldBtn) boldBtn.classList.toggle('active', state.isBold);
        if (italicBtn) italicBtn.classList.toggle('active', state.isItalic);


        // Update preview (this function uses the global vars like currentAlignment etc.)
        updatePreview();
        // Explicitly set bg image style restored from state
         if(document.getElementById('quotePreview')) {
             document.getElementById('quotePreview').style.backgroundImage = state.bgImageStyle || 'none';
         }
    }

    function updateHistoryButtons() {
         if (undoBtn) undoBtn.disabled = historyIndex <= 0;
         if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Debounced version of saveStateAndPushHistory for frequent updates
    const debouncedSave = debounce(() => {
        const state = saveState();
         if(state) pushHistory(state);
    }, 500); // Save state 500ms after the last change


    // --- index.html Functionality ---
    const indexForm = document.querySelector('.container .card'); // More specific selector
    if (indexForm && window.location.pathname.includes('index.html')) {
        const authorInput = document.getElementById('author');
        const quoteInput = document.getElementById('quote');
        const designBtn = document.getElementById('designBtn');
        const wordCountEl = document.getElementById('wordCount');

        if (authorInput && quoteInput && designBtn && wordCountEl) {
            // Live word count validation
            quoteInput.addEventListener('input', () => {
                updateWordCount(quoteInput, wordCountEl);
            });

            designBtn.addEventListener('click', () => {
                const author = authorInput.value.trim();
                const quote = quoteInput.value.trim();

                if (!author) {
                    alert('Please enter an author name.');
                    authorInput.focus();
                    return;
                }
                if (!quote) {
                    alert('Please enter a quote.');
                    quoteInput.focus();
                    return;
                }
                if (!updateWordCount(quoteInput, wordCountEl)) {
                     alert(`Quote must be ${MAX_WORDS} words or less.`);
                     quoteInput.focus();
                     return;
                }

                // Save to localStorage and navigate
                localStorage.setItem('quoteData', JSON.stringify({ author, quote }));
                window.location.href = 'design.html';
            });
             // Initial word count check in case of back navigation
            updateWordCount(quoteInput, wordCountEl);
        }
    }

    // --- design.html Functionality ---
    const designContainer = document.querySelector('.design-container');
    if (designContainer) {
        let quoteData = JSON.parse(localStorage.getItem('quoteData'));

        // Redirect if no data (e.g., direct access to design.html)
        if (!quoteData) {
            alert("No quote data found. Redirecting to the start page.");
            window.location.href = 'index.html';
            return; // Stop script execution for this page
        }

        // DOM Elements
        const preview = document.getElementById('quotePreview');
        const previewContainer = document.getElementById('previewContainer');
        const aspectRatioWrapper = document.getElementById('aspectRatioWrapper');
        const editQuoteInput = document.getElementById('editQuote');
        const editAuthorInput = document.getElementById('editAuthor');
        const editWordCountEl = document.getElementById('editWordCount');
        const fontSizeValueEl = document.getElementById('fontSizeValue');
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');


        const controls = {
            bgColor: document.getElementById('bgColor'),
            textColor: document.getElementById('textColor'),
            fontFamily: document.getElementById('fontFamily'),
            fontSize: document.getElementById('fontSize'),
            downloadBtn: document.getElementById('downloadBtn'),
            bgImageUpload: document.getElementById('bgImageUpload'),
            clearBackgroundBtn: document.getElementById('clearBackgroundBtn'),
        };

        const alignmentButtons = document.querySelectorAll('.alignment-btn');
        const backgroundImageOptions = document.querySelectorAll('.background-image-option');
        const aspectRatioRadios = document.querySelectorAll('input[name="aspectRatio"]');

        // State Variables
        let currentAlignment = 'center';
        let currentBackgroundImage = null; // URL of the selected preset/uploaded image
        let uploadedBgObjectURL = null; // For revoking uploaded image URLs

        // Initial Setup
        function initializeDesignPage() {
            if (editQuoteInput) {
                 editQuoteInput.value = quoteData.quote;
                 updateWordCount(editQuoteInput, editWordCountEl); // Initial count
            }
            if (editAuthorInput) editAuthorInput.value = quoteData.author;
            if (controls.fontSize && fontSizeValueEl) fontSizeValueEl.textContent = controls.fontSize.value;

            // Set initial preview & save initial state
             updatePreview();
             const initialState = saveState();
             if(initialState) pushHistory(initialState); // Save initial state
             updateHistoryButtons();
        }


        // Update Preview Function
        function updatePreview() {
            if (!preview || !quoteData) return;

            const quoteText = quoteData.quote || "";
            const authorText = quoteData.author ? `- ${quoteData.author}` : "";

            const quoteTextEl = preview.querySelector('.quote-text') || document.createElement('div');
            quoteTextEl.className = 'quote-text';
            quoteTextEl.textContent = quoteText;
            quoteTextEl.style.textAlign = currentAlignment;
            quoteTextEl.classList.toggle('bold', boldBtn?.classList.contains('active'));
            quoteTextEl.classList.toggle('italic', italicBtn?.classList.contains('italic'));


            const authorNameEl = preview.querySelector('.author-name') || document.createElement('div');
            authorNameEl.className = 'author-name';
            authorNameEl.textContent = authorText;
            authorNameEl.style.textAlign = currentAlignment;
             // Optionally apply bold/italic to author too if needed, currently only applies to quote
             // authorNameEl.classList.toggle('bold', boldBtn?.classList.contains('active'));
            // authorNameEl.classList.toggle('italic', italicBtn?.classList.contains('italic'));


            // Clear preview and append updated elements
            preview.innerHTML = '';
            preview.appendChild(quoteTextEl);
            preview.appendChild(authorNameEl);


            // Apply Styles
             preview.style.color = controls.textColor?.value || '#ffffff';
             preview.style.fontFamily = controls.fontFamily?.value || "'Space Mono', monospace";
             preview.style.fontSize = `${controls.fontSize?.value || 24}px`;

            // Background Handling
            if (currentBackgroundImage) {
                preview.style.backgroundImage = `url('${currentBackgroundImage}')`;
                preview.style.backgroundColor = 'transparent'; // Ensure background color doesn't interfere
                 if(controls.bgColor) controls.bgColor.disabled = true; // Disable color picker when image is set
            } else {
                preview.style.backgroundImage = 'none';
                preview.style.backgroundColor = controls.bgColor?.value || '#1a1a1a';
                 if(controls.bgColor) controls.bgColor.disabled = false;
            }

             // Aspect Ratio
            const selectedRatio = document.querySelector('input[name="aspectRatio"]:checked')?.value || 'free';
            if (aspectRatioWrapper) aspectRatioWrapper.className = `aspect-ratio-${selectedRatio}`; // Apply class
        }

        // --- Event Listeners ---

        // Edit Text Inputs
        if (editQuoteInput) {
            editQuoteInput.addEventListener('input', () => {
                if (updateWordCount(editQuoteInput, editWordCountEl)) {
                    quoteData.quote = editQuoteInput.value;
                    updatePreview();
                    debouncedSave();
                } else {
                     // Maybe provide visual feedback directly on the input
                }
            });
        }
        if (editAuthorInput) {
            editAuthorInput.addEventListener('input', () => {
                quoteData.author = editAuthorInput.value;
                updatePreview();
                debouncedSave();
            });
        }

        // Control Panel Inputs
        Object.values(controls).forEach(control => {
            if (control && control !== controls.downloadBtn && control !== controls.bgImageUpload && control !== controls.clearBackgroundBtn) {
                const eventType = (control.type === 'select-one' || control.type === 'color') ? 'change' : 'input';
                 control.addEventListener(eventType, () => {
                     if (control.id === 'fontSize' && fontSizeValueEl) {
                         fontSizeValueEl.textContent = control.value; // Update slider value display
                     }
                    updatePreview();
                    debouncedSave();
                });
            }
        });

        // Alignment Buttons
        alignmentButtons.forEach(button => {
            button.addEventListener('click', () => {
                alignmentButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentAlignment = button.dataset.align;
                updatePreview();
                 pushHistory(saveState()); // Save state immediately for discrete actions
            });
        });

         // Text Format Buttons
        [boldBtn, italicBtn].forEach(button => {
            if(button) {
                button.addEventListener('click', () => {
                    button.classList.toggle('active');
                    updatePreview();
                    pushHistory(saveState());
                });
            }
        });

        // Background Image Options (Presets)
        backgroundImageOptions.forEach(option => {
            option.addEventListener('click', () => {
                backgroundImageOptions.forEach(opt => opt.classList.remove('active'));
                 option.classList.add('active');
                 currentBackgroundImage = option.dataset.src;
                 if (uploadedBgObjectURL) { // Clear uploaded background if preset is chosen
                    URL.revokeObjectURL(uploadedBgObjectURL);
                    uploadedBgObjectURL = null;
                    if(controls.bgImageUpload) controls.bgImageUpload.value = ''; // Clear file input
                }
                if(controls.clearBackgroundBtn) controls.clearBackgroundBtn.disabled = false;
                updatePreview();
                pushHistory(saveState());
            });
        });

        // Background Image Upload
         if (controls.bgImageUpload) {
            controls.bgImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file && file.type.startsWith('image/')) {
                     // Revoke previous object URL if one exists
                     if (uploadedBgObjectURL) {
                        URL.revokeObjectURL(uploadedBgObjectURL);
                    }
                    uploadedBgObjectURL = URL.createObjectURL(file);
                    currentBackgroundImage = uploadedBgObjectURL;
                    backgroundImageOptions.forEach(opt => opt.classList.remove('active')); // Deactivate presets
                    if(controls.clearBackgroundBtn) controls.clearBackgroundBtn.disabled = false;
                    updatePreview();
                    pushHistory(saveState());
                } else if (file) {
                    alert("Please select a valid image file.");
                    event.target.value = ''; 
                }
            });
        }

        // Clear Background Button
        if (controls.clearBackgroundBtn) {
             controls.clearBackgroundBtn.addEventListener('click', () => {
                backgroundImageOptions.forEach(opt => opt.classList.remove('active'));
                 if (uploadedBgObjectURL) {
                     URL.revokeObjectURL(uploadedBgObjectURL);
                     uploadedBgObjectURL = null;
                 }
                 if(controls.bgImageUpload) controls.bgImageUpload.value = ''; // Clear file input
                currentBackgroundImage = null;
                controls.clearBackgroundBtn.disabled = true; 
                updatePreview();
                 pushHistory(saveState());
             });
             // Initial state
             controls.clearBackgroundBtn.disabled = !currentBackgroundImage;
        }

         // Aspect Ratio Radios
         aspectRatioRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                updatePreview(); // updatePreview now handles aspect ratio via class
                pushHistory(saveState());
            });
        });

        // Undo/Redo Buttons
         if (undoBtn) {
             undoBtn.addEventListener('click', () => {
                 if (historyIndex > 0) {
                     historyIndex--;
                     restoreState(history[historyIndex]);
                     updateHistoryButtons();
                 }
             });
         }
         if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                 if (historyIndex < history.length - 1) {
                     historyIndex++;
                     restoreState(history[historyIndex]);
                     updateHistoryButtons();
                 }
             });
         }

        // Download Button
        if (controls.downloadBtn) {
            controls.downloadBtn.addEventListener('click', () => {
                 if (typeof html2canvas === 'undefined') {
                    alert('Error: html2canvas library is not loaded. Cannot download image.');
                    return;
                }

                const buttonText = controls.downloadBtn.querySelector('.btn-gradient');
                const spinner = controls.downloadBtn.querySelector('.loading-spinner');
                const originalButtonText = buttonText.textContent;

                // Show loading state
                buttonText.textContent = 'Generating...';
                if(spinner) spinner.style.display = 'inline-block';
                controls.downloadBtn.disabled = true;

                // Options for html2canvas
                const canvasOptions = {
                    backgroundColor: currentBackgroundImage ? null : (controls.bgColor?.value || '#1a1a1a'), // Use null bg if image exists for transparency
                    scale: 2, // Increase scale for better resolution
                    useCORS: true,
                     allowTaint: true, 
                    logging: false
                };

                html2canvas(preview, canvasOptions).then(canvas => {
                    try {
                        const link = document.createElement('a');
                        link.download = `quote-design-${Date.now()}.png`; // Unique filename
                        link.href = canvas.toDataURL('image/png'); // Get data URL
                        document.body.appendChild(link); // Required for Firefox
                        link.click();
                        document.body.removeChild(link);

                        // Restore button state on success
                        buttonText.textContent = originalButtonText;
                        if(spinner) spinner.style.display = 'none';
                         controls.downloadBtn.disabled = false;

                    } catch (downloadError) {
                         console.error('Download stage error:', downloadError);
                        alert('Error creating download link. Please try again.');
                         // Restore button state on error
                        buttonText.textContent = originalButtonText;
                        if(spinner) spinner.style.display = 'none';
                         controls.downloadBtn.disabled = false;
                    }
                }).catch(renderError => {
                     console.error('html2canvas rendering error:', renderError);
                    alert('Could not generate the image. The design might be too complex, or there could be issues loading resources (like fonts or background images). Try simplifying the design or check the console for more details.');
                    // Restore button state on error
                    buttonText.textContent = originalButtonText;
                    if(spinner) spinner.style.display = 'none';
                     controls.downloadBtn.disabled = false;
                });
            });
        }

        // Initialize the page
        initializeDesignPage();
    }
});
