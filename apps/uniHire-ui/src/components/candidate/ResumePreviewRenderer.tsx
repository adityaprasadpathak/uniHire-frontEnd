import React from 'react';
import type { ResumeVersionData } from '../../api/resumeBuilderApi';

interface Props {
    data: ResumeVersionData;
    template?: string;
}

export const ResumePreviewRenderer: React.FC<Props> = ({ data, template = 'ATS_MODERN' }) => {
    const templates: Record<string, React.FC<{ data: ResumeVersionData }>> = {
        ATS_MODERN: AtsModernTemplate,
        CORPORATE: CorporateTemplate,
        MINIMAL: MinimalTemplate,
        EXECUTIVE: ExecutiveTemplate,
        CREATIVE: CreativeTemplate,
        ACADEMIC: AcademicTemplate,
        TECH_STARTUP: TechStartupTemplate,
        MODERN_SPLIT: ModernSplitTemplate,
    };
    const Template = templates[template] || AtsModernTemplate;
    return (
        <div id="resume-preview-root" style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#fff' }}>
            <Template data={data} />
        </div>
    );
};

// ─── ATS Modern Template ────────────────────────────────────────────────────
const AtsModernTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', padding: '36px 44px', color: '#1a1a2e', fontSize: '14px', lineHeight: '1.55' }}>
        {/* Header */}
        <div style={{ borderBottom: '3px solid #4f46e5', paddingBottom: '16px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#1a1a2e' }}>{data.candidateName}</h1>
            {data.targetRole && <p style={{ margin: '4px 0 8px', color: '#4f46e5', fontWeight: 600, fontSize: '14px' }}>{data.targetRole}</p>}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#555', fontSize: '13px', marginTop: '6px' }}>
                {data.email && <span>✉ {data.email}</span>}
                {data.phone && <span>✆ {data.phone}</span>}
                {data.location && <span>📍 {data.location}</span>}
            </div>
        </div>

        {/* Summary */}
        {data.professionalSummary && (
            <Section title="Professional Summary">
                <p style={{ margin: 0, color: '#333' }}>{data.professionalSummary}</p>
            </Section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
            <Section title="Technical Skills">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {data.skills.map((s, i) => (
                        <span key={i} style={{ background: '#ede9fe', color: '#4f46e5', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                            {s}
                        </span>
                    ))}
                </div>
            </Section>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
            <Section title="Experience">
                {data.experiences.map((exp, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{exp.jobTitle}</span>
                                <span style={{ color: '#4f46e5', fontWeight: 500 }}> — {exp.company}</span>
                            </div>
                            <span style={{ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                {exp.startDate} – {exp.endDate || 'Present'}
                            </span>
                        </div>
                        {exp.bullets && exp.bullets.length > 0 && (
                            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                                {exp.bullets.map((b, bi) => (
                                    <li key={bi} style={{ marginBottom: '4px', color: '#333' }}>{b}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </Section>
        )}

        {/* Education */}
        {data.educations && data.educations.length > 0 && (
            <Section title="Education">
                {data.educations.map((edu, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div>
                            <span style={{ fontWeight: 600 }}>{edu.degree}</span>
                            <span style={{ color: '#555' }}> — {edu.institution}</span>
                        </div>
                        <span style={{ color: '#888', fontSize: '12px' }}>{edu.startDate} – {edu.endDate || 'Present'}</span>
                    </div>
                ))}
            </Section>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
            <Section title="Certifications">
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {data.certifications.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                </ul>
            </Section>
        )}

        {/* Keywords */}
        {data.keywords && data.keywords.length > 0 && (
            <Section title="Keywords">
                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{data.keywords.join(' • ')}</p>
            </Section>
        )}
    </div>
);

// ─── Corporate Template ─────────────────────────────────────────────────────
const CorporateTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', color: '#1a1a1a', fontSize: '13px', lineHeight: '1.55' }}>
        {/* Blue header bar */}
        <div style={{ background: '#1e3a5f', color: '#fff', padding: '32px 40px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>{data.candidateName}</h1>
            {data.targetRole && <p style={{ margin: '6px 0 0', fontSize: '15px', color: '#a8c4e0', fontWeight: 500 }}>{data.targetRole}</p>}
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', color: '#cde' }}>
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>{data.phone}</span>}
                {data.location && <span>{data.location}</span>}
            </div>
        </div>
        <div style={{ padding: '28px 36px' }}>
            {data.professionalSummary && (
                <Section title="Profile Summary" color="#1e3a5f">
                    <p style={{ margin: 0 }}>{data.professionalSummary}</p>
                </Section>
            )}
            {data.skills && data.skills.length > 0 && (
                <Section title="Core Competencies" color="#1e3a5f">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                        {data.skills.map((s, i) => <span key={i} style={{ fontSize: '13px' }}>▸ {s}</span>)}
                    </div>
                </Section>
            )}
            {data.experiences && data.experiences.length > 0 && (
                <Section title="Professional Experience" color="#1e3a5f">
                    {data.experiences.map((exp, i) => (
                        <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{exp.jobTitle}</strong>
                                <span style={{ color: '#888', fontSize: '12px' }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                            </div>
                            <div style={{ color: '#1e3a5f', fontWeight: 500, marginBottom: '6px' }}>{exp.company}</div>
                            {exp.bullets && <ul style={{ margin: 0, paddingLeft: '16px' }}>{exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}</ul>}
                        </div>
                    ))}
                </Section>
            )}
            {data.educations && data.educations.length > 0 && (
                <Section title="Education" color="#1e3a5f">
                    {data.educations.map((edu, i) => (
                        <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px' }}>
                            <strong>{edu.degree}</strong> — {edu.institution}
                            <span style={{ color: '#888', fontSize: '12px', marginLeft: '8px' }}>{edu.startDate} – {edu.endDate || 'Present'}</span>
                        </div>
                    ))}
                </Section>
            )}
        </div>
    </div>
);

// ─── Minimal Template ───────────────────────────────────────────────────────
const MinimalTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', padding: '44px 40px', color: '#222', fontSize: '14px', lineHeight: '1.6' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>{data.candidateName}</h1>
        {data.targetRole && <p style={{ margin: '0 0 12px', color: '#888', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>{data.targetRole}</p>}
        <div style={{ color: '#999', fontSize: '13px', marginBottom: '28px' }}>
            {[data.email, data.phone, data.location].filter(Boolean).join(' · ')}
        </div>
        {data.professionalSummary && <div style={{ marginBottom: '28px', color: '#555', fontStyle: 'italic' }}>{data.professionalSummary}</div>}
        {data.skills && data.skills.length > 0 && (
            <MinimalSection title="Skills">
                <p style={{ margin: 0, color: '#444' }}>{data.skills.join(', ')}</p>
            </MinimalSection>
        )}
        {data.experiences && data.experiences.length > 0 && (
            <MinimalSection title="Experience">
                {data.experiences.map((exp, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{exp.jobTitle}, {exp.company}</strong>
                            <span style={{ color: '#999', fontSize: '12px' }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                        </div>
                        {exp.bullets && <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '3px', color: '#444' }}>{b}</li>)}</ul>}
                    </div>
                ))}
            </MinimalSection>
        )}
        {data.educations && data.educations.length > 0 && (
            <MinimalSection title="Education">
                {data.educations.map((edu, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span><strong>{edu.degree}</strong> — {edu.institution}</span>
                        <span style={{ color: '#999', fontSize: '12px' }}>{edu.startDate} – {edu.endDate || 'Present'}</span>
                    </div>
                ))}
            </MinimalSection>
        )}
    </div>
);

// ─── Executive Template ─────────────────────────────────────────────────────
const ExecutiveTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', padding: '36px 40px', color: '#1a1a1a', fontSize: '13.5px', lineHeight: '1.6' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #b8860b', paddingBottom: '20px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 6px', color: '#1a1a1a' }}>{data.candidateName}</h1>
            {data.targetRole && <p style={{ margin: '0 0 10px', color: '#b8860b', fontSize: '14px', fontWeight: 600, letterSpacing: '1px' }}>{data.targetRole}</p>}
            <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{[data.email, data.phone, data.location].filter(Boolean).join(' | ')}</p>
        </div>
        {data.professionalSummary && (
            <Section title="Executive Profile" color="#b8860b">
                <p style={{ margin: 0, fontStyle: 'italic', color: '#333', fontSize: '14px' }}>{data.professionalSummary}</p>
            </Section>
        )}
        {data.skills && data.skills.length > 0 && (
            <Section title="Areas of Expertise" color="#b8860b">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 16px' }}>
                    {data.skills.map((s, i) => <span key={i}>• {s}</span>)}
                </div>
            </Section>
        )}
        {data.experiences && data.experiences.length > 0 && (
            <Section title="Career History" color="#b8860b">
                {data.experiences.map((exp, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ fontSize: '14px' }}>{exp.company}</strong>
                            <span style={{ color: '#888', fontSize: '12px' }}>{exp.startDate} – {exp.endDate || 'Present'}</span>
                        </div>
                        <div style={{ color: '#b8860b', fontStyle: 'italic', marginBottom: '6px' }}>{exp.jobTitle}</div>
                        {exp.bullets && <ul style={{ margin: 0, paddingLeft: '18px' }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: '4px' }}>{b}</li>)}</ul>}
                    </div>
                ))}
            </Section>
        )}
        {data.educations && data.educations.length > 0 && (
            <Section title="Education" color="#b8860b">
                {data.educations.map((edu, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px' }}>
                        <strong>{edu.degree}</strong> — {edu.institution}
                        {edu.endDate && <span style={{ color: '#888', marginLeft: '8px', fontSize: '12px' }}>{edu.endDate}</span>}
                    </div>
                ))}
            </Section>
        )}
    </div>
);

// ─── Shared helper components ───────────────────────────────────────────────
const Section: React.FC<{ title: string; color?: string; children: React.ReactNode }> = ({ title, color = '#4f46e5', children }) => (
    <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color, borderBottom: `1px solid ${color}33`, paddingBottom: '4px', marginBottom: '10px' }}>
            {title}
        </h2>
        {children}
    </div>
);

const MinimalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#999', marginBottom: '10px' }}>{title}</div>
        {children}
    </div>
);

// ─── Creative Template ──────────────────────────────────────────────────────
const CreativeTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', display: 'flex', color: '#333', fontSize: '13px', lineHeight: '1.5' }}>
        {/* Left Column - Dark Sidebar */}
        <div style={{ width: '30%', background: '#2c3e50', color: '#fff', padding: '40px 24px', minHeight: '100%' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px', lineHeight: '1.2' }}>{data.candidateName}</h1>
            {data.targetRole && <p style={{ margin: '0 0 24px', color: '#1abc9c', fontSize: '14px', fontWeight: 600 }}>{data.targetRole}</p>}
            
            <div style={{ fontSize: '12px', marginBottom: '32px', color: '#bdc3c7' }}>
                <div style={{ marginBottom: '8px' }}>{data.email}</div>
                <div style={{ marginBottom: '8px' }}>{data.phone}</div>
                <div style={{ marginBottom: '8px' }}>{data.location}</div>
            </div>

            {data.skills && data.skills.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ borderBottom: '1px solid #34495e', paddingBottom: '8px', color: '#1abc9c', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>Expertise</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {data.skills.map((s, i) => (
                            <span key={i} style={{ background: '#34495e', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>{s}</span>
                        ))}
                    </div>
                </div>
            )}
            
            {data.educations && data.educations.length > 0 && (
                <div>
                    <h3 style={{ borderBottom: '1px solid #34495e', paddingBottom: '8px', color: '#1abc9c', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px' }}>Education</h3>
                    {data.educations.map((edu, i) => (
                        <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: '12px' }}>
                            <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                            <div style={{ color: '#bdc3c7', fontSize: '11px' }}>{edu.institution}</div>
                            <div style={{ color: '#7f8c8d', fontSize: '10px' }}>{edu.startDate} – {edu.endDate || 'Present'}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Right Column - Main Content */}
        <div style={{ width: '70%', padding: '40px 32px', background: '#fff' }}>
            {data.professionalSummary && (
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Profile</h2>
                    <p style={{ margin: 0, color: '#555' }}>{data.professionalSummary}</p>
                </div>
            )}

            {data.experiences && data.experiences.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Experience</h2>
                    {data.experiences.map((exp, i) => (
                        <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#2c3e50' }}>{exp.jobTitle}</div>
                                <div style={{ fontSize: '12px', color: '#1abc9c', fontWeight: 600 }}>{exp.startDate} – {exp.endDate || 'Present'}</div>
                            </div>
                            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '8px', fontWeight: 500 }}>{exp.company}</div>
                            {exp.bullets && exp.bullets.length > 0 && (
                                <ul style={{ margin: 0, paddingLeft: '16px', color: '#555' }}>
                                    {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: '4px' }}>{b}</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// ─── Academic Template ──────────────────────────────────────────────────────
const AcademicTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', padding: '40px 48px', color: '#000', fontFamily: '"Times New Roman", Times, serif', fontSize: '14px', lineHeight: '1.4' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', margin: '0 0 8px' }}>{data.candidateName}</h1>
            <div style={{ fontSize: '13px' }}>
                {data.location && <span>{data.location} • </span>}
                {data.phone && <span>{data.phone} • </span>}
                {data.email && <span>{data.email}</span>}
            </div>
        </div>

        {data.professionalSummary && (
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', borderBottom: '1px solid #000', margin: '0 0 8px', textTransform: 'uppercase' }}>Summary</h2>
                <p style={{ margin: 0 }}>{data.professionalSummary}</p>
            </div>
        )}

        {data.educations && data.educations.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', borderBottom: '1px solid #000', margin: '0 0 12px', textTransform: 'uppercase' }}>Education</h2>
                {data.educations.map((edu, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{edu.institution}</span>
                            <span>{edu.startDate} – {edu.endDate || 'Present'}</span>
                        </div>
                        <div style={{ fontStyle: 'italic' }}>{edu.degree}</div>
                        {edu.description && <div style={{ marginTop: '4px' }}>{edu.description}</div>}
                    </div>
                ))}
            </div>
        )}

        {data.experiences && data.experiences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', borderBottom: '1px solid #000', margin: '0 0 12px', textTransform: 'uppercase' }}>Academic & Professional Experience</h2>
                {data.experiences.map((exp, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{exp.jobTitle}, {exp.company}</span>
                            <span>{exp.startDate} – {exp.endDate || 'Present'}</span>
                        </div>
                        {exp.bullets && exp.bullets.length > 0 && (
                            <ul style={{ margin: '4px 0 0', paddingLeft: '20px' }}>
                                {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: '2px' }}>{b}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        )}

        {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', borderBottom: '1px solid #000', margin: '0 0 8px', textTransform: 'uppercase' }}>Skills & Expertise</h2>
                <div>{data.skills.join(', ')}</div>
            </div>
        )}
    </div>
);

// ─── Tech Startup Template ──────────────────────────────────────────────────
const TechStartupTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', padding: '40px 48px', color: '#d1d5db', background: '#111827', fontSize: '13px', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '24px', marginBottom: '24px' }}>
            <div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 4px', color: '#f3f4f6', letterSpacing: '-0.5px' }}>
                    <span style={{ color: '#3b82f6' }}>{data.candidateName.split(' ')[0]}</span> {data.candidateName.substring(data.candidateName.indexOf(' ') + 1)}
                </h1>
                {data.targetRole && <div style={{ color: '#9ca3af', fontSize: '16px', fontWeight: 500 }}>{data.targetRole}</div>}
            </div>
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af' }}>
                <div>{data.email}</div>
                <div>{data.phone}</div>
                <div>{data.location}</div>
            </div>
        </div>

        {data.professionalSummary && (
            <div style={{ marginBottom: '28px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>{data.professionalSummary}</p>
            </div>
        )}

        {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7280', marginBottom: '12px', fontWeight: 600 }}>Core Technologies</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {data.skills.map((s, i) => (
                        <span key={i} style={{ background: '#1f2937', color: '#60a5fa', border: '1px solid #374151', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500 }}>{s}</span>
                    ))}
                </div>
            </div>
        )}

        {data.experiences && data.experiences.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7280', marginBottom: '16px', fontWeight: 600 }}>Experience</div>
                {data.experiences.map((exp, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '24px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #374151' }}>
                        <div style={{ position: 'absolute', left: '-5px', top: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: '#f3f4f6' }}>{exp.jobTitle} <span style={{ color: '#6b7280', fontWeight: 400 }}>@ {exp.company}</span></div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>{exp.startDate} – {exp.endDate || 'PRESENT'}</div>
                        </div>
                        {exp.bullets && exp.bullets.length > 0 && (
                            <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
                                {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: '6px' }}>{b}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        )}

        {data.educations && data.educations.length > 0 && (
            <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6b7280', marginBottom: '12px', fontWeight: 600 }}>Education</div>
                {data.educations.map((edu, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                            <span style={{ color: '#f3f4f6', fontWeight: 500 }}>{edu.degree}</span>
                            <span style={{ color: '#9ca3af' }}> — {edu.institution}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>{edu.startDate} – {edu.endDate || 'PRESENT'}</div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ─── Modern Split Template (Image Match) ────────────────────────────────────
const ModernSplitTemplate: React.FC<{ data: ResumeVersionData }> = ({ data }) => (
    <div style={{ width: '100%', padding: '40px 48px', color: '#1a1a1a', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontSize: '12px', lineHeight: '1.5' }}>
        
        {/* Header Section */}
        <div style={{ borderBottom: '1px solid #d1d5db', paddingBottom: '24px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.5px', color: '#000' }}>{data.candidateName}</h1>
            {data.targetRole && <div style={{ fontSize: '15px', color: '#4b5563' }}>{data.targetRole}</div>}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'flex', width: '100%' }}>
            
            {/* Left Sidebar */}
            <div style={{ width: '32%', paddingRight: '24px', borderRight: '1px solid #d1d5db' }}>
                
                {/* Profile Contact */}
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', color: '#000' }}>Profile</h3>
                    {data.location && (
                        <div style={{ display: 'flex', marginBottom: '12px' }}>
                            <div style={{ width: '20px', fontWeight: 'bold' }}>📍</div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Personal Address</div>
                                <div style={{ color: '#4b5563' }}>{data.location}</div>
                            </div>
                        </div>
                    )}
                    {data.email && (
                        <div style={{ display: 'flex', marginBottom: '12px' }}>
                            <div style={{ width: '20px', fontWeight: 'bold' }}>✉</div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Email</div>
                                <div style={{ color: '#4b5563' }}>{data.email}</div>
                            </div>
                        </div>
                    )}
                    {data.phone && (
                        <div style={{ display: 'flex', marginBottom: '12px' }}>
                            <div style={{ width: '20px', fontWeight: 'bold' }}>✆</div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Mobile</div>
                                <div style={{ color: '#4b5563' }}>{data.phone}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Skills */}
                {data.skills && data.skills.length > 0 && (
                    <div style={{ marginBottom: '32px', borderTop: '1px solid #d1d5db', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', color: '#000' }}>Skills</h3>
                        <div style={{ color: '#4b5563' }}>
                            {data.skills.map((skill, i) => (
                                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '4px' }}>- {skill}</div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications (Mapping to Languages/Hobbies layout) */}
                {data.certifications && data.certifications.length > 0 && (
                    <div style={{ marginBottom: '32px', borderTop: '1px solid #d1d5db', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', color: '#000' }}>Certifications</h3>
                        <div style={{ color: '#4b5563' }}>
                            {data.certifications.map((cert, i) => (
                                <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '4px' }}>- {cert}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Content */}
            <div style={{ width: '68%', paddingLeft: '24px' }}>
                
                {/* About Me */}
                {data.professionalSummary && (
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 12px', textTransform: 'uppercase', color: '#000' }}>About Me</h3>
                        <p style={{ margin: 0, color: '#4b5563' }}>{data.professionalSummary}</p>
                    </div>
                )}

                {/* Professional Experience */}
                {data.experiences && data.experiences.length > 0 && (
                    <div style={{ marginBottom: '32px', borderTop: '1px solid #d1d5db', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 20px', textTransform: 'uppercase', color: '#000' }}>Professional Experience</h3>
                        
                        {data.experiences.map((exp, i) => (
                            <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', marginBottom: '24px' }}>
                                {/* Position / Company */}
                                <div style={{ width: '35%', paddingRight: '16px' }}>
                                    <div style={{ fontWeight: 600, color: '#000' }}>{exp.jobTitle}</div>
                                    <div style={{ color: '#4b5563' }}>{exp.company}</div>
                                </div>
                                {/* Dates and Description */}
                                <div style={{ width: '65%' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '8px', color: '#000' }}>{exp.startDate} – {exp.endDate || 'Present'}</div>
                                    {exp.bullets && exp.bullets.length > 0 && (
                                        <div style={{ color: '#4b5563' }}>
                                            {exp.bullets.map((b, j) => <div key={j} style={{ marginBottom: '4px' }}>{b}</div>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {data.educations && data.educations.length > 0 && (
                    <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 20px', textTransform: 'uppercase', color: '#000' }}>Education</h3>
                        
                        {data.educations.map((edu, i) => (
                            <div key={i} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', display: 'flex', marginBottom: '20px' }}>
                                {/* Dates */}
                                <div style={{ width: '35%', paddingRight: '16px', color: '#4b5563' }}>
                                    <div>{edu.startDate}</div>
                                    <div>{edu.endDate || 'Present'}</div>
                                </div>
                                {/* Degree and Description */}
                                <div style={{ width: '65%' }}>
                                    <div style={{ fontWeight: 700, marginBottom: '4px', color: '#000' }}>{edu.degree} – {edu.institution}</div>
                                    {edu.description && (
                                        <div style={{ color: '#4b5563' }}>{edu.description}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default ResumePreviewRenderer;
