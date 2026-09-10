import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Image, MapPin, Package, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import ProgressStepper from '../../components/ProgressStepper';
import Select from '../../components/Select';
import UploadBox from '../../components/UploadBox';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import type { ItemCondition, WasteCategory } from '../../types';
import { CATEGORY_LABELS, CONDITION_LABELS, formatCurrency } from './sourceUtils';

interface SellForm {
  category: WasteCategory | '';
  itemName: string;
  quantity: string;
  weightKg: string;
  condition: ItemCondition | '';
  expectedPrice: string;
  pickupAddress: string;
  description: string;
}

interface PendingImage {
  file: File;
  previewUrl: string;
}

type FormErrors = Partial<Record<keyof SellForm | 'images', string>>;

const initialForm: SellForm = {
  category: '',
  itemName: '',
  quantity: '1',
  weightKg: '',
  condition: '',
  expectedPrice: '',
  pickupAddress: '',
  description: '',
};

const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
  reader.readAsDataURL(file);
});

const SellWastePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { createListing } = usePlatform();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<SellForm>(() => ({ ...initialForm, pickupAddress: user?.location ?? '' }));
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const objectUrls = useRef(new Set<string>());

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
  }, []);

  const setField = <K extends keyof SellForm>(field: K, value: SellForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleAddImages = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} is larger than 5 MB.`, 'error');
        return false;
      }
      return true;
    });

    const next = validFiles.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      objectUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setPendingImages((current) => [...current, ...next].slice(0, 5));
    if (next.length > 0) setErrors((current) => ({ ...current, images: undefined }));
  };

  const handleRemoveImage = (index: number) => {
    setPendingImages((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        objectUrls.current.delete(target.previewUrl);
      }
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const validateImages = (): boolean => {
    if (pendingImages.length > 0) return true;
    setErrors((current) => ({ ...current, images: 'Add at least one clear photo of the item.' }));
    return false;
  };

  const validateDetails = (): boolean => {
    const nextErrors: FormErrors = {};
    const quantity = Number(form.quantity);
    const weight = Number(form.weightKg);
    const expectedPrice = Number(form.expectedPrice);

    if (!form.itemName.trim()) nextErrors.itemName = 'Enter a name that identifies the item.';
    if (!form.category) nextErrors.category = 'Choose an e-waste category.';
    if (!form.condition) nextErrors.condition = 'Choose the item condition.';
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) nextErrors.quantity = 'Quantity must be a whole number from 1 to 999.';
    if (!Number.isFinite(weight) || weight <= 0 || weight > 10000) nextErrors.weightKg = 'Enter a weight greater than 0 and no more than 10,000 kg.';
    if (!Number.isFinite(expectedPrice) || expectedPrice < 0) nextErrors.expectedPrice = 'Expected price cannot be negative.';
    if (form.pickupAddress.trim().length < 10) nextErrors.pickupAddress = 'Enter a complete pickup address (at least 10 characters).';
    if (form.description.length > 500) nextErrors.description = 'Keep the description within 500 characters.';

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (step === 0 && !validateImages()) return;
    if (step === 1 && !validateDetails()) return;
    setStep((current) => Math.min(current + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateImages() || !validateDetails() || !user) {
      if (!user) showToast('Please sign in again before creating a listing.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const images = await Promise.all(pendingImages.map(({ file }) => fileToDataUrl(file)));
      const created = await createListing({
        sourceId: user.id,
        category: form.category as WasteCategory,
        itemName: form.itemName.trim(),
        quantity: Number(form.quantity),
        weightKg: Number(form.weightKg),
        condition: form.condition as ItemCondition,
        expectedPrice: Number(form.expectedPrice),
        description: form.description.trim() || undefined,
        pickupAddress: form.pickupAddress.trim(),
        images,
        status: 'active',
      });
      showToast('Your e-waste listing is now live.', 'success');
      navigate(`/source/listing/${created.id}`, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create the listing.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Photos', 'Details', 'Review'].map((label, index) => ({
    label,
    status: (index < step ? 'completed' : index === step ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
  }));

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="New listing"
        title="Sell or recycle e-waste"
        description="Add accurate photos and details so nearby verified collectors can make fair offers."
        backTo="/source"
      />

      <div className="card p-4 md:p-5">
        <ProgressStepper steps={steps} orientation="horizontal" />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-5 items-start">
        <section className="card p-5 md:p-7 min-w-0">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <Image size={20} style={{ color: 'var(--primary)' }} />
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Show us the item</h2>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Upload up to five JPG, PNG, or camera photos. Each file must be 5 MB or smaller.
                </p>
              </div>
              <UploadBox
                images={pendingImages.map(({ previewUrl }) => previewUrl)}
                onAdd={handleAddImages}
                onRemove={handleRemoveImage}
                maxImages={5}
              />
              {errors.images && <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.images}</p>}
              <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--primary-subtle)' }}>
                <ShieldCheck size={19} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Before photographing phones or computers, hide personal information visible on screens and remove SIM or memory cards.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2">
                  <Package size={20} style={{ color: 'var(--primary)' }} />
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Describe the e-waste</h2>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Specific information helps collectors price and handle it safely.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Item name"
                    value={form.itemName}
                    onChange={(event) => setField('itemName', event.target.value)}
                    placeholder="Example: Dell Inspiron laptop"
                    maxLength={80}
                    error={errors.itemName}
                    required
                  />
                </div>
                <Select
                  label="Category"
                  value={form.category}
                  onChange={(event) => setField('category', event.target.value as WasteCategory)}
                  placeholder="Select category"
                  options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
                  error={errors.category}
                  required
                />
                <Select
                  label="Condition"
                  value={form.condition}
                  onChange={(event) => setField('condition', event.target.value as ItemCondition)}
                  placeholder="Select condition"
                  options={Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }))}
                  error={errors.condition}
                  required
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => setField('quantity', event.target.value)}
                  error={errors.quantity}
                  required
                />
                <Input
                  label="Approximate total weight (kg)"
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  value={form.weightKg}
                  onChange={(event) => setField('weightKg', event.target.value)}
                  placeholder="Example: 2.5"
                  error={errors.weightKg}
                  required
                />
                <Input
                  label="Expected price (₹)"
                  type="number"
                  min="0"
                  step="1"
                  value={form.expectedPrice}
                  onChange={(event) => setField('expectedPrice', event.target.value)}
                  hint="Enter 0 if you prefer responsible disposal over payment."
                  error={errors.expectedPrice}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Pickup address"
                    value={form.pickupAddress}
                    onChange={(event) => setField('pickupAddress', event.target.value)}
                    placeholder="House/building, street, locality, city and PIN code"
                    leftIcon={<MapPin size={16} />}
                    error={errors.pickupAddress}
                    required
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="listing-description" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Description (optional)</label>
                  <textarea
                    id="listing-description"
                    value={form.description}
                    onChange={(event) => setField('description', event.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Mention model, age, defects, accessories, battery condition, or handling concerns."
                    className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-100 resize-y"
                    style={{ borderColor: errors.description ? 'var(--danger)' : 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                  />
                  <div className="flex justify-between gap-3">
                    <span className="text-xs" style={{ color: errors.description ? 'var(--danger)' : 'var(--text-secondary)' }}>{errors.description}</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{form.description.length}/500</span>
                  </div>
                </div>
              </div>

              {(form.category === 'battery' || form.condition === 'damaged') && (
                <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
                  <AlertTriangle size={19} className="flex-shrink-0" style={{ color: '#b45309' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Handle with extra care</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#92400e' }}>
                      Do not puncture, crush, charge, or expose damaged electronics and batteries to heat. Tell the collector about any swelling or leakage.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} />
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Review your listing</h2>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Check the details before making this visible to collectors.</p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {pendingImages.map(({ previewUrl, file }, index) => (
                  <img key={previewUrl} src={previewUrl} alt={`${file.name}, photo ${index + 1}`} className="aspect-square w-full rounded-xl object-cover border" style={{ borderColor: 'var(--border)' }} />
                ))}
              </div>

              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ['Item', form.itemName],
                  ['Category', form.category ? CATEGORY_LABELS[form.category] : '—'],
                  ['Condition', form.condition ? CONDITION_LABELS[form.condition] : '—'],
                  ['Quantity', `${form.quantity} item${Number(form.quantity) === 1 ? '' : 's'}`],
                  ['Approximate weight', `${form.weightKg} kg`],
                  ['Expected price', formatCurrency(Number(form.expectedPrice))],
                ].map(([label, value]) => (
                  <div key={label} className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</dt>
                    <dd className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                  <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pickup address</dt>
                  <dd className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{form.pickupAddress}</dd>
                </div>
                {form.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>Description</dt>
                    <dd className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{form.description}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-7 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              variant="outline"
              onClick={() => step === 0 ? navigate('/source') : setStep((current) => current - 1)}
              disabled={isSubmitting}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < 2 ? (
              <Button onClick={goNext}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isSubmitting}>Publish listing</Button>
            )}
          </div>
        </section>

        <aside className="card p-5 lg:sticky lg:top-6">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>A stronger listing gets better bids</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {[
              'Use bright, clear photos from more than one angle.',
              'Mention defects, missing parts, and battery damage honestly.',
              'Use a complete address; it is shared only for pickup coordination.',
              'Compare collector ratings, distance, and offer value before accepting.',
            ].map((tip) => (
              <li key={tip} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} /> {tip}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default SellWastePage;
