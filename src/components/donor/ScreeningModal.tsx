import React, { useState } from 'react';
import { api } from '../../services/api';
import { DonorProfile } from '../../types';
import { ShieldCheck, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ScreeningModalProps {
  profile: DonorProfile;
  isOpen: boolean;
  onClose: () => void;
  onCompleted: (updatedProfile: DonorProfile) => void;
}

export const ScreeningModal: React.FC<ScreeningModalProps> = ({ profile, isOpen, onClose, onCompleted }) => {
  const [weightKg, setWeightKg] = useState(profile.screeningDetails?.weightKg || 65);
  const [hemoglobinGdl, setHemoglobinGdl] = useState(profile.screeningDetails?.hemoglobinGdl || 14.0);
  const [hasRecentTattooOrPiercing, setHasRecentTattooOrPiercing] = useState(profile.screeningDetails?.hasRecentTattooOrPiercing || false);
  const [hasMajorIllness, setHasMajorIllness] = useState(profile.screeningDetails?.hasMajorIllness || false);
  const [isTakingAntibiotics, setIsTakingAntibiotics] = useState(profile.screeningDetails?.isTakingAntibiotics || false);
  const [isPregnantOrNursing, setIsPregnantOrNursing] = useState(profile.screeningDetails?.isPregnantOrNursing || false);
  const [clinicalDisclaimerAcknowledged, setClinicalDisclaimerAcknowledged] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState<{ status: string; note: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.submitScreening({
        weightKg: Number(weightKg),
        hemoglobinGdl: Number(hemoglobinGdl),
        hasRecentTattooOrPiercing,
        hasMajorIllness,
        isTakingAntibiotics,
        isPregnantOrNursing,
        clinicalDisclaimerAcknowledged
      });

      if (res.success) {
        setResultMessage({
          status: res.data.screeningStatus,
          note: res.data.screeningNote
        });
        onCompleted(res.data.profile);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit screening');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative my-8">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {resultMessage ? (
          <div className="text-center space-y-4 py-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              resultMessage.status === 'screened' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {resultMessage.status === 'screened' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {resultMessage.status === 'screened' ? 'Health Screening Completed' : 'Temporary Medical Deferral'}
            </h3>

            <p className="text-xs text-slate-600">
              {resultMessage.note}
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-left space-y-1">
              <div><strong className="text-slate-700">Important: </strong>Final medical eligibility is determined in person by qualified blood-bank hematologists.</div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Donor Health Screening Questionnaire
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Standard preliminary criteria to evaluate voluntary donation safety.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Body Weight (kg) * (Min: 50 kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Recent Hemoglobin (g/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={hemoglobinGdl}
                    onChange={(e) => setHemoglobinGdl(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRecentTattooOrPiercing}
                    onChange={(e) => setHasRecentTattooOrPiercing(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-red-600"
                  />
                  <span>Have you gotten a tattoo or body piercing in the past 6 months?</span>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTakingAntibiotics}
                    onChange={(e) => setIsTakingAntibiotics(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-red-600"
                  />
                  <span>Are you currently taking antibiotics or recovering from an active infection?</span>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMajorIllness}
                    onChange={(e) => setHasMajorIllness(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-red-600"
                  />
                  <span>Do you have any history of cardiovascular, liver, or chronic blood disorders?</span>
                </label>

                {profile.gender === 'Female' && (
                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPregnantOrNursing}
                      onChange={(e) => setIsPregnantOrNursing(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-red-600"
                    />
                    <span>Are you currently pregnant or nursing?</span>
                  </label>
                )}
              </div>

              {/* Disclaimer */}
              <div className="pt-2">
                <label className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={clinicalDisclaimerAcknowledged}
                    onChange={(e) => setClinicalDisclaimerAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-red-600"
                  />
                  <span>
                    I confirm that the health information supplied is accurate. I acknowledge that final clinical eligibility will be determined by blood bank professionals prior to donation.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? 'Evaluating Responses...' : 'Submit Health Evaluation'}
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
