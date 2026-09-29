import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Upload,
  Play,
  Download,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';

export const VeoVideoGenerator: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState<string>(
    'Veterinary gait analysis: Cow walking at a steady pace across green pasture, showing smooth leg flexion, hoof placement, and healthy posture.'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Clean up poll on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const loadPreset = (presetType: string) => {
    setErrorMsg(null);
    setVideoBlobUrl(null);
    if (presetType === 'gait') {
      setPrompt(
        'High-speed veterinary gait analysis of this cow moving in a barn corridor, highlighting joint flexion, weight bearing, and locomotion scoring.'
      );
      setAspectRatio('16:9');
    } else if (presetType === 'grazing') {
      setPrompt(
        'Cinematic portrait video of livestock grazing quietly in rolling morning mist pasture, showing rumination jaw movement and calm ear flicking.'
      );
      setAspectRatio('9:16');
    } else if (presetType === 'swine') {
      setPrompt(
        'Observational camera footage of pigs exploring clean straw bedding, demonstrating active foraging locomotion and social herd interaction.'
      );
      setAspectRatio('16:9');
    }
  };

  const startVideoGeneration = async () => {
    if (!imageBase64 && !prompt) {
      setErrorMsg('Please upload an image or provide a descriptive prompt.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setVideoBlobUrl(null);
    setGenerationPhase('Initializing Veo 3.1 neural video diffusion pipeline...');

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64 || undefined,
          imageMimeType,
          prompt,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to start video generation');
      }

      const data = await res.json();
      const opName = data.operationName;
      setOperationName(opName);
      setGenerationPhase('Rendering motion vectors and temporal continuity frames...');

      // Start polling
      pollVideoStatus(opName);
    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      setErrorMsg(err.message || 'Error initiating video generation');
    }
  };

  const pollVideoStatus = (opName: string) => {
    let attempt = 0;
    const progressMessages = [
      'Rendering temporal consistency & animal posture kinematics...',
      'Synthesizing realistic muscle movement and joint mechanics...',
      'Applying high-fidelity lighting and environmental depth...',
      'Finalizing H.264 encode and motion smoothing...',
    ];

    pollIntervalRef.current = setInterval(async () => {
      attempt++;
      setGenerationPhase(progressMessages[attempt % progressMessages.length]);

      try {
        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!statusRes.ok) return;

        const statusData = await statusRes.json();
        if (statusData.done) {
          clearInterval(pollIntervalRef.current);
          if (statusData.error) {
            throw new Error(statusData.error.message || 'Video generation failed');
          }

          setGenerationPhase('Downloading completed video stream...');
          await downloadVideo(opName);
        }
      } catch (pollErr: any) {
        clearInterval(pollIntervalRef.current);
        setIsGenerating(false);
        setErrorMsg(pollErr.message || 'Error during video processing');
      }
    }, 7000);
  };

  const downloadVideo = async (opName: string) => {
    try {
      const dlRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!dlRes.ok) {
        throw new Error('Failed to retrieve video stream');
      }

      const blob = await dlRes.blob();
      const url = URL.createObjectURL(blob);
      setVideoBlobUrl(url);
      setIsGenerating(false);
      setGenerationPhase('Video generation complete!');
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err.message || 'Error downloading video');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <Film className="w-4 h-4" />
              <span>Veo 3.1 Fast Video Kinematics Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Animate Still Photos into Dynamic Gait & Behavior Video
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Transform still clinical images of livestock into temporal videos using{' '}
              <span className="text-indigo-300 font-mono font-semibold">
                veo-3.1-fast-generate-preview
              </span>{' '}
              for gait scoring, lameness kinematics, and behavioral simulations.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Sample Motion:</span>
            <button
              onClick={() => loadPreset('gait')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 transition-all"
            >
              Cattle Gait Scoring (16:9)
            </button>
            <button
              onClick={() => loadPreset('grazing')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-all"
            >
              Pasture Rumination (9:16)
            </button>
            <button
              onClick={() => loadPreset('swine')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 transition-all"
            >
              Swine Locomotion (16:9)
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Image Upload & Aspect Ratio */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Source Image (Upload Animal Photo)</span>
                {imageBase64 && (
                  <button
                    onClick={() => setImageBase64(null)}
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Remove image
                  </button>
                )}
              </label>

              {imageBase64 ? (
                <div className="relative rounded-xl overflow-hidden border border-indigo-500/50 max-h-56 group">
                  <img
                    src={imageBase64}
                    alt="Source for Veo"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-indigo-500/40">
                      Ready for Veo 3.1 Kinematics
                    </span>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/40">
                  <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-200">
                    Upload Still Photo to Animate
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Cattle, swine, sheep, goats, poultry (JPG, PNG, WebP)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Aspect Ratio Selector (Mandatory requirement: 16:9 or 9:16) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Video Aspect Ratio (Required)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-950'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>16:9 Landscape (Desktop & Arena Monitor)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-950'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4 rotate-90" />
                  <span>9:16 Portrait (Mobile & Handheld Scanner)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Prompt & Video Generation Controls */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Movement Description & Behavioral Prompt
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                  placeholder="Specify movement kinematics (e.g., gait stride, neck curvature, chewing, trotting across pasture)..."
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Veo 3.1 Kinematics Capability</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Veo synthesizes fluid locomotion from static posture snapshots, enabling farm
                  teams to visualize potential musculoskeletal limping, hoof soreness, or behavioral
                  restlessness before committing to hands-on chute restraining.
                </p>
              </div>
            </div>

            {/* Generate Action Button */}
            <div>
              <button
                onClick={startVideoGeneration}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition-all shadow-lg shadow-indigo-950 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Veo 3.1 Neural Video...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Generate Video with Veo 3.1 ({aspectRatio})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading Progress State */}
        {isGenerating && (
          <div className="mt-6 p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/80 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-900/60 border border-indigo-700 animate-pulse">
              <Film className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Veo Video Generation in Progress</h4>
              <p className="text-xs text-indigo-300 font-medium mt-1">{generationPhase}</p>
              <p className="text-[11px] text-slate-400 mt-2 max-w-md mx-auto">
                Diffusion video generation computes hundreds of temporal frames. This typically takes 30-90 seconds. Your browser will automatically update once the video stream is ready!
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Video Playback Display */}
      {videoBlobUrl && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-base">Generated Veo 3.1 Video</h3>
                <span className="text-[11px] text-slate-400">
                  Aspect Ratio: {aspectRatio} • Model: veo-3.1-fast-generate-preview
                </span>
              </div>
            </div>

            <a
              href={videoBlobUrl}
              download={`livestock-gait-${Date.now()}.mp4`}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center space-x-1.5 shadow-md self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </a>
          </div>

          <div className="flex justify-center bg-black/60 rounded-xl overflow-hidden p-2">
            <video
              src={videoBlobUrl}
              controls
              autoPlay
              loop
              className={`rounded-lg max-h-[500px] object-contain shadow-2xl ${
                aspectRatio === '9:16' ? 'w-auto' : 'w-full'
              }`}
            />
          </div>

          <p className="text-xs text-slate-400 text-center">
            Review joint range-of-motion, stance duration, and gait symmetry for early musculoskeletal or hoof lesions.
          </p>
        </div>
      )}
    </div>
  );
};
