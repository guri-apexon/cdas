import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPolicyList } from "../../../../store/actions/PolicyAdminActions";
import "./CreateRole.scss";

const CreateRole = () => {
  const dispatch = useDispatch();
  const policyAdmin = useSelector((state) => state.policyAdmin);
  const getPolicies = () => {
    dispatch(getPolicyList(true));
  };
  useEffect(() => {
    if (policyAdmin.policyList?.length) {
      const policies = policyAdmin.policyList;
      console.log("policies", policies);
    }
  }, [policyAdmin]);
  useEffect(() => {
    getPolicies();
  }, []);
  return <div className="create-role-wrapper">Create Role</div>;
};

export default CreateRole;
