"use client";

import { Icon } from "@iconify/react";
import whatsappIcon from "@iconify-icons/simple-icons/whatsapp";
import { useEffect, useState } from "react";
import { contactWhatsAppHref } from "@/data/content";
import { useLanguage } from "@/features/i18n/LanguageProvider";

import styles from "./FloatingWhatsApp.module.css";

export function FloatingWhatsApp({ hidden = false }: { readonly hidden?: boolean }) {
  const { t } = useLanguage();
  const [contactActionVisible, setContactActionVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const actions = document.querySelectorAll("[data-spectrum-contact-cta]");
    const visibleActions = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleActions.add(entry.target);
        else visibleActions.delete(entry.target);
      }
      setContactActionVisible(visibleActions.size > 0);
    });
    for (const action of actions) observer.observe(action);
    return () => observer.disconnect();
  }, []);
  const href = new URL(contactWhatsAppHref);
  const message = href.searchParams.get("text");
  if (message) href.searchParams.set("text", t(message));

  if (hidden || contactActionVisible) return null;

  return (
    <a
      className={styles["root"]}
      href={href.toString()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("Iniciar conversa no WhatsApp")}
      data-floating-whatsapp
    >
      <span className={styles["label"]} aria-hidden="true">
        WhatsApp
      </span>
      <Icon icon={whatsappIcon} className={styles["icon"]} aria-hidden="true" />
    </a>
  );
}
