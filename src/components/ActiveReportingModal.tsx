import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  AlertTriangle, 
  Trees, 
  Waves, 
  Recycle, 
  Info,
  Loader2,
  Crosshair,
  Compass,
  RotateCcw,
  Image as ImageIcon,
  Mic,
  MicOff,
  Radio,
  Volume2,
  Square,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CitizenReport, ReportCategory, AIAnalysisResult, Coordinates, LiveLocationState } from '../types';
import { GMC_SECTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';
import { formatCoordinates } from '../utils/geo';
import { CameraCaptureView } from './CameraCaptureView';

interface ActiveReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: CitizenReport) => void;
  userName: string;
  initialCoordinates?: Coordinates;
  initialSector?: string;
  userLocation?: LiveLocationState;
}

const SAMPLE_PRESETS = [
  {
    title: "Golden Langur Family in Canopy Corridor",
    category: "wildlife" as ReportCategory,
    sector: "Sector 2: Mao River Watershed & Riparian Corridor",
    locationName: "Canopy Rope Bridge 14",
    photoUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80",
    description: "Spotted a troop of 5 Golden Langurs with a juvenile peacefully crossing the bamboo rope way."
  },
  {
    title: "Himalayan Cypress Grove Sapling Regeneration",
    category: "forestry" as ReportCategory,
    sector: "Sector 6: Sarpang Dzongkhag Heritage Forest",
    locationName: "Sacred Cypress Ridge Trail",
    photoUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    description: "Inspected native weeping cypress stand. 18 saplings growing vigorous with optimal humus mulch."
  },
  {
    title: "Municipal Solar Lamp & Rain Cistern Inspection",
    category: "municipal" as ReportCategory,
    sector: "Sector 1: Mindfulness Spine",
    locationName: "Promenade Eco-Kiosk 3",
    photoUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    description: "Public filtered water tap flowing clear with optimal pressure; solar battery charged at 100%."
  },
  {
    title: "Organic Red Rice Terrace Water Distribution",
    category: "agriculture" as ReportCategory,
    sector: "Sector 4: Agri-Tech & Permaculture Terraces",
    locationName: "Terrace 7 Bio-Gravity Aqueduct",
    photoUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    description: "Terrace irrigation channels checked. Even 5cm biological water layer maintained for organic rice."
  },
  {
    title: "Pasture Corridor Indigenous Cattle Grazing",
    category: "livestock" as ReportCategory,
    sector: "Sector 5: Royal Heritage & Cultural Sanctuary",
    locationName: "Upper Pasture Buffer Gate 2",
    photoUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80",
    description: "Local Siri cattle grazing harmoniously within pasture fence. Bio-acoustic elephant deterrent verified active."
  },
  {
    title: "River Driftwood Debris at Mao Fish Sieve",
    category: "watershed" as ReportCategory,
    sector: "Sector 2: Mao River Watershed & Riparian Corridor",
    locationName: "Mao River Silt Sieve Station",
    photoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    description: "Heavy mountain runoff washed fallen branches into the downstream fish ladder bypass."
  }
];

export const ActiveReportingModal: React.FC<ActiveReportingModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  userName,
  initialCoordinates,
  initialSector,
  userLocation,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('wildlife');
  const [sector, setSector] = useState(initialSector || GMC_SECTORS[1].name);
  const [locationName, setLocationName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Real-time geocoordinates
  const [reportCoords, setReportCoords] = useState<Coordinates>(() => {
    if (initialCoordinates) return initialCoordinates;
    if (userLocation?.coords) return userLocation.coords;
    return { lat: 26.8858, lng: 90.5015 };
  });
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Voice-to-Text State via Browser SpeechRecognition API
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceTarget, setVoiceTarget] = useState<'description' | 'title'>('description');
  const [speechLanguage, setSpeechLanguage] = useState<'en-US' | 'en-GB' | 'en-IN'>('en-US');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeech = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
      setSpeechSupported(hasSpeech);
    }
  }, []);

  // Ensure recognition is stopped when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const stopVoiceDictation = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
    // Commit any remaining interim text
    if (interimTranscript.trim()) {
      const remaining = interimTranscript.trim();
      if (voiceTarget === 'title') {
        setTitle(prev => (prev ? `${prev} ${remaining}` : remaining));
      } else {
        setDescription(prev => (prev ? `${prev} ${remaining}` : remaining));
      }
      setInterimTranscript('');
    }
    setIsListening(false);
    playMindfulChime('bell');
  };

  const startVoiceDictation = (target: 'description' | 'title' = 'description') => {
    setVoiceTarget(target);
    setSpeechError(null);

    const SpeechRecognitionClass = 
      (typeof window !== 'undefined' && 
       ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

    if (!SpeechRecognitionClass) {
      setSpeechError('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        playMindfulChime('karma');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        setInterimTranscript(currentInterim);

        if (currentFinal.trim()) {
          const newPhrase = currentFinal.trim();
          if (target === 'title') {
            setTitle(prev => {
              const combined = prev ? `${prev.trim()} ${newPhrase}` : newPhrase;
              return combined.charAt(0).toUpperCase() + combined.slice(1);
            });
          } else {
            setDescription(prev => {
              const combined = prev ? `${prev.trim()} ${newPhrase}` : newPhrase;
              return combined.charAt(0).toUpperCase() + combined.slice(1);
            });
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone access denied. Please enable microphone permissions in your browser.');
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Microphone is active and listening for your voice.');
        } else if (event.error === 'network') {
          setSpeechError('Network connectivity interrupted voice transcription. You can continue typing directly.');
          setIsListening(false);
        } else if (event.error !== 'aborted') {
          setSpeechError(`Voice notice: ${event.error}`);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setSpeechError('Could not initialize microphone speech recognition.');
      setIsListening(false);
    }
  };

  const toggleVoiceDictation = (target: 'description' | 'title' = 'description') => {
    if (isListening) {
      if (voiceTarget === target) {
        stopVoiceDictation();
      } else {
        stopVoiceDictation();
        setTimeout(() => startVoiceDictation(target), 200);
      }
    } else {
      startVoiceDictation(target);
    }
  };

  const handleModalClose = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimTranscript('');
    onClose();
  };

  useEffect(() => {
    if (initialCoordinates) {
      setReportCoords(initialCoordinates);
    } else if (userLocation?.coords) {
      setReportCoords(userLocation.coords);
    }
  }, [initialCoordinates, userLocation]);

  useEffect(() => {
    if (initialSector) {
      setSector(initialSector);
    }
  }, [initialSector]);

  if (!isOpen) return null;

  const handleFetchCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setReportCoords(coords);
        setIsLocatingGPS(false);
        playMindfulChime('bell');
      },
      (err) => {
        console.warn('GPS acquire error:', err);
        setIsLocatingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setSector(preset.sector);
    setLocationName(preset.locationName);
    setPhotoUrl(preset.photoUrl);
    setDescription(preset.description);
    triggerAIAnalysis(preset.title, preset.description, preset.category, preset.photoUrl, preset.locationName);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoUrl(base64);
        triggerAIAnalysis(title, description, category, base64, locationName);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCaptured = (capturedBase64: string) => {
    setPhotoUrl(capturedBase64);
    setIsCameraOpen(false);
    triggerAIAnalysis(title, description, category, capturedBase64, locationName);
  };

  const triggerAIAnalysis = async (
    t = title, 
    d = description, 
    c = category, 
    img = photoUrl, 
    loc = locationName
  ) => {
    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: t,
          description: d,
          category: c,
          base64Image: img.startsWith('data:') ? img : undefined,
          locationName: loc || sector
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAiAnalysis(data.analysis);
          return;
        }
      }
    } catch (err) {
      console.warn("AI analysis network fetch, using immediate mindful reflection:", err);
    } finally {
      setIsAnalyzingAI(false);
    }

    // Client-side fallback if network or endpoint was unavailable
    setAiAnalysis({
      verifiedCategory: c === 'wildlife' ? 'Wildlife & Fauna' : c === 'watershed' ? 'Watershed & River Health' : 'Ecological Stewardship',
      speciesOrItemIdentified: t || 'GMC Verified Observation',
      ecologicalImpactScore: c === 'wildlife' ? 95 : 88,
      suggestedKarmaPoints: c === 'wildlife' ? 90 : 65,
      urgencyLevel: 'Normal',
      mindfulReflection: 'Your mindful observation fosters harmonious balance across the Gelephu valley.',
      actionableRecommendations: [
        'Logged into City Pulse real-time stream',
        'Allocated to district eco-wardens for routine check'
      ],
      biodiversityIndexContribution: '+0.15% Corridor Health',
      carbonCircularityNote: 'Zero-waste verification logged in GMC Ledger.'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const points = aiAnalysis ? aiAnalysis.suggestedKarmaPoints : (category === 'wildlife' ? 90 : 60);

    const newReport: CitizenReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      description: description.trim() || 'Mindful citizen observation logged into GMC Geo-Repository.',
      category,
      sector,
      locationName: locationName.trim() || `${sector} Zone`,
      coordinates: reportCoords,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      status: 'pending',
      timestamp: 'Just now',
      reporterName: isAnonymous ? 'Anonymous Steward' : userName,
      isAnonymous,
      pointsAwarded: points,
      upvotes: 1,
      userUpvoted: true,
      aiAnalysis: aiAnalysis || {
        verifiedCategory: category,
        speciesOrItemIdentified: title,
        ecologicalImpactScore: 88,
        suggestedKarmaPoints: points,
        urgencyLevel: 'Normal',
        mindfulReflection: 'Your mindful observation fosters harmonious balance across Gelephu.',
        actionableRecommendations: [
          'Logged into City Pulse real-time stream',
          'Allocated to district eco-wardens'
        ],
        biodiversityIndexContribution: '+0.15% Corridor Health',
        carbonCircularityNote: 'Zero-waste verification logged.'
      }
    };

    if (isListening) {
      stopVoiceDictation();
    }

    // Confetti & celebratory audio
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#52b788', '#d8f3dc', '#f4a261', '#1b4332']
    });
    playMindfulChime('karma');

    onSubmitReport(newReport);
    handleModalClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#2d6a4f]/20 max-h-[92dvh] overflow-y-auto my-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold shrink-0">
              📸
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-[#1b4332] truncate">Citizen Steward Observation Studio</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">Report wildlife, hazards, or waste for GMC Karma</p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          
          {/* Quick Sample Presets Bar */}
          <div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              ⚡ Quick Simulation Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2 text-left rounded-xl bg-[#f8f9f6] hover:bg-[#d8f3dc]/50 border border-gray-200 text-xs font-semibold text-[#1b4332] transition line-clamp-2"
                >
                  {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}...
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload & AI Scan Section */}
          <div className="p-4 rounded-2xl bg-[#f8f9f6] border border-dashed border-[#52b788]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1b4332] flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-[#2d6a4f]" />
                <span>Observation Photo & Ecological Vision AI</span>
              </span>

              {photoUrl && (
                <button
                  type="button"
                  onClick={() => triggerAIAnalysis()}
                  disabled={isAnalyzingAI}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#52b788] text-[11px] font-bold text-[#2d6a4f] flex items-center space-x-1 hover:bg-[#d8f3dc]/40 transition"
                >
                  <Sparkles className="w-3 h-3 text-[#f4a261]" />
                  <span>{isAnalyzingAI ? 'Scanning...' : 'Scan with Gemini AI'}</span>
                </button>
              )}
            </div>

            {photoUrl ? (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 group bg-black/5">
                  <img
                    src={photoUrl}
                    alt="Captured observation"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#1b4332]/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-[#52b788]" />
                    <span>Photo Attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPhotoUrl(''); setAiAnalysis(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition shadow-md"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-[#52b788] text-[#1b4332] hover:bg-[#d8f3dc]/40 text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#2d6a4f]" />
                    <span>Click New Picture</span>
                  </button>

                  <label className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition flex items-center justify-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Change File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-5 px-4 text-center bg-white rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#1b4332]">Capture or Upload Photo</h4>
                  <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                    Click a live photo with your camera or select from device for automatic species identification & karma bonus.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
                  {/* Big Primary Click Picture Button */}
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-extrabold shadow-sm transition flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4 text-[#52b788]" />
                    <span>Click Picture (Live Camera)</span>
                  </button>

                  {/* Upload from Gallery / Files */}
                  <label className="px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer transition flex items-center space-x-1.5 border border-gray-200">
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Mobile Direct Camera Trigger */}
                  <label className="px-3.5 py-2.5 rounded-xl bg-[#d8f3dc] hover:bg-[#b7e4c7] text-[#1b4332] text-xs font-bold cursor-pointer transition flex items-center space-x-1.5 sm:hidden">
                    <Camera className="w-3.5 h-3.5 text-[#1b4332]" />
                    <span>Device Lens</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* AI Analysis Result Card */}
            {isAnalyzingAI && (
              <div className="p-3 rounded-xl bg-white border border-[#52b788] flex items-center space-x-3 text-xs text-[#1b4332]">
                <Loader2 className="w-4 h-4 text-[#2d6a4f] animate-spin" />
                <span>Gemini Ecological AI is analyzing species taxonomy and karmic impact...</span>
              </div>
            )}

            {aiAnalysis && !isAnalyzingAI && (
              <div className="p-3.5 rounded-xl bg-white border border-[#52b788] shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1b4332] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
                    <span>AI Verified: {aiAnalysis.speciesOrItemIdentified}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#d8f3dc] text-[#1b4332] font-extrabold text-[10px]">
                    +{aiAnalysis.suggestedKarmaPoints} Karma Points
                  </span>
                </div>

                <p className="text-gray-600 italic">"{aiAnalysis.mindfulReflection}"</p>

                <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">Impact: {aiAnalysis.ecologicalImpactScore}/100</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">Biosphere: {aiAnalysis.biodiversityIndexContribution}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">Urgency: {aiAnalysis.urgencyLevel}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1b4332]">Observation Title *</label>
                {speechSupported && (
                  <button
                    type="button"
                    onClick={() => toggleVoiceDictation('title')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 transition border ${
                      isListening && voiceTarget === 'title'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                        : 'bg-white text-[#2d6a4f] hover:bg-[#d8f3dc]/60 border-[#52b788]/40'
                    }`}
                    title="Narrate title using your voice"
                  >
                    <Mic className={`w-3 h-3 ${isListening && voiceTarget === 'title' ? 'text-rose-600 animate-pulse' : 'text-[#2d6a4f]'}`} />
                    <span>{isListening && voiceTarget === 'title' ? 'Listening...' : 'Voice Title'}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Golden Langur Troop crossing overpass"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1b4332]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
              >
                <option value="wildlife">🐾 Wildlife & Biodiversity Observation</option>
                <option value="forestry">🌲 Forestry Sectors & Canopy Stewardship</option>
                <option value="municipal">🏛️ Municipal Sectors & Public Services</option>
                <option value="agriculture">🌾 Agriculture & Permaculture Terraces</option>
                <option value="livestock">🐂 Livestock, Pastures & Coexistence</option>
                <option value="watershed">🌊 Watershed & Mao River Health</option>
                <option value="waste">♻️ Circular Waste / Litter Recovery</option>
                <option value="hazard">⚠️ Environmental / Forest Hazard</option>
                <option value="infrastructure">⚡ Clean Energy & Bridge Grid</option>
                <option value="botanical">🌿 Botanical & Rare Flora</option>
              </select>
            </div>

            {/* Sector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1b4332]">GMC District Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
              >
                {GMC_SECTORS.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Specific Location Landmark */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-[#1b4332]">Specific Landmark / Bridge / Trail</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Bridge 14 Canopy Rope Corridor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>

            {/* Real-time Geocoordinates Capture Bar */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-[#f8f9f6] border border-[#d8f3dc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b4332] flex items-center space-x-1.5">
                  <Crosshair className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Real-Time Geocoordinate Tag</span>
                </span>

                <button
                  type="button"
                  onClick={handleFetchCurrentGPS}
                  disabled={isLocatingGPS}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#52b788] text-[11px] font-bold text-[#1b4332] hover:bg-[#d8f3dc] transition flex items-center space-x-1 shadow-2xs"
                >
                  <Compass className="w-3.5 h-3.5 text-[#52b788]" />
                  <span>{isLocatingGPS ? 'Acquiring GPS...' : 'Fetch Live GPS'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">Latitude:</span>
                  <input
                    type="number"
                    step="0.00001"
                    value={reportCoords.lat}
                    onChange={(e) => setReportCoords(prev => ({ ...prev, lat: parseFloat(e.target.value) || prev.lat }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-mono font-bold text-gray-800 text-xs bg-white focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Longitude:</span>
                  <input
                    type="number"
                    step="0.00001"
                    value={reportCoords.lng}
                    onChange={(e) => setReportCoords(prev => ({ ...prev, lng: parseFloat(e.target.value) || prev.lng }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 font-mono font-bold text-gray-800 text-xs bg-white focus:outline-none focus:border-[#2d6a4f]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span>Formatted: <strong className="font-mono text-[#2d6a4f]">{formatCoordinates(reportCoords)}</strong></span>
                {userLocation && (
                  <span className="text-[10px] bg-[#d8f3dc] text-[#1b4332] font-semibold px-2 py-0.5 rounded-full">
                    GPS Accuracy: ±{userLocation.accuracy}m
                  </span>
                )}
              </div>
            </div>

            {/* Description & Voice-to-Text Studio */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center space-x-1.5">
                  <label className="block text-xs font-bold text-[#1b4332]">Mindful Observation Notes</label>
                  {isListening && voiceTarget === 'description' && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                      <span>Recording Voice...</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Language Selector */}
                  {speechSupported && (
                    <select
                      value={speechLanguage}
                      onChange={(e) => setSpeechLanguage(e.target.value as any)}
                      disabled={isListening}
                      className="text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5 focus:outline-none"
                      title="Dictation Language"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-IN">English (India/Bhutan)</option>
                      <option value="en-GB">English (UK)</option>
                    </select>
                  )}

                  {/* Primary Voice-to-Text Dictation Toggle Button */}
                  {speechSupported ? (
                    <button
                      type="button"
                      onClick={() => toggleVoiceDictation('description')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs ${
                        isListening && voiceTarget === 'description'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                          : 'bg-[#1b4332] hover:bg-[#2d6a4f] text-[#d8f3dc]'
                      }`}
                      title={isListening && voiceTarget === 'description' ? 'Stop voice recording' : 'Narrate your observation with microphone'}
                    >
                      {isListening && voiceTarget === 'description' ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Stop Dictation</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-[#52b788]" />
                          <span>Narrate Notes</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">
                      Voice input available on Chrome / Safari
                    </span>
                  )}
                </div>
              </div>

              {/* Active Voice Waveform & Live Interim Transcript Display */}
              {isListening && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#d8f3dc]/70 via-emerald-50 to-[#d8f3dc]/70 border border-[#52b788] animate-in fade-in duration-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-0.5 h-4 px-1.5 py-0.5 bg-white/80 rounded-md border border-emerald-200">
                        <span className="w-1 h-2.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-3.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.45s]"></span>
                        <span className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-xs font-bold text-[#1b4332]">
                        {voiceTarget === 'title' ? 'Narrating Observation Title' : 'Narrating Observation Notes'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (voiceTarget === 'description') {
                            setDescription(prev => (prev ? `${prev.trim()}. ` : ''));
                          } else {
                            setTitle(prev => (prev ? `${prev.trim()}. ` : ''));
                          }
                        }}
                        className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-semibold text-gray-700 hover:bg-gray-100"
                        title="Add period"
                      >
                        + Period (.)
                      </button>
                      <button
                        type="button"
                        onClick={stopVoiceDictation}
                        className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>

                  {/* Real-time Interim Voice Ticker */}
                  <div className="p-2 rounded-xl bg-white/90 border border-emerald-200/80 text-xs text-gray-800 font-medium min-h-[38px] flex items-center">
                    {interimTranscript ? (
                      <span className="text-emerald-900 font-semibold italic">
                        "{interimTranscript}..."
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-[11px] flex items-center space-x-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <span>Speak clearly into your microphone... (GMC Web Speech Engine is active)</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Speech Error Banner if permission denied or network failure */}
              {speechError && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start justify-between space-x-2">
                  <div className="flex items-start space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{speechError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpeechError(null)}
                    className="text-amber-700 hover:text-amber-900 text-xs font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe details, animal behaviors, river flow status, or required field assistance (or click 'Narrate Notes' above to speak)..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-[#1b4332] focus:outline-none transition ${
                    isListening && voiceTarget === 'description'
                      ? 'border-[#52b788] bg-emerald-50/20 ring-2 ring-[#52b788]/30'
                      : 'border-gray-200 focus:border-[#2d6a4f]'
                  }`}
                />

                {description && (
                  <div className="absolute bottom-2 right-2 flex items-center space-x-1.5">
                    <span className="text-[10px] text-gray-400 bg-white/80 px-1.5 py-0.5 rounded">
                      {description.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                      type="button"
                      onClick={() => setDescription('')}
                      className="text-[10px] text-gray-400 hover:text-rose-600 bg-white/80 hover:bg-white px-1.5 py-0.5 rounded border border-gray-200 transition"
                      title="Clear Notes"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Guidance Prompt Chip */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span className="flex items-center space-x-1 truncate max-w-sm">
                  <span className="text-gray-400">💡 Voice Tip:</span>
                  <span className="italic truncate text-gray-600">
                    "Observed 4 langurs crossing rope bridge near Mao River..."
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = "Observed 4 Golden Langurs safely crossing the rope overpass near Mao River. Foliage undisturbed and river flow calm.";
                    setDescription(prev => prev ? `${prev} ${sample}` : sample);
                  }}
                  className="text-[#2d6a4f] hover:underline text-[10px] font-bold shrink-0 ml-1"
                >
                  Insert Sample
                </button>
              </div>
            </div>

          </div>

          {/* Anonymity Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9f6] border border-gray-200 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🛡️</span>
              <div>
                <span className="font-bold text-[#1b4332]">Anonymous Reporting</span>
                <p className="text-[11px] text-gray-500">Hide your citizen name from the public map stream</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-[#2d6a4f] rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#081c15]" />
              <span>Submit & Earn Karma Points</span>
            </button>
          </div>

        </form>

      </div>

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <CameraCaptureView
          title="Click Citizen Observation Photo"
          onCapture={handleCameraCaptured}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};
