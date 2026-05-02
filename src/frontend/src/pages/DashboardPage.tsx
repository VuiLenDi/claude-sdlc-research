import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { projectService } from '../services/projectService';
import AppLayout from '../components/AppLayout';
import ProjectFormModal from '../components/ProjectFormModal';
import DeleteProjectDialog from '../components/DeleteProjectDialog';
import type { Project } from '../types';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCreateOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string }) =>
      projectService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteProject(null);
    },
  });

  const createError =
    (createMutation.error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message ?? null;

  const editError =
    (editMutation.error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message ?? null;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + New Project
        </button>
      </div>

      {isLoading && (
        <p className="text-gray-500 text-sm">Loading projects…</p>
      )}

      {isError && (
        <p className="text-red-600 text-sm">Failed to load projects. Please refresh.</p>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-4">No projects yet — create your first one</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            + New Project
          </button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-base font-semibold text-gray-900 hover:text-indigo-600 line-clamp-1"
                >
                  {project.name}
                </Link>
                {project.ownerId === user?.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      aria-label="Edit project"
                      onClick={() => setEditProject(project)}
                      className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      aria-label="Delete project"
                      onClick={() => setDeleteProject(project)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {project.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto">
                <span>{project.taskCount} tasks</span>
                <span>{project.memberCount} member{project.memberCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
        error={createError}
      />

      <ProjectFormModal
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSubmit={(data) => editMutation.mutate({ id: editProject!.id, ...data })}
        isPending={editMutation.isPending}
        error={editError}
        project={editProject ?? undefined}
      />

      <DeleteProjectDialog
        open={!!deleteProject}
        projectName={deleteProject?.name ?? ''}
        onConfirm={() => deleteMutation.mutate(deleteProject!.id)}
        onCancel={() => setDeleteProject(null)}
        isPending={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
