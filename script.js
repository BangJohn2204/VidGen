// Global variables
let uploadedImageBase64 = null;
let uploadedImageType = null;

// Load saved API key on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }
});

// Save API key to localStorage
document.getElementById('apiKey').addEventListener('change', function() {
    localStorage.setItem('gemini_api_key', this.value);
});

// Toggle input type
function toggleInputType() {
    const inputType = document.getElementById('inputType').value;
    const textSection = document.getElementById('textPromptSection');
    const jsonSection = document.getElementById('jsonPromptSection');
    const imageSection = document.getElementById('imagePromptSection');
    
    // Hide all sections
    textSection.style.display = 'none';
    jsonSection.style.display = 'none';
    imageSection.style.display = 'none';
    
    // Show selected section
    switch(inputType) {
        case 'text':
            textSection.style.display = 'block';
            break;
        case 'json':
            jsonSection.style.display = 'block';
            break;
        case 'image':
            imageSection.style.display = 'block';
            break;
    }
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file!');
        return;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result.split(',')[1]; // Remove data:image/...;base64,
        uploadedImageType = file.type;
        
        // Show preview
        const previewImg = document.getElementById('previewImg');
        const imagePreview = document.getElementById('imagePreview');
        
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
        
        // Hide upload area
        document.querySelector('.upload-area').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Remove uploaded image
function removeImage() {
    uploadedImageBase64 = null;
    uploadedImageType = null;
    
    document.getElementById('imagePreview').style.display = 'none';
    document.querySelector('.upload-area').style.display = 'block';
    document.getElementById('imageInput').value = '';
}

// Generate video
async function generateVideo() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const inputType = document.getElementById('inputType').value;
    const videoLength = document.getElementById('videoLength').value;
    const videoStyle = document.getElementById('videoStyle').value;
    
    // Validate API key
    if (!apiKey) {
        alert('Please enter your Google Gemini API key!');
        return;
    }
    
    // Get prompt based on input type
    let promptText = '';
    let requestData = {
        contents: [{
            parts: []
        }]
    };
    
    try {
        switch(inputType) {
            case 'text':
                promptText = document.getElementById('textPrompt').value.trim();
                if (!promptText) {
                    alert('Please enter a text prompt!');
                    return;
                }
                
                // Enhance prompt with video specifications
                const enhancedPrompt = `Generate a ${videoStyle} style video that is ${videoLength} seconds long. ${promptText}. Make sure the video is smooth, high quality, and suitable for the specified duration.`;
                
                requestData.contents[0].parts.push({
                    text: enhancedPrompt
                });
                break;
                
            case 'json':
                const jsonPrompt = document.getElementById('jsonPrompt').value.trim();
                if (!jsonPrompt) {
                    alert('Please enter a JSON prompt!');
                    return;
                }
                
                try {
                    const jsonData = JSON.parse(jsonPrompt);
                    const jsonPromptText = `Generate a video based on this specification: ${JSON.stringify(jsonData)}. Video style: ${videoStyle}, Duration: ${videoLength} seconds.`;
                    
                    requestData.contents[0].parts.push({
                        text: jsonPromptText
                    });
                } catch (error) {
                    alert('Invalid JSON format! Please check your JSON syntax.');
                    return;
                }
                break;
                
            case 'image':
                const imagePrompt = document.getElementById('imagePrompt').value.trim();
                if (!uploadedImageBase64) {
                    alert('Please upload an image first!');
                    return;
                }
                if (!imagePrompt) {
                    alert('Please enter a prompt for the image!');
                    return;
                }
                
                const imagePromptText = `${imagePrompt}. Generate a ${videoStyle} style video that is ${videoLength} seconds long based on this image. Make the video smooth and high quality.`;
                
                requestData.contents[0].parts.push(
                    {
                        text: imagePromptText
                    },
                    {
                        inline_data: {
                            mime_type: uploadedImageType,
                            data: uploadedImageBase64
                        }
                    }
                );
                break;
        }
        
        // Show loading state
        showLoading();
        
        // Make API call
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        // Hide loading state
        hideLoading();
        
        if (response.ok) {
            displayResult(data);
        } else {
            displayError(data);
        }
        
    } catch (error) {
        hideLoading();
        displayError({ error: { message: 'Network error: ' + error.message } });
    }
}

// Show loading state
function showLoading() {
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('generateBtn').textContent = 'Generating...';
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('generateBtn').textContent = '🎬 Generate Video';
    document.getElementById('loadingState').style.display = 'none';
}

// Display result
function displayResult(data) {
    const resultSection = document.getElementById('resultSection');
    const videoResult = document.getElementById('videoResult');
    const errorResult = document.getElementById('errorResult');
    
    errorResult.style.display = 'none';
    resultSection.style.display = 'block';
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        const content = data.candidates[0].content;
        let resultHtml = '<div class="response-info"><h4>📋 Response dari Gemini:</h4>';
        
        // Check if response contains video data or just text
        if (content.parts && content.parts.length > 0) {
            content.parts.forEach((part, index) => {
                if (part.text) {
                    resultHtml += `<p><strong>Text Response:</strong></p>`;
                    resultHtml += `<pre>${part.text}</pre>`;
                }
                
                // Note: Gemini API might not directly return video files
                // This is a placeholder for when video generation is supported
                if (part.video_data || part.inline_data) {
                    resultHtml += `<p><strong>Generated Video:</strong></p>`;
                    resultHtml += `<p>⚠️ Video generation feature is still being developed by Google Gemini. Currently showing text response only.</p>`;
                }
            });
        }
        
        resultHtml += '</div>';
        
        // Add information about current limitations
        resultHtml += `
            <div class="response-info" style="background: #fff3cd; border-color: #ffeaa7;">
                <h4>ℹ️ Informasi Penting:</h4>
                <p>Saat ini, Google Gemini API belum sepenuhnya mendukung generate video secara langsung. 
                Response yang ditampilkan adalah deskripsi atau instruksi untuk membuat video sesuai prompt Anda.</p>
                <p>Untuk generate video yang sesungguhnya, Anda bisa menggunakan deskripsi ini sebagai panduan 
                untuk tools video AI lainnya seperti Runway ML, Pika Labs, atau Stable Video Diffusion.</p>
            </div>
        `;
        
        videoResult.innerHTML = resultHtml;
    } else {
        videoResult.innerHTML = `
            <div class="response-info">
                <h4>📋 Response:</h4>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
        `;
    }
}

// Display error
function displayError(data) {
    const resultSection = document.getElementById('resultSection');
    const videoResult = document.getElementById('videoResult');
    const errorResult = document.getElementById('errorResult');
    
    videoResult.innerHTML = '';
    resultSection.style.display = 'block';
    errorResult.style.display = 'block';
    
    let errorMessage = 'Unknown error occurred';
    
    if (data.error) {
        errorMessage = data.error.message || JSON.stringify(data.error);
        
        // Common error handling
        if (errorMessage.includes('API_KEY_INVALID')) {
            errorMessage = 'API Key tidak valid. Pastikan Anda menggunakan API Key yang benar dari Google AI Studio.';
        } else if (errorMessage.includes('QUOTA_EXCEEDED')) {
            errorMessage = 'Quota API telah terlampaui. Silakan coba lagi nanti atau upgrade plan Anda.';
        } else if (errorMessage.includes('PERMISSION_DENIED')) {
            errorMessage = 'Permission denied. Pastikan API Key Anda memiliki akses ke model Gemini 2.0 Flash.';
        }
    }
    
    errorResult.innerHTML = `
        <h4>❌ Error:</h4>
        <p>${errorMessage}</p>
        <details style="margin-top: 10px;">
            <summary>Technical Details</summary>
            <pre style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 5px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
        </details>
    `;
}

// Utility function to validate JSON
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
}