'use client';

import React, { useState, useTransition } from 'react';
import type { ContentPageSummaryDto, AnnouncementAdminDto } from '../../actions/content.actions';
import {
  saveContentPageAction,
  publishContentPageAction,
  archiveContentPageAction,
  saveAnnouncementAction,
  deleteAnnouncementAction,
} from '../../actions/content.actions';

export interface ContentWorkbenchClientProps {
  readonly initialPages: readonly ContentPageSummaryDto[];
  readonly initialAnnouncements: readonly AnnouncementAdminDto[];
}

export function ContentWorkbenchClient({
  initialPages,
  initialAnnouncements,
}: ContentWorkbenchClientProps) {
  const [activeTab, setActiveTab] = useState<'PAGES' | 'ANNOUNCEMENTS'>('PAGES');
  const [pages, setPages] = useState<readonly ContentPageSummaryDto[]>(initialPages);
  const [announcements, setAnnouncements] =
    useState<readonly AnnouncementAdminDto[]>(initialAnnouncements);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Page Editor State
  const [editingPage, setEditingPage] = useState<ContentPageSummaryDto | null>(null);
  const [pageSlug, setPageSlug] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageMarkdown, setPageMarkdown] = useState('');
  const [pageMeta, setPageMeta] = useState('');
  const [pageStatus, setPageStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Announcement Editor State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'INFO' | 'WARNING' | 'ALERT' | 'PROMO'>('INFO');
  const [annPriority, setAnnPriority] = useState(5);
  const [annStartDate, setAnnStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [annEndDate, setAnnEndDate] = useState('');
  const [showAnnModal, setShowAnnModal] = useState(false);

  const handleOpenPageEditor = (page?: ContentPageSummaryDto) => {
    if (page) {
      setEditingPage(page);
      setPageSlug(page.slug);
      setPageTitle(page.title);
      setPageMarkdown(page.contentMarkdown);
      setPageMeta(page.metaDescription || '');
      setPageStatus(page.status);
    } else {
      setEditingPage(null);
      setPageSlug('');
      setPageTitle('');
      setPageMarkdown('# New Atelier Story\n\nWrite your content here...');
      setPageMeta('');
      setPageStatus('DRAFT');
    }
    setShowEditor(true);
    setShowPreview(false);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await saveContentPageAction({
        id: editingPage?.id,
        slug: pageSlug,
        title: pageTitle,
        contentMarkdown: pageMarkdown,
        metaDescription: pageMeta || undefined,
        status: pageStatus,
      });

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error?.message || 'Failed to save page' });
        return;
      }

      setFeedback({ type: 'success', message: `Page "${pageTitle}" saved successfully` });
      setShowEditor(false);

      // Optimistically update local list
      const updatedList = editingPage
        ? pages.map((p) =>
            p.id === editingPage.id
              ? {
                  ...p,
                  slug: pageSlug,
                  title: pageTitle,
                  contentMarkdown: pageMarkdown,
                  metaDescription: pageMeta,
                  status: pageStatus,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          )
        : [
            ...pages,
            {
              id: result.data!.id,
              slug: pageSlug,
              title: pageTitle,
              contentMarkdown: pageMarkdown,
              metaDescription: pageMeta,
              status: pageStatus,
              isPublished: pageStatus === 'PUBLISHED',
              updatedAt: new Date().toISOString(),
            },
          ];

      setPages(updatedList);
    });
  };

  const handlePublishPage = async (id: string) => {
    startTransition(async () => {
      const result = await publishContentPageAction(id);
      if (!result.success) {
        setFeedback({ type: 'error', message: result.error?.message || 'Publish failed' });
        return;
      }
      setFeedback({ type: 'success', message: 'Page published to live storefront' });
      setPages(
        pages.map((p) => (p.id === id ? { ...p, status: 'PUBLISHED', isPublished: true } : p)),
      );
    });
  };

  const handleArchivePage = async (id: string) => {
    startTransition(async () => {
      const result = await archiveContentPageAction(id);
      if (!result.success) {
        setFeedback({ type: 'error', message: result.error?.message || 'Archive failed' });
        return;
      }
      setFeedback({ type: 'success', message: 'Page archived from public view' });
      setPages(
        pages.map((p) => (p.id === id ? { ...p, status: 'ARCHIVED', isPublished: false } : p)),
      );
    });
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveAnnouncementAction({
        title: annTitle,
        message: annMessage,
        type: annType,
        priority: annPriority,
        startDate: new Date(annStartDate).toISOString(),
        endDate: annEndDate ? new Date(annEndDate).toISOString() : undefined,
      });

      if (!result.success) {
        setFeedback({
          type: 'error',
          message: result.error?.message || 'Failed to schedule announcement',
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Operational announcement scheduled' });
      setShowAnnModal(false);
      setAnnouncements([
        ...announcements,
        {
          id: result.data!.id,
          title: annTitle,
          message: annMessage,
          type: annType,
          priority: annPriority,
          startDate: new Date(annStartDate).toISOString(),
          endDate: annEndDate ? new Date(annEndDate).toISOString() : undefined,
        },
      ]);
    });
  };

  const handleDeleteAnnouncement = async (id: string) => {
    startTransition(async () => {
      const result = await deleteAnnouncementAction(id);
      if (!result.success) {
        setFeedback({ type: 'error', message: result.error?.message || 'Deletion failed' });
        return;
      }
      setFeedback({ type: 'success', message: 'Announcement deleted' });
      setAnnouncements(announcements.filter((a) => a.id !== id));
    });
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem 4rem 2rem' }}>
      {/* Header Eyebrow & Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#38bdf8',
            fontWeight: 700,
            marginBottom: '0.35rem',
          }}
        >
          CONTENT MANAGEMENT SYSTEM · JN-157 → JN-167
        </div>
        <h1
          style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0' }}
        >
          Atelier CMS &amp; Editorial Workbench
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
          Author storytelling pages, calibrate sizing guides, and schedule operational site notices.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            backgroundColor: feedback.type === 'success' ? '#064e3b' : '#7f1d1d',
            border: `1px solid ${feedback.type === 'success' ? '#059669' : '#dc2626'}`,
            color: '#f8fafc',
            fontSize: '0.85rem',
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid #334155',
          marginBottom: '2rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('PAGES')}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'PAGES' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'PAGES' ? '#38bdf8' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          CMS Pages ({pages.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom:
              activeTab === 'ANNOUNCEMENTS' ? '2px solid #38bdf8' : '2px solid transparent',
            color: activeTab === 'ANNOUNCEMENTS' ? '#38bdf8' : '#94a3b8',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Site Announcements ({announcements.length})
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CMS PAGES TABLE                                         */}
      {/* ============================================================== */}
      {activeTab === 'PAGES' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Showing {pages.length} published and draft pages
            </div>
            <button
              type="button"
              onClick={() => handleOpenPageEditor()}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Create New Atelier Page
            </button>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
                <tr>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    Slug
                  </th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Title</th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      color: '#94a3b8',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    Status
                  </th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Last Updated</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#38bdf8',
                      }}
                    >
                      /{p.slug}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                      {p.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor:
                            p.status === 'PUBLISHED'
                              ? '#065f46'
                              : p.status === 'ARCHIVED'
                                ? '#4b5563'
                                : '#854d0e',
                          color: '#ffffff',
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenPageEditor(p)}
                          style={{
                            backgroundColor: '#334155',
                            color: '#f8fafc',
                            border: 'none',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        {p.status !== 'PUBLISHED' && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handlePublishPage(p.id)}
                            style={{
                              backgroundColor: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            Publish
                          </button>
                        )}
                        {p.status === 'PUBLISHED' && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleArchivePage(p.id)}
                            style={{
                              backgroundColor: '#475569',
                              color: '#cbd5e1',
                              border: 'none',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ANNOUNCEMENTS TABLE                                     */}
      {/* ============================================================== */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Scheduled promotional banners and workshop notices
            </div>
            <button
              type="button"
              onClick={() => setShowAnnModal(true)}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Schedule Announcement
            </button>
          </div>

          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Title</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Message</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Priority</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>Active Window</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#94a3b8', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                      {a.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', maxWidth: '300px' }}>
                      {a.message}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor:
                            a.type === 'PROMO'
                              ? '#9333ea'
                              : a.type === 'ALERT'
                                ? '#dc2626'
                                : '#0284c7',
                          color: '#ffffff',
                        }}
                      >
                        {a.type}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: '#38bdf8',
                      }}
                    >
                      {a.priority}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {new Date(a.startDate).toLocaleDateString()} –{' '}
                      {a.endDate ? new Date(a.endDate).toLocaleDateString() : 'Indefinite'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        style={{
                          backgroundColor: '#7f1d1d',
                          color: '#fca5a5',
                          border: 'none',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PAGE EDITOR MODAL / DRAWER                                     */}
      {/* ============================================================== */}
      {showEditor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', color: '#f8fafc', margin: 0 }}>
                {editingPage ? `Edit Page: /${editingPage.slug}` : 'New Atelier Content Page'}
              </h2>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSavePage}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Slug (URL Path)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPage}
                    value={pageSlug}
                    onChange={(e) =>
                      setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    placeholder="e.g. kuroki-mill-story"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Page Title
                  </label>
                  <input
                    type="text"
                    required
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="e.g. Kuroki Mill & Indigo Chemistry"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Meta Description (SEO)
                </label>
                <input
                  type="text"
                  value={pageMeta}
                  onChange={(e) => setPageMeta(e.target.value)}
                  placeholder="Summary for search engines..."
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.35rem',
                  }}
                >
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Markdown Body Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {showPreview ? 'Show Raw Editor' : 'Toggle Live Preview'}
                  </button>
                </div>

                {showPreview ? (
                  <div
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#fdfbf7',
                      color: '#0f172a',
                      borderRadius: '4px',
                      minHeight: '280px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-serif, serif)',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                      }}
                    >
                      {pageTitle}
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                      {pageMarkdown}
                    </pre>
                  </div>
                ) : (
                  <textarea
                    rows={12}
                    required
                    value={pageMarkdown}
                    onChange={(e) => setPageMarkdown(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.85rem',
                      resize: 'vertical',
                    }}
                  />
                )}
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '0.5rem' }}>
                    Status:
                  </label>
                  <select
                    value={pageStatus}
                    onChange={(e) =>
                      setPageStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
                    }
                    style={{
                      padding: '0.4rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditor(false)}
                    style={{
                      padding: '0.6rem 1rem',
                      backgroundColor: '#334155',
                      color: '#f8fafc',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    style={{
                      padding: '0.6rem 1.25rem',
                      backgroundColor: '#38bdf8',
                      color: '#0f172a',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ANNOUNCEMENT MODAL                                             */}
      {/* ============================================================== */}
      {showAnnModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '600px',
              padding: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', color: '#f8fafc', margin: 0 }}>
                Schedule Operational Announcement
              </h2>
              <button
                type="button"
                onClick={() => setShowAnnModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveAnnouncement}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Kathmandu Workshop Holiday Schedule"
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    marginBottom: '0.35rem',
                  }}
                >
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Operational notice text shown to clients..."
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    borderRadius: '4px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Type
                  </label>
                  <select
                    value={annType}
                    onChange={(e) =>
                      setAnnType(e.target.value as 'INFO' | 'WARNING' | 'ALERT' | 'PROMO')
                    }
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                    }}
                  >
                    <option value="INFO">INFO</option>
                    <option value="PROMO">PROMO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ALERT">ALERT</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Priority (Higher = Displayed First)
                  </label>
                  <input
                    type="number"
                    value={annPriority}
                    onChange={(e) => setAnnPriority(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={annStartDate}
                    onChange={(e) => setAnnStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      marginBottom: '0.35rem',
                    }}
                  >
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={annEndDate}
                    onChange={(e) => setAnnEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      color: '#f8fafc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  style={{
                    padding: '0.6rem 1rem',
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#38bdf8',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
