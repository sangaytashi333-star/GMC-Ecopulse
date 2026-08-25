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
  AlertTriangle 
} from 'lucide-react';
import { CitizenReport } from '../types';

interface ReportDetailModalProps {
  report: CitizenReport | null;
  onClose: () => void;
  onUpvote: (reportId: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onUpvote,
}) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#d8f3dc] text-[#1b4332]">
              {report.category}
            </span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${
              report.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.status}
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
          {report.status === 'resolved' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Field Resolution Log</span>
              </div>
              <p className="text-emerald-900">{report.resolutionNotes || 'Inspected and verified by GMC Ranger unit.'}</p>
              {report.resolvedAt && (
                <p className="text-[10px] text-emerald-700 font-semibold">Resolved at: {report.resolvedAt}</p>
              )}
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
