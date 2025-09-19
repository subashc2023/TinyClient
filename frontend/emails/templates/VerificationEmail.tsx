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

export type VerificationEmailProps = {
  verificationLink: string;
  logoSrc: string;
  projectName: string;
};

export function getVerificationEmailSubject(projectName: string): string {
  return `Confirm your ${projectName} account`;
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
    backgroundColor: "#2563eb",
    borderRadius: "9999px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: 600,
    padding: "15px 36px",
    textDecoration: "none"
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

const VerificationEmail = ({ verificationLink, logoSrc, projectName }: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>{getVerificationEmailSubject(projectName)}</Preview>
    <Body style={styles.main}>
      <Section>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src={logoSrc} width="48" height="48" alt={`${projectName} mark`} style={styles.logo} />
            <Text style={styles.brand}>{projectName}</Text>
          </Section>
          <Text style={styles.preview}>One click and you can start herding all your Model Context Protocol tools.</Text>
          <Heading style={styles.heading}>Confirm your email</Heading>
          <Text style={styles.paragraph}>
            Thanks for joining {projectName}. This link proves you are a real human (or at least a very polite AI) and gives
            you access to your workspace.
          </Text>
          <Section style={styles.buttonContainer}>
            <Button href={verificationLink} style={styles.button}>
              Verify my address
            </Button>
          </Section>
          <Text style={styles.paragraph}>
            The link stays fresh for 24 hours. After that we release it back into the wild and you&apos;ll need a new one.
          </Text>
          <Text style={styles.subtle}>
            Didn&apos;t ask for this? Release this carrier pigeon and carry on: no account changes will be made.
          </Text>
          <Hr style={styles.divider} />
          <Text style={styles.footer}>Made with gears and coffee for Model Context Protocol explorers everywhere.</Text>
        </Container>
      </Section>
    </Body>
  </Html>
);

export default VerificationEmail;

