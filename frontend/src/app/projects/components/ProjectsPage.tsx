"use client";

import { useEffect, useState } from "react";
import { Container, getContainers } from "../../../lib/backend/api";
import { CreateProjectCard } from "./CreateProjectCard";
import { ProjectCard } from "./ProjectCard";

export const ProjectsPage = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = async () => {
    try {
      setError(null);
      const data = await getContainers();
      setContainers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleProjectCreated = () => {
    fetchContainers();
  };

  const handleStatusChange = () => {
    fetchContainers();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

        <div className="relative">
          <nav className="border-b border-gray-800/50 backdrop-blur-xl bg-black/80">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg shadow-lg" />
                  <span className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    December
                  </span>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                <span className="text-white/70 font-medium">
                  Loading projects...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

        <div className="relative">
          <nav className="border-b border-gray-800/50 backdrop-blur-xl bg-black/80">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg shadow-lg" />
                  <span className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    December
                  </span>
                </div>
              </div>
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="flex flex-col items-center justify-center h-64 gap-6">
              <div className="bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 p-8 text-center shadow-xl max-w-md">
                <div className="text-red-400 text-xl font-semibold mb-2">
                  Error loading projects
                </div>
                <div className="text-white/60 mb-4">{error}</div>
                <button
                  onClick={fetchContainers}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />

      <div className="relative">
        <nav className="border-b border-gray-800/50 backdrop-blur-xl bg-black/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg shadow-lg" />
                <span className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  December
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-white transition-colors text-sm">
                  Documentation
                </button>
                <button className="text-gray-400 hover:text-white transition-colors text-sm">
                  Support
                </button>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">U</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-3 text-white">
                Build anything with AI
              </h1>
              <p className="text-gray-400 mb-8">
                From idea to deployed app in seconds
              </p>

              <div className="max-w-2xl mx-auto">
                <div className="relative bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                  <input
                    type="text"
                    placeholder="Create a landing page for my startup..."
                    className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none py-4 px-6 text-base"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white text-black hover:bg-gray-100 rounded-md transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CreateProjectCard onProjectCreated={handleProjectCreated} />

            {containers.map((container) => (
              <ProjectCard
                key={container.id}
                container={container}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {containers.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  No projects yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Use the prompt above to create your first project with AI
                  assistance.
                </p>
              </div>
            </div>
          )}

          <footer className="mt-20 pt-12 border-t border-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2025 December. Build the future, one container at a time.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Status
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
