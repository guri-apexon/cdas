import Footer from "apollo-react/components/Footer";

const footerStyle = {
  maxWidth: "100%",
  height: "auto",
};

const AppFooter = () => {
  return (
    <div
      className="app-footer"
      style={{ background: "#F6F7FB", width: "100%" }}
    >
      <Footer
        buttonProps={[
          {
            label: "Terms of Use",
            href: "https://www.iqvia.com/about-us/terms-of-use",
            target: "_blank",
          },
          {
            label: "Privacy Policy",
            href: "https://www.iqvia.com/about-us/privacy/privacy-policy",
            target: "_blank",
          },
        ]}
        style={footerStyle}
      />
    </div>
  );
};

export default AppFooter;
