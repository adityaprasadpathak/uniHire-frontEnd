import { useState, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link, useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEFAULT_SCREENING_QUESTIONS = [
  'What is your current CTC?',
  'What is your expected CTC?',
  'What is your notice period?',
];

interface JobFormData {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salary: string;
  numberOfVacancies: number;
  skills: string;
  description: string;
  benefits: string;
  status: 'DRAFT' | 'PUBLISHED';
  
  // New fields
  experience: string;
  minExperience: number;
  maxExperience: number;
  jobLevel: string;
  workMode: string;
  openings: number;
  education: string;
  preferredSkills: string;
  certifications: string;
  languages: string;
  responsibilities: string;
  qualifications: string;
  workingDays: string;
  shiftTiming: string;
  travelRequirement: string;
  noticePeriod: string;
  employmentCategory: string;
  industry: string;
  incentives: string;
  hiringManager: string;
  recruiter: string;
  interviewProcess: string;
  screeningQuestions: string;
  expiryDate: string;
}

export default function JobFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Skill Chip Lists
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [preferredSkillsList, setPreferredSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');

  // Screening questions list – pre-populated with default questions
  const [screeningList, setScreeningList] = useState<string[]>([...DEFAULT_SCREENING_QUESTIONS]);
  const [questionInput, setQuestionInput] = useState('');

  // Languages chip list state
  const [languagesList, setLanguagesList] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');

  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { register, handleSubmit, setValue, trigger, reset, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      status: 'PUBLISHED',
      numberOfVacancies: 1,
      jobLevel: 'Entry Level',
      workMode: 'On-site',
      employmentType: 'Full-time',
      employmentCategory: 'Permanent',
      travelRequirement: 'No Travel',
      noticePeriod: 'Immediate',
      openings: 1,
      minExperience: 0,
      maxExperience: 2
    }
  });

  const { data: jobData, isLoading: isLoadingJob } = useQuery({
    queryKey: ['jobDetails', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/employer/jobs/${id}`);
      return data;
    },
    enabled: isEditMode
  });

  useEffect(() => {
    if (jobData) {
      reset({
        title: jobData.title || '',
        department: jobData.department || '',
        location: jobData.location || '',
        employmentType: jobData.employmentType || 'Full-time',
        salary: jobData.salary || '',
        numberOfVacancies: jobData.numberOfVacancies || 1,
        skills: jobData.skills || '',
        description: jobData.description || '',
        benefits: jobData.benefits || '',
        status: jobData.status || 'PUBLISHED',
        
        minExperience: jobData.minExperience || 0,
        maxExperience: jobData.maxExperience || 2,
        jobLevel: jobData.jobLevel || 'Entry Level',
        workMode: jobData.workMode || 'On-site',
        openings: jobData.openings || 1,
        education: jobData.education || 'Any Graduate',
        preferredSkills: jobData.preferredSkills || '',
        certifications: jobData.certifications || '',
        languages: jobData.languages || '',
        responsibilities: jobData.responsibilities || '',
        qualifications: jobData.qualifications || '',
        workingDays: jobData.workingDays || 'Monday-Friday',
        shiftTiming: jobData.shiftTiming || 'General Shift',
        travelRequirement: jobData.travelRequirement || 'No Travel',
        noticePeriod: jobData.noticePeriod || 'Immediate',
        employmentCategory: jobData.employmentCategory || 'Permanent',
        industry: jobData.industry || 'Banking',
        incentives: jobData.incentives || '',
        hiringManager: jobData.hiringManager || '',
        recruiter: jobData.recruiter || '',
        interviewProcess: jobData.interviewProcess || '',
        expiryDate: jobData.expiryDate ? jobData.expiryDate.substring(0, 10) : ''
      });

      if (jobData.skills) {
        setSkillsList(jobData.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
      if (jobData.preferredSkills) {
        setPreferredSkillsList(jobData.preferredSkills.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
      if (jobData.languages) {
        setLanguagesList(jobData.languages.split(',').map((s: string) => s.trim()).filter(Boolean));
      }
      if (jobData.screeningQuestions) {
        try {
          const parsed = JSON.parse(jobData.screeningQuestions);
          if (Array.isArray(parsed)) {
            // Prepend any default questions that aren't already saved
            const missingDefaults = DEFAULT_SCREENING_QUESTIONS.filter(
              (dq) => !parsed.includes(dq)
            );
            setScreeningList([...missingDefaults, ...parsed]);
          }
        } catch (e) {
          // Fallback: if not valid JSON, just use defaults
          setScreeningList([...DEFAULT_SCREENING_QUESTIONS]);
        }
      } else {
        // No questions saved yet — start with defaults
        setScreeningList([...DEFAULT_SCREENING_QUESTIONS]);
      }
    }
  }, [jobData, reset]);

  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      if (isEditMode) {
        const response = await apiClient.put(`/employer/jobs/${id}`, data);
        return response.data;
      } else {
        const response = await apiClient.post('/employer/jobs', data);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Job updated successfully!' : 'Job posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['jobDetails', id] });
      }
      navigate('/dashboard/jobs');
    },
    onError: () => {
      setErrorMsg(isEditMode ? 'Failed to update job posting' : 'Failed to create job posting');
      toast.error(isEditMode ? 'Failed to update job posting' : 'Failed to create job posting');
    }
  });

  const onSubmit = (data: JobFormData) => {
    setErrorMsg('');
    // Format screening questions as JSON list
    data.screeningQuestions = JSON.stringify(screeningList);
    // Fill legacy fields for backward compatibility
    data.experience = `${data.minExperience}-${data.maxExperience} Years`;
    data.numberOfVacancies = data.openings;

    // Convert date YYYY-MM-DD to YYYY-MM-DDT23:59:59 LocalDateTime format
    if (data.expiryDate && !data.expiryDate.includes('T')) {
      data.expiryDate = `${data.expiryDate}T23:59:59`;
    }

    createJobMutation.mutate(data);
  };

  const addSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim().replace(/,$/, '');
      if (val && !skillsList.includes(val)) {
        const newList = [...skillsList, val];
        setSkillsList(newList);
        setValue('skills', newList.join(','));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    const newList = skillsList.filter((_, i) => i !== index);
    setSkillsList(newList);
    setValue('skills', newList.join(','));
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const skillsToAdd = pastedText.split(',').map(s => s.trim()).filter(Boolean);
    if (skillsToAdd.length > 0) {
      const newList = [...skillsList];
      skillsToAdd.forEach(skill => {
        if (!newList.includes(skill)) {
          newList.push(skill);
        }
      });
      setSkillsList(newList);
      setValue('skills', newList.join(','));
    }
  };

  const addPrefSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = prefSkillInput.trim().replace(/,$/, '');
      if (val && !preferredSkillsList.includes(val)) {
        const newList = [...preferredSkillsList, val];
        setPreferredSkillsList(newList);
        setValue('preferredSkills', newList.join(','));
      }
      setPrefSkillInput('');
    }
  };

  const removePrefSkill = (index: number) => {
    const newList = preferredSkillsList.filter((_, i) => i !== index);
    setPreferredSkillsList(newList);
    setValue('preferredSkills', newList.join(','));
  };

  const handlePrefPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const skillsToAdd = pastedText.split(',').map(s => s.trim()).filter(Boolean);
    if (skillsToAdd.length > 0) {
      const newList = [...preferredSkillsList];
      skillsToAdd.forEach(skill => {
        if (!newList.includes(skill)) {
          newList.push(skill);
        }
      });
      setPreferredSkillsList(newList);
      setValue('preferredSkills', newList.join(','));
    }
  };

  const addLanguage = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = languageInput.trim().replace(/,$/, '');
      if (val && !languagesList.includes(val)) {
        const newList = [...languagesList, val];
        setLanguagesList(newList);
        setValue('languages', newList.join(','));
      }
      setLanguageInput('');
    }
  };

  const removeLanguage = (index: number) => {
    const newList = languagesList.filter((_, i) => i !== index);
    setLanguagesList(newList);
    setValue('languages', newList.join(','));
  };

  const handleLanguagePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const languagesToAdd = pastedText.split(',').map(s => s.trim()).filter(Boolean);
    if (languagesToAdd.length > 0) {
      const newList = [...languagesList];
      languagesToAdd.forEach(lang => {
        if (!newList.includes(lang)) {
          newList.push(lang);
        }
      });
      setLanguagesList(newList);
      setValue('languages', newList.join(','));
    }
  };

  const addQuestion = () => {
    const val = questionInput.trim();
    if (val && !screeningList.includes(val)) {
      setScreeningList([...screeningList, val]);
    }
    setQuestionInput('');
  };

  const removeQuestion = (index: number) => {
    setScreeningList(screeningList.filter((_, i) => i !== index));
  };

  const handleFormKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === 'Enter' && target.tagName === 'INPUT') {
      e.preventDefault();
    }
  };

  const handleQuestionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQuestion();
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof JobFormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['title', 'department', 'location'];
    } else if (currentStep === 2) {
      // Trigger validation on skills
      fieldsToValidate = ['skills'];
      if (skillsList.length === 0) {
        toast.error('Please add at least one required skill tag.');
        return;
      }
    } else if (currentStep === 3) {
      fieldsToValidate = ['description', 'responsibilities'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please resolve validation errors before continuing.');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Requirements' },
    { number: 3, label: 'Job Details' },
    { number: 4, label: 'Hiring & Salary' }
  ];

  if (isEditMode && isLoadingJob) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <span>Loading draft job details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link to="/dashboard/jobs" className="text-blue-600 hover:underline flex items-center gap-2 text-sm font-medium mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}</h1>
          <p className="text-slate-500 text-sm">{isEditMode ? 'Edit the details of your draft job below.' : 'Post a job using our step-by-step recruitment form.'}</p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          Step {currentStep} of 4
        </span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-8 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1 last:flex-initial">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2 transition-all duration-300 ${
                  currentStep === step.number
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : currentStep > step.number
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}>
                  {currentStep > step.number ? '✓' : step.number}
                </div>
                <span className={`text-[10px] sm:text-xs mt-1.5 font-medium ${
                  currentStep === step.number ? 'text-blue-600 font-semibold' : 'text-slate-500'
                }`}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-6">
        
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Step 1: Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title*</label>
                <input 
                  {...register('title', { required: 'Job Title is required' })} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Branch Relationship Manager" 
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department*</label>
                <input 
                  {...register('department', { required: 'Department is required' })} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Retail Banking" 
                />
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Level</label>
                <select 
                  {...register('jobLevel')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Entry Level">Entry Level</option>
                  <option value="Associate">Associate</option>
                  <option value="Officer">Officer</option>
                  <option value="Senior Officer">Senior Officer</option>
                  <option value="Manager">Manager</option>
                  <option value="Senior Manager">Senior Manager</option>
                  <option value="AVP">AVP</option>
                  <option value="VP">VP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                <select 
                  {...register('employmentType')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Mode</label>
                <select 
                  {...register('workMode')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Branch*</label>
                <input 
                  {...register('location', { required: 'Location is required' })} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Connaught Place, New Delhi" 
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Openings</label>
                <input 
                  type="number"
                  {...register('openings', { min: 1 })} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. 5" 
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CANDIDATE REQUIREMENTS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Step 2: Candidate Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Experience (Years)</label>
                <input 
                  type="number"
                  {...register('minExperience', { min: 0 })} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Experience (Years)</label>
                <input 
                  type="number"
                  {...register('maxExperience', { min: 0 })} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Education Qualification</label>
                <select 
                  {...register('education')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Any Graduate">Any Graduate</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="B.Com">B.Com</option>
                  <option value="M.Com">M.Com</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="CA">CA</option>
                  <option value="ICWA">ICWA</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Languages (Type language and press Enter or comma)</label>
                <div className="border border-slate-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white min-h-[42px] flex flex-wrap gap-1.5 items-center">
                  {languagesList.map((lang, index) => (
                    <span key={lang} className="bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md px-2.5 py-0.5 text-sm flex items-center gap-1 font-medium">
                      {lang}
                      <button type="button" onClick={() => removeLanguage(index)} className="text-indigo-500 hover:text-indigo-700">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={addLanguage}
                    onPaste={handleLanguagePaste}
                    placeholder={languagesList.length === 0 ? "e.g. English, Hindi, Spanish" : ""}
                    className="flex-1 min-w-[120px] focus:outline-none py-0.5 text-sm"
                  />
                </div>
                <input type="hidden" {...register('languages')} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills (Type skill and press Enter or comma)*</label>
                <div className="border border-slate-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white min-h-[42px] flex flex-wrap gap-1.5 items-center">
                  {skillsList.map((skill, index) => (
                    <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2.5 py-0.5 text-sm flex items-center gap-1 font-medium">
                      {skill}
                      <button type="button" onClick={() => removeSkill(index)} className="text-blue-500 hover:text-blue-700">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    onPaste={handlePaste}
                    placeholder={skillsList.length === 0 ? "e.g. Cash Handling, KYC" : ""}
                    className="flex-1 min-w-[120px] focus:outline-none py-0.5 text-sm"
                  />
                </div>
                <input type="hidden" {...register('skills', { required: 'At least one skill is required' })} />
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Skills (Type skill and press Enter or comma)</label>
                <div className="border border-slate-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white min-h-[42px] flex flex-wrap gap-1.5 items-center">
                  {preferredSkillsList.map((skill, index) => (
                    <span key={skill} className="bg-purple-50 text-purple-700 border border-purple-200 rounded-md px-2.5 py-0.5 text-sm flex items-center gap-1 font-medium">
                      {skill}
                      <button type="button" onClick={() => removePrefSkill(index)} className="text-purple-500 hover:text-purple-700">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={prefSkillInput}
                    onChange={(e) => setPrefSkillInput(e.target.value)}
                    onKeyDown={addPrefSkill}
                    onPaste={handlePrefPaste}
                    placeholder={preferredSkillsList.length === 0 ? "e.g. CASA Sales, Cross Selling" : ""}
                    className="flex-1 min-w-[120px] focus:outline-none py-0.5 text-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Required Certifications (Comma separated)</label>
                <input 
                  {...register('certifications')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. NISM, AMFI, JAIIB, CAIIB" 
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: JOB DETAILS & DESCRIPTIONS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Step 3: Job Details & Descriptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Key Responsibilities*</label>
                <textarea 
                  {...register('responsibilities', { required: 'Key Responsibilities are required' })} 
                  rows={4}
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Handle customer transactions, verify KYC, cash reconciliation..." 
                ></textarea>
                {errors.responsibilities && <p className="text-red-500 text-sm mt-1">{errors.responsibilities.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Description / Overview*</label>
                <textarea 
                  {...register('description', { required: 'Description is required' })} 
                  rows={5}
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Provide an overview of the role..." 
                ></textarea>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications / Required Background</label>
                <textarea 
                  {...register('qualifications')} 
                  rows={3}
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Detail any specific qualifications or educational background..." 
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Benefits</label>
                <textarea 
                  {...register('benefits')} 
                  rows={3}
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Health Insurance, PF, Performance Bonus, Paid Leaves" 
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Working Days</label>
                <select 
                  {...register('workingDays')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Monday-Friday">Monday-Friday</option>
                  <option value="Monday-Saturday">Monday-Saturday</option>
                  <option value="Rotational Week Off">Rotational Week Off</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shift Timing</label>
                <select 
                  {...register('shiftTiming')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="General Shift">General Shift</option>
                  <option value="Rotational Shift">Rotational Shift</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Travel Requirement</label>
                <select 
                  {...register('travelRequirement')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="No Travel">No Travel</option>
                  <option value="10% Travel">10% Travel</option>
                  <option value="25% Travel">25% Travel</option>
                  <option value="50% Travel">50% Travel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notice Period Preference</label>
                <select 
                  {...register('noticePeriod')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: COMPENSATION, HIRING & SCREENING */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Step 4: Compensation & Hiring Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
                <input 
                  {...register('salary')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. 5,00,000 - 8,00,000 INR" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Incentives / Bonus (Optional)</label>
                <input 
                  {...register('incentives')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Performance-linked bonus up to 20%" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hiring Manager</label>
                <input 
                  {...register('hiringManager')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Rajesh Kumar" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recruiter Name / ID</label>
                <input 
                  {...register('recruiter')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. Sneha Sharma" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
                <input 
                  type="date"
                  {...register('expiryDate')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Category</label>
                <select 
                  {...register('employmentCategory')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Consultant">Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <select 
                  {...register('industry')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Banking">Banking</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="IT">IT / Software</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Interview Process (e.g. HR, Technical, Final)</label>
                <input 
                  {...register('interviewProcess')} 
                  className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g. HR Round -> Technical -> Final Discussion" 
                />
              </div>

              {/* Screening Questions Section */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4">
                <label className="block text-sm font-semibold text-slate-800 mb-1">Screening Questions</label>
                <p className="text-slate-400 text-xs mb-3">
                  Default questions are pre-added below. You may remove any question or add your own.
                </p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyDown={handleQuestionKeyDown}
                    placeholder="e.g. Do you have active NISM certification?"
                    className="flex-1 border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold py-2 px-4 rounded-md transition duration-200 flex items-center gap-1.5 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {screeningList.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                    {screeningList.map((q, idx) => {
                      const isDefault = DEFAULT_SCREENING_QUESTIONS.includes(q);
                      return (
                        <div
                          key={`${q}-${idx}`}
                          className={`flex justify-between items-center bg-white p-2.5 rounded-md border text-sm ${
                            isDefault ? 'border-blue-100' : 'border-slate-100'
                          }`}
                        >
                          <span className="font-medium text-slate-700 flex items-center gap-2">
                            {idx + 1}. {q}
                            {isDefault && (
                              <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 leading-none">
                                Default
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(idx)}
                            className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                            title="Remove question"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Wizard Navigation Buttons */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-6">
          <button 
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-md hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Back
          </button>
          
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => navigate('/dashboard/jobs')}
              className="px-6 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < 4 ? (
              <button 
                key="next-btn"
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
              >
                Next
              </button>
            ) : (
              <button 
                key="submit-btn"
                type="submit"
                disabled={createJobMutation.isPending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {createJobMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {createJobMutation.isPending ? (isEditMode ? 'Saving...' : 'Publishing...') : (isEditMode ? 'Save Changes' : 'Publish Job')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
