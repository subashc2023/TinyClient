import * as React from "react";

export type PasswordResetEmailProps = {
  resetLink: string;
  logoSrc: string;
  projectName: string;
};

export function getPasswordResetEmailSubject(projectName: string) {
  return `${projectName} password reset`;
}

export default function PasswordResetEmail({ resetLink, logoSrc, projectName }: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img src={logoSrc} alt={`${projectName} logo`} width={40} height={40} />
      </div>
      <h1 style={{ fontSize: 18 }}>Reset your password</h1>
      <p>We received a request to reset your {projectName} password.</p>
      <p>
        Click the link below to set a new password. If you didn't request this, you can safely ignore this email.
      </p>
      <p>
        <a href={resetLink} target="_blank" rel="noreferrer">
          Reset your password
        </a>
      </p>
      <p style={{ color: '#6b7280', fontSize: 12 }}>This link will expire shortly for your security.</p>
    </div>
  );
}


