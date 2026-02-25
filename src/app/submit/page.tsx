'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createProject, uploadImage } from '@/lib/db';

export default function SubmitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    motivation: '',
    liveUrl: '',
    videoUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-slate-600">Sign in with Google to submit a project.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setImageUploadFailed(false);
    setBusy(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile, user.uid);
        } catch (uploadErr) {
          // Submit without image so the user is not blocked
          setImageUploadFailed(true);
        }
      }
      await createProject({
        title: form.title.trim(),
        description: form.description.trim(),
        motivation: form.motivation.trim(),
        liveUrl: form.liveUrl.trim(),
        imageUrl,
        videoUrl: form.videoUrl.trim(),
        userId: user.uid,
        userName: user.displayName ?? '',
        userEmail: user.email ?? '',
      });
      if (imageUploadFailed) {
        await new Promise((r) => setTimeout(r, 1500));
      }
      router.push('/vote');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20';

  return (
    <div className="bg-grid min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-lg px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-semibold text-slate-800">Submit a project</h1>
        <p className="mt-1 text-sm text-slate-500">Share what you built for Code till Sehri.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {imageUploadFailed && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Image could not be uploaded (e.g. network or size). Submitting without image.
            </p>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={inputClass}
              placeholder="My awesome app"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              What does it do?
            </label>
            <textarea
              id="description"
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={inputClass}
              placeholder="Short description of your project"
            />
          </div>
          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-slate-700">
              Motivation
            </label>
            <textarea
              id="motivation"
              rows={2}
              value={form.motivation}
              onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
              className={inputClass}
              placeholder="What inspired you?"
            />
          </div>
          <div>
            <label htmlFor="liveUrl" className="block text-sm font-medium text-slate-700">
              Live URL <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="liveUrl"
              type="url"
              value={form.liveUrl}
              onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-slate-700">
              Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="mt-1.5 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
            />
          </div>
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-slate-700">
              Video link (e.g. Loom)
            </label>
            <input
              id="videoUrl"
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary-600 py-3 font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-50"
          >
            {busy ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
