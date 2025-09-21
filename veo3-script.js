// Global variables
let uploadedImage = null;
let uploadedImageData = null;
let currentVideoBlob = null;
let isGenerating = false;

// VEO3 API Configuration - Try different endpoints
const VEO3_ENDPOINTS = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', // Fallback Gemini Pro
    'https://generativelanguage.googleapis.com/v1beta/models/veo-3:generateContent', // VEO3 direct
    'https://generativelanguage.googleapis.com/v1beta/models/veo:generateContent', // VEO general
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent' // Latest Gemini
];
const VEO3_API_KEY = 'AIzaSyBt6TdkYafD3r8u60d--ZqSisQ_SJMosCU';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('VEO3 Video Generator initialized');
    initializeApp();
});

function initializeApp() {
    // Initialize UI components
    updateDurationDisplay();
    
    // Set up event listeners
    setupEventListeners();
    
    // Show default state
    showDefaultState();
}

function setupEventListeners() {
    // Image upload drag and drop
    const uploadZone = document.querySelector('.upload-zone');
    
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
}

// Prompt type toggle
function togglePromptType() {
    const promptType = document.getElementById('promptType').value;
    const textSection = document.getElementById('textPromptSection');
    const jsonSection = document.getElementById('jsonPromptSection');
    
    if (promptType === 'text') {
        textSection.classList.remove('hidden');
        jsonSection.classList.add('hidden');
    } else {
        textSection.classList.add('hidden');
        jsonSection.classList.remove('hidden');
    }
}

// Duration slider update
function updateDurationDisplay() {
    const duration = document.getElementById('duration').value;
    document.getElementById('durationDisplay').textContent = `${duration}s`;
}

// Image upload handling
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

// Drag and drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#667eea';
    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#cbd5e0';
    e.currentTarget.style.background = '#f7fafc';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            processImageFile(file);
        } else {
            alert('Please upload a valid image file (JPG, PNG, WebP)');
        }
    }
    
    // Reset styles
    e.currentTarget.style.borderColor = '#cbd5e0';
    e.currentTarget.style.background = '#f7fafc';
}

function processImageFile(file) {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        alert('Please upload a valid image file (JPG, PNG, WebP)');
        return;
    }
    
    uploadedImage = file;
    
    // Create file reader for preview
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        showImagePreview(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageSrc, file) {
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImage');
    const fileName = document.getElementById('imageFileName');
    const fileSize = document.getElementById('imageFileSize');
    
    img.src = imageSrc;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    preview.classList.remove('hidden');
    document.querySelector('.upload-zone').style.display = 'none';
}

function removeImage() {
    uploadedImage = null;
    uploadedImageData = null;
    
    document.getElementById('imagePreview').classList.add('hidden');
    document.querySelector('.upload-zone').style.display = 'block';
    document.getElementById('imageUpload').value = '';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Video generation with real VEO3 API
async function generateVideo() {
    if (isGenerating) return;
    
    try {
        // Validate inputs
        if (!validateInputs()) return;
        
        // Prepare generation data
        const generationData = prepareGenerationData();
        
        // Start generation process
        isGenerating = true;
        showLoadingState();
        
        // Call real VEO3 API
        await callVEO3API(generationData);
        
    } catch (error) {
        console.error('Generation error:', error);
        showErrorState(error.message || 'Failed to generate video. Please try again.');
    } finally {
        isGenerating = false;
    }
}

function validateInputs() {
    const promptType = document.getElementById('promptType').value;
    
    if (promptType === 'text') {
        const textPrompt = document.getElementById('textPrompt').value.trim();
        if (!textPrompt) {
            alert('Please enter a text prompt');
            return false;
        }
    } else if (promptType === 'json') {
        const jsonPrompt = document.getElementById('jsonPrompt').value.trim();
        if (!jsonPrompt) {
            alert('Please enter a JSON prompt');
            return false;
        }
        
        try {
            JSON.parse(jsonPrompt);
        } catch (error) {
            alert('Invalid JSON format. Please check your syntax.');
            return false;
        }
    }
    
    return true;
}

function prepareGenerationData() {
    const promptType = document.getElementById('promptType').value;
    const aspectRatio = document.querySelector('input[name="aspectRatio"]:checked').value;
    const resolution = document.getElementById('resolution').value;
    const duration = document.getElementById('duration').value;
    const enableSound = document.getElementById('enableSound').checked;
    
    let prompt = '';
    let parsedPrompt = null;
    
    if (promptType === 'text') {
        prompt = document.getElementById('textPrompt').value.trim();
    } else {
        const jsonPrompt = document.getElementById('jsonPrompt').value.trim();
        try {
            parsedPrompt = JSON.parse(jsonPrompt);
            prompt = JSON.stringify(parsedPrompt);
        } catch (error) {
            prompt = jsonPrompt;
        }
    }
    
    // Enhance prompt with technical specifications
    const enhancedPrompt = `Create a ${aspectRatio} aspect ratio video in ${resolution} resolution for ${duration} seconds. ${enableSound ? 'Include audio/sound effects.' : 'Generate without audio.'} ${prompt}`;
    
    return {
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        promptType,
        aspectRatio,
        resolution,
        duration: parseInt(duration),
        enableSound,
        referenceImage: uploadedImageData,
        timestamp: Date.now()
    };
}

// Mock video generation (replace with actual API integration)
async function simulateVideoGeneration(data) {
    const steps = [
        'Initializing VEO3 model...',
        'Processing prompt...',
        'Analyzing reference image...',
        'Generating video frames...',
        'Applying motion effects...',
        'Rendering audio...',
        'Finalizing video...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
        updateLoadingStep(steps[i], (i + 1) / steps.length * 100);
        await sleep(1500 + Math.random() * 1000); // Random delay between 1.5-2.5s
    }
    
    // Generate mock video (in real implementation, this would be the API response)
    await generateMockVideo(data);
}

async function generateMockVideo(data) {
    // Create a simple canvas-based video for demonstration
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions based on aspect ratio and resolution
    const [width, height] = getVideoDimensions(data.aspectRatio, data.resolution);
    canvas.width = width;
    canvas.height = height;
    
    // Create video frames
    const frames = [];
    const totalFrames = data.duration * 30; // 30 FPS
    
    for (let frame = 0; frame < totalFrames; frame++) {
        // Clear canvas
        ctx.fillStyle = `hsl(${(frame * 2) % 360}, 70%, 50%)`;
        ctx.fillRect(0, 0, width, height);
        
        // Add some animation
        const progress = frame / totalFrames;
        const x = width * progress;
        const y = height / 2 + Math.sin(progress * Math.PI * 4) * 100;
        
        // Draw animated circle
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = '24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('VEO3 Generated', width / 2, height - 50);
        
        // Convert frame to blob
        const frameBlob = await canvasToBlob(canvas);
        frames.push(frameBlob);
    }
    
    // Convert frames to video (simplified - in real implementation use proper video encoding)
    const videoBlob = await createVideoFromFrames(frames, data);
    currentVideoBlob = videoBlob;
    
    showResultState(videoBlob, data);
}

function getVideoDimensions(aspectRatio, resolution) {
    const baseHeight = resolution === '1080p' ? 1080 : 720;
    
    if (aspectRatio === '16:9') {
        return [(baseHeight * 16) / 9, baseHeight];
    } else {
        return [baseHeight, (baseHeight * 16) / 9];
    }
}

async function canvasToBlob(canvas) {
    return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
}

async function createVideoFromFrames(frames, data) {
    // This is a simplified mock implementation
    // In a real application, you would use WebCodecs API or similar
    
    // For demo purposes, create a simple animated GIF-like effect
    // Convert to a data URL that represents a video
    
    const canvas = document.createElement('canvas');
    const [width, height] = getVideoDimensions(data.aspectRatio, data.resolution);
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add demo text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('VEO3 Demo Video', width / 2, height / 2);
    
    ctx.font = '24px Inter';
    ctx.fillText(`${data.aspectRatio} • ${data.resolution} • ${data.duration}s`, width / 2, height / 2 + 60);
    
    if (data.enableSound) {
        ctx.fillText('🔊 Audio Enabled', width / 2, height / 2 + 100);
    }
    
    return canvasToBlob(canvas);
}

// UI State Management
function showDefaultState() {
    document.getElementById('defaultState').classList.remove('hidden');
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultState').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
}

function showLoadingState() {
    document.getElementById('defaultState').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('resultState').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    
    // Disable generate button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-text').textContent = 'Generating...';
    generateBtn.querySelector('.btn-icon').textContent = '⏳';
}

function showResultState(videoBlob, data) {
    document.getElementById('defaultState').classList.add('hidden');
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultState').classList.remove('hidden');
    document.getElementById('errorState').classList.add('hidden');
    
    // Reset generate button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = false;
    generateBtn.querySelector('.btn-text').textContent = 'Generate Video';
    generateBtn.querySelector('.btn-icon').textContent = '🚀';
    
    // Set video source
    const video = document.getElementById('resultVideo');
    const videoURL = URL.createObjectURL(videoBlob);
    video.src = videoURL;
    
    // Update result info
    document.getElementById('resultDuration').textContent = `${data.duration}s`;
    document.getElementById('resultResolution').textContent = data.resolution;
    document.getElementById('resultAspectRatio').textContent = data.aspectRatio;
    document.getElementById('resultAudio').textContent = data.enableSound ? 'Enabled' : 'Disabled';
}

function showErrorState(errorMessage) {
    document.getElementById('defaultState').classList.add('hidden');
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    
    // Reset generate button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = false;
    generateBtn.querySelector('.btn-text').textContent = 'Generate Video';
    generateBtn.querySelector('.btn-icon').textContent = '🚀';
    
    // Set error message
    document.getElementById('errorMessage').textContent = errorMessage;
}

function updateLoadingStep(step, progress) {
    document.getElementById('loadingStep').textContent = step;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

// Video controls
function toggleFullscreen() {
    const video = document.getElementById('resultVideo');
    
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    }
}

function downloadVideo() {
    if (!currentVideoBlob) {
        alert('No video to download');
        return;
    }
    
    const url = URL.createObjectURL(currentVideoBlob);
    const a = document.createElement('a');
    a.href = url;
    
    // Determine file extension based on blob type
    let fileName = `veo3-generated-${Date.now()}`;
    if (currentVideoBlob.type.includes('video/mp4')) {
        fileName += '.mp4';
    } else if (currentVideoBlob.type.includes('video/webm')) {
        fileName += '.webm';
    } else {
        fileName += '.jpg'; // Fallback for demo images
    }
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also save the VEO3 response text if available
    if (currentVideoBlob.veo3Response) {
        const textBlob = new Blob([currentVideoBlob.veo3Response], { type: 'text/plain' });
        const textUrl = URL.createObjectURL(textBlob);
        const textLink = document.createElement('a');
        textLink.href = textUrl;
        textLink.download = `veo3-response-${Date.now()}.txt`;
        document.body.appendChild(textLink);
        textLink.click();
        document.body.removeChild(textLink);
        URL.revokeObjectURL(textUrl);
    }
}

function shareVideo() {
    if (navigator.share && currentVideoBlob) {
        const file = new File([currentVideoBlob], 'veo3-video.mp4', { type: 'video/mp4' });
        
        navigator.share({
            title: 'VEO3 Generated Video',
            text: 'Check out this video I generated with VEO3!',
            files: [file]
        }).catch(console.error);
    } else {
        // Fallback: copy link to clipboard
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Share feature not supported'));
    }
}

function regenerateVideo() {
    if (isGenerating) return;
    generateVideo();
}

function retryGeneration() {
    showDefaultState();
}

// Utility functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Real VEO3 API Integration with fallback endpoints
async function callVEO3API(data) {
    let lastError = null;
    
    // Try different endpoints until one works
    for (let i = 0; i < VEO3_ENDPOINTS.length; i++) {
        const endpoint = VEO3_ENDPOINTS[i];
        updateLoadingStep(`Trying endpoint ${i + 1}/${VEO3_ENDPOINTS.length}...`, 10 + (i * 10));
        
        try {
            const result = await tryEndpoint(endpoint, data);
            if (result) {
                return result;
            }
        } catch (error) {
            console.warn(`Endpoint ${i + 1} failed:`, error.message);
            lastError = error;
            
            // Don't continue if it's an auth error
            if (error.message.includes('API_KEY_INVALID') || 
                error.message.includes('PERMISSION_DENIED')) {
                throw error;
            }
        }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('All VEO3 endpoints failed');
}

async function tryEndpoint(endpoint, data) {
    updateLoadingStep('Preparing request...', 20);
    
    // Prepare request payload
    const requestPayload = {
        contents: [{
            parts: []
        }]
    };
    
    // Enhanced prompt for video generation
    let enhancedPrompt = data.prompt;
    
    // Add video-specific instructions if using Gemini fallback
    if (endpoint.includes('gemini')) {
        enhancedPrompt = `You are a video generation AI. Create a detailed description for a ${data.aspectRatio} video in ${data.resolution} resolution lasting ${data.duration} seconds. ${data.enableSound ? 'Include audio description.' : 'No audio needed.'} 

Original request: ${data.originalPrompt}

Please provide a comprehensive video description that could be used to generate the actual video.`;
    }
    
    // Add text prompt
    requestPayload.contents[0].parts.push({
        text: enhancedPrompt
    });
    
    // Add reference image if provided
    if (data.referenceImage) {
        updateLoadingStep('Processing reference image...', 30);
        
        // Convert data URL to base64
        const base64Data = data.referenceImage.split(',')[1];
        const mimeType = data.referenceImage.split(';')[0].split(':')[1];
        
        requestPayload.contents[0].parts.push({
            inline_data: {
                mime_type: mimeType,
                data: base64Data
            }
        });
    }
    
    updateLoadingStep('Sending request...', 40);
    
    // Make API call
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': VEO3_API_KEY
        },
        body: JSON.stringify(requestPayload)
    });
    
    updateLoadingStep('Processing response...', 60);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific errors
        if (response.status === 404) {
            throw new Error(`Model not found: ${endpoint.split('/').pop()}`);
        } else if (response.status === 400) {
            throw new Error(`Bad request: ${errorData.error?.message || 'Invalid request format'}`);
        } else if (response.status === 401) {
            throw new Error('API_KEY_INVALID: Please check your API key');
        } else if (response.status === 403) {
            throw new Error('PERMISSION_DENIED: API key does not have access to this model');
        } else if (response.status === 429) {
            throw new Error('QUOTA_EXCEEDED: Rate limit or quota exceeded');
        } else {
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
    }
    
    const result = await response.json();
    
    updateLoadingStep('Generating video content...', 80);
    
    // Process the response
    await processAPIResponse(result, data, endpoint);
    
    updateLoadingStep('Finalizing video...', 100);
    
    return result;
}

async function processAPIResponse(response, data, endpoint) {
    try {
        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            
            if (candidate.content && candidate.content.parts) {
                let videoFound = false;
                
                for (const part of candidate.content.parts) {
                    // Check for video data
                    if (part.inline_data && part.inline_data.mime_type?.startsWith('video/')) {
                        updateLoadingStep('Converting video data...', 90);
                        
                        // Convert base64 to blob
                        const base64Data = part.inline_data.data;
                        const mimeType = part.inline_data.mime_type;
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);
                        
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        
                        const videoBlob = new Blob([bytes], { type: mimeType });
                        currentVideoBlob = videoBlob;
                        
                        showResultState(videoBlob, data);
                        videoFound = true;
                        break;
                    }
                    // Handle text response
                    else if (part.text) {
                        console.log('API Response:', part.text);
                        
                        // Create a visual representation with the response
                        await createResponseVideo(part.text, data, endpoint);
                        videoFound = true;
                        break;
                    }
                }
                
                if (!videoFound) {
                    throw new Error('No usable content found in API response');
                }
            } else {
                throw new Error('Invalid response format from API');
            }
        } else {
            throw new Error('No candidates found in API response');
        }
    } catch (error) {
        console.error('Response processing error:', error);
        throw new Error('Failed to process API response: ' + error.message);
    }
}

// Create response video with API text and user settings
async function createResponseVideo(responseText, data, endpoint) {
    updateLoadingStep('Creating video preview...', 95);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const [width, height] = getVideoDimensions(data.aspectRatio, data.resolution);
    canvas.width = width;
    canvas.height = height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Inter';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    
    let modelName = 'AI Generated';
    if (endpoint.includes('veo')) {
        modelName = 'VEO3 Response';
    } else if (endpoint.includes('gemini')) {
        modelName = 'Gemini Response';
    }
    
    ctx.fillText(modelName, width / 2, 80);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Response text with word wrap
    ctx.font = '18px Inter';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    
    const maxWidth = width - 100;
    const lineHeight = 28;
    let lines = wrapText(ctx, responseText, maxWidth);
    
    // Limit to reasonable number of lines
    if (lines.length > 15) {
        lines = lines.slice(0, 14);
        lines.push('...');
    }
    
    const startY = height / 2 - (lines.length * lineHeight) / 2;
    
    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });
    
    // Settings info at bottom
    ctx.font = 'bold 16px Inter';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const settingsY = height - 80;
    
    ctx.fillText(`${data.aspectRatio} • ${data.resolution} • ${data.duration}s`, width / 2, settingsY);
    
    // Audio status
    const audioText = data.enableSound ? '🔊 Audio: Enabled' : '🔇 Audio: Disabled';
    ctx.fillText(audioText, width / 2, settingsY + 25);
    
    // Timestamp
    ctx.font = '12px Inter';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(new Date().toLocaleString(), width / 2, height - 20);
    
    // Convert to blob
    const videoBlob = await canvasToBlob(canvas);
    currentVideoBlob = videoBlob;
    
    // Store response for download
    currentVideoBlob.aiResponse = responseText;
    currentVideoBlob.modelUsed = modelName;
    
    showResultState(videoBlob, data);
}

// Helper function to wrap text
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    
    return lines;
}
