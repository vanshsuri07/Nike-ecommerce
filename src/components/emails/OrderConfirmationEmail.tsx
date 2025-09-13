import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Text,
    Section,
    Row,
    Column,
    Link,
  } from "@react-email/components";
  import { Tailwind } from "@react-email/tailwind";
  import * as React from "react";

  interface OrderConfirmationEmailProps {
    orderId: string;
    orderDate: string;
    customerName: string;
    items: {
      name: string;
      quantity: number;
      price: string;
    }[];
    total: string;
    paymentMethod: string;
  }

  const OrderConfirmationEmail = ({
    orderId,
    orderDate,
    customerName,
    items,
    total,
    paymentMethod,
  }: OrderConfirmationEmailProps) => {
    const previewText = `Order Confirmation #${orderId}`;

    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Tailwind>
          <Body className="bg-white my-auto mx-auto font-sans">
            <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
              <Section className="mt-[32px] text-center">
                <Img
                  src="http://localhost:3000/nikelogo.jpg" // Placeholder for store logo
                  width="150"
                  height="50"
                  alt="Store Logo"
                  className="my-0 mx-auto"
                />
                <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                  Thanks for your order!
                </Heading>
              </Section>
              <Text className="text-black text-[14px] leading-[24px]">
                Hi {customerName},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                We&apos;ve received your order and will contact you as soon as your
                package is shipped. You can find your purchase information below.
              </Text>
              <Section>
                <Row>
                  <Column>
                    <Text className="font-semibold">Order Number</Text>
                    <Text>{orderId}</Text>
                  </Column>
                  <Column className="text-right">
                    <Text className="font-semibold">Order Date</Text>
                    <Text>{orderDate}</Text>
                  </Column>
                </Row>
              </Section>
              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
              <Heading as="h2" className="text-lg font-semibold">
                Purchased Items
              </Heading>
              {items.map((item, index) => (
                <Section key={index}>
                  <Row>
                    <Column>{item.name}</Column>
                    <Column className="text-center">x{item.quantity}</Column>
                    <Column className="text-right">{item.price}</Column>
                  </Row>
                </Section>
              ))}
              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
              <Section>
                <Row>
                  <Column className="font-semibold">Total</Column>
                  <Column className="text-right font-semibold">{total}</Column>
                </Row>
                <Row>
                  <Column>Payment Method</Column>
                  <Column className="text-right">{paymentMethod}</Column>
                </Row>
              </Section>
              <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
              <Section className="text-center text-gray-500">
                <Text>
                  Need help? Contact our support team at{" "}
                  <Link href="mailto:support@example.com">
                    support@example.com
                  </Link>
                </Text>
                <Text>
                  © {new Date().getFullYear()} Your Store Name. All rights reserved.
                </Text>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  };

  export default OrderConfirmationEmail;
