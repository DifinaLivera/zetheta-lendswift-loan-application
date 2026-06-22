import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationState, DocumentUpload } from '../types';
import { getSchemaForStep } from '../utils/schemaFactory';
import { SignaturePad } from './common/SignaturePad';
import { ErrorMessage } from './common/ErrorMessage';
import { compressImage } from '../utils/imageCompression';
import { FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Trash2, Upload, Loader2 } from 'lucide-react';

interface StepProps {
  globalState: Partial<ApplicationState>;
  onNext: (data: Partial<ApplicationState>) => void;
  onPrev: () => void;
}

interface DocReq {
  key: string;
  label: string;
  subText: string;
  formats: string[];
  maxSizeMB: number;
  required: boolean;
}

export function Step7Documents({ globalState, onNext, onPrev }: StepProps) {
  const currentSchema = getSchemaForStep(7, globalState);

  // Maintain local document upload states, pre-populated with globalState uploads
  const [docs, setDocs] = React.useState<Record<string, DocumentUpload>>(
    globalState.uploadedDocuments || {}
  );
  
  const [compressingKey, setCompressingKey] = React.useState<string | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      applicantSignature: globalState.applicantSignature || ''
    }
  });

  const sigUrl = watch('applicantSignature');

  // Dynamically calculate document checklist requirements based on user data
  const requirementsList = React.useMemo<DocReq[]>(() => {
    const list: DocReq[] = [];

    // PAN Copy: Optional if PAN is verified
    list.push({
      key: 'pan_card',
      label: 'PAN Card Copy',
      subText: 'Requires PDF, JPG or PNG (Max 5MB).',
      formats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 5,
      required: !globalState.isPanVerified // Optional if PAN verified
    });

    // Aadhaar Copy
    list.push({
      key: 'aadhaar_card',
      label: 'Aadhaar Card (Front & Back Copy)',
      subText: 'Requires PDF, JPG or PNG (Max 5MB).',
      formats: ['image/jpeg', 'image/png', 'application/pdf'],
      maxSizeMB: 5,
      required: true
    });

    // Salary Slips: if corporate salaried
    if (globalState.employmentType === 'Salaried') {
      list.push({
        key: 'salary_slips',
        label: 'Salary Slips (Last 3 Months)',
        subText: 'Requires 3-page consolidated PDF (Max 5MB).',
        formats: ['application/pdf'],
        maxSizeMB: 5,
        required: true
      });
    }

    // Bank Statement
    list.push({
      key: 'bank_statement',
      label: 'Bank Statement (Last 6 Months)',
      subText: 'Requires bank consolidated PDF (Max 10MB).',
      formats: ['application/pdf'],
      maxSizeMB: 10,
      required: true
    });

    // ITR Statements: if self-employed or business owner
    if (globalState.employmentType === 'Self-Employed' || globalState.employmentType === 'Business Owner') {
      list.push({
        key: 'itr_return',
        label: 'ITR Statements (Last 2 Years filings)',
        subText: 'Requires consolidated ITR-V forms as PDF (Max 5MB).',
        formats: ['application/pdf'],
        maxSizeMB: 5,
        required: true
      });
    }

    // Home Loan: Property deeds / documents
    if (globalState.loanType === 'Home') {
      list.push({
        key: 'property_docs',
        label: 'Property Valuation & Deeds Copy',
        subText: 'Requires consolidated property PDFs (Max 10MB).',
        formats: ['application/pdf'],
        maxSizeMB: 10,
        required: true
      });
    }

    // Business Loan: Business Certificate & GST returns
    if (globalState.loanType === 'Business') {
      list.push({
        key: 'business_cert',
        label: 'Business Registration Certificate',
        subText: 'Requires MSME register cert or Incorporation deed PDF (Max 5MB).',
        formats: ['application/pdf'],
        maxSizeMB: 5,
        required: true
      });
      list.push({
        key: 'gst_returns',
        label: 'GST Returns (Last 4 Quarters)',
        subText: 'Requires GSTR-3B filings as consolidated PDF (Max 5MB each).',
        formats: ['application/pdf'],
        maxSizeMB: 5,
        required: true
      });
    }

    // Passport size photograph
    list.push({
      key: 'photo',
      label: 'Passport size Photograph',
      subText: 'Requires clear JPG or PNG image (Max 2MB).',
      formats: ['image/jpeg', 'image/png'],
      maxSizeMB: 2,
      required: true
    });

    return list;
  }, [globalState.employmentType, globalState.loanType, globalState.isPanVerified]);

  // Handle Drag & Drop / File Select events
  const handleFileDrop = async (key: string, file: File, req: DocReq) => {
    setUploadError(null);

    // 1. Format audit
    if (!req.formats.includes(file.type)) {
      setUploadError(`File format is invalid. Acceptable formats for this document are: ${req.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')}.`);
      return;
    }

    // 2. Size audit
    if (file.size > req.maxSizeMB * 1024 * 1024) {
      setUploadError(`File is too large! Maximum limit is ${req.maxSizeMB}MB.`);
      return;
    }

    setCompressingKey(key);
    try {
      if (file.type.startsWith('image/')) {
        // Run canvas-based image compression for PNG/JPG
        const comp = await compressImage(file);
        
        // Save to state
        setDocs(prev => ({
          ...prev,
          [key]: {
            name: file.name,
            size: comp.compressedSize,
            originalSize: comp.originalSize,
            type: comp.compressedFile.type,
            base64Data: comp.base64,
            status: 'uploaded'
          }
        }));
      } else {
        // PDF: read and encode as base64 to allow auto-save restore
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocs(prev => ({
            ...prev,
            [key]: {
              name: file.name,
              size: file.size,
              originalSize: file.size,
              type: file.type,
              base64Data: reader.result as string,
              status: 'uploaded'
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      setUploadError('Failed to process/compress selected file.');
    } finally {
      setCompressingKey(null);
    }
  };

  const removeDoc = (key: string) => {
    setDocs(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Check if all mandatory documents have been uploaded
  const isUploadRequirementsComplete = React.useMemo(() => {
    return requirementsList.every(req => {
      if (!req.required) return true; // optional is true
      return docs[req.key] !== undefined;
    });
  }, [requirementsList, docs]);

  const handleFormSubmit = (data: any) => {
    if (!isUploadRequirementsComplete) {
      setUploadError('Please upload all mandatory documents before proceeding.');
      return;
    }
    onNext({
      ...globalState,
      uploadedDocuments: docs,
      applicantSignature: data.applicantSignature
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-xl font-bold text-white font-serif tracking-wide px-1">Upload Documents & Signature</h2>
        <p className="text-[#8E9299] text-xs mt-1 font-medium leading-relaxed font-sans px-1">
          Provide your verification attachments as per your loan and income selections. Images will undergo automated client-side compression to speed up load times.
        </p>
      </div>

      {uploadError && <ErrorMessage message={uploadError} />}

      {/* Checklist items dynamic mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pointer-events-auto">
        {requirementsList.map((req) => {
          const fileUploaded = docs[req.key];
          const isCompressing = compressingKey === req.key;

          return (
            <div 
              key={req.key}
              className={`p-4 border rounded-sm flex flex-col gap-3 transition-all select-none
                ${fileUploaded 
                  ? 'bg-emerald-950/10 border-emerald-900/30' 
                  : 'bg-[#1A1D23] border-[#2D3036] hover:border-[#D4AF37]/40'
                }
              `}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                  handleFileDrop(req.key, e.dataTransfer.files[0], req);
                }
              }}
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="text-xs font-bold text-[#E0E2E5] flex items-center gap-1.5 leading-snug">
                    {req.label}
                    {req.required ? (
                      <em className="text-[10px] font-bold text-rose-400 bg-rose-950/20 border border-rose-950/40 rounded px-1.5 py-0.2 not-italic">Mandatory</em>
                    ) : (
                      <em className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded px-1.5 py-0.2 not-italic">Optional</em>
                    )}
                  </span>
                  <span className="text-[10px] font-medium text-[#8E9299] mt-1 block">
                    {req.subText}
                  </span>
                </div>

                {fileUploaded && (
                  <button
                    type="button"
                    onClick={() => removeDoc(req.key)}
                    className="p-1 px-2 text-rose-400 hover:bg-rose-950/20 border border-rose-955/35 hover:border-rose-900 rounded-sm transition active:scale-95 cursor-pointer"
                    aria-label={`Remove uploaded file for ${req.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload interface */}
              {isCompressing ? (
                <div className="py-4 border border-dashed border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-sm flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                  <span className="text-xs text-[#E0E2E5] font-bold">Compressing Image (Canvas)...</span>
                </div>
              ) : fileUploaded ? (
                /* Uploaded File preview thumbnail layout */
                <div className="p-3 bg-[#131418] border border-[#2D3036] rounded-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#0A0B0D] flex items-center justify-center flex-shrink-0 border border-[#2D3036]">
                    {fileUploaded.type.startsWith('image/') ? (
                      <img 
                        src={fileUploaded.base64Data || ''} 
                        alt="thumbnail" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded bg-[#0A0B0D]" 
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-rose-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col leading-tight">
                    <span className="text-xs font-bold text-[#E0E2E5] truncate">
                      {fileUploaded.name}
                    </span>
                    <span className="text-[10px] text-[#8E9299] font-semibold mt-1 flex items-center gap-1.5">
                      {fileUploaded.type.startsWith('image/') && fileUploaded.originalSize !== fileUploaded.size ? (
                        <>
                          <span className="line-through">₹ {(fileUploaded.originalSize! / 1024 / 1024).toFixed(2)} MB</span>
                          <span className="text-emerald-400 font-bold bg-emerald-950/20 px-1 rounded">▼ {Math.round((1 - (fileUploaded.size! / fileUploaded.originalSize!)) * 100)}% compressed</span>
                        </>
                      ) : null}
                      <span>Size: {(fileUploaded.size! / 1024 / 1024).toFixed(2)} MB</span>
                    </span>
                  </div>

                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                </div>
              ) : (
                /* Drag & Drop input box trigger */
                <label className="border border-dashed border-[#2D3036] hover:border-[#D4AF37]/50 bg-[#1A1D23] hover:bg-[#1A1D23]/80 rounded-sm py-4 px-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition">
                  <input
                    type="file"
                    accept={req.formats.join(',')}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileDrop(req.key, e.target.files[0], req);
                      }
                    }}
                    className="sr-only"
                  />
                  <Upload className="w-4 h-4 text-[#8E9299]" />
                  <span className="text-xs font-bold text-[#E0E2E5]">Drag file here or <span className="text-[#D4AF37] underline">Browse</span></span>
                  <span className="text-[9px] text-[#8E9299] font-medium">Supports {req.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')} up to {req.maxSizeMB}MB</span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Applicant Signature capture canvas */}
      <div className="mt-4 pointer-events-auto">
        <SignaturePad
          label="Primary Applicant Electronic Signature Pad"
          required
          value={sigUrl}
          onChange={(val) => {
            setValue('applicantSignature', val, { shouldValidate: true });
          }}
          error={errors.applicantSignature?.message?.toString()}
        />
      </div>

      <div className="flex justify-between pt-4 border-t border-[#2D3036] gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 border border-[#2D3036] text-[#E0E2E5] bg-[#1A1D23] hover:bg-[#2D3036] hover:text-white rounded-sm font-semibold transition cursor-pointer text-xs uppercase tracking-wider"
        >
          Previous Step
        </button>
        <button
          type="submit"
          disabled={!isUploadRequirementsComplete || !sigUrl}
          className={`px-6 py-2.5 rounded-sm font-bold transition cursor-pointer text-xs uppercase tracking-wider ${
            (isUploadRequirementsComplete && sigUrl)
              ? 'bg-[#D4AF37] text-[#0A0B0D] hover:bg-[#E5C158] shadow-[0_0_12px_rgba(212,175,55,0.15)]'
              : 'bg-[#1A1D23] text-[#8E9299]/30 border border-[#2D3036] cursor-not-allowed'
          }`}
        >
          Save & Proceed
        </button>
      </div>
    </form>
  );
}
