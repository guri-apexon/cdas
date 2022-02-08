import React, { useEffect, useState } from "react";
import Blade from "apollo-react/components/Blade";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import { useHistory } from "react-router";

const PolicySnapshot = ({ policy, closeSnapshot }) => {
  const history = useHistory();
  const [policyProducts, setPolicyroducts] = useState([]);
  const [open, setOpen] = useState(false);
  const onClose = (v) => {
    console.log("onClose", v);
    setOpen(false);
  };
  useEffect(() => {
    if (policy) {
      console.log("policy", policy);
      setOpen(true);
    }
  }, [policy]);
  return (
    <>
      <Blade
        side="right"
        id="policySnapshot"
        open={open}
        onClose={onClose}
        title="Policy Snapshot"
        subtitle={policy?.policyName}
        hasBackdrop
        actions={
          // eslint-disable-next-line react/jsx-wrap-multilines
          <ButtonGroup
            alignItems="right"
            buttonProps={[
              {
                size: "small",
                onClick: () =>
                  policy &&
                  history.push(`policy-management/${policy?.policyId}`),
                label: "View full policy",
              },
              {
                size: "small",
                onClick: onClose,
                label: "Close",
              },
            ]}
          />
        }
      >
        <Typography variant="body2" className="">
          {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sodales ultrices
        arcu non elementum. Cras rutrum, urna non cursus luctus, mauris metus rhoncus sem,
        vitae faucibus augue nibh sed tellus.`}
        </Typography>
      </Blade>
    </>
  );
};

export default React.memo(PolicySnapshot);
