import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  orderId: string;
}

export const EmailTemplate = ({ name, orderId }: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Your entry to Chicago In Moonlight is confirmed.</Preview>
    <Body style={{ backgroundColor: '#000', margin: '0 auto', padding: '40px 0' }}>
      <Container style={{ border: '1px solid #b91c1c', padding: '40px', maxWidth: '600px' }}>
        <Heading style={{ color: '#b91c1c', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
          The Invitation is Yours
        </Heading>
        <Section style={{ marginTop: '24px' }}>
          <Text style={{ color: '#fff', fontSize: '16px' }}>Greetings, {name},</Text>
          <Text style={{ color: '#fff', fontSize: '16px' }}>
            We look forward to seeing you this coming Elysium. Your credentials for the gathering are secured.
          </Text>
          <Text style={{ color: '#b91c1c', fontFamily: 'monospace', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
            ORDER ID: {orderId}
          </Text>
        </Section>
        <Text style={{ color: '#52525b', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
          CHICAGO IN MOONLIGHT — MMXXVI
        </Text>
      </Container>
    </Body>
  </Html>
);