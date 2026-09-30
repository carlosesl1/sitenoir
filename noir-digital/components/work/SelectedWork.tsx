"use client";

import { LazyWorkCardCanvas } from "@/components/work/LazyWorkCardCanvas";
import { ProjectCard } from "@/components/work/ProjectCard";
import { ServiceStatement } from "@/components/work/ServiceStatement";
import { WorkCardAnimationProvider } from "@/components/work/work-card-animation-controller";
import { groupProjectsByService } from "@/data/projects";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./SelectedWork.module.css";

export function SelectedWork() {
  const { t } = useLanguage();
  const groupedProjects = groupProjectsByService();

  return (
    <section id="selected-work" className={styles["selectedWork"]} aria-labelledby="work-heading">
      <LazyWorkCardCanvas className={styles["workCardCanvas"]} />
      <ServiceStatement />

      <WorkCardAnimationProvider>
        <div className={styles["projectGrid"]}>
          {groupedProjects.map((group) => {
            const headingId = `service-${group.id}-heading`;

            return (
              <section
                id={`service-${group.id}`}
                key={group.id}
                className={styles["serviceGroup"]}
                aria-labelledby={headingId}
                data-service-group={group.id}
              >
                <header className={styles["serviceHeading"]}>
                  <span aria-hidden="true">{group.index}</span>
                  <h3 id={headingId}>{t(group.title)}</h3>
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
