import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Send, 
  Compass, 
  Sliders, 
  MapPin, 
  Eye, 
  Truck, 
  RefreshCw, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { CitizenReport, FieldTeam, CityMetrics, ReportStatus } from '../types';
import { playMindfulChime } from '../utils/audio';

interface AdminPortalProps {
  reports: CitizenReport[];
  fieldTeams: FieldTeam[];
  metrics: CityMetrics;
  onUpdateReportStatus: (reportId: string, newStatus: ReportStatus, fieldTeamAssigned?: string, notes?: string) => void;
  onUpdateMetrics: (newMetrics: Partial<CityMetrics>) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  reports,
  fieldTeams,
  metrics,
  onUpdateReportStatus,
  onUpdateMetrics,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'pending' | 'dispatched' | 'in-progress' | 'resolved'>('all');
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [assigningTeam, setAssigningTeam] = useState<string>(fieldTeams[0].name);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [simulatedRain, setSimulatedRain] = useState(false);

  const filteredReports = reports.filter(r => {
    if (selectedStatusTab !== 'all' && r.status !== selectedStatusTab) return false;
    return true;
  });

  const handleDispatchTeam = (report: CitizenReport) => {
    onUpdateReportStatus(report.id, 'dispatched', assigningTeam, `Dispatched ${assigningTeam} to coordinates.`);
    playMindfulChime('karma');
    setSelectedReport(null);
  };

  const handleResolveIncident = (report: CitizenReport) => {
    onUpdateReportStatus(
      report.id, 
      'resolved', 
      report.fieldTeamAssigned || assigningTeam, 
      resolutionNotes || 'Ecological inspection complete. Harmony verified.'
    );
    playMindfulChime('badge');
    setSelectedReport(null);
    setResolutionNotes('');
  };

  const handleToggleRainSimulation = () => {
    const nextRain = !simulatedRain;
    setSimulatedRain(nextRain);
    if (nextRain) {
      onUpdateMetrics({
        harmonyScore: 94.1,
        waterPurityIndex: 98.6,
        hydroOutputMw: 135.0,
        renewablePercent: 99.4,
        aqi: 11
      });
    } else {
      onUpdateMetrics({
        harmonyScore: 92.6,
        waterPurityIndex: 97.5,
        hydroOutputMw: 118.0,
        renewablePercent: 98.8,
        aqi: 16
      });
    }
    playMindfulChime('bell');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HQ Command Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#081c15] text-white shadow-xl border border-[#2d6a4f]/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1b4332] border border-[#52b788]/40 text-[#74c69d] text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#52b788]" />
            <span>GMC HQ Mission Control • Department of Biosphere & Urban Resilience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">HQ Command Center</h2>
          <p className="text-xs sm:text-sm text-[#d8f3dc]/80 leading-relaxed max-w-xl">
            Live incident triage, field ranger coordination (Biologists, River Hydrologists, Waste Units), and real-time city telemetry modulation.
          </p>
        </div>

        {/* Telemetry Simulation Toggles */}
        <div className="p-4 rounded-2xl bg-[#1b4332]/80 border border-[#52b788]/30 flex flex-col sm:flex-row items-center gap-3">
          <div className="text-left">
            <span className="block text-[10px] uppercase font-bold text-[#d8f3dc]/70">Himalayan Weather Sim</span>
            <span className="text-xs font-bold text-white">{simulatedRain ? '🌧️ Monsoon Mountain Inflow' : '☀️ Serene Sun & Valley Breeze'}</span>
          </div>
          <button
            onClick={handleToggleRainSimulation}
            className="px-3.5 py-1.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] text-xs font-bold transition shadow-xs"
          >
            {simulatedRain ? 'Reset Sun' : 'Simulate Rain Surge'}
          </button>
        </div>
      </div>

      {/* Field Personnel Live Tracker Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Active Field Personnel & Ranger Units</h3>
            <p className="text-xs text-gray-500">Biologists, watershed engineers, and circular waste logistics on active duty</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {fieldTeams.filter(t => t.status === 'on-duty' || t.status === 'dispatched').length} Units Deployed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fieldTeams.map((team) => (
            <div
              key={team.id}
              className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] text-[#1b4332] flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5 text-[#2d6a4f]" />
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                    team.status === 'dispatched'
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : team.status === 'on-duty'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {team.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1b4332]">{team.name}</h4>
                  <p className="text-xs font-semibold text-[#2d6a4f]">{team.specialty}</p>
                </div>

                <p className="text-[11px] text-gray-500">Lead: {team.leadName} ({team.membersCount} rangers)</p>
              </div>

              <div className="pt-2 border-t border-gray-100 text-[11px] space-y-1 text-gray-600">
                <p className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#52b788]" />
                  <span className="truncate">{team.currentSector}</span>
                </p>
                <p className="flex items-center space-x-1 font-mono text-[10px] text-gray-500">
                  <Radio className="w-3 h-3 text-sky-600" />
                  <span>{team.contactFreq}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Incident Management & Triage Kanban */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#1b4332] tracking-tight">Citizen Incident Triage & Dispatch Queue</h3>
            <p className="text-xs text-gray-500">Review observations, assign field units, and verify resolution</p>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(['all', 'pending', 'dispatched', 'in-progress', 'resolved'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatusTab(st)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition ${
                  selectedStatusTab === st
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table / Kanban List */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-5 hover:bg-[#f8f9f6] transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  {report.photoUrl && (
                    <img
                      src={report.photoUrl}
                      alt={report.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-gray-200 flex-shrink-0"
                    />
                  )}

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#d8f3dc] text-[#1b4332]">
                        {report.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        report.status === 'resolved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : report.status === 'dispatched'
                          ? 'bg-sky-100 text-sky-800'
                          : report.status === 'in-progress'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">#{report.id}</span>
                      <span className="text-[11px] text-gray-500">{report.timestamp}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#1b4332]">{report.title}</h4>
                    <p className="text-xs text-gray-600 max-w-2xl">{report.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-[#52b788]" />
                        <span>{report.locationName}</span>
                      </span>
                      <span>Reporter: <strong>{report.reporterName}</strong></span>
                      {report.fieldTeamAssigned && (
                        <span className="font-semibold text-sky-700">Assigned: {report.fieldTeamAssigned}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dispatch & Action Column */}
                <div className="flex items-center space-x-2 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <span>Manage Dispatch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident Management Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#081c15]/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#2d6a4f] bg-[#d8f3dc] px-2 py-0.5 rounded">
                  Incident Action Panel • {selectedReport.category}
                </span>
                <h3 className="text-base font-bold text-[#1b4332] mt-1">{selectedReport.title}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {selectedReport.photoUrl && (
              <img
                src={selectedReport.photoUrl}
                alt="Incident detail"
                referrerPolicy="no-referrer"
                className="w-full h-40 rounded-2xl object-cover border border-gray-100"
              />
            )}

            <p className="text-xs text-gray-600">{selectedReport.description}</p>

            <div className="p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200 text-xs space-y-2">
              <label className="block font-bold text-[#1b4332]">Assign Dedicated Field Team</label>
              <select
                value={assigningTeam}
                onChange={(e) => setAssigningTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#1b4332] bg-white focus:outline-none"
              >
                {fieldTeams.map((team) => (
                  <option key={team.id} value={team.name}>
                    {team.name} ({team.specialty}) - Lead: {team.leadName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1b4332]">Resolution / Inspection Notes</label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Log field verification results, biological acoustics, or clean-up notes..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleDispatchTeam(selectedReport)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
              >
                Dispatch {assigningTeam.split(' ')[0]}
              </button>

              <button
                type="button"
                onClick={() => handleResolveIncident(selectedReport)}
                className="px-4 py-2 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] text-xs font-extrabold shadow-md flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
