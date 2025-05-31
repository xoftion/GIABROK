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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white/70 font-medium">
                Loading projects...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center shadow-xl">
              <div className="text-red-400 text-xl font-semibold mb-2">
                Error loading projects
              </div>
              <div className="text-white/60 mb-4">{error}</div>
              <button
                onClick={fetchContainers}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-purple-500/30 hover:scale-105"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900/5 to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 shadow-xl">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-white/60 text-lg">
              Manage your containerized applications with ease
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 shadow-xl inline-block">
              <div className="text-white/60 text-xl font-semibold mb-3">
                No projects yet
              </div>
              <div className="text-white/40">
                Create your first project to get started with containerized
                development
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
