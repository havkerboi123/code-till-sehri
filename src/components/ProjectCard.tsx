'use client';

import type { Project } from '@/lib/db';

type Props = {
  project: Project;
  currentScore: number | null;
  onVote: (score: number) => void;
};

export function ProjectCard({ project, currentScore, onVote }: Props) {
  const avg =
    project.voteCount > 0 ? (project.totalScore / project.voteCount).toFixed(1) : '—';

  return (
    <li className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        {project.imageUrl && (
          project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-52 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-44 sm:w-72"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </a>
          ) : (
            <div className="block h-52 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-44 sm:w-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">{project.title}</h2>
          <p className="mt-2 text-base text-slate-600 leading-relaxed line-clamp-3 sm:line-clamp-4">
            {project.description}
          </p>
          {project.motivation && (
            <p className="mt-2 text-sm text-slate-500">Motivation: {project.motivation}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Live link
              </a>
            )}
            {project.videoUrl && (
              <a
                href={project.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Video
              </a>
            )}
          </div>
          <p className="mt-3 text-base text-slate-500">
            Score: <strong className="text-slate-700">{avg}</strong>/5
            <span className="text-slate-400"> ({project.voteCount} votes)</span>
          </p>
        </div>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="mb-3 text-sm font-medium text-slate-500">Your vote (1–5)</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onVote(n)}
              disabled={currentScore !== null}
              className={`h-11 w-11 rounded-lg text-base font-medium transition sm:h-12 sm:w-12 ${
                currentScore !== null
                  ? n === currentScore
                    ? 'bg-primary-600 text-white'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-primary-100 hover:text-primary-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {currentScore !== null && (
          <p className="mt-2 text-sm text-slate-400">You voted. Score cannot be changed.</p>
        )}
      </div>
    </li>
  );
}
