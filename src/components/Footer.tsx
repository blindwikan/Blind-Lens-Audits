const Footer = () => {
  return (
    <footer className="border-t border-border/50 mt-16 py-6 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs text-muted-foreground">
          Accessibility data powered by{" "}
          <a
            href="https://wave.webaim.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-accent underline underline-offset-2 transition-colors"
          >
            WAVE by WebAIM
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
