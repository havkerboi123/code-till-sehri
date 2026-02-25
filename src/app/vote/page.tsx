'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getUserVote, submitVote, type Project } from '@/lib/db';
import { ProjectCard } from '@/components/ProjectCard';

export default function VotePage() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await getProjects();
      if (!cancelled) setProjects(list);
      setLoadingProjects(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const votes: Record<string, number> = {};
      for (const p of projects) {
        const score = await getUserVote(p.id, user.uid);
        if (score !== null) votes[p.id] = score;
      }
      if (!cancelled) setUserVotes(votes);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, projects]);

  const handleVote = async (projectId: string, score: number) => {
    if (!user) return;
    await submitVote(projectId, user.uid, score);
    setUserVotes((v) => ({ ...v, [projectId]: score }));
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const alreadyVoted = userVotes[p.id] != null;
        const oldScore = userVotes[p.id] ?? 0;
        return {
          ...p,
          voteCount: alreadyVoted ? p.voteCount : p.voteCount + 1,
          totalScore: alreadyVoted ? p.totalScore - oldScore + score : p.totalScore + score,
        };
      })
    );
  };

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
        <p className="text-slate-600">Sign in with Google to vote on projects.</p>
      </div>
    );
  }

  if (loadingProjects) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="bg-grid min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-semibold text-slate-800">Vote on projects</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rate each project 1–5. You can only vote once per project.
        </p>
        {projects.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">
            No projects yet. Be the first to submit one.
          </p>
        ) : (
          <ul className="mt-8 space-y-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentScore={userVotes[project.id] ?? null}
                onVote={(score) => handleVote(project.id, score)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
