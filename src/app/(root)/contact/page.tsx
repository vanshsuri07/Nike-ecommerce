import ContactForm from "@/components/contact/contact-form";
import { Toaster } from "sonner";

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg text-gray-600 mb-8">
        Have a question or want to work with us? Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>
      <div className="max-w-xl mx-auto">
        <ContactForm />
      </div>
      <Toaster richColors />
    </div>
  );
};

export default ContactPage;
