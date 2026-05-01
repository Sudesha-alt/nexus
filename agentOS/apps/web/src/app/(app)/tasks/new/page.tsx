"use client";

import { Topbar } from "@/components/layout/Topbar";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function NewTaskPage() {
  return (
    <>
      <Topbar title="New Task" />
      <main className="p-4 lg:p-8">
        <TaskForm />
      </main>
    </>
  );
}
