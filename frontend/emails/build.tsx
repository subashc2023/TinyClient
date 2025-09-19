import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as React from "react";
import { render } from "@react-email/render";

import InviteEmail, { getInviteEmailSubject, InviteEmailProps } from "./templates/InviteEmail";
import VerificationEmail, {
  getVerificationEmailSubject,
  VerificationEmailProps
} from "./templates/VerificationEmail";

type TemplateConfig<Props> = {
  name: string;
  subject: string;
  component: React.ComponentType<Props>;
  props: Props;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..", "..");
const frontendRoot = path.resolve(projectRoot, "frontend");
const outputDir = path.resolve(projectRoot, "backend", "app", "email_templates");
const logoPath = path.resolve(frontendRoot, "public", "mcp.png");
const logoDataUri = `data:image/png;base64,${readFileSync(logoPath, { encoding: "base64" })}`;
const projectName = process.env.PROJECT_NAME || process.env.NEXT_PUBLIC_PROJECT_NAME || "TinyClient";

const templates: TemplateConfig<InviteEmailProps | VerificationEmailProps>[] = [
  {
    name: "verification_email",
    subject: getVerificationEmailSubject(projectName),
    component: VerificationEmail as React.ComponentType<InviteEmailProps | VerificationEmailProps>,
    props: { verificationLink: "{{verification_link}}", logoSrc: logoDataUri, projectName }
  },
  {
    name: "invite_email",
    subject: getInviteEmailSubject(projectName),
    component: InviteEmail as React.ComponentType<InviteEmailProps | VerificationEmailProps>,
    props: {
      inviteLink: "{{invite_link}}",
      invitedBy: "{{invited_by}}",
      logoSrc: logoDataUri,
      projectName
    }
  }
];

const ensureTrailingNewline = (value: string) => (value.endsWith("\n") ? value : `${value}\n`);

async function build() {
  await mkdir(outputDir, { recursive: true });

  const manifest: Record<string, { subject: string; html: string; text: string }> = {};

  for (const template of templates) {
    const Component = template.component;
    const element = <Component {...template.props} />;

    let htmlOutput: string;
    let textOutput: string;

    try {
      htmlOutput = await render(element, { pretty: true });
      textOutput = await render(element, { plainText: true });
    } catch (error) {
      console.error(`Failed to render template ${template.name}`, error);
      throw error;
    }

    const htmlFile = `${template.name}.html`;
    const textFile = `${template.name}.txt`;

    await writeFile(path.join(outputDir, htmlFile), ensureTrailingNewline(htmlOutput), "utf8");
    await writeFile(path.join(outputDir, textFile), ensureTrailingNewline(textOutput), "utf8");

    manifest[template.name] = {
      subject: template.subject,
      html: htmlFile,
      text: textFile
    };
  }

  const manifestPath = path.join(outputDir, "manifest.json");
  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
}

build().catch((error) => {
  console.error("Failed to build email templates", error);
  process.exitCode = 1;
});
