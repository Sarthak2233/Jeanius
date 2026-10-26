'use client';

import React, { useState, useTransition } from 'react';
import type { CategoryAdminDto } from '../../actions/category.actions';
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryStatusAction,
  deleteCategoryAction,
} from '../../actions/category.actions';

export interface CategoryManagementClientProps {
  readonly initialCategories: readonly CategoryAdminDto[];
}

export function CategoryManagementClient({ initialCategories }: CategoryManagementClientProps) {
  const [categories, setCategories] = useState<readonly CategoryAdminDto[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Form states
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(categories.length + 1);
  const [isActive, setIsActive] = useState(true);

  // Auto-slug generator from Name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(val));
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append('slug', slug);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('sortOrder', String(sortOrder));
    formData.append('isActive', String(isActive));

    startTransition(async () => {
      const res = await createCategoryAction(formData);
      if (res.success && res.data) {
        setCategories((prev) => [...prev, res.data!].sort((a, b) => a.sortOrder - b.sortOrder));
        setSlug('');
        setName('');
        setDescription('');
        setSortOrder(categories.length + 2);
        setIsActive(true);
        setFeedback({
          type: 'success',
          message: `Category "${res.data.name}" created successfully.`,
        });
      } else {
        setFeedback({ type: 'error', message: res.error?.message || 'Failed to create category' });
      }
    });
  };

  const handleToggle = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await toggleCategoryStatusAction(id);
      if (res.success && res.data) {
        setCategories((prev) => prev.map((c) => (c.id === id ? res.data! : c)));
        setFeedback({
          type: 'success',
          message: `Category "${res.data.name}" ${res.data.isActive ? 'activated' : 'deactivated'}.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error?.message || 'Failed to toggle category status',
        });
      }
    });
  };

  const handleDelete = (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setFeedback({ type: 'success', message: `Category "${catName}" deleted successfully.` });
      } else {
        setFeedback({ type: 'error', message: res.error?.message || 'Failed to delete category' });
      }
    });
  };

  const handleSortOrderChange = (id: string, newOrder: number) => {
    startTransition(async () => {
      const res = await updateCategoryAction(id, { sortOrder: newOrder });
      if (res.success && res.data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? res.data! : c)).sort((a, b) => a.sortOrder - b.sortOrder),
        );
      }
    });
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeCount = categories.filter((c) => c.isActive).length;
  const canonicalSlugs = new Set([
    'rings',
    'bracelets-cuffs',
    'necklaces-pendants',
    'earrings',
    'chains-links',
    'artefacts',
  ]);
  const customCount = categories.filter((c) => !canonicalSlugs.has(c.slug)).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
      {/* Header Telemetry */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#38bdf8',
                fontWeight: 700,
              }}
            >
              Artisan Catalog Classification System
            </span>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: '-0.02em',
                margin: '0.25rem 0 0.5rem',
              }}
            >
              Project 925 Categories Workbench
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
              Dynamic category taxonomy for Kathmandu sterling silver jewellery. Add custom
              categories, toggle visibility, and set display orders for the storefront filter bar.
            </p>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#121826',
              border: '1px solid #334155',
              padding: '1rem',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Total Categories
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#f8fafc',
                fontFamily: 'monospace',
                marginTop: '0.25rem',
              }}
            >
              {categories.length}
            </div>
          </div>
          <div
            style={{
              background: '#121826',
              border: '1px solid #334155',
              padding: '1rem',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Active on Storefront
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#10b981',
                fontFamily: 'monospace',
                marginTop: '0.25rem',
              }}
            >
              {activeCount}
            </div>
          </div>
          <div
            style={{
              background: '#121826',
              border: '1px solid #334155',
              padding: '1rem',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Built-in Canonical
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#38bdf8',
                fontFamily: 'monospace',
                marginTop: '0.25rem',
              }}
            >
              {categories.length - customCount}
            </div>
          </div>
          <div
            style={{
              background: '#121826',
              border: '1px solid #334155',
              padding: '1rem',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
              Custom Created
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#fbbf24',
                fontFamily: 'monospace',
                marginTop: '0.25rem',
              }}
            >
              {customCount}
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            background: feedback.type === 'success' ? '#064e3b' : '#7f1d1d',
            border: `1px solid ${feedback.type === 'success' ? '#059669' : '#dc2626'}`,
            color: '#f8fafc',
            fontSize: '0.85rem',
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Main Grid: Add Category Form (Left) + Category Table (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
        {/* Creation Workbench Panel */}
        <div
          style={{
            background: '#121826',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1.5rem',
            height: 'fit-content',
          }}
        >
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#38bdf8',
              }}
            />
            Add Custom Category
          </h2>

          <form
            onSubmit={handleCreateCategory}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.35rem',
                }}
              >
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Brooches & Pins"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: '#0b0f19',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.35rem',
                }}
              >
                URL Slug * (kebab-case)
              </label>
              <input
                type="text"
                required
                pattern="^[a-z0-9-]+$"
                placeholder="e.g. brooches-pins"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: '#0b0f19',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  marginTop: '0.2rem',
                  display: 'block',
                }}
              >
                Used in filters: /products?category={slug || '...'}
              </span>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  marginBottom: '0.35rem',
                }}
              >
                Artisan Description (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Handcrafted Kathmandu solid silver..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: '#0b0f19',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    marginBottom: '0.35rem',
                  }}
                >
                  Sort Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: '#0b0f19',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>
                    Active Immediately
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !name || !slug}
              style={{
                marginTop: '0.5rem',
                padding: '0.65rem 1rem',
                background: isPending ? '#475569' : '#0284c7',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background 150ms ease',
              }}
            >
              {isPending ? 'Provisioning...' : '+ Provision Category'}
            </button>
          </form>
        </div>

        {/* Existing Categories Table Panel */}
        <div
          style={{
            background: '#121826',
            border: '1px solid #334155',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Table Header Filter */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#1e293b',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Active Category Registry ({filteredCategories.length})
            </h3>
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                background: '#0b0f19',
                border: '1px solid #334155',
                borderRadius: '4px',
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none',
                width: '220px',
              }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #334155',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                  }}
                >
                  <th style={{ padding: '0.75rem 1.5rem' }}>Order</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Slug Key</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}
                    >
                      No matching jewellery categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const isCanonical = canonicalSlugs.has(cat.slug);
                    return (
                      <tr
                        key={cat.id}
                        style={{
                          borderBottom: '1px solid #1e293b',
                          transition: 'background 150ms ease',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1.5rem' }}>
                          <input
                            type="number"
                            min={0}
                            defaultValue={cat.sortOrder}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val !== cat.sortOrder) {
                                handleSortOrderChange(cat.id, val);
                              }
                            }}
                            style={{
                              width: '50px',
                              padding: '0.2rem 0.4rem',
                              background: '#0b0f19',
                              border: '1px solid #334155',
                              borderRadius: '3px',
                              color: '#f8fafc',
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                              textAlign: 'center',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{cat.name}</div>
                          {cat.description && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: '#64748b',
                                marginTop: '0.15rem',
                              }}
                            >
                              {cat.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.78rem',
                              color: '#38bdf8',
                              background: '#0b0f19',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '3px',
                              border: '1px solid #1e293b',
                            }}
                          >
                            {cat.slug}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              background: cat.isActive ? '#064e3b' : '#334155',
                              color: cat.isActive ? '#34d399' : '#94a3b8',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: cat.isActive ? '#10b981' : '#64748b',
                              }}
                            />
                            {cat.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>
                          <div
                            style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggle(cat.id)}
                              disabled={isPending}
                              style={{
                                padding: '0.3rem 0.6rem',
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '4px',
                                color: cat.isActive ? '#f87171' : '#34d399',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {cat.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {!isCanonical && (
                              <button
                                type="button"
                                onClick={() => handleDelete(cat.id, cat.name)}
                                disabled={isPending}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  background: '#7f1d1d',
                                  border: 'none',
                                  borderRadius: '4px',
                                  color: '#f8fafc',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
