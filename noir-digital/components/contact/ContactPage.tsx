"use client";

import { Icon } from "@iconify/react";
import whatsappIcon from "@iconify-icons/simple-icons/whatsapp";
import altArrowDownLinear from "@iconify-icons/solar/alt-arrow-down-linear";
import arrowRightUpLinear from "@iconify-icons/solar/arrow-right-up-linear";
import earthBold from "@iconify-icons/solar/earth-bold";
import lockKeyholeLinear from "@iconify-icons/solar/lock-keyhole-linear";
import stopBold from "@iconify-icons/solar/stop-bold";
import Image from "next/image";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

import {
  contactEmail,
  contactPhoneDisplay,
  contactPhoneHref,
  contactWhatsAppHref,
} from "@/data/content";
import { ContactSubmissionError, submitContact } from "@/features/contact/submit-contact";

import styles from "./ContactPage.module.css";
import spectrumStyles from "./SpectrumContactCta.module.css";

const serviceOptions = [
  "Sites e experiências digitais",
  "Vídeos e motion",
  "Presença no Google",
  "Inteligência artificial",
  "Outro",
] as const;

interface ContactFormValues {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly company: string;
  readonly phone: string;
  readonly service: string;
  readonly message: string;
  readonly website: string;
}

type SubmissionState =
  | { readonly status: "idle" }
  | { readonly status: "pending" }
  | { readonly status: "success"; readonly message: string }
  | { readonly status: "error"; readonly message: string };

const EMPTY_FORM: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  phone: "",
  service: "",
  message: "",
  website: "",
};

const FALLBACK_ERROR = "Não foi possível enviar agora. Tente novamente em instantes.";

function isServiceOption(value: string): value is (typeof serviceOptions)[number] {
  return serviceOptions.includes(value as (typeof serviceOptions)[number]);
}

function WhatsAppPanel({ variant }: { readonly variant: "desktop" | "mobile" }) {
  const variantClass =
    variant === "mobile" ? styles["mobileWhatsAppPanel"] : styles["desktopWhatsAppPanel"];

  return (
    <section
      className={`${styles["whatsAppPanel"]} ${variantClass}`}
      data-contact-whatsapp-panel={variant}
    >
      <span className={styles["recommended"]}>RECOMENDADO</span>
      <div className={styles["whatsAppHeading"]}>
        <h3>WHATSAPP</h3>
        <p className={styles["whatsAppSubtitle"]}>RESPOSTA RÁPIDA</p>
      </div>
      <div className={styles["whatsAppMark"]} aria-hidden="true" data-contact-whatsapp-icon>
        <Icon icon={whatsappIcon} />
      </div>
      <p>Prefere falar diretamente? Abra uma conversa com a mensagem inicial já pronta.</p>
      <a
        className={`${spectrumStyles["root"]} ${styles["whatsAppAction"]}`}
        href={contactWhatsAppHref}
        target="_blank"
        rel="noreferrer"
        data-spectrum-contact-cta="true"
      >
        <span
          className={`${spectrumStyles["surface"]} ${styles["actionSurface"]} ${styles["whatsAppActionSurface"]}`}
          data-spectrum-contact-surface
        >
          <span>Iniciar conversa no WhatsApp</span>
          <Icon
            className={styles["ctaIcon"]}
            icon={arrowRightUpLinear}
            aria-hidden="true"
            data-contact-cta-icon
          />
        </span>
      </a>
    </section>
  );
}

export function ContactPage() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_FORM);
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });
  const submittingRef = useRef(false);

  useEffect(() => {
    const requestedService = new URLSearchParams(window.location.search).get("service");
    if (!requestedService || !isServiceOption(requestedService)) return;

    setValues((current) => (current.service ? current : { ...current, service: requestedService }));
  }, []);

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.currentTarget;
    setValues((current) => ({ ...current, [name]: value }));
    if (submission.status !== "idle") setSubmission({ status: "idle" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmission({ status: "pending" });

    try {
      const result = await submitContact({
        ...values,
        pageUrl: window.location.href,
        source: "Formulário de contato",
      });
      setValues(EMPTY_FORM);
      setSubmission({ status: "success", message: result.message });
    } catch (error) {
      setSubmission({
        status: "error",
        message: error instanceof ContactSubmissionError ? error.message : FALLBACK_ERROR,
      });
    } finally {
      submittingRef.current = false;
    }
  };

  const pending = submission.status === "pending";

  return (
    <article className={styles["page"]}>
      <div className={styles["atmosphere"]} aria-hidden="true" />

      <div className={styles["layout"]}>
        <section className={styles["intro"]} aria-labelledby="contact-page-heading">
          <span className={styles["sectionLabel"]}>CONTATO / 00</span>
          <h1 id="contact-page-heading">
            VAMOS CRIAR ALGO EXCEPCIONAL JUNTOS<span aria-hidden="true">.</span>
          </h1>
          <p>
            Conte-nos sobre o seu projeto. Vamos encontrar a estrutura certa para transformar a
            ideia em um próximo passo claro.
          </p>

          <WhatsAppPanel variant="mobile" />

          <a
            className={styles["brandLockup"]}
            href="/"
            aria-label="NOIR DIGITAL — Início"
            data-contact-brand-lockup
          >
            <Image
              src="/brand/noir-symbol.svg"
              width={164}
              height={186}
              alt=""
              aria-hidden="true"
            />
            <span>
              <Image
                src="/brand/noir-wordmark.svg"
                width={389}
                height={116}
                alt=""
                aria-hidden="true"
              />
              <small>AGÊNCIA DE ESTRUTURA DIGITAL</small>
            </span>
          </a>
        </section>

        <section
          className={styles["formPanel"]}
          aria-labelledby="project-data-heading"
          data-contact-form-panel
        >
          <div className={styles["panelHeading"]}>
            <span>01</span>
            <h2 id="project-data-heading">DADOS DO PROJETO</h2>
          </div>

          <form className={styles["form"]} aria-label="Dados do projeto" onSubmit={handleSubmit}>
            <div className={styles["fieldGrid"]}>
              <label className={styles["field"]}>
                <span>Nome</span>
                <input
                  name="firstName"
                  value={values.firstName}
                  onChange={updateField}
                  autoComplete="given-name"
                  maxLength={80}
                  required
                />
              </label>

              <label className={styles["field"]}>
                <span>Sobrenome</span>
                <input
                  name="lastName"
                  value={values.lastName}
                  onChange={updateField}
                  autoComplete="family-name"
                  maxLength={80}
                />
              </label>

              <label className={`${styles["field"]} ${styles["wideField"]}`}>
                <span>E-mail</span>
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={updateField}
                  autoComplete="email"
                  maxLength={190}
                  required
                />
              </label>

              <label className={styles["field"]}>
                <span>Empresa</span>
                <input
                  name="company"
                  value={values.company}
                  onChange={updateField}
                  autoComplete="organization"
                  maxLength={120}
                />
              </label>

              <label className={styles["field"]}>
                <span>Telefone</span>
                <input
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={updateField}
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={24}
                />
              </label>

              <label className={`${styles["field"]} ${styles["wideField"]}`}>
                <span>Serviço de interesse</span>
                <span className={styles["selectControl"]}>
                  <select name="service" value={values.service} onChange={updateField} required>
                    <option value="" disabled>
                      Selecione o serviço desejado
                    </option>
                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  <Icon
                    className={styles["selectIcon"]}
                    icon={altArrowDownLinear}
                    aria-hidden="true"
                    data-contact-select-icon
                  />
                </span>
              </label>
            </div>

            <div className={styles["projectSection"]}>
              <div className={styles["panelHeading"]}>
                <span>02</span>
                <h2>SOBRE O PROJETO</h2>
              </div>

              <label className={styles["field"]}>
                <span>Mensagem</span>
                <textarea
                  name="message"
                  value={values.message}
                  onChange={updateField}
                  rows={7}
                  maxLength={4000}
                  placeholder="Fale sobre o projeto, os objetivos e como podemos ajudar."
                  required
                />
              </label>

              <div className={styles["honeypot"]} aria-hidden="true">
                <label>
                  Website
                  <input
                    name="website"
                    value={values.website}
                    onChange={updateField}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </label>
              </div>

              <button
                className={`${spectrumStyles["root"]} ${styles["submit"]}`}
                type="submit"
                disabled={pending}
                data-spectrum-contact-cta="true"
              >
                <span
                  className={`${spectrumStyles["surface"]} ${styles["actionSurface"]}`}
                  data-spectrum-contact-surface
                >
                  <span>{pending ? "Enviando mensagem" : "Enviar mensagem"}</span>
                  <Icon
                    className={styles["ctaIcon"]}
                    icon={arrowRightUpLinear}
                    aria-hidden="true"
                    data-contact-cta-icon
                  />
                </span>
              </button>

              {submission.status === "success" ? (
                <p className={`${styles["feedback"]} ${styles["success"]}`} role="status">
                  {submission.message}
                </p>
              ) : null}
              {submission.status === "error" ? (
                <p className={`${styles["feedback"]} ${styles["error"]}`} role="alert">
                  {submission.message}
                </p>
              ) : null}

              <div className={styles["privacyNote"]}>
                <Icon
                  className={styles["privacyIcon"]}
                  icon={lockKeyholeLinear}
                  aria-hidden="true"
                  data-contact-privacy-icon
                />
                <p>
                  <span>Seus dados estão protegidos.</span>
                  <span>
                    Não compartilhamos suas informações. Consulte a{" "}
                    <a href="/privacidade">Política de privacidade</a>.
                  </span>
                </p>
              </div>
            </div>
          </form>
        </section>

        <aside className={styles["channels"]} aria-labelledby="contact-channels-heading">
          <div className={styles["panelHeading"]}>
            <span>03</span>
            <h2 id="contact-channels-heading">OUTRA FORMA DE CONTATO</h2>
          </div>

          <WhatsAppPanel variant="desktop" />

          <section className={styles["information"]} aria-labelledby="contact-info-heading">
            <div className={styles["panelHeading"]}>
              <span>04</span>
              <h2 id="contact-info-heading">INFORMAÇÕES</h2>
            </div>
            <dl>
              <div>
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>
                  <a href={contactPhoneHref}>{contactPhoneDisplay}</a>
                </dd>
              </div>
              <div>
                <dt>Horário de atendimento</dt>
                <dd>Seg - Sex, 09h às 18h</dd>
              </div>
            </dl>

            <div className={styles["internationalTag"]}>
              <Icon
                className={styles["internationalIndicator"]}
                icon={stopBold}
                aria-hidden="true"
              />
              <p>
                <span>Atendemos projetos em todo o Brasil</span>
                <span>e também internacionalmente.</span>
              </p>
              <Icon
                className={styles["globalIcon"]}
                icon={earthBold}
                aria-hidden="true"
                data-contact-global-icon
              />
            </div>
          </section>
        </aside>
      </div>
    </article>
  );
}
