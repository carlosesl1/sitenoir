import { ProjectCard } from "@/components/work/ProjectCard";
import { ServiceStatement } from "@/components/work/ServiceStatement";
import { WorkCardAnimationProvider } from "@/components/work/work-card-animation-controller";
import { groupProjectsByService } from "@/data/projects";
import { WorkCardCanvas } from "@/scene/WorkCardCanvas";

import styles from "./SelectedWork.module.css";

export function SelectedWork() {
  const groupedProjects = groupProjectsByService();

  return (
    <section id="selected-work" className={styles["selectedWork"]} aria-labelledby="work-heading">
      <WorkCardCanvas className={styles["workCardCanvas"]} />
      <ServiceStatement />

      <WorkCardAnimationProvider>
        <div className={styles["projectGrid"]}>
          {groupedProjects.map((group) => {
            const headingId = `service-${group.id}-heading`;

            return (
              <section
                key={group.id}
                className={styles["serviceGroup"]}
                aria-labelledby={headingId}
                data-service-group={group.id}
              >
                <header className={styles["serviceHeading"]}>
                  <span aria-hidden="true">{group.index}</span>
                  <h3 id={headingId}>{group.title}</h3>
                </header>

                {group.projects.map((project, index) => (
                  <ProjectCard key={project.slug} project={project} featured={index === 0} />
                ))}
              </section>
            );
          })}
        </div>
      </WorkCardAnimationProvider>
    </section>
  );
}
