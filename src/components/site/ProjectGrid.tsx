import type { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

/** Editorial rhythm: one wide cinematic card, then two side by side, repeating. */
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 md:gap-8">
      {projects.map((project, i) => {
        const wide = i % 3 === 0;
        return (
          <div key={project.id} className={wide ? "sm:col-span-2" : ""}>
            <ProjectCard project={project} index={i} variant={wide ? "wide" : "default"} priority={i === 0} />
          </div>
        );
      })}
    </div>
  );
}
