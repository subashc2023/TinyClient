import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text
} from "@react-email/components";
import * as React from "react";

export type InviteEmailProps = {
  inviteLink: string;
  invitedBy: string;
  logoSrc: string;
  projectName: string;
};

export function getInviteEmailSubject(projectName: string): string {
  return `You're invited to ${projectName}`;
}

const fontFamily =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const styles: Record<string, React.CSSProperties> = {
  main: {
    backgroundColor: "#f4f4f6",
    margin: 0,
    padding: "32px 0",
    fontFamily
  },
  container: {
    margin: "0 auto",
    padding: "36px 32px",
    backgroundColor: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    width: "100%",
    maxWidth: "560px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px"
  },
  logo: {
    borderRadius: "12px"
  },
  brand: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#0f172a",
    margin: 0
  },
  preview: {
    margin: "0 0 12px",
    fontSize: "16px",
    lineHeight: "24px",
    color: "#475569"
  },
  heading: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 20px"
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#1f2937",
    margin: "0 0 18px"
  },
  buttonContainer: {
    margin: "32px 0",
    textAlign: "center"
  },
  button: {
    backgroundColor: "#10b981",
    borderRadius: "9999px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: 600,
    padding: "15px 36px",
    textDecoration: "none"
  },
  link: {
    color: "#2563eb",
    textDecoration: "underline"
  },
  subtle: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#64748b",
    margin: "0 0 12px"
  },
  divider: {
    borderColor: "#e5e7eb",
    margin: "36px 0"
  },
  footer: {
    fontSize: "13px",
    lineHeight: "22px",
    color: "#94a3b8",
    margin: 0,
    textAlign: "center"
  }
};

const InviteEmail = ({ inviteLink, invitedBy, logoSrc, projectName }: InviteEmailProps) => (
  <Html>
    <Head />
    <Preview>{getInviteEmailSubject(projectName)}</Preview>
    <Body style={styles.main}>
      <Section>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src={logoSrc} width="48" height="48" alt={`${projectName} mark`} style={styles.logo} />
            <Text style={styles.brand}>{projectName}</Text>
          </Section>
          <Text style={styles.preview}>A fresh workspace, a shiny MCP stack, and probably too many sticky notes.</Text>
          <Heading style={styles.heading}>Join the party</Heading>
          <Text style={styles.paragraph}>
            {invitedBy} set aside a seat for you. {projectName} keeps Model Context Protocol services, prompts, and
            automations in one tidy lounge so you can focus on the clever parts.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button href={inviteLink} style={styles.button}>
              Accept invitation
            </Button>
          </Section>
          <Text style={styles.paragraph}>
            Having trouble with the button? Copy and paste this link into your browser:
            <br />
            <a href={inviteLink} style={styles.link}>
              {inviteLink}
            </a>
          </Text>
          <Text style={styles.subtle}>
            Not expecting this? Ignore it and we&apos;ll quietly recycle the invite link in 24 hours.
          </Text>
          <Hr style={styles.divider} />
          <Text style={styles.footer}>Bring your favorite prompt—snacks are metaphorical but enthusiasm is real.</Text>
        </Container>
      </Section>
    </Body>
  </Html>
);

export default InviteEmail;
