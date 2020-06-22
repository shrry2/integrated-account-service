import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { FaFileImage } from 'react-icons/fa';
import ReactCrop from 'react-image-crop';
import loadImage from 'blueimp-load-image';

import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import Button from '../../../components/input/Button';
import { uploadProfilePicture } from '../../../domain/Backend/Profile';
import { ErrorMessage } from './style';

const ProcessingScreen = ({ isProcessing, children }) => {
  const DefaultWrapper = styled.div`
    box-sizing: border-box;
    padding: 1rem;
  `;

  const ProcessingWrapper = styled.div`
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.05);
    user-select: none;
    cursor: progress;
  `;

  if (!isProcessing) {
    return (
      <DefaultWrapper>
        {children}
      </DefaultWrapper>
    );
  }

  return (
    <ProcessingWrapper>
      {children}
    </ProcessingWrapper>
  );
};

const DropzoneWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  padding: 3rem 1rem;
  border: 2px dotted #888;
  border-radius: 5px;
  background: #fafafa;
  color: #666;
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus {
    border-color: #0575e6;
    color: #333;
  }
  
  &:focus {
    outline: 3px solid #05b2e6;
    -moz-outline-radius: 5px;
  }
  
  small {
    display: block;
    font-size: .8rem;
    margin-top: 1rem;
  }
`;

const Icon = styled.span`
  display: block;
  text-align: center;
  font-size: 2rem;
  margin-bottom: .5rem;
`;

const Dropzone = ({ onDrop, message, help }) => {
  const dropzoneOptions = {
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // no larger than 5mb
    multiple: false,
    onDrop,
  };
  const { getRootProps, getInputProps } = useDropzone(dropzoneOptions);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <DropzoneWrapper {...getRootProps()}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input {...getInputProps()} />
      <Icon><FaFileImage /></Icon>
      {message}
      <small>
        {help}
      </small>
    </DropzoneWrapper>
  );
};

Dropzone.propTypes = {
  onDrop: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  help: PropTypes.string.isRequired,
};

const Guidance = styled.h2`
  font-weight: 200;
  font-size: 1.2rem;
`;

const ControlButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: .5rem;
`;

function ProfileImageUploader({ onUploaded }) {
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [src, setSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [crop, setCrop] = useState(null);
  const [image, setImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const T = (key, data) => t(`pages:dashboard.profile.profilePicture.uploader.${key}`, data);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setIsProcessing(true);

      loadImage(
        acceptedFiles[0],
        (img) => {
          setFile(acceptedFiles[0]);
          setSrc(img.toDataURL('image/jpeg'));
          setIsProcessing(false);
        },
        {
          orientation: true,
          canvas: true,
        },
      );
    }
  }, []);

  const resetImage = () => {
    setSrc(null);
    setErrorMessage(null);
  };

  const onImageLoaded = (img) => {
    let x = 0;
    let y = 0;
    const { width, height } = img;
    let cropSize;
    if (width >= height) {
      cropSize = height;
      x = img.width / 2 - width / 2;
    } else if (height >= width) {
      cropSize = width;
      y = img.height / 2 - height / 2;
    }
    setImage(img);
    setCrop({
      unit: 'px',
      x,
      y,
      width: cropSize,
      height: cropSize,
      aspect: 1,
    });
    return false; // Return false when setting crop state in here.
  };

  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const uploadImage = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    let response;
    try {
      const cropData = {
        x: crop.x,
        y: crop.y,
        width: crop.width,
        height: crop.height,
        cropAreaWidth: image.width,
        cropAreaHeight: image.height,
      };
      response = await uploadProfilePicture(file, cropData);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
    if (response && response.result === 'ok') {
      onUploaded();
    }
  };

  // Dropzone
  if (!src) {
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <ProcessingScreen isProcessing={isProcessing}>
        <Guidance>{T('selectIconGuidance')}</Guidance>
        <Dropzone onDrop={onDrop} message={T('selectPicture')} help={T('help')} />
      </ProcessingScreen>
    );
  }

  // Image Cropper
  return (
    <>
      <Guidance>{T('cropGuidance')}</Guidance>
      <ReactCrop
        src={src}
        crop={crop}
        onImageLoaded={onImageLoaded}
        onChange={onCropChange}
        minWidth={100}
        minHeight={100}
        disabled={isProcessing}
      />
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <ControlButtons>
        <Button theme="gloomy" onClick={resetImage} disabled={isProcessing}>{T('reselect')}</Button>
        <Button theme="primary" onClick={uploadImage} disabled={isProcessing}>{T('proceed')}</Button>
      </ControlButtons>
    </>
  );
}

ProfileImageUploader.propTypes = {
  onUploaded: PropTypes.func.isRequired,
};

export default ProfileImageUploader;
