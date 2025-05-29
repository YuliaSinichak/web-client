import React from "react";

const Footer = () => {
  return (
    <footer className="bg-olive-600 text-cream px-8 py-4 flex flex-wrap justify-between items-center text-sm mt-5">
      <div className="mb-4 sm:mb-0">
        <p>© 2025 City Builder Simulator v.1000. All rights protected by me.</p>
        <p>
          Розроблено в рамках курсу{" "}
          <span className="italic">
            "Вебтехнології та розробка вебзастосувань"
          </span>
        </p>
      </div>
      <div>
        <p className="font-semibold">Контакти</p>
        <p>
          <a
            href="https://www.linkedin.com/in/yuliia-synychak"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            LinkedIn
          </a>
        </p>
        <p>
          <a
            href="https://github.com/YuliaSinichak"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
