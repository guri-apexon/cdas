import Footer from "apollo-react/components/Footer";

const wrapperStyle = {
  background: "#F6F7FB",
  // position: "absolute",
  width: "100%",
  // bottom: 0,
};

const footerStyle = {
  maxWidth: "100%",
};

const AppFooter = () => {
  return (
    <div className="app-footer" style={wrapperStyle}>
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
