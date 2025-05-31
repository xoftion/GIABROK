"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createContainer } from "../../../lib/backend/api";

interface CreateProjectCardProps {
  onProjectCreated: () => void;
}

export const CreateProjectCard = ({
  onProjectCreated,
}: CreateProjectCardProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      await createContainer();
      onProjectCreated();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      onClick={handleCreateProject}
      className="group relative bg-white/5 backdrop-blur-md border-2 border-dashed border-white/20 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer min-h-[280px] flex flex-col items-center justify-center shadow-lg hover:shadow-2xl hover:shadow-purple-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10 flex flex-col items-center">
        {isCreating ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 rounded-2xl animate-pulse opacity-50"></div>
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-white mb-2 block">
                Creating project...
              </span>
              <span className="text-sm text-white/60">
                Setting up your container
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-white/70 group-hover:text-white transition-colors duration-300">
            <div className="relative group-hover:scale-110 transition-transform duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-all duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-blue-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
            </div>
            <div className="text-center">
              <span className="text-xl font-bold mb-2 block bg-gradient-to-r from-white to-white/80 bg-clip-text">
                Create New Project
              </span>
              <span className="text-sm text-center leading-relaxed">
                Start a new Next.js application
                <br />
                <span className="text-white/50">
                  with Docker containerization
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
