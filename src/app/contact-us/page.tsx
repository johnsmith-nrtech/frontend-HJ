"use client";

import { MarqueeStrip } from "@/components/marquee-strip";
import { Button } from "@/components/button-custom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Image from "next/image";
import { useSubmitContactMessage } from "@/lib/api/contact-messages";
import { toast } from "sonner";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitContactMessage = useSubmitContactMessage();

  const handleCustomOrderClick = () => {
    // TODO: Replace with actual custom order functionality
    // Options:
    // 1. Navigate to custom order page: router.push('/custom-order')
    // 2. Open a modal/dialog
    // 3. Scroll to contact section
    // For now, we'll show an alert as placeholder
    alert(
      "Custom Order feature coming soon! Please contact us for custom orders."
    );
  };

  // Marquee items data
  const marqueeItems = [
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
    { text: "100-NIGHT TRIAL", icon: "/sofa-icon.png" },
    { text: "EASY RETURN", icon: "/sofa-icon.png" },
    { text: "FREE DELIVERY", icon: "/sofa-icon.png" },
    { text: "10-YEARS GUARANTEE", icon: "/sofa-icon.png" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await submitContactMessage.mutateAsync({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        message_text: formData.message.trim(),
      });

      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
      setErrors({});

      toast.success(
        "Thank you! Your message has been sent successfully. We'll get back to you soon."
      );
    } catch (error) {
      console.error("Error submitting contact message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative">
        {/* Light blue background for right side extending from navbar */}
        <div className="absolute inset-0 hidden w-full overflow-hidden lg:block">
          <div className="relative mx-auto h-full px-4">
            <div className="bg-light-blue absolute right-0 mt-[-70px] h-full md:w-[50%] 2xl:w-[50%]"></div>
          </div>
        </div>

        <div className="relative min-h-[400px] overflow-hidden sm:min-h-[500px] md:min-h-[640px] 2xl:min-h-[820px]">
          {/* Hero Image - Background for entire section */}
          <div className="absolute inset-0 h-full w-full md:mt-[-80px] md:ml-[46px] 2xl:mt-[0px] 2xl:ml-[68px]">
            <Image
              src="/product-img1.png"
              alt="Sofa Deals Contact Us"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="absolute left-4 mt-10 flex-col justify-center px-2 py-8 sm:px-[32px] sm:py-12 md:bottom-[10px] md:mt-[-60px] md:py-16 lg:py-26 2xl:bottom-[-50px] 2xl:mt-[0px]">
            <div className="max-w-full sm:max-w-md lg:max-w-xl 2xl:max-w-2xl">
              <h1 className="sm:text-[85px]">CONTACT US</h1>
              <p className="font-open-sans text-dark-gray/90 mb-8 text-sm leading-relaxed sm:text-base md:text-[#999]">
                &quot;Questions? We’re here to help! Get in touch today.&quot;
              </p>
              <Button
                onClick={handleCustomOrderClick}
                variant="main"
                size="xl"
                rounded="full"
                className="bg-blue relative w-[170px] items-center justify-start sm:!w-[200px]"
                icon={
                  <Image
                    src="/arrow-right.png"
                    alt="arrow-right"
                    width={20}
                    height={20}
                    className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 md:h-[40px] md:w-[40px]"
                  />
                }
              >
                Custom Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <MarqueeStrip
        items={marqueeItems}
        backgroundColor="bg-blue"
        textColor="text-white"
        className="py-3 sm:py-4 md:mt-[-70px] 2xl:mt-[0px]"
      />

      {/* Contact Section */}
      <div className="mt-12 py-8 md:py-16">
        <div className="relative px-4 sm:px-[32px]">
          <div className="bg-light-blue rounded-3xl p-4 shadow-lg sm:p-6 md:p-8 lg:ml-[150px] lg:p-12 2xl:w-[90%]">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
              {/* Contact Information */}
              <div className="w-full lg:ml-[-200px] lg:w-2/5">
                <div className="bg-blue mx-auto flex h-full w-full flex-col items-center justify-center gap-4 rounded-3xl p-4 text-white sm:gap-6 sm:p-6 lg:gap-8 lg:p-8">
                  <div>
                    <h2 className="font-bebas mb-4 text-center text-3xl font-medium text-white sm:mb-6 sm:text-start sm:text-4xl lg:mt-0 lg:mb-8 lg:text-[52px]">
                      Contact Us
                    </h2>

                    {/* Phone */}
                    <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4 lg:mb-8">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-15 sm:w-15">
                        <Image
                          src="/c-1.png"
                          alt="Phone"
                          width={24}
                          height={24}
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </div>
                      <a
                        href="tel:+18001234567"
                        className="cursor-pointer text-sm transition-all duration-200 hover:underline sm:text-base"
                      >
                        +44 7306 127481
                      </a>
                    </div>

                    {/* Email */}
                    <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4 lg:mb-8">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-15 sm:w-15">
                        <Image
                          src="/c-2.png"
                          alt="Email"
                          width={24}
                          height={24}
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </div>
                      <a
                        href="mailto:info@sofadeal.co.uk"
                        className="cursor-pointer text-sm break-all transition-all duration-200 hover:underline sm:text-base"
                      >
                        info@sofadeal.co.uk
                      </a>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-15 sm:w-15">
                        <Image
                          src="/c-3.png"
                          alt="Location"
                          width={24}
                          height={24}
                          className="h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base lg:text-base">
                          2 Manor House Lane, Datchet, Slough,
                        </div>
                        <div className="text-sm sm:text-base lg:text-base">
                          England, SL3 9EB
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex-1">
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-center text-2xl sm:text-start sm:text-3xl lg:text-[52px]">
                    LET&apos;S CONNECT!
                  </h1>
                  <p className="mt-2 text-center text-sm text-[#999] sm:text-start sm:text-base">
                    Need more details or want to book our services? Reach out to
                    us today
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div>
                        <Input
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`h-[46px] rounded-full border-white bg-white px-6 text-[18px] placeholder:text-[#999] sm:h-[65px] ${
                            errors.firstName ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <div>
                        <Input
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`h-[46px] rounded-full border-white bg-white px-6 text-[18px] placeholder:text-[#999] sm:h-[65px] ${
                            errors.lastName ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`h-[46px] rounded-full border-white bg-white px-6 text-[18px] placeholder:text-[#999] sm:h-[65px] ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <div>
                      <Textarea
                        name="message"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`h-[160px] resize-none rounded-2xl border-white bg-white px-6 py-4 text-[18px] placeholder:text-[#999] sm:min-h-[218px] ${
                          errors.message ? "border-red-500" : ""
                        }`}
                        required
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      variant="main"
                      size="xl"
                      rounded="full"
                      disabled={submitContactMessage.isPending}
                      className="bg-blue relative !w-[120px] items-center justify-start disabled:opacity-50 md:!w-[140px]"
                      icon={
                        submitContactMessage.isPending ? (
                          <div className="absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] p-2 md:h-[40px] md:w-[40px]">
                            <div className="border-blue h-full w-full animate-spin rounded-full border-2 border-t-transparent"></div>
                          </div>
                        ) : (
                          <Image
                            src="/arrow-right.png"
                            alt="arrow-right"
                            width={20}
                            height={20}
                            className="text-blue absolute top-1/2 right-2 h-[30px] w-[30px] -translate-y-1/2 rounded-full bg-[#fff] object-contain p-2 md:h-[40px] md:w-[40px]"
                          />
                        )
                      }
                    >
                      {submitContactMessage.isPending ? "Sending..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
