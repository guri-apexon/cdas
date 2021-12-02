/* eslint-disable react/prop-types */
import React, { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerviedStateFromError() {
    return {
      hasError: true,
    };
  }
  render() {
    if (this.state.hasError) {
      return <div>this is serror page;</div>;
    } else {
      return this.props.children;
    }
  }
}
