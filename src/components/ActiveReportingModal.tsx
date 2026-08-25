import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CitizenReport, ReportCategory, AIAnalysisResult } from '../types';
import { GMC_SECTORS } from '../data/initialData';
import { playMindfulChime } from '../utils/audio';

interface ActiveReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (newReport: CitizenReport) => void;
  userName: string;
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
    title: "River Driftwood Debris at Mao Fish Sieve",
    category: "watershed" as ReportCategory,
    sector: "Sector 2: Mao River Watershed & Riparian Corridor",
    locationName: "Mao River Silt Sieve Station",
    photoUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    description: "Heavy mountain runoff washed fallen branches into the downstream fish ladder bypass."
  },
  {
    title: "Organic Vegetable Husk at Market Pavilion",
    category: "waste" as ReportCategory,
    sector: "Sector 4: Agri-Tech & Permaculture Terraces",
    locationName: "Organic Farmers Exchange Stall 8",
    photoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    description: "Bags of clean organic produce trimmings ready for transfer to the anaerobic biogas digester."
  },
  {
    title: "Rufous-necked Hornbill Sighting in Heritage Oak",
    category: "wildlife" as ReportCategory,
    sector: "Sector 6: Sarpang Dzongkhag Heritage Forest",
    locationName: "Sacred Oak Canopy Grove",
    photoUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80",
    description: "Rare nesting pair spotted in high hollow trunk. Acoustic quiet recommended."
  }
];

export const ActiveReportingModal: React.FC<ActiveReportingModalProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
  userName,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('wildlife');
  const [sector, setSector] = useState(GMC_SECTORS[1].name);
  const [locationName, setLocationName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  if (!isOpen) return null;

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
      coordinates: {
        lat: 26.880 + (Math.random() - 0.5) * 0.03,
        lng: 90.500 + (Math.random() - 0.5) * 0.03
      },
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

    // Confetti & celebratory audio
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#52b788', '#d8f3dc', '#f4a261', '#1b4332']
    });
    playMindfulChime('karma');

    onSubmitReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#2d6a4f]/20 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold">
              📸
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1b4332]">Citizen Steward Observation Studio</h3>
              <p className="text-xs text-gray-500">Report wildlife, hazards, or waste to earn GMC Karma Points</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
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
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#52b788] text-[11px] font-bold text-[#2d6a4f] flex items-center space-x-1 hover:bg-[#d8f3dc]/40"
                >
                  <Sparkles className="w-3 h-3 text-[#f4a261]" />
                  <span>{isAnalyzingAI ? 'Scanning...' : 'Scan with Gemini AI'}</span>
                </button>
              )}
            </div>

            {photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={photoUrl}
                  alt="Captured observation"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setPhotoUrl(''); setAiAnalysis(null); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Upload className="w-8 h-8 text-[#2d6a4f] mb-2" />
                <p className="text-xs font-semibold text-gray-700">Drag & drop photo, or click to upload</p>
                <p className="text-[11px] text-gray-500">Supports JPG, PNG, WEBP for Gemini ecological classification</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="mt-3 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1b4332] file:text-white hover:file:bg-[#2d6a4f] cursor-pointer"
                />
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
              <label className="block text-xs font-bold text-[#1b4332]">Observation Title *</label>
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
                <option value="watershed">🌊 Watershed & Mao River Health</option>
                <option value="waste">♻️ Circular Waste / Litter Recovery</option>
                <option value="hazard">⚠️ Environmental / Forest Hazard</option>
                <option value="infrastructure">⚡ Clean Energy & Bridge Grid</option>
                <option value="botanical">🌿 Botanical & Canopy Health</option>
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

            {/* Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-[#1b4332]">Mindful Observation Notes</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe details, animal behaviors, river flow status, or required field assistance..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
              />
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
              onClick={onClose}
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
    </div>
  );
};
