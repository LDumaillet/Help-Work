import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/free-regular-svg-icons";
import React from "react";
import {
  faLinkedin,
  faSquareFacebook,
  faSquareXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faAddressBook } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  return (
    <div className="footer">
      <div className="social-networks">
        <FontAwesomeIcon icon={faLinkedin} />
        <FontAwesomeIcon icon={faSquareFacebook} />
        <FontAwesomeIcon icon={faSquareXTwitter} />
        <FontAwesomeIcon icon={faAddressBook} />
      </div>
      <p>
        <FontAwesomeIcon icon={faCopyright} />| Lucas DUMAILLET | 2026 Help
        Work. Tous droits réservés.
      </p>
    </div>
  );
};

export default Footer;
