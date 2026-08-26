import React from 'react';
import { 
  X, 
  MapPin, 
  Sparkles, 
  ThumbsUp, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Trees, 
  Waves, 
  Recycle, 
  AlertTriangle,
  Award,
  Hourglass
} from 'lucide-react';
import { CitizenReport } from '../types';

interface ReportDetailModalProps {
  report: CitizenReport | null;
  onClose: () => void;
  onUpvote: (reportId: string) => void;
  onOpenFixResolution?: (report: CitizenReport) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onUpvote,
  onOpenFixResolution,
}) => {
  if (!report) return null;

  const isResolved = report.status === 'resolved';
  const isPendingFixVerification = report.status === 'pending_verification';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-h-[92dvh] overflow-y-auto my-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#d8f3dc] text-[#1b4332]">
              {report.category}
            </span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
              isResolved 
                ? 'bg-emerald-100 text-emerald-800' 
                : isPendingFixVerification
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isPendingFixVerification ? '⏳ Verification in Progress' : report.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Photo */}
          {report.photoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
              <img
                src={report.photoUrl}
                alt={report.title}
                referrerPolicy="no-referrer"
                className="w-full h-56 object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#52b788]" />
                <span>{report.locationName}</span>
              </div>
              {isPendingFixVerification && (
                <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  ORIGINAL OBSERVATION PHOTO
                </div>
              )}
            </div>
          )}

          {/* Title & Metadata */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-[#1b4332] leading-snug">{report.title}</h3>
            <p className="text-xs text-gray-500">
              Logged by <strong>{report.reporterName}</strong> • {report.timestamp} • Sector: {report.sector}
            </p>
          </div>

          {/* Main Description */}
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#f8f9f6] p-4 rounded-2xl border border-gray-200">
            {report.description}
          </p>

          {/* If Pending HQ Verification (Citizen Cleaned / Fixed This) */}
          {isPendingFixVerification && report.resolutionEvidence && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                  <Hourglass className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Resolution Evidence Submitted • Awaiting Official HQ Approval</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 text-amber-900">
                  +{report.resolutionEvidence.proposedBonusPoints} Karma Pending
                </span>
              </div>

              {report.resolutionEvidence.afterPhotoUrl && (
                <div className="relative rounded-xl overflow-hidden border border-amber-200 h-36">
                  <img
                    src={report.resolutionEvidence.afterPhotoUrl}
                    alt="After cleanup evidence"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    AFTER CLEANUP EVIDENCE
                  </div>
                </div>
              )}

              <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1 text-gray-700">
                <div className="flex items-center justify-between font-semibold text-[11px] text-amber-900">
                  <span>Fixer / Steward: {report.resolutionEvidence.fixerName}</span>
                  <span>{report.resolutionEvidence.timestamp}</span>
                </div>
                <p className="text-xs text-gray-800 italic">"{report.resolutionEvidence.fixDescription}"</p>
                {report.resolutionEvidence.wasteWeightKg ? (
                  <p className="text-[11px] font-bold text-emerald-800">
                    ♻️ Waste Collected: {report.resolutionEvidence.wasteWeightKg} kg
                  </p>
                ) : null}
              </div>

              <p className="text-[11px] text-amber-800">
                A GMC Municipal Official is reviewing this submission. Once certified, Karma points will be credited and this marker will be cleared from the active map.
              </p>
            </div>
          )}

          {/* AI Ecological Verification Card */}
          {report.aiAnalysis && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#d8f3dc]/30 to-[#f8f9f6] border border-[#52b788]/40 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1b4332]">
                  <Sparkles className="w-4 h-4 text-[#52b788]" />
                  <span>Gemini AI Biosphere Verification</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#1b4332] text-[#d8f3dc]">
                  +{report.pointsAwarded} Karma Awarded
                </span>
              </div>

              <p className="text-gray-700 italic">
                "{report.aiAnalysis.mindfulReflection}"
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-gray-600">
                <div className="bg-white p-2 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 font-semibold">Identified Item:</span>
                  <span className="font-bold text-[#1b4332]">{report.aiAnalysis.speciesOrItemIdentified}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-100">
                  <span className="block text-gray-400 font-semibold">Corridor Impact:</span>
                  <span className="font-bold text-emerald-700">{report.aiAnalysis.biodiversityIndexContribution}</span>
                </div>
              </div>
            </div>
          )}

          {/* Field Resolution Notes if Resolved */}
          {isResolved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Field Resolution Certification</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-200 text-emerald-900">
                  Cleared from Live Map
                </span>
              </div>

              {report.resolutionEvidence?.afterPhotoUrl && (
                <div className="relative rounded-xl overflow-hidden border border-emerald-300 h-32">
                  <img
                    src={report.resolutionEvidence.afterPhotoUrl}
                    alt="Verified cleanup"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    VERIFIED CLEANUP EVIDENCE
                  </div>
                </div>
              )}

              <p className="text-emerald-900 leading-relaxed">
                {report.resolutionNotes || 'Inspected and certified by GMC Biosphere Wardens.'}
              </p>
              {report.resolutionEvidence?.fixerName && (
                <p className="text-[11px] text-emerald-800 font-semibold">
                  Resolved by Citizen Steward: <strong>{report.resolutionEvidence.fixerName}</strong> (+{report.resolutionEvidence.proposedBonusPoints} Karma awarded)
                </p>
              )}
              {report.resolvedAt && (
                <p className="text-[10px] text-emerald-700 font-medium">Certified at: {report.resolvedAt}</p>
              )}
            </div>
          )}

          {/* Action to Clean Up / Fix Incident (if not resolved and not pending) */}
          {!isResolved && !isPendingFixVerification && onOpenFixResolution && (
            <div className="p-4 rounded-2xl bg-[#d8f3dc]/40 border border-[#52b788] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <h4 className="font-bold text-[#1b4332]">Are you nearby? Clean or fix this incident</h4>
                <p className="text-gray-600 text-[11px]">
                  Submit after-photos for GMC Official review to earn +200-300 extra Karma points.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenFixResolution(report);
                }}
                className="px-4 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs shadow-xs transition flex items-center space-x-1.5 shrink-0 min-h-[40px]"
              >
                <Award className="w-4 h-4 text-[#74c69d]" />
                <span>I Cleaned This Up</span>
              </button>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <button
              onClick={() => onUpvote(report.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                report.userUpvoted 
                  ? 'bg-[#d8f3dc] text-[#1b4332]' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{report.userUpvoted ? 'Upvoted' : 'Upvote Observation'} ({report.upvotes})</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#1b4332] text-white text-xs font-bold hover:bg-[#2d6a4f]"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
