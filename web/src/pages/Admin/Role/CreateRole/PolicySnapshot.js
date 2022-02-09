import React, { useEffect, useState } from "react";
import Blade from "apollo-react/components/Blade";
import Typography from "apollo-react/components/Typography";
import ButtonGroup from "apollo-react/components/ButtonGroup";
import { useHistory } from "react-router";
import ApolloProgress from "apollo-react/components/ApolloProgress";
import { getPolicySnapshot } from "../../../../services/ApiServices";

const PolicySnapshot = ({ policy, closeSnapshot }) => {
  const history = useHistory();
  const [policyProducts, setPolicyProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onClose = (v) => {
    setOpen(false);
    if (closeSnapshot) closeSnapshot();
  };
  const fetchPolicyPermission = async () => {
    const permissionsData = await getPolicySnapshot(policy.policyId);
    console.log("permissionsData", permissionsData);
    setPolicyProducts(permissionsData);
    setLoading(false);
  };
  useEffect(() => {
    if (policy) {
      setOpen(true);
      setLoading(true);
      fetchPolicyPermission();
    }
  }, [policy]);
  useEffect(() => {
    console.log("Update Snapshot");
  }, []);
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
        {loading ? (
          <div className="loader">
            <ApolloProgress />
          </div>
        ) : (
          policyProducts.map((product) => {
            const Categories = product.category.map((category) => {
              const permissionList = category.values.map((permission) => {
                return (
                  <Typography key={permission} className="b-font">
                    {permission}
                  </Typography>
                );
              });
              return (
                <div key={category.name} className="flex category-content">
                  <Typography className="category-name">
                    {category.name}
                  </Typography>
                  <div className="permission-list">{permissionList}</div>
                </div>
              );
            });
            return (
              <div key={product.label}>
                <Typography className="product-title">
                  {product.label}
                </Typography>
                {Categories}
              </div>
            );
          })
        )}
      </Blade>
    </>
  );
};

export default React.memo(PolicySnapshot);
