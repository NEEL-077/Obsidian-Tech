"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Dribbble,
  Globe,
} from "lucide-react";
import { FooterBackgroundGradient } from "./ui/hover-footer";
import { TextHoverEffect } from "./ui/hover-footer";

function HoverFooter() {
  // Footer link data
  const footerLinks = [
    {
      title: "About Us",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Mission & Vision", href: "/about" },
        { label: "Tech Stack", href: "/about" },
        { label: "Careers", href: "#" },
      ],
    },
    {
      title: "Helpful Links",
      links: [
        { label: "Contact Us", href: "/contact" },
        { label: "FAQs", href: "/contact" },
        { label: "Support", href: "/contact" },
        {
          label: "Live Chat",
          href: "#",
          pulse: true,
        },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} />,
      text: "OBSIDIAN TECH.001@gmail.com",
      href: "mailto:OBSIDIAN TECH.001@gmail.com",
    },
    {
      icon: <Phone size={18} />,
      text: "+91 6353808435",
      href: "tel:+916353808435",
    },
    {
      icon: <MapPin size={18} />,
      text: "Surat, Gujarat, India",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Facebook size={20} />, label: "Facebook", href: "#" },
    { icon: <Instagram size={20} />, label: "Instagram", href: "#" },
    { icon: <Twitter size={20} />, label: "Twitter", href: "#" },
    { icon: <Dribbble size={20} />, label: "Dribbble", href: "#" },
    { icon: <Globe size={20} />, label: "Globe", href: "#" },
  ];

  return (
    <footer className="bg-[#0a0a0b] relative h-fit rounded-3xl overflow-hidden m-8">
      <div className="max-w-7xl mx-auto p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">

              <span className="text-white text-3xl font-bold">OBSIDIAN TECH</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Your trusted destination for the latest smartphones with AI-powered recommendations at OBSIDIAN TECH.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-lg font-semibold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        to={link.href}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="flex items-center space-x-3 text-gold-500 hover:text-cyan-400 transition-colors"
                    >
                      {item.icon}
                      <span>{item.text}</span>
                    </a>
                  ) : (
                    <span className="flex items-center space-x-3 text-gold-500 hover:text-cyan-400 transition-colors cursor-pointer">
                      {item.icon}
                      <span>{item.text}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-gray-700 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          {/* Social icons */}
          <div className="flex space-x-6 text-gray-400">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-cyan-400 transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left text-gray-400">
            &copy; {new Date().getFullYear()} OBSIDIAN TECH. All rights reserved.
          </p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-64 mt-8">
        <TextHoverEffect text="OBSIDIAN TECH" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default HoverFooter;
