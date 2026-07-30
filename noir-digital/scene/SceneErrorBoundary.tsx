"use client";

import { Component, type ReactNode } from "react";

declare global {
  interface Window {
    __NOIR_CONTACT_READY__?: boolean;
    __NOIR_DECOR_READY__?: boolean;
    __NOIR_READY__?: boolean;
    __NOIR_SCENE_STATUS__?: "disabled" | "failed" | "loading" | "ready";
  }
}

interface SceneErrorBoundaryProps {
  readonly children: ReactNode;
}

interface SceneErrorBoundaryState {
  readonly failed: boolean;
}

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  override state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch() {
    document.documentElement.dataset["effects"] = "failed";
    window.__NOIR_CONTACT_READY__ = true;
    window.__NOIR_DECOR_READY__ = true;
    window.__NOIR_READY__ = true;
    window.__NOIR_SCENE_STATUS__ = "failed";
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}
