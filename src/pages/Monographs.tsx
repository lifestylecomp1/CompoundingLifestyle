import { useState, useEffect, useRef } from 'react';
import MaterialCard from '../components/MaterialCard';
import AuthMonographPhoto from '../components/AuthMonographPhoto';
import {
  openMaterialFileInNewTab,
  fetchMonographs,
  uploadMonograph,
  updateMonograph,
  type Monograph,
} from '../lib/api';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './PageLayout.css';
import './Monographs.css';

export default function Monographs() {
  const { isAdmin } = useAuth();
  const [monographs, setMonographs] = useState<Monograph[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editMonograph, setEditMonograph] = useState<Monograph | null>(null);
  /** Local preview URL for a newly chosen cover image (blob); revoked on close or replace */
  const [replacePhotoPreview, setReplacePhotoPreview] = useState<string | null>(null);
  const replacePhotoBlobRef = useRef<string | null>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  const revokeReplacePhotoPreview = () => {
    if (replacePhotoBlobRef.current) {
      URL.revokeObjectURL(replacePhotoBlobRef.current);
      replacePhotoBlobRef.current = null;
    }
    setReplacePhotoPreview(null);
  };

  const onEditPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    revokeReplacePhotoPreview();
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      replacePhotoBlobRef.current = url;
      setReplacePhotoPreview(url);
    }
  };

  useEffect(() => {
    revokeReplacePhotoPreview();
    const input = editPhotoInputRef.current;
    if (input) input.value = '';
  }, [editMonograph?.id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMonographs();
      setMonographs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || '';
    const file = formData.get('file') as File | null;
    if (!name || !file?.size) {
      setError('Name and file are required');
      return;
    }
    formData.set('name', name);
    formData.set('description', description);
    setError(null);
    try {
      await uploadMonograph(formData);
      setUploadOpen(false);
      form.reset();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editMonograph) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get('name') as string)?.trim();
    const description = (formData.get('description') as string)?.trim() || '';
    if (!name) {
      setError('Name is required');
      return;
    }
    formData.set('name', name);
    formData.set('description', description);
    setError(null);
    try {
      await updateMonograph(editMonograph.id, formData);
      setEditMonograph(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const fileType = (fn: string) => {
    const ext = (fn.split('.').pop() || '').toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'docx') return 'Word';
    return ext.toUpperCase() || 'File';
  };

  return (
    <div className="page-layout">
      <header className="page-header page-header-row">
        <div>
          <h1>Clinical Education</h1>
          <p className="page-subtitle">
            Drug monographs and clinical reference materials. Learn what each product does, indications, and usage.
            {isAdmin
              ? ' Upload and edit documents below.'
              : ' Contact an administrator to add or update documents.'}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="btn btn-primary btn-icon"
            onClick={() => setUploadOpen(true)}
            title="Upload clinical education document"
          >
            <Plus size={18} />
            Upload
          </button>
        )}
      </header>

      {error && (
        <div className="monograph-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="monograph-loading">Loading clinical education materials…</p>
      ) : (
        <div className="material-grid">
          {monographs.map((item) => (
            <MaterialCard
              key={`${item.id}-${item.photoFileName ?? ''}`}
              title={item.name}
              fileType={fileType(item.fileName)}
              description={item.description}
              imageSlot={
                item.photoFileName ? <AuthMonographPhoto monographId={item.id} alt="" /> : undefined
              }
              onView={() => {
                void openMaterialFileInNewTab(item.id).catch((e) => {
                  window.alert(e instanceof Error ? e.message : 'Could not open file');
                });
              }}
              onEdit={isAdmin ? () => setEditMonograph(item) : undefined}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      {uploadOpen && (
        <div className="modal-overlay" onClick={() => setUploadOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload document</h2>
              <button type="button" className="modal-close" onClick={() => setUploadOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                  </label>
                  <input type="text" name="name" required placeholder="e.g. Glutathione" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" rows={3} placeholder="Brief description (optional)" />
                </div>
                <div className="form-group">
                  <label>
                    File (PDF or DOCX) <span className="required">*</span>
                  </label>
                  <div className="modal-file-wrap">
                    <input type="file" name="file" accept=".pdf,.docx" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Cover photo (optional)</label>
                  <p className="modal-field-hint">JPG, PNG, GIF, or WebP — shown on the card.</p>
                  <div className="modal-file-wrap">
                    <input type="file" name="photo" accept=".jpg,.jpeg,.png,.gif,.webp,image/*" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setUploadOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editMonograph && (
        <div className="modal-overlay" onClick={() => setEditMonograph(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit document</h2>
              <button type="button" className="modal-close" onClick={() => setEditMonograph(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editMonograph.name}
                    placeholder="e.g. Glutathione"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editMonograph.description}
                    placeholder="Brief description (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Replace file (optional)</label>
                  <div className="modal-file-wrap">
                    <input type="file" name="file" accept=".pdf,.docx" />
                  </div>
                  <div className="modal-current-file">
                    <span className="file-name">{editMonograph.fileName}</span>
                    <span>— leave empty to keep</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Cover photo</label>
                  <p className="modal-field-hint">
                    Shown on the listing card. Use <strong>Replace cover photo</strong> below to change the image without removing it first.
                  </p>

                  {replacePhotoPreview && (
                    <div className="monograph-photo-preview monograph-photo-preview--new">
                      <span className="monograph-photo-badge monograph-photo-badge--new">New image — Save to apply</span>
                      <img src={replacePhotoPreview} alt="" />
                      <button
                        type="button"
                        className="monograph-photo-clear"
                        onClick={() => {
                          revokeReplacePhotoPreview();
                          if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
                        }}
                      >
                        Clear selection
                      </button>
                    </div>
                  )}

                  {editMonograph.photoFileName && !replacePhotoPreview && (
                    <div className="monograph-photo-preview monograph-photo-preview--current">
                      <span className="monograph-photo-badge">Current cover</span>
                      <AuthMonographPhoto monographId={editMonograph.id} alt="" />
                      <label className="monograph-remove-photo">
                        <input
                          type="checkbox"
                          name="removePhoto"
                          value="1"
                          onChange={(e) => {
                            if (e.target.checked) {
                              revokeReplacePhotoPreview();
                              if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
                            }
                          }}
                        />
                        Remove current photo only
                      </label>
                    </div>
                  )}

                  <label className="monograph-replace-photo-label" htmlFor="edit-monograph-photo">
                    Replace / add cover photo
                  </label>
                  <p className="modal-field-hint monograph-replace-hint">
                    {editMonograph.photoFileName
                      ? 'Choose a new image file to replace the current cover. Supported: JPG, PNG, GIF, WebP.'
                      : 'Optional — add an image for the card listing.'}
                  </p>
                  <div className="modal-file-wrap">
                    <input
                      ref={editPhotoInputRef}
                      id="edit-monograph-photo"
                      type="file"
                      name="photo"
                      accept=".jpg,.jpeg,.png,.gif,.webp,image/*"
                      onChange={onEditPhotoFileChange}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditMonograph(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
