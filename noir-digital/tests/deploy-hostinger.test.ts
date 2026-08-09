import { readFileSync } from "node:fs";
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

  it("verifies that production serves WebVTT captions with the required MIME", () => {
    expect(workflow).toContain("/cases/strong/strong-whey-types.pt-BR.vtt");
    expect(workflow).toContain("^content-type: text/vtt");
  });
});
