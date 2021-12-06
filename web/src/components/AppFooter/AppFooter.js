import Footer from "apollo-react/components/Footer";
import { withRouter } from "react-router";

const AppFooter = () => {
  return (
    <div style={wrapperStyle}>
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
        maxWidth={"100%"}
      />
    </div>
  );
};

const wrapperStyle = {
  background: '#F6F7FB',
  position: "absolute", 
  width: "100%",
}

export default withRouter(AppFooter);