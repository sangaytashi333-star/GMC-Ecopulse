import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Clock, 
  MapPin, 
  ShieldCheck,
  Scale,
  Trees,
  Award
} from 'lucide-react';
import { CitizenReport, ResolutionEvidence, UserProfile } from '../types';
import { playMindfulChime } from '../utils/audio';

interface FixResolutionModalProps {
  report: CitizenReport | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSubmitEvidence: (reportId: string, evidence: Omit<ResolutionEvidence, 'isApproved' | 'verifiedByOfficial' | 'verifiedAt'>) => void;
}

export const FixResolutionModal: React.FC<FixResolutionModalProps> = ({
  report,
  user,
  isOpen,
  onClose,
  onSubmitEvidence,
}) => {
  if (!isOpen || !report) return null;

  const defaultBounty = report.cleanupKarmaBonus || Math.max(150, Math.round((report.pointsAwarded || 100) * 1.8));

  const [fixDescription, setFixDescription] = useState('');
  const [wasteWeightKg, setWasteWeightKg] = useState<number>(report.category === 'waste' ? 5.5 : 0);
  const [timeSpentMins, setTimeSpentMins] = useState<number>(30);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Realistic After-Photo Evidence Presets
  const EVIDENCE_PRESETS = [
    {
      title: 'Pristine Stream & Clear Bank',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      tag: 'Watershed Clear'
    },
    {
      title: 'Sorted Circular Biomass Bags',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      tag: 'Waste Recovered'
    },
    {
      title: 'Restored Forest Trail & Flora',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      tag: 'Corridor Restored'
    },
    {
      title: 'Secured Infrastructure & Safe Walkway',
      url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      tag: 'Hazard Neutralized'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setAfterPhotoUrl(fakeUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixDescription.trim()) return;

    setIsSubmitting(true);
    playMindfulChime('karma');

    setTimeout(() => {
      onSubmitEvidence(report.id, {
        fixerName: user.name,
        fixerEmail: user.email,
        fixDescription: fixDescription.trim(),
        afterPhotoUrl,
        beforePhotoUrl: report.photoUrl,
        timestamp: 'Just now',
        wasteWeightKg: Number(wasteWeightKg) || undefined,
        proposedBonusPoints: defaultBounty
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#d8f3dc] text-[#1b4332]">
                Citizen Field Resolution
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Earn +{defaultBounty} Karma Points</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1b4332]">
              Submit Resolution & Evidence of Fix
            </h3>
            <p className="text-xs text-gray-500">
              Did you clean up this area or fix the hazard? Upload after-photos to claim your stewardship bounty.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incident Summary Pill */}
        <div className="p-4 rounded-2xl bg-[#f8f9f6] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            {report.photoUrl && (
              <img
                src={report.photoUrl}
                alt="Before condition"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
              />
            )}
            <div>
              <span className="text-[10px] font-mono uppercase text-gray-400">Incident #{report.id}</span>
              <h4 className="font-bold text-[#1b4332] text-sm line-clamp-1">{report.title}</h4>
              <p className="text-gray-500 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#52b788]" />
                <span>{report.locationName} • {report.sector}</span>
              </p>
            </div>
          </div>

          <div className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-right">
            <span className="block text-[10px] font-bold text-gray-400 uppercase">Verification Bounty</span>
            <span className="text-sm font-extrabold text-[#1b4332]">+{defaultBounty} Karma</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Fixer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#1b4332] mb-1">Steward / Fixer Name</label>
              <input
                type="text"
                disabled
                value={`${user.name} (${user.levelTitle})`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1b4332] mb-1">Estimated Time Spent</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={timeSpentMins}
                  onChange={(e) => setTimeSpentMins(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-bold text-[#1b4332] focus:outline-none"
                />
                <span className="text-gray-500 font-semibold shrink-0">Minutes</span>
              </div>
            </div>
          </div>

          {/* Quantified Metrics (if applicable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#1b4332] mb-1 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>Waste Removed / Biomass Recovered (kg)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                max={500}
                value={wasteWeightKg}
                onChange={(e) => setWasteWeightKg(Number(e.target.value))}
                placeholder="e.g. 6.5 kg of debris"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-bold text-[#1b4332] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1b4332] mb-1 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-[#52b788]" />
                <span>Disposal / Transfer Destination</span>
              </label>
              <input
                type="text"
                defaultValue="Sector 2 Circular Biomass & Recycling Center"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Description of Fix */}
          <div className="space-y-1 text-xs">
            <label className="block font-bold text-[#1b4332]">
              Resolution Description & Evidence Details *
            </label>
            <textarea
              rows={3}
              required
              value={fixDescription}
              onChange={(e) => setFixDescription(e.target.value)}
              placeholder="Describe what you cleaned or fixed (e.g., Removed 6.5 kg of discarded plastic bottles and cans from stream bed; swept surrounding pathway and deposited waste in designated compost hub)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-[#1b4332] focus:border-[#2d6a4f] focus:outline-none"
            />
          </div>

          {/* After Photo Evidence */}
          <div className="space-y-2 text-xs">
            <label className="block font-bold text-[#1b4332] flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-[#52b788]" />
                <span>"After" Photographic Proof of Cleaned Area *</span>
              </span>
              <span className="text-[11px] text-gray-400 font-normal">Required for Official HQ Verification</span>
            </label>

            {/* Photo Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#52b788] bg-[#f8f9f6] h-40 flex items-center justify-center">
                {afterPhotoUrl ? (
                  <img
                    src={afterPhotoUrl}
                    alt="After fix evidence"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 space-y-1 text-gray-400">
                    <Camera className="w-8 h-8 mx-auto text-[#52b788]" />
                    <p className="font-semibold">Attach After Photo</p>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                  AFTER RESOLUTION
                </div>
              </div>

              {/* Upload & Presets */}
              <div className="space-y-2">
                <label className="w-full py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-50 cursor-pointer flex items-center justify-center space-x-2 text-gray-700 font-semibold transition">
                  <UploadCloud className="w-4 h-4 text-[#2d6a4f]" />
                  <span>Upload Camera Snapshot</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Or select sample evidence photo:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EVIDENCE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAfterPhotoUrl(preset.url)}
                        className={`p-1.5 rounded-lg border text-left text-[10px] font-semibold truncate transition ${
                          afterPhotoUrl === preset.url
                            ? 'border-[#2d6a4f] bg-[#d8f3dc]/50 text-[#1b4332]'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {preset.tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Verification Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-[#d8f3dc]/30 border border-[#52b788]/40 space-y-1 text-xs text-emerald-950">
            <div className="flex items-center space-x-1.5 font-bold text-[#1b4332]">
              <ShieldCheck className="w-4 h-4 text-[#2d6a4f]" />
              <span>GMC Official HQ Verification Workflow</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Submitting this evidence will transition the incident to <strong>Pending Verification</strong>. A GMC Municipal Official in HQ will inspect your before/after evidence. Once approved:
            </p>
            <ul className="list-disc list-inside text-[11px] text-gray-700 space-y-0.5 pt-0.5">
              <li><strong>+{defaultBounty} Karma Points</strong> will be credited directly to your profile.</li>
              <li>The incident indicator will be <strong>cleared and removed from the active map</strong>.</li>
              <li>Your stewardship log will reflect the clean-up contribution.</li>
            </ul>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fixDescription.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Evidence...' : 'Submit Resolution Evidence'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
