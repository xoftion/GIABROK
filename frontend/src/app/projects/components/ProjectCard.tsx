"use client";

import { Code, ExternalLink, Play, Square, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Container,
  deleteContainer,
  startContainer,
  stopContainer,
} from "../../../lib/backend/api";

interface ProjectCardProps {
  container: Container;
  onStatusChange: () => void;
}

export const ProjectCard = ({
  container,
  onStatusChange,
}: ProjectCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isRunning = container.status === "running";

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      if (isRunning) {
        await stopContainer(container.id);
      } else {
        await startContainer(container.id);
      }
      onStatusChange();
    } catch (error) {
      console.error("Failed to toggle container status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContainer(container.id);
      onStatusChange();
    } catch (error) {
      console.error("Failed to delete container:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-7 h-7 bg-white/90 rounded-lg shadow-inner"></div>
            </div>
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                isRunning ? "bg-emerald-400" : "bg-gray-400"
              }`}
            ></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
              <div
                className={`w-2 h-2 rounded-full ${
                  isRunning ? "bg-emerald-400 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-sm text-white/80 font-medium">
                {isRunning ? "Running" : "Stopped"}
              </span>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text">
            {container.name?.replace("/", "") ||
              `Container ${container.id.slice(0, 8)}`}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <p className="text-sm text-white/70 font-medium">
              Next.js Application
            </p>
          </div>
          <p className="text-xs text-white/50">
            Created {formatDate(container.created)}
          </p>
        </div>

        {container.assignedPort && (
          <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
            <span className="text-sm text-white/70">Port: </span>
            <span className="text-sm font-mono text-purple-300">
              {container.assignedPort}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm border shadow-lg ${
                isRunning
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 hover:border-red-400/50 hover:shadow-red-500/20"
                  : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-emerald-500/20"
              } ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : isRunning ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isRunning ? "Stop" : "Start"}
            </button>

            <a
              href={`/projects/${container.id}`}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-400/50 rounded-lg text-sm font-semibold transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-105 hover:shadow-blue-500/20"
            >
              <Code className="w-4 h-4" />
              Work with
            </a>
          </div>

          {container.url && isRunning && (
            <a
              href={container.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-105 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <h4 className="text-lg font-semibold text-white mb-3">
              Delete Project?
            </h4>
            <p className="text-sm text-white/70 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
