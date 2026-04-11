/* eslint-disable react/display-name */
const React = require('react');
const { View } = require('react-native-web');

const CameraView = React.forwardRef((props, ref) =>
  React.createElement(View, { ...props, ref })
);

const useCameraPermissions = () => [{ granted: true }, jest.fn()];

module.exports = { CameraView, useCameraPermissions };
