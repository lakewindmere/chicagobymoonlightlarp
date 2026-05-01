import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Button,
} from '@react-email/components';
import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  orderId: string;
}

export const EmailTemplate = ({ name, orderId }: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Your entry to Chicago In Moonlight is secured.</Preview>
    <Body style={{ backgroundColor: '#000', margin: '0 auto', padding: '40px 0' }}>
      <Container style={{ border: '1px solid #b91c1c', padding: '40px', maxWidth: '600px', textAlign: 'center' }}>
        <Heading style={{ color: '#b91c1c', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          The Invitation is Yours
        </Heading>
        
        <Section style={{ marginTop: '24px' }}>
          <Text style={{ color: '#fff', fontSize: '16px' }}>Greetings, {name},</Text>
          <Text style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
            We look forward to seeing you next Elysium. Access your digital credentials via the link below to present at the threshold.
          </Text>
          
          <Button
            href={`https://chicago-in-moonlight.com/success?session_id=${orderId}`}
            style={{
              backgroundColor: '#b91c1c',
              color: '#000',
              padding: '16px 32px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              textDecoration: 'none',
              letterSpacing: '1px',
            }}
          >
            View Digital Pass
          </Button>
          
          <Text style={{ color: '#52525b', fontSize: '12px', marginTop: '30px' }}>
            ID: {orderId}
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);