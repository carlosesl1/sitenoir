import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  resolve(process.cwd(), "..", ".github", "workflows", "deploy-hostinger.yml"),
  "utf8",
);

describe("Hostinger deployment safety", () => {
  it.each([
    "wp-admin",
    "wp-content",
    "wp-includes",
    "wp-config\\.php",
    "wp-.*\\.php",
    "xmlrpc\\.php",
    "index\\.php",
  ])("excludes protected WordPress target %s from the static mirror", (target) => {
    expect(workflow).toContain(`--exclude '^${target}`);
  });

  it("publishes the mu-plugin separately and verifies the downloaded hash", () => {
    expect(workflow).toContain("out/wp-content/mu-plugins/noir-contact-endpoint.php");
    expect(workflow).toContain("cd " + "$" + "{FTP_TARGET}/wp-content/mu-plugins");
    expect(workflow).not.toContain("mkdir -p " + "$" + "{FTP_TARGET}/wp-content/mu-plugins;");
    expect(workflow).toContain("sha256sum");
    expect(workflow).toContain("REMOTE_PLUGIN_HASH");
  });

  it("keeps rollback idempotent when the new mu-plugin was never created", () => {
    expect(workflow).toContain(
      "rm " + "$" + "{FTP_TARGET}/wp-content/mu-plugins/noir-contact-endpoint.php;",
    );
    expect(workflow).toContain("|| true");
  });

  it("proves the route without sending a valid lead or real email", () => {
    expect(workflow).toContain("/wp-json/noir/v1/contact");
    expect(workflow).toContain("Confira os campos informados.");
    expect(workflow).not.toContain('"firstName":"Deploy Test"');
  });

  it("removes retired pages only after the release is verified, without risking a rollback", () => {
    const step = (name: string) => workflow.indexOf(`- name: ${name}`);
    const removal = workflow.slice(step("Remove retired paths"), step("Roll back entry files"));

    expect(step("Validate retired paths")).toBeGreaterThan(-1);
    expect(step("Validate retired paths")).toBeLessThan(step("Deploy static export and mu-plugin"));
    expect(step("Remove retired paths")).toBeGreaterThan(step("Verify exact production release"));
    expect(step("Remove retired paths")).toBeLessThan(step("Roll back entry files"));
    expect(removal).toContain("continue-on-error: true");
    expect(removal).toContain("set cmd:fail-exit no;");
    expect(removal).toContain('commands+="rm -r -f $' + '{FTP_TARGET}/$' + '{path}; "');
    expect(workflow).toContain('"$' + '{path}" == wp-*');
    expect(workflow).toContain('-e "out/$' + '{path}"');
  });

  it("retires only paths the site no longer has", () => {
    const retired = /RETIRED_PATHS: (.+)/.exec(workflow)?.[1]?.trim().split(/\s+/) ?? [];

    expect(retired).toEqual(["showcase", "assets/v1/audio/bgm.mp3"]);
    for (const path of retired) {
      expect(existsSync(resolve(process.cwd(), "public", path)), path).toBe(false);
      expect(existsSync(resolve(process.cwd(), "app", path)), path).toBe(false);
    }
  });

  it("verifies that production serves WebVTT captions with the required MIME", () => {
    expect(workflow).toContain("/cases/strong/strong-whey-types.pt-BR.vtt");
    expect(workflow).toContain("^content-type: text/vtt");
  });
});
