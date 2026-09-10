import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, BrainCircuit, Check, CheckCircle2, ImagePlus, LoaderCircle, ScanLine, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import UploadBox from '../../components/UploadBox';
import { useAppContext } from '../../context/AppContext';
import { usePlatform } from '../../context/PlatformContext';
import { analyzeWaste } from '../../services/wasteService';
import type { AIAnalysisResult, ItemCondition, WasteCategory } from '../../types';
import { categoryLabels, conditionLabels, formatCurrency } from '../../utils/format';

interface PendingImage { file: File; url: string }

const processingSteps = ['Uploading', 'Preparing Image', 'Identifying E-Waste', 'Estimating Category', 'Preparing Result'];
const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

const toDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
  reader.readAsDataURL(file);
});

const CollectorScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useAppContext();
  const { addInventoryItem } = usePlatform();
  const [images, setImages] = useState<PendingImage[]>([]);
  const imageUrls = useRef(new Set<string>());
  const mounted = useRef(true);
  const [form, setForm] = useState({ itemName: '', category: '', condition: '', quantity: '1', weightKg: '', estimatedValue: '', collectedFrom: '' });
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(-1);
  const [previewComplete, setPreviewComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const apiConfigured = Boolean(import.meta.env.VITE_API_BASE_URL);

  useEffect(() => () => {
    mounted.current = false;
    imageUrls.current.forEach((url) => URL.revokeObjectURL(url));
    imageUrls.current.clear();
  }, []);

  const setField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const addImages = (files: File[]) => {
    const next = files.map((file) => {
      const url = URL.createObjectURL(file);
      imageUrls.current.add(url);
      return { file, url };
    });
    setImages((current) => [...current, ...next]);
    setAnalysis(null);
    setPreviewComplete(false);
    setScanStep(-1);
  };

  const removeImage = (index: number) => setImages((current) => {
    const target = current[index];
    if (target) {
      URL.revokeObjectURL(target.url);
      imageUrls.current.delete(target.url);
    }
    return current.filter((_, imageIndex) => imageIndex !== index);
  });

  const playFrontendPreview = async () => {
    setIsAnalyzing(true);
    setPreviewComplete(false);
    for (let step = 0; step < processingSteps.length; step += 1) {
      if (!mounted.current) return;
      setScanStep(step);
      await wait(step === 0 ? 360 : 520);
    }
    if (!mounted.current) return;
    setIsAnalyzing(false);
    setPreviewComplete(true);
    showToast('Scan UI preview complete. Verify and enter the item details manually.', 'info', 5000);
  };

  const runAnalysis = async () => {
    if (images.length === 0) {
      showToast('Add at least one clear item photo.', 'error');
      return;
    }
    if (!apiConfigured) {
      await playFrontendPreview();
      return;
    }

    setIsAnalyzing(true);
    setPreviewComplete(false);
    setScanStep(0);
    try {
      await wait(220);
      setScanStep(1);
      const payload = new FormData();
      images.forEach(({ file }) => payload.append('images', file));
      setScanStep(2);
      const response = await analyzeWaste(payload);
      if (!response.success || !response.data) throw new Error(response.error || response.message || 'Analysis did not return a result.');
      setScanStep(3);
      const result = response.data;
      setAnalysis(result);
      setForm((current) => ({
        ...current,
        itemName: result.detectedItems[0] || current.itemName,
        category: result.detectedCategory,
        condition: result.condition,
        estimatedValue: String(Math.round((result.estimatedPriceMin + result.estimatedPriceMax) / 2)),
      }));
      await wait(240);
      setScanStep(4);
      setPreviewComplete(true);
      showToast('Analysis complete. Review the suggested details.', 'success');
    } catch (reason) {
      setScanStep(-1);
      showToast(reason instanceof Error ? reason.message : 'AI analysis failed. Enter the details manually.', 'error');
    } finally {
      if (mounted.current) setIsAnalyzing(false);
    }
  };

  const saveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const weight = Number(form.weightKg);
    const value = Number(form.estimatedValue);
    if (!form.itemName.trim() || !form.category || !form.condition) {
      showToast('Complete the item name, category, and condition.', 'error');
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(value) || value < 0) {
      showToast('Enter valid quantity, weight, and estimated value.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const encodedImages = await Promise.all(images.map(({ file }) => toDataUrl(file)));
      addInventoryItem({
        itemName: form.itemName.trim(), category: form.category as WasteCategory, condition: form.condition as ItemCondition,
        quantity, weightKg: weight, estimatedValue: value, collectedFrom: form.collectedFrom.trim() || undefined, images: encodedImages,
      });
      showToast('Item added to inventory.', 'success');
      navigate('/collector/inventory');
    } catch (reason) {
      showToast(reason instanceof Error ? reason.message : 'Could not save this item.', 'error');
    } finally {
      if (mounted.current) setIsSaving(false);
    }
  };

  return (
    <div className="page-enter max-container flex flex-col gap-7 py-7 md:py-9">
      <PageHeader backTo="/collector" eyebrow="Material intake" title="Scan e-waste" description="Capture multiple views, preview the analysis journey, then verify every detail before inventory." />

      {!apiConfigured && (
        <div className="flex items-start gap-3 rounded-xl border p-4" style={{ backgroundColor: '#fff8e8', borderColor: '#efd8a6' }}>
          <BrainCircuit size={19} className="flex-shrink-0" style={{ color: '#9a610e' }} />
          <div><p className="text-sm font-semibold" style={{ color: '#704508' }}>Frontend scan preview mode</p><p className="mt-1 text-xs leading-relaxed" style={{ color: '#8c651f' }}>No analysis API is configured. The processing sequence is an interface demonstration only and never invents a category or result; inventory details remain manual. Add <code>VITE_API_BASE_URL</code> to use a real analysis service.</p></div>
        </div>
      )}

      <form onSubmit={saveItem} className="grid items-start gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5 lg:sticky lg:top-28">
          <section className="card overflow-hidden">
            <div className="border-b p-5" style={{ borderColor: 'var(--border)' }}><h2 className="flex items-center gap-2 font-semibold"><ScanLine size={18} style={{ color: 'var(--primary)' }} /> Camera & upload zone</h2><p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Use up to five well-lit views of the full device, labels and visible damage.</p></div>
            <div className="relative m-4 min-h-[22rem] overflow-hidden rounded-2xl border bg-[#eaf2ec] p-4 sm:m-5 sm:p-5" style={{ borderColor: isAnalyzing ? 'var(--primary-light)' : 'var(--border)' }}>
              <span className="pointer-events-none absolute left-3 top-3 h-8 w-8 border-l-2 border-t-2" style={{ borderColor: 'var(--primary)' }} />
              <span className="pointer-events-none absolute right-3 top-3 h-8 w-8 border-r-2 border-t-2" style={{ borderColor: 'var(--primary)' }} />
              <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-8 border-b-2 border-l-2" style={{ borderColor: 'var(--primary)' }} />
              <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-8 border-b-2 border-r-2" style={{ borderColor: 'var(--primary)' }} />
              {(isAnalyzing || images.length > 0) && <span className="scanner-line z-10" aria-hidden="true" />}
              <div className="relative z-0 flex min-h-[19rem] flex-col justify-center">
                {images.length === 0 && <div className="pointer-events-none mb-4 flex justify-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm" style={{ color: 'var(--primary)' }}><ImagePlus size={26} /></span></div>}
                <UploadBox images={images.map((image) => image.url)} onAdd={addImages} onRemove={removeImage} onError={(message) => showToast(message, 'error')} maxImages={5} className="[&_[role=button]]:min-h-48 [&_[role=button]]:bg-white/60" />
              </div>
            </div>
            <div className="px-5 pb-5"><Button type="button" variant={apiConfigured ? 'secondary' : 'outline'} fullWidth leftIcon={isAnalyzing ? <LoaderCircle size={17} className="animate-spin" /> : <Sparkles size={17} />} isLoading={false} onClick={runAnalysis} disabled={isAnalyzing || images.length === 0}>{apiConfigured ? 'Analyze with connected service' : 'Preview scan experience'}</Button></div>
          </section>

          {(scanStep >= 0 || isAnalyzing) && (
            <section className="card p-5" aria-live="polite" aria-label="Scan progress">
              <div className="flex items-center justify-between gap-3"><div><span className="eyebrow">Processing sequence</span><h2 className="mt-2 text-sm font-bold">{previewComplete ? (analysis ? 'Result prepared' : 'Preview complete') : processingSteps[scanStep]}</h2></div><span className="text-xs font-bold tabular-nums" style={{ color: 'var(--primary)' }}>{Math.min(scanStep + 1, processingSteps.length)}/{processingSteps.length}</span></div>
              <div className="mt-5 space-y-0">
                {processingSteps.map((label, index) => {
                  const completed = index < scanStep || previewComplete;
                  const current = index === scanStep && !previewComplete;
                  return <div key={label} className="flex gap-3"><div className="flex flex-col items-center"><span className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${current ? 'status-pulse' : ''}`} style={{ backgroundColor: completed || current ? 'var(--primary)' : 'var(--surface)', borderColor: completed || current ? 'var(--primary)' : 'var(--border)', color: completed || current ? '#fff' : 'var(--text-tertiary)' }}>{completed ? <Check size={13} /> : current ? <LoaderCircle size={13} className="animate-spin" /> : index + 1}</span>{index < processingSteps.length - 1 && <span className="h-5 w-px" style={{ backgroundColor: completed ? 'var(--primary)' : 'var(--border)' }} />}</div><p className={`pt-1 text-xs font-semibold ${completed || current ? '' : 'opacity-45'}`}>{label}</p></div>;
                })}
              </div>
              {previewComplete && !analysis && <p className="mt-4 rounded-lg p-3 text-xs leading-5" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--text-secondary)' }}>No classification was generated. Complete the verified details manually below.</p>}
            </section>
          )}
        </div>

        <section className="card p-5 md:p-6">
          <h2 className="font-semibold">Classification details</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Verify every value before saving it to traceable inventory.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Input label="Item name" value={form.itemName} onChange={(event) => setField('itemName', event.target.value)} placeholder="Example: Dell laptop" required /></div>
            <Select label="Category" value={form.category} onChange={(event) => setField('category', event.target.value)} placeholder="Choose category" options={Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))} required />
            <Select label="Condition" value={form.condition} onChange={(event) => setField('condition', event.target.value)} placeholder="Choose condition" options={Object.entries(conditionLabels).map(([value, label]) => ({ value, label }))} required />
            <Input label="Quantity" type="number" min="1" step="1" value={form.quantity} onChange={(event) => setField('quantity', event.target.value)} required />
            <Input label="Weight (kg)" type="number" min="0.01" step="0.01" value={form.weightKg} onChange={(event) => setField('weightKg', event.target.value)} placeholder="0.00" required />
            <Input label="Estimated value (₹)" type="number" min="0" step="1" value={form.estimatedValue} onChange={(event) => setField('estimatedValue', event.target.value)} placeholder="0" required />
            <Input label="Collected from" value={form.collectedFrom} onChange={(event) => setField('collectedFrom', event.target.value)} placeholder="Locality or source" />
          </div>

          {analysis && (
            <div className="mt-5 rounded-xl border p-4" style={{ backgroundColor: 'var(--primary-subtle)', borderColor: 'var(--primary-soft)' }}>
              <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}><CheckCircle2 size={17} /> Analysis summary · {Math.round(analysis.confidenceScore * (analysis.confidenceScore <= 1 ? 100 : 1))}% confidence</p>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>Estimated range: {formatCurrency(analysis.estimatedPriceMin)}–{formatCurrency(analysis.estimatedPriceMax)} · Materials: {analysis.materialTypes.join(', ') || 'Not identified'}</p>
              {analysis.safetyWarnings.length > 0 && <ul className="mt-3 flex flex-col gap-1">{analysis.safetyWarnings.map((warning) => <li key={warning} className="flex gap-1.5 text-xs" style={{ color: '#9a610e' }}><AlertTriangle size={13} className="mt-0.5" /> {warning}</li>)}</ul>}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse justify-end gap-2 border-t pt-5 sm:flex-row" style={{ borderColor: 'var(--border)' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/collector/inventory')}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Add to inventory</Button>
          </div>
        </section>
      </form>
    </div>
  );
};

export default CollectorScanPage;
