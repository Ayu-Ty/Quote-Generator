document.addEventListener('DOMContentLoaded', () => {
    const MAX_WORDS = 20;

    // --- Preset Quotes ---
    const presetQuotesData = [
        { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
        { quote: "The mind is everything. What you think you become.", author: "Buddha" },
        { quote: "An unexamined life is not worth living.", author: "Socrates" },
        { quote: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
        { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" }
    ];

    // --- Helper Functions ---
    function countWords(str) {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    function updateWordCountDisplay(textArea, displayElement) {
        const words = countWords(textArea.value);
        const isValid = words <= MAX_WORDS;
        displayElement.textContent = `${words} / ${MAX_WORDS} words`;
        displayElement.classList.toggle('error', !isValid);
        return isValid;
    }

    // --- index.html Functionality ---
    const indexForm = document.querySelector('.container .card');
    if (indexForm && (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') || window.location.pathname === '') ) { // Added check for root path
        const authorInput = document.getElementById('author');
        const quoteInput = document.getElementById('quote');
        const designBtn = document.getElementById('designBtn');
        const wordCountEl = document.getElementById('wordCount');
        const presetQuotesSelect = document.getElementById('presetQuotes');

        if (presetQuotesSelect) {
             // Clear existing options first (if any)
             presetQuotesSelect.innerHTML = '<option value="">Select a preset...</option>';
            presetQuotesData.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${item.quote.substring(0, 30)}... (${item.author})`;
                presetQuotesSelect.appendChild(option);
            });

            presetQuotesSelect.addEventListener('change', () => {
                const selectedIndex = presetQuotesSelect.value;
                if (selectedIndex !== "" && authorInput && quoteInput && wordCountEl) {
                    const selectedQuote = presetQuotesData[selectedIndex];
                    quoteInput.value = selectedQuote.quote;
                    authorInput.value = selectedQuote.author;
                    updateWordCountDisplay(quoteInput, wordCountEl);
                    quoteInput.focus();
                }
            });
        }

        if (authorInput && quoteInput && designBtn && wordCountEl) {
            quoteInput.addEventListener('input', () => {
                updateWordCountDisplay(quoteInput, wordCountEl);
            });

            designBtn.addEventListener('click', () => {
                const author = authorInput.value.trim();
                const quote = quoteInput.value.trim();
                const isWordCountValid = updateWordCountDisplay(quoteInput, wordCountEl);

                if (!author) { alert('Please enter an author name.'); authorInput.focus(); return; }
                if (!quote) { alert('Please enter a quote.'); quoteInput.focus(); return; }
                if (!isWordCountValid) { alert(`Quote must be ${MAX_WORDS} words or less.`); quoteInput.focus(); return; }

                localStorage.setItem('quoteData', JSON.stringify({ author, quote }));
                window.location.href = 'design.html';
            });
            updateWordCountDisplay(quoteInput, wordCountEl);
        }
    }

    // --- design.html Functionality ---
    const designContainer = document.querySelector('.design-container');
    if (designContainer) {
        let quoteData = JSON.parse(localStorage.getItem('quoteData'));

        if (!quoteData) {
            alert("No quote data found. Redirecting to the start page.");
            window.location.href = 'index.html';
            return;
        }

        const preview = document.getElementById('quotePreview');
        const quoteTextEl = preview?.querySelector('.quote-text');
        const authorNameEl = preview?.querySelector('.author-name');
        const aspectRatioWrapper = document.getElementById('aspectRatioWrapper');
        const editQuoteInput = document.getElementById('editQuote');
        const editAuthorInput = document.getElementById('editAuthor');
        const editWordCountEl = document.getElementById('editWordCount');
        const fontSizeValueEl = document.getElementById('fontSizeValue');
        const boldBtn = document.getElementById('boldBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        const italicBtn = document.getElementById('italicBtn');

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

        let currentAlignment = 'center';
        let currentBackgroundImage = null;
        let uploadedBgObjectURL = null;

        function initializeDesignPage() {
            if (editQuoteInput && editWordCountEl) {
                 editQuoteInput.value = quoteData.quote;
                 updateWordCountDisplay(editQuoteInput, editWordCountEl);
            }
            if (editAuthorInput) editAuthorInput.value = quoteData.author;
            if (controls.fontSize && fontSizeValueEl) fontSizeValueEl.textContent = controls.fontSize.value;
            updatePreview();
        }

        function updatePreview() {
             if (!preview || !quoteData || !quoteTextEl || !authorNameEl) return;
             quoteTextEl.textContent = quoteData.quote || "";
             authorNameEl.textContent = quoteData.author ? `- ${quoteData.author}` : "";
             preview.style.color = controls.textColor?.value || '#ffffff';
             preview.style.fontFamily = controls.fontFamily?.value || "'Space Mono', monospace";
             preview.style.fontSize = `${controls.fontSize?.value || 24}px`;
             preview.style.textAlign = currentAlignment;
             preview.style.alignItems = currentAlignment === 'left' ? 'flex-start' : currentAlignment === 'right' ? 'flex-end' : 'center';

             // Apply formatting classes
             quoteTextEl.classList.toggle('bold', boldBtn?.classList.contains('active'));
             quoteTextEl.classList.toggle('underline', underlineBtn?.classList.contains('active')); // Added underline toggle
             quoteTextEl.classList.toggle('italic', italicBtn?.classList.contains('active'));

            if (currentBackgroundImage) {
                preview.style.backgroundImage = `url('${currentBackgroundImage}')`;
                preview.style.backgroundColor = 'transparent';
                 if(controls.bgColor) controls.bgColor.disabled = true;
            } else {
                preview.style.backgroundImage = 'none';
                preview.style.backgroundColor = controls.bgColor?.value || '#1a1a1a';
                 if(controls.bgColor) controls.bgColor.disabled = false;
            }
             const selectedRatio = document.querySelector('input[name="aspectRatio"]:checked')?.value || 'free';
            if (aspectRatioWrapper) aspectRatioWrapper.className = `aspect-ratio-${selectedRatio}`;
        }

        // --- Event Listeners ---
        if (editQuoteInput && editWordCountEl) {
            editQuoteInput.addEventListener('input', () => {
                const isValid = updateWordCountDisplay(editQuoteInput, editWordCountEl);
                if (isValid) {
                     quoteData.quote = editQuoteInput.value;
                     updatePreview();
                }
            });
        }
        if (editAuthorInput) {
            editAuthorInput.addEventListener('input', () => {
                quoteData.author = editAuthorInput.value;
                updatePreview();
            });
        }

        // Generic controls (excluding color, buttons)
        ['textColor', 'fontFamily', 'fontSize'].forEach(controlId => {
             const control = controls[controlId];
             if (control) {
                 const eventType = (control.type === 'select-one') ? 'change' : 'input';
                 control.addEventListener(eventType, () => {
                     if (controlId === 'fontSize' && fontSizeValueEl) {
                         fontSizeValueEl.textContent = control.value;
                     }
                    updatePreview();
                });
             }
        });

        // *** Specific Listener for Background Color using 'input' event ***
        if (controls.bgColor) {
            controls.bgColor.addEventListener('input', () => {
                // No need to update quoteData, just call updatePreview
                updatePreview();
            });
        }

        alignmentButtons.forEach(button => {
            button.addEventListener('click', () => {
                alignmentButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentAlignment = button.dataset.align;
                updatePreview();
            });
        });

      
        [boldBtn, underlineBtn, italicBtn].forEach(button => {
            if(button) {
                button.addEventListener('click', () => {
                    button.classList.toggle('active');
                    updatePreview();
                });
            }
        });

        backgroundImageOptions.forEach(option => {
            option.addEventListener('click', () => {
                backgroundImageOptions.forEach(opt => opt.classList.remove('active'));
                 option.classList.add('active');
                 currentBackgroundImage = option.dataset.src;
                 if (uploadedBgObjectURL) { URL.revokeObjectURL(uploadedBgObjectURL); uploadedBgObjectURL = null; if(controls.bgImageUpload) controls.bgImageUpload.value = ''; }
                if(controls.clearBackgroundBtn) controls.clearBackgroundBtn.disabled = false;
                updatePreview();
            });
        });

         if (controls.bgImageUpload) {
            controls.bgImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file && file.type.startsWith('image/')) {
                     if (uploadedBgObjectURL) { URL.revokeObjectURL(uploadedBgObjectURL); }
                    uploadedBgObjectURL = URL.createObjectURL(file);
                    currentBackgroundImage = uploadedBgObjectURL;
                    backgroundImageOptions.forEach(opt => opt.classList.remove('active'));
                    if(controls.clearBackgroundBtn) controls.clearBackgroundBtn.disabled = false;
                    updatePreview();
                } else if (file) {
                    alert("Please select a valid image file.");
                    event.target.value = '';
                }
            });
        }

        if (controls.clearBackgroundBtn) {
             controls.clearBackgroundBtn.addEventListener('click', () => {
                backgroundImageOptions.forEach(opt => opt.classList.remove('active'));
                 if (uploadedBgObjectURL) { URL.revokeObjectURL(uploadedBgObjectURL); uploadedBgObjectURL = null; }
                 if(controls.bgImageUpload) controls.bgImageUpload.value = '';
                currentBackgroundImage = null;
                controls.clearBackgroundBtn.disabled = true;
                updatePreview();
             });
             controls.clearBackgroundBtn.disabled = !currentBackgroundImage;
        }

         aspectRatioRadios.forEach(radio => {
            radio.addEventListener('change', () => { updatePreview(); });
        });

        if (controls.downloadBtn && preview) {
             controls.downloadBtn.addEventListener('click', () => {
                // (Download logic remains the same as previous version)
                 if (typeof html2canvas === 'undefined') { alert('Error: html2canvas library is not loaded.'); return; }
                const buttonText = controls.downloadBtn.querySelector('.btn-gradient');
                const spinner = controls.downloadBtn.querySelector('.loading-spinner');
                const originalButtonText = buttonText.textContent;
                buttonText.textContent = 'Generating...';
                if(spinner) spinner.style.display = 'inline-block';
                controls.downloadBtn.disabled = true;
                const canvasOptions = { backgroundColor: currentBackgroundImage ? null : controls.bgColor?.value, scale: 2, useCORS: true, allowTaint: true, logging: false };
                const elementToCapture = aspectRatioWrapper.className === 'aspect-ratio-free' ? preview : aspectRatioWrapper;
                html2canvas(elementToCapture, canvasOptions).then(canvas => {
                    try {
                        const link = document.createElement('a');
                        link.download = `quote-design-${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); document.body.appendChild(link); link.click(); document.body.removeChild(link);
                    } catch (downloadError) { console.error('Download stage error:', downloadError); alert('Error creating download link.');
                    } finally { buttonText.textContent = originalButtonText; if(spinner) spinner.style.display = 'none'; controls.downloadBtn.disabled = false; }
                }).catch(renderError => {
                     console.error('html2canvas rendering error:', renderError); alert('Could not generate the image. Check console (F12) for details.');
                     buttonText.textContent = originalButtonText; if(spinner) spinner.style.display = 'none'; controls.downloadBtn.disabled = false;
                });
            });
        }

        initializeDesignPage();
    }
});
