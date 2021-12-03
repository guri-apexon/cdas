import Footer from "apollo-react/components/Footer";
import { withRouter } from "react-router";

const AppFooter = () => {
  return (
    <div style={{ position: "absolute", width: "100%" }}>
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

export default withRouter(AppFooter);