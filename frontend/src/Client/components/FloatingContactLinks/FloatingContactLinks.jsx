import React from "react";
import { Phone } from "lucide-react";
import "./FloatingContactLinks.css";

export default function FloatingContactLinks() {
  const phoneNumber = "0932082976";
  const facebookUrl = "https://www.facebook.com/anh.khoa.huynh.376591?locale=vi_VN";
  const zaloUrl = "https://zalo.me/0932082976";

  return (
    <div className="floating-contact-links">
      <a
        href={`tel:${phoneNumber}`}
        className="floating-contact-btn phone"
        title="Call me"
      >
        <Phone size={22} />
      </a>

      <a
        href={facebookUrl}
        className="floating-contact-btn facebook"
        title="Facebook"
        target="_blank"
        rel="noopener noreferrer"
      >
        f
      </a>

      <a
        href={zaloUrl}
        className="floating-contact-btn zalo"
        title="Zalo"
        target="_blank"
        rel="noopener noreferrer"
      >
        Zalo
      </a>
    </div>
  );
}