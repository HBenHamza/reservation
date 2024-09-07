import React from 'react';
import { getImageSrc } from '../../Utils/imageUtils';

const Footer = () => {
  return (
    <div className="footer">
      <div className="whatsapp">
        <img src={getImageSrc('/img/whatsapp.png')} alt="WhatsApp" />
        <p>+216 73 693 530</p>
      </div>
      <div className="gmail">
        <img src={getImageSrc('/img/gmail.png')} alt="Gmail" />
        <a href="mailto:thapsusresortcontact@gmail.com">thapsusresortcontact@gmail.com</a>
      </div>
      <div className="facebook">
        <img src={getImageSrc('/img/facebook.png')} alt="Facebook" />
        <a href="https://www.facebook.com/ThapsusMahdia/" target="_blank" rel="noopener noreferrer">
          https://www.facebook.com/ThapsusMahdia/
        </a>
      </div>
      <div className="instagram">
        <img src={getImageSrc('/img/instagram.png')} alt="Instagram" />
        <a href="https://www.instagram.com/hotel_thapsus_mahdia?igsh=MXAzdjc4ODE0OWViYw==" target="_blank" rel="noopener noreferrer">
          https://www.instagram.com/hotel_thapsus_mahdia?igsh=MXAzdjc4ODE0OWViYw==
        </a>
      </div>
      <p className="copyright">Copyright ©2024 All rights reserved</p>
    </div>
  );
};

export default Footer;
