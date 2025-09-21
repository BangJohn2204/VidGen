
import React, { useState, useCallback } from 'react';
import { AspectRatio, Resolution, VideoGenerationParams } from './types';
import { generateVideo } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import LoadingIndicator from './components/LoadingIndicator';
import VideoPlayer from './components/VideoPlayer';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const Toggle: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
  <button
    type="button"
    className={`${enabled ? 'bg-indigo-600' : 'bg-slate-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500`}
    onClick={() => setEnabled(!enabled)}
  >
    <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
  </button>
);

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [withSound, setWithSound] = useState<boolean>(true);
  const [resolution, setResolution] = useState<Resolution>('1080p');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
  }, []);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate a video.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setLastPrompt(prompt);

    try {
      const params: VideoGenerationParams = {
        prompt,
        aspectRatio,
        withSound,
        resolution,
      };

      if (imageFile) {
        params.image = {
          data: await fileToBase64(imageFile),
          mimeType: imageFile.type,
        };
      }

      const videoUrl = await generateVideo(params);
      setGeneratedVideoUrl(videoUrl);

    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <main className="mt-8 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Prompt and Image */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
                    Your Prompt
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A neon hologram of a cat driving a sports car at top speed on a rainbow road"
                    rows={5}
                    className="mt-1 block w-full bg-slate-900/50 border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-200 placeholder-slate-500 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <ImageUploader onImageChange={handleImageChange} />
              </div>

              {/* Right Column: Settings */}
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-sm font-medium text-slate-300">Aspect Ratio</legend>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {(['16:9', '9:16'] as AspectRatio[]).map((ar) => (
                      <button key={ar} onClick={() => setAspectRatio(ar)} disabled={isLoading} className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${aspectRatio === ar ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        {ar}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-medium text-slate-300">Resolution</legend>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {(['720p', '1080p'] as Resolution[]).map((res) => (
                       <button key={res} onClick={() => setResolution(res)} disabled={isLoading} className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${resolution === res ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600'}`}>
                        {res}
                      </button>
                    ))}
                  </div>
                </fieldset>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Include Sound</span>
                  <Toggle enabled={withSound} setEnabled={setWithSound} />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <button
                onClick={handleGenerateVideo}
                disabled={isLoading || !prompt.trim()}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
              >
                {isLoading ? 'Generating...' : 'Generate Video'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 4.372A1 1 0 0116 5.175v9.65a1 1 0 01-1.447.894L12 13.431V6.57l2.553-2.198z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-10">
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">{error}</div>}
            {isLoading && <LoadingIndicator />}
            {generatedVideoUrl && <VideoPlayer videoUrl={generatedVideoUrl} prompt={lastPrompt} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
