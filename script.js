// ===========================
// State Management
// ===========================
let certificateData = {
    type: '',
    studentName: '',
    courseName: '',
    completionDate: '',
    grade: '',
    description: ''
};

// ===========================
// DOM Elements
// ===========================
const typeCards = document.querySelectorAll('.type-card');
const formSection = document.getElementById('formSection');
const previewSection = document.getElementById('previewSection');
const certificateForm = document.getElementById('certificateForm');
const resetBtn = document.getElementById('resetBtn');
const editBtn = document.getElementById('editBtn');
const downloadBtn = document.getElementById('downloadBtn');
const certificate = document.getElementById('certificate');

// ===========================
// Certificate Type Selection
// ===========================
typeCards.forEach(card => {
    card.addEventListener('click', function () {
        // Remove active class from all cards
        typeCards.forEach(c => c.classList.remove('active'));

        // Add active class to clicked card
        this.classList.add('active');

        // Store certificate type
        certificateData.type = this.dataset.type;

        // Show form section with animation
        formSection.classList.add('active');
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ===========================
// Form Handling
// ===========================
certificateForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Collect form data
    certificateData.studentName = document.getElementById('studentName').value;
    certificateData.courseName = document.getElementById('courseName').value;
    certificateData.completionDate = document.getElementById('completionDate').value;
    certificateData.grade = document.getElementById('grade').value;
    certificateData.description = document.getElementById('description').value;

    // Generate certificate
    generateCertificate();

    // Show preview section
    previewSection.classList.add('active');
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Reset Button
resetBtn.addEventListener('click', function () {
    certificateForm.reset();
    certificateData = {
        type: certificateData.type,
        studentName: '',
        courseName: '',
        completionDate: '',
        grade: '',
        description: ''
    };
});

// Edit Button
editBtn.addEventListener('click', function () {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Download Button - Simple Print Solution
downloadBtn.addEventListener('click', function () {
    const certificateElement = document.getElementById('certificate');

    if (!certificateElement) {
        alert('Please generate a certificate first.');
        return;
    }

    // Simply open print dialog - works perfectly for local files
    // User can save as PDF from print dialog
    window.print();
});

// PNG Download Button - High Quality 4K
const downloadPngBtn = document.getElementById('downloadPngBtn');
downloadPngBtn.addEventListener('click', async function () {
    const certificateElement = document.getElementById('certificate');

    if (!certificateElement) {
        alert('Please generate a certificate first.');
        return;
    }

    // Show loading state
    const originalText = this.textContent;
    this.textContent = 'Generating 4K PNG...';
    this.disabled = true;

    try {
        // Step 1: Convert all images to base64 to avoid tainted canvas
        const images = certificateElement.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => convertImageToBase64(img));
        await Promise.all(imagePromises);

        // Small delay to ensure images are loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Step 2: Capture certificate at very high resolution (5x for 4K quality)
        const canvas = await html2canvas(certificateElement, {
            scale: 5, // 5x scale for ultra high quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: certificateElement.offsetWidth,
            height: certificateElement.offsetHeight,
            imageTimeout: 0
        });

        // Step 3: Convert to PNG and download
        canvas.toBlob(function (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const filename = `certificate-${certificateData.studentName.replace(/\s+/g, '-').toLowerCase()}-4K-${Date.now()}.png`;
            link.download = filename;
            link.href = url;
            link.click();

            // Clean up
            URL.revokeObjectURL(url);

            // Reset button
            downloadPngBtn.textContent = originalText;
            downloadPngBtn.disabled = false;
        }, 'image/png', 1.0);

    } catch (error) {
        console.error('Error generating PNG:', error);
        alert('Failed to generate PNG. Error: ' + error.message);

        // Reset button
        this.textContent = originalText;
        this.disabled = false;
    }
});

// Helper function to convert image to base64
async function convertImageToBase64(imgElement) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Create a new image to load
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                try {
                    const dataURL = canvas.toDataURL('image/png');
                    imgElement.src = dataURL;
                    resolve();
                } catch (e) {
                    // If conversion fails, just keep original - might still work
                    console.warn('Could not convert image to base64:', imgElement.src);
                    resolve();
                }
            };

            img.onerror = function () {
                // If loading fails, keep original
                console.warn('Could not load image for conversion:', imgElement.src);
                resolve();
            };

            // Load the image
            img.src = imgElement.src;
        } catch (e) {
            console.error('Error in convertImageToBase64:', e);
            resolve(); // Resolve anyway to not block the process
        }
    });
}

// ===========================
// Certificate Generation
// ===========================
function generateCertificate() {
    const typeTexts = {
        completion: {
            title: 'Certificate of Completion',
            subtitle: 'This is to certify that',
            text: 'has successfully completed the course',
            description: 'This certificate is awarded in recognition of dedication, hard work, and successful completion of all course requirements. The recipient has demonstrated commitment to excellence and mastery of the subject matter.'
        },
        achievement: {
            title: 'Certificate of Achievement',
            subtitle: 'This is proudly presented to',
            text: 'for outstanding achievement in',
            description: 'This certificate recognizes exceptional performance, outstanding dedication, and exemplary achievement. The recipient has demonstrated excellence and has set a remarkable standard of success.'
        },
        participation: {
            title: 'Certificate of Participation',
            subtitle: 'This is awarded to',
            text: 'for active participation in',
            description: 'This certificate acknowledges active involvement, enthusiastic participation, and valuable contribution. The recipient has demonstrated commitment and has made meaningful contributions throughout the program.'
        },
        appreciation: {
            title: 'Certificate of Appreciation',
            subtitle: 'This is presented to',
            text: 'in recognition of valuable contributions to',
            description: 'This certificate is presented in appreciation of outstanding service, dedication, and valuable contributions. The recipient has demonstrated exceptional commitment and has made a significant positive impact.'
        }
    };

    const selectedType = typeTexts[certificateData.type] || typeTexts.completion;

    // Format date
    const dateObj = new Date(certificateData.completionDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Use auto-generated description if user didn't provide one
    const finalDescription = certificateData.description || selectedType.description;

    // Build certificate HTML with new design
    let certificateHTML = `
        <!-- Corner Decorations -->
        <div class="certificate-corner-tl"></div>
        <div class="certificate-corner-tr"></div>
        <div class="certificate-corner-bl"></div>
        <div class="certificate-corner-br"></div>
        
        <!-- Inner Border -->
        <div class="certificate-inner-border"></div>
        
        <!-- Watermark -->
        <div class="certificate-watermark">
            <img src="karta.png" alt="Watermark">
        </div>
        
        <div class="certificate-content">
            <!-- Logo -->
            <img src="aarambha_logo.png" alt="Aarambha College Logo" class="certificate-logo-img">
            
            <div class="certificate-header">
                <div class="certificate-main-title">CERTIFICATE</div>
                <div class="certificate-type">OF ${selectedType.title.replace('Certificate of ', '')}</div>
                
                <!-- Diamond Decorations -->
                <div class="certificate-diamonds">
                    <div class="diamond gold"></div>
                    <div class="diamond blue"></div>
                    <div class="diamond gold"></div>
                </div>
                
                <div class="certificate-subtitle">${selectedType.subtitle}</div>
            </div>
            
            <div class="certificate-body">
                <div class="certificate-name">${certificateData.studentName}</div>
                
                <div class="certificate-description">${finalDescription}</div>
    `;

    // Add course name if provided
    if (certificateData.courseName) {
        certificateHTML += `<div class="certificate-course">${certificateData.courseName}</div>`;
    }

    // Add grade if provided
    if (certificateData.grade) {
        certificateHTML += `<div class="certificate-grade">Grade: ${certificateData.grade}</div>`;
    }

    certificateHTML += `
                <!-- Badge/Seal -->
                <div class="certificate-badge">
                    <div class="certificate-badge-circle">
                        <div class="certificate-badge-text">Aarambha<br>College</div>
                    </div>
                    <div class="certificate-badge-ribbon"></div>
                </div>
            </div>
            
            <div class="certificate-footer">
                <div class="certificate-signature">
                    <div class="signature-line"></div>
                    <div class="signature-title">Signature</div>
                </div>
                <div class="certificate-signature">
                    <div class="signature-line"></div>
                    <div class="signature-title">Signature</div>
                </div>
            </div>
        </div>
    `;

    // Insert into certificate container
    certificate.innerHTML = certificateHTML;
}

// ===========================
// Additional Features
// ===========================

// Auto-format student name (capitalize first letter of each word)
document.getElementById('studentName').addEventListener('blur', function () {
    this.value = this.value.replace(/\b\w/g, char => char.toUpperCase());
});

// Set max date to today
document.getElementById('completionDate').setAttribute('max', new Date().toISOString().split('T')[0]);

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add loading animation when generating certificate
function showLoadingAnimation() {
    certificate.innerHTML = '<div style="text-align: center; padding: 100px; color: #64748b;">Generating certificate...</div>';
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + P to download
    if ((e.ctrlKey || e.metaKey) && e.key === 'p' && previewSection.classList.contains('active')) {
        e.preventDefault();
        window.print();
    }

    // Escape to scroll to top
    if (e.key === 'Escape') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ===========================
// Print Optimization
// ===========================
window.addEventListener('beforeprint', function () {
    // Ensure certificate is visible before printing
    if (!previewSection.classList.contains('active')) {
        alert('Please generate a certificate before printing.');
        return false;
    }
});

// ===========================
// Initialize
// ===========================
console.log('Certificate Generator initialized successfully!');
console.log('✨ Ready to create beautiful certificates!');
