import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    resumeBuilderApi,
    type ResumeBuilderResponseDto,
    type ResumeVersionDto,
    type ResumeVersionData,
    type TargetCustomizationRequest,
} from '../api/resumeBuilderApi';
import ResumePreviewRenderer from '../components/candidate/ResumePreviewRenderer';
import {
    Upload, RefreshCw, Download, Trash2, ChevronDown, CheckCircle,
    AlertCircle, Clock, Layers, FileText, Sparkles, LayoutTemplate,
    FileJson, FileType2, Save, X, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const INDUSTRIES = [
    'Information Technology', 'Banking & Finance', 'Healthcare', 'Manufacturing',
    'Education', 'Consulting', 'E-Commerce', 'Telecom', 'Government',
];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'UAE', 'Singapore'];
const EXP_LEVELS = ['FRESHER', 'MID', 'SENIOR', 'EXECUTIVE'];
const TEMPLATES = ['ATS_MODERN', 'CORPORATE', 'MINIMAL', 'EXECUTIVE', 'CREATIVE', 'ACADEMIC', 'TECH_STARTUP', 'MODERN_SPLIT'];
const STYLES = ['CHRONOLOGICAL', 'FUNCTIONAL', 'HYBRID'];
const EXPORT_FORMATS = [
    { label: 'Print / PDF', value: 'PDF', icon: FileType2 },
    { label: 'DOCX', value: 'DOCX', icon: FileText },
    { label: 'JSON', value: 'JSON', icon: FileJson },
];

const defaultRequest: TargetCustomizationRequest = {
    industry: 'Information Technology',
    country: 'India',
    jobDescription: '',
    targetRole: '',
    experienceLevel: 'MID',
    resumeTemplate: 'ATS_MODERN',
    language: 'en',
    targetCompany: '',
    extraKeywords: [],
    resumeStyle: 'CHRONOLOGICAL',
    includeProjects: true,
    includeCertifications: true,
    pageLimit: 2,
    exportFormat: 'PDF',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ResumeBuilderPage() {
    const [pageData, setPageData] = useState<ResumeBuilderResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [request, setRequest] = useState<TargetCustomizationRequest>(defaultRequest);
    const [generating, setGenerating] = useState(false);
    const [pollingVersionId, setPollingVersionId] = useState<number | null>(null);
    const [currentVersion, setCurrentVersion] = useState<ResumeVersionDto | null>(null);
    const [currentData, setCurrentData] = useState<ResumeVersionData | null>(null);

    const [activeTemplate, setActiveTemplate] = useState('ATS_MODERN');
    const [showJdInput, setShowJdInput] = useState(false);
    const [exportFormat, setExportFormat] = useState<'PDF' | 'DOCX' | 'JSON'>('PDF');
    const [keywordInput, setKeywordInput] = useState('');

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const previewRef = useRef<HTMLDivElement | null>(null);

    // ─── Fetch page data ───────────────────────────────────────────────────
    const fetchPageData = useCallback(async () => {
        try {
            const data = await resumeBuilderApi.getResumeBuilderData();
            setPageData(data);
        } catch {
            toast.error('Failed to load resume builder data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPageData(); }, [fetchPageData]);

    // ─── Polling for PROCESSING version ───────────────────────────────────
    useEffect(() => {
        if (!pollingVersionId) return;
        pollRef.current = setInterval(async () => {
            try {
                const version = await resumeBuilderApi.getVersion(pollingVersionId);
                if (version.generationStatus === 'COMPLETED') {
                    clearInterval(pollRef.current!);
                    setPollingVersionId(null);
                    setGenerating(false);
                    setCurrentVersion(version);
                    if (version.versionDataJson) {
                        const parsed: ResumeVersionData = JSON.parse(version.versionDataJson);
                        setCurrentData(parsed);
                        setActiveTemplate(parsed.resumeTemplate || 'ATS_MODERN');
                    }
                    fetchPageData();
                    toast.success('Resume generated successfully!');
                } else if (version.generationStatus === 'FAILED') {
                    clearInterval(pollRef.current!);
                    setPollingVersionId(null);
                    setGenerating(false);
                    toast.error('Generation failed. Please try again.');
                }
            } catch {
                clearInterval(pollRef.current!);
                setPollingVersionId(null);
                setGenerating(false);
            }
        }, 2500);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [pollingVersionId, fetchPageData]);

    // ─── Upload handler ────────────────────────────────────────────────────
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
        setUploading(true);
        try {
            await resumeBuilderApi.uploadExistingResume(file);
            toast.success('Resume uploaded! Parsing started…');
            fetchPageData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // ─── Generate handler ──────────────────────────────────────────────────
    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const finalRequest = { ...request, resumeTemplate: activeTemplate };
            const version = await resumeBuilderApi.generateVersion(finalRequest);
            setPollingVersionId(version.id);
            toast('Generating your tailored resume…', { icon: '✨' });
        } catch (err: any) {
            setGenerating(false);
            toast.error(err.response?.data?.message || 'Failed to start generation');
        }
    };

    // ─── Load a saved version ──────────────────────────────────────────────
    const handleLoadVersion = (version: ResumeVersionDto) => {
        setCurrentVersion(version);
        if (version.versionDataJson) {
            try {
                const parsed: ResumeVersionData = JSON.parse(version.versionDataJson);
                setCurrentData(parsed);
                setActiveTemplate(parsed.resumeTemplate || 'ATS_MODERN');
                toast.success(`Loaded: ${version.versionName}`);
            } catch { toast.error('Could not load version data'); }
        }
    };

    // ─── Delete a version ──────────────────────────────────────────────────
    const handleDeleteVersion = async (versionId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await resumeBuilderApi.deleteVersion(versionId);
            if (currentVersion?.id === versionId) { setCurrentVersion(null); setCurrentData(null); }
            fetchPageData();
            toast.success('Version deleted');
        } catch { toast.error('Delete failed'); }
    };

    // ─── Print / PDF from rendered DOM ────────────────────────────────────
    const handlePrintPdf = () => {
        const el = previewRef.current;
        if (!el) { toast.error('No resume to print'); return; }

        // Use innerHTML (NOT outerHTML) — outerHTML includes Tailwind wrapper classes
        // like "shadow-lg rounded-xl overflow-hidden" that don't exist in the popup,
        // which causes layout breakage. innerHTML gives us just the ResumePreviewRenderer
        // root which uses 100% inline styles.
        const html = el.innerHTML;

        const win = window.open('', '_blank', 'width=850,height=1100');
        if (!win) { toast.error('Please allow pop-ups for this site'); return; }

        win.document.open();
        win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* ── Color preservation — MUST apply to every element, not just body ── */
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box;
    }

    /* ── Page & body ─────────────────────────────────────────────────────── */
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      /* Match A4 width at 96dpi so the preview looks the same as on screen */
      width: 794px;
    }

    /* ── A4 page setup ───────────────────────────────────────────────────── */
    @page {
      size: A4 portrait;
      /* 10mm top/bottom, 12mm left/right — matches the template's own padding */
      margin: 10mm 12mm;
    }

    /* ── Force the resume to fill the full page width ─────────────────────── */
    /* The templates use max-width:750px / margin:auto for screen — override for print */
    body > div {
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    /* Also target the inner wrapper that each template uses */
    body > div > div {
      max-width: 100% !important;
      width: 100% !important;
      margin: 0 !important;
    }

    /* ── Print media — re-apply colors, strip screen-only decorations ──── */
    @media print {
      *, *::before, *::after {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      body {
        width: 100%;
      }
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      p, li, img {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>${html}</body>
</html>`);
        win.document.close();

        // Wait for Google Fonts to load, then print and auto-close window
        const doPrint = () => {
            win.focus();
            win.print();
            win.onafterprint = () => win.close();
        };

        if (win.document.readyState === 'complete') {
            setTimeout(doPrint, 700);
        } else {
            win.onload = () => setTimeout(doPrint, 500);
            setTimeout(doPrint, 2000); // guaranteed fallback
        }
    };

    // ─── DOCX / JSON download via server ──────────────────────────────────
    const addKeyword = () => {
        const kw = keywordInput.trim();
        if (kw && !request.extraKeywords.includes(kw)) {
            setRequest(r => ({ ...r, extraKeywords: [...r.extraKeywords, kw] }));
        }
        setKeywordInput('');
    };
    const removeKeyword = (kw: string) => setRequest(r => ({ ...r, extraKeywords: r.extraKeywords.filter(k => k !== kw) }));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    const parsingJob = pageData?.latestParsingJob;
    const savedVersions = pageData?.savedVersions || [];
    const atsScore = currentVersion?.atsScore || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="bg-indigo-600 p-2 rounded-xl">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">AI Resume Builder</h1>
                        </div>
                        <p className="text-slate-500 text-sm ml-12">
                            Upload your resume, configure your target, and let AI tailor it to any industry or role.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl cursor-pointer transition-colors text-sm shadow-sm">
                        {uploading ? <RefreshCw className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
                        {uploading ? 'Uploading…' : 'Upload Resume'}
                        <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.txt" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>

                {/* ── Parsing status banner ────────────────────────────────── */}
                {parsingJob && (
                    <div className={`rounded-xl p-4 flex items-start gap-3 text-sm shadow-sm border ${parsingJob.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-800' : parsingJob.status === 'FAILED' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        {parsingJob.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />}
                        {parsingJob.status === 'FAILED' && <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />}
                        {!['COMPLETED', 'FAILED'].includes(parsingJob.status) && <RefreshCw className="h-5 w-5 flex-shrink-0 animate-spin text-blue-500 mt-0.5" />}
                        <div>
                            <p className="font-semibold">Resume parsing: <span className="font-normal">{parsingJob.status.replace(/_/g, ' ')}</span></p>
                            <p className="opacity-80 mt-0.5">{parsingJob.originalFileName}</p>
                            {parsingJob.errorMessage && <p className="text-red-600 mt-1">{parsingJob.errorMessage}</p>}
                        </div>
                    </div>
                )}

                {/* ── Main Grid ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr_260px] gap-6">

                    {/* ── Left: Configuration ────────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Target Config card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Layers className="h-4 w-4 text-indigo-500" /> Target Configuration
                            </h2>
                            <div className="space-y-3">
                                <SelectField label="Industry" value={request.industry} onChange={v => setRequest(r => ({ ...r, industry: v }))} options={INDUSTRIES} />
                                <SelectField label="Country Standard" value={request.country} onChange={v => setRequest(r => ({ ...r, country: v }))} options={COUNTRIES} />
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Target Role</label>
                                    <input
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. Senior Software Engineer"
                                        value={request.targetRole}
                                        onChange={e => setRequest(r => ({ ...r, targetRole: e.target.value }))}
                                    />
                                </div>
                                <SelectField label="Experience Level" value={request.experienceLevel} onChange={v => setRequest(r => ({ ...r, experienceLevel: v }))} options={EXP_LEVELS} />
                                <SelectField label="Resume Style" value={request.resumeStyle} onChange={v => setRequest(r => ({ ...r, resumeStyle: v }))} options={STYLES} />
                                <div className="flex gap-4 text-sm pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded text-indigo-600" checked={request.includeCertifications} onChange={e => setRequest(r => ({ ...r, includeCertifications: e.target.checked }))} />
                                        Include Certifications
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded text-indigo-600" checked={request.includeProjects} onChange={e => setRequest(r => ({ ...r, includeProjects: e.target.checked }))} />
                                        Include Projects
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 block mb-1">Page Limit</label>
                                    <div className="flex gap-2">
                                        {[1, 2].map(n => (
                                            <button key={n} onClick={() => setRequest(r => ({ ...r, pageLimit: n }))}
                                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${request.pageLimit === n ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                {n} Page{n > 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Keywords */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-base font-bold text-slate-900 mb-3">Extra Keywords</h2>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Add keyword…"
                                    value={keywordInput}
                                    onChange={e => setKeywordInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addKeyword()}
                                />
                                <button onClick={addKeyword} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">+</button>
                            </div>
                            {request.extraKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {request.extraKeywords.map(kw => (
                                        <span key={kw} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                            {kw}
                                            <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeKeyword(kw)} />
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* JD Input */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <button className="w-full flex justify-between items-center text-base font-bold text-slate-900" onClick={() => setShowJdInput(s => !s)}>
                                <span className="flex items-center gap-2"><Info className="h-4 w-4 text-indigo-500" /> Job Description</span>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showJdInput ? 'rotate-180' : ''}`} />
                            </button>
                            {showJdInput && (
                                <textarea
                                    className="w-full mt-3 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                                    rows={6}
                                    placeholder="Paste the full job description here for tailored AI generation and ATS scoring…"
                                    value={request.jobDescription}
                                    onChange={e => setRequest(r => ({ ...r, jobDescription: e.target.value }))}
                                />
                            )}
                        </div>

                        {/* Generate button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm"
                        >
                            {generating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="h-4 w-4" /> Generate Tailored Resume</>}
                        </button>
                    </div>

                    {/* ── Centre: Live Preview ──────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[700px]">
                        {/* Template selector + Download bar */}
                        <div className="border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                                <LayoutTemplate className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">Template:</span>
                                <div className="flex gap-1">
                                    {TEMPLATES.map(t => (
                                        <button key={t} onClick={() => setActiveTemplate(t)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${activeTemplate === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                            {t.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {currentVersion?.generationStatus === 'COMPLETED' && (
                                <div className="flex items-center gap-2">
                                    <div className="flex rounded-lg overflow-hidden border border-slate-200">
                                        {EXPORT_FORMATS.map(f => (
                                            <button key={f.value} onClick={() => setExportFormat(f.value as any)}
                                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${exportFormat === f.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                                                <f.icon className="h-3 w-3" />
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (exportFormat === 'PDF') {
                                                handlePrintPdf();
                                            } else {
                                                resumeBuilderApi.downloadVersion(currentVersion.id, exportFormat);
                                            }
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors"
                                    >
                                        <Download className="h-3 w-3" /> Download
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Preview area */}
                        <div className="flex-1 overflow-auto p-4">
                            {generating ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                                        <Sparkles className="h-6 w-6 text-indigo-600 absolute top-5 left-5" />
                                    </div>
                                    <p className="font-medium text-slate-600">AI is tailoring your resume…</p>
                                    <p className="text-xs text-slate-400">This usually takes 5–15 seconds</p>
                                </div>
                            ) : currentData ? (
                                <div ref={previewRef} className="shadow-lg rounded-xl overflow-hidden border border-slate-100">
                                    <ResumePreviewRenderer data={currentData} template={activeTemplate} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 py-24">
                                    <div className="bg-indigo-50 p-6 rounded-full">
                                        <FileText className="h-12 w-12 text-indigo-300" />
                                    </div>
                                    <p className="font-medium text-slate-500">No resume preview yet</p>
                                    <p className="text-sm text-slate-400 max-w-xs text-center">
                                        Configure your target settings on the left and click <strong>Generate Tailored Resume</strong>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* AI Feedback banner */}
                        {currentVersion?.aiFeedback && (
                            <div className="border-t border-slate-100 p-3 bg-indigo-50 rounded-b-2xl">
                                <p className="text-xs text-indigo-800"><span className="font-semibold">AI Feedback:</span> {currentVersion.aiFeedback}</p>
                            </div>
                        )}
                    </div>

                    {/* ── Right: ATS + Versions ────────────────────────────── */}
                    <div className="space-y-4">
                        {/* ATS Score */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-base font-bold text-slate-900 mb-4">ATS Score</h2>
                            {currentVersion?.generationStatus === 'COMPLETED' ? (
                                <>
                                    <div className="flex justify-center mb-5">
                                        <div className="relative">
                                            <svg className="h-28 w-28 -rotate-90">
                                                <circle className="text-slate-100" strokeWidth={10} stroke="currentColor" fill="transparent" r={52} cx={56} cy={56} />
                                                <circle
                                                    className={atsScore >= 80 ? 'text-green-500' : atsScore >= 60 ? 'text-yellow-500' : 'text-red-500'}
                                                    strokeWidth={10}
                                                    strokeDasharray={326.7}
                                                    strokeDashoffset={326.7 - (326.7 * atsScore) / 100}
                                                    strokeLinecap="round"
                                                    stroke="currentColor"
                                                    fill="transparent"
                                                    r={52} cx={56} cy={56}
                                                    style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-extrabold text-slate-900">{atsScore}%</span>
                                                <span className="text-[10px] text-slate-500">ATS Match</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-semibold px-2 py-1 rounded-full text-center mb-4 ${atsScore >= 80 ? 'bg-green-100 text-green-700' : atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {atsScore >= 80 ? 'Excellent Match' : atsScore >= 60 ? 'Good Match' : 'Needs Improvement'}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">Generate a resume to see your ATS score</p>
                                </div>
                            )}
                        </div>

                        {/* Saved Versions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Save className="h-4 w-4 text-indigo-500" /> Saved Versions
                                {savedVersions.length > 0 && (
                                    <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{savedVersions.length}</span>
                                )}
                            </h2>
                            {savedVersions.length > 0 ? (
                                <div className="space-y-2">
                                    {savedVersions.map(v => (
                                        <div
                                            key={v.id}
                                            onClick={() => v.generationStatus === 'COMPLETED' && handleLoadVersion(v)}
                                            className={`group relative p-3 rounded-xl border transition-all ${currentVersion?.id === v.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50'} ${v.generationStatus === 'COMPLETED' ? 'cursor-pointer' : 'opacity-60'}`}
                                        >
                                            <div className="pr-6">
                                                <p className="font-semibold text-slate-800 text-sm leading-tight">{v.versionName}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{v.targetIndustry} • {v.targetCountry}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {v.generationStatus === 'PROCESSING' && <span className="flex items-center gap-1 text-xs text-blue-600"><RefreshCw className="h-3 w-3 animate-spin" /> Processing</span>}
                                                {v.generationStatus === 'COMPLETED' && (
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${v.atsScore >= 80 ? 'bg-green-100 text-green-700' : v.atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {v.atsScore}% ATS
                                                    </span>
                                                )}
                                                {v.generationStatus === 'FAILED' && <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Failed</span>}
                                                <span className="ml-auto text-xs text-slate-400">{new Date(v.updatedAt || v.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <button
                                                onClick={e => handleDeleteVersion(v.id, e)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all rounded"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                                    <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm">No saved versions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const SelectField: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
        >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);
