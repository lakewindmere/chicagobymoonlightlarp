import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
    Row,
    Column,
    Link,
    Button,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationProps {
    customerName: string;
    orderId: string;
    items: any[];
    total: number;
    qrLink?: string | null;
}

export const OrderConfirmationEmail = ({
    customerName,
    orderId,
    items,
    total,
    qrLink,
}: OrderConfirmationProps) => (
    <Html>
        <Head />
        <Preview>Your Chicago In Moonlight Manifest</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>THE NIGHT MARKET</Heading>

                <Text style={text}>Greetings, {customerName}.</Text>
                <Text style={text}>
                    Your contribution to the shadows has been recorded. The following artifacts have been added to your manifest.
                </Text>

                {/* Digital Credential Section - Only shows if tickets were bought */}
                {qrLink && (
                    <Section style={credentialSection}>
                        <Text style={credentialHeading}>Digital Credential Generated</Text>
                        <Text style={credentialText}>
                            Your admission to Elysium is secured. Access your QR credential via the link below:
                        </Text>
                        <Button style={button} href={qrLink}>
                            VIEW ENTRANCE PASS
                        </Button>
                    </Section>
                )}

                <Section style={section}>
                    <Text style={label}>ORDER ID: {orderId.slice(-12).toUpperCase()}</Text>
                    <Hr style={hr} />

                    {items.map((item, index) => (
                        <Row key={index} style={itemRow}>
                            <Column>
                                <Text style={itemDescription}>
                                    <span style={itemTitle}>{item.description}</span>
                                    <br />
                                    <span style={itemQty}>Quantity: {item.quantity}</span>
                                </Text>
                            </Column>
                            <Column align="right">
                                <Text style={itemPrice}>
                                    ${(item.amount_total / 100).toFixed(2)}
                                </Text>
                            </Column>
                        </Row>
                    ))}

                    <Hr style={hr} />

                    <Row>
                        <Column>
                            <Text style={totalLabel}>TOTAL CONTRIBUTION</Text>
                        </Column>
                        <Column align="right">
                            <Text style={totalValue}>
                                ${(total / 100).toFixed(2)}
                            </Text>
                        </Column>
                    </Row>
                </Section>

                <Hr style={hr} />

                <Text style={footer}>
                    This is an automated missive from Chicago In Moonlight.
                    If you have questions regarding your artifacts, please reply to this email.
                    <br /><br />
                    Stay in the shadows.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default OrderConfirmationEmail;

// --- STYLES ---

const main = {
    backgroundColor: "#000000",
    fontFamily: "'Crimson Text', serif, -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto",
    color: "#ffffff",
    margin: "0 auto",
};

const container = {
    margin: "40px auto",
    padding: "40px 20px",
    maxWidth: "560px",
    border: "1px solid #450a0a",
    backgroundColor: "#050505",
};

const h1 = {
    color: "#b91c1c",
    fontSize: "28px",
    fontWeight: "900",
    letterSpacing: "6px",
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
    margin: "0 0 40px 0",
};

const text = {
    color: "#d4d4d8",
    fontSize: "16px",
    lineHeight: "24px",
    fontStyle: "italic",
};

const credentialSection = {
    backgroundColor: "#111111",
    border: "1px dashed #b91c1c",
    padding: "24px",
    textAlign: "center" as const,
    margin: "32px 0",
};

const credentialHeading = {
    color: "#b91c1c",
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    letterSpacing: "2px",
    margin: "0 0 8px 0",
};

const credentialText = {
    color: "#a1a1aa",
    fontSize: "13px",
    margin: "0 0 20px 0",
};

const button = {
    backgroundColor: "#b91c1c",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    borderRadius: "0px",
    letterSpacing: "2px",
    padding: "12px 20px",
};

const section = {
    margin: "32px 0",
};

const hr = {
    borderColor: "#27272a",
    margin: "20px 0",
};

const label = {
    color: "#52525b",
    fontSize: "10px",
    letterSpacing: "2px",
    fontWeight: "bold",
};

const itemRow = {
    padding: "12px 0",
};

const itemDescription = {
    margin: "0",
};

const itemTitle = {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
};

const itemQty = {
    color: "#71717a",
    fontSize: "12px",
};

const itemPrice = {
    color: "#d4d4d8",
    fontSize: "14px",
    margin: "0",
};

const totalLabel = {
    color: "#b91c1c",
    fontWeight: "bold",
    fontSize: "12px",
    letterSpacing: "1px",
};

const totalValue = {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "18px",
};

const footer = {
    color: "#3f3f46",
    fontSize: "11px",
    textAlign: "center" as const,
    marginTop: "40px",
    lineHeight: "18px",
};