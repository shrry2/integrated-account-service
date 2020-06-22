import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';

import { useHistory } from 'react-router-dom';

import styled from 'styled-components';
import media from 'styled-media-query';
import { AiOutlineDelete } from 'react-icons/ai';

import {
  ButtonContainer,
  SectionTitle,
  SectionBody,
  ErrorMessage,
  HelpText, SectionSubTitle,
} from './style';

import Modal from '../../../components/Modal';
import ProfileImageUploader from './ProfileImageUploader';
import Button from '../../../components/input/Button';
import ReturnLink from '../components/ReturnLink';

import {
  loadProfilePictureLibrary,
  selectFromPictureLibrary,
  deleteProfilePictureLibrary,
} from '../../../domain/Backend/Profile';

const LibraryMessage = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 1rem auto;
  border-radius: 5px;
  border: 1px solid ${({ color }) => color ?? '#ccc'};
  text-align: center;
  color: ${({ color }) => color ?? '#ccc'};
  padding: 1rem;
  background: #fff;
`;

const LibraryItemOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  padding: 1rem;
  display: none;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

const ProfilePicturesLibrary = styled.ul`
  list-style: none;
  margin: 1rem 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: flex-start;
  
  li {
    flex-basis: 50%;
    align-self: flex-start;
    position: relative;
    box-sizing: border-box;
    padding: .5rem;
    
    ${media.greaterThan('medium')`
      flex-basis: ${100 / 3}%;
    `}
    
    img {
      width: 100%;
    }
    
    &:hover,
    &:focus {
      div {
        display: flex;
      }
    }
  }
`;

function ProfilePicture({ onUpdated }) {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.profile.${key}`, data);

  const history = useHistory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [profilePictures, setProfilePictures] = useState(null);

  const loadLibrary = async () => {
    let pictures;
    try {
      pictures = await loadProfilePictureLibrary();
      setProfilePictures(pictures);
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const update = async () => {
    toast.success(T('updated', { field: t('common:profilePicture') }));
    await onUpdated();
    history.push('/profile');
  };

  const selectPicture = async (id) => {
    try {
      const response = await selectFromPictureLibrary(id);
      if (response.result === 'ok') {
        update();
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteProfilePicture = async (id) => {
    try {
      const response = await deleteProfilePictureLibrary(id);
      if (response.result === 'ok') {
        if (response.needUpdate) {
          update();
          return;
        }
        await loadLibrary();
        toast.success(T('profilePicture.deleteSuccess'));
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const PictureSpacers = [];
  if (Array.isArray(profilePictures)) {
    if (profilePictures.length % 3 === 1) {
      PictureSpacers.push(<li key="spacer_0" />, <li key="spacer_1" />);
    } else if (profilePictures.length % 3 === 2) {
      PictureSpacers.push(<li key="spacer_0" />);
    }
  }

  return (
    <>
      <SectionTitle>
        <ReturnLink to="/profile" />
        {T('edit', { field: t('common:profilePicture') })}
      </SectionTitle>
      <SectionBody>
        <HelpText>{T('help.profilePicture')}</HelpText>
        <ButtonContainer>
          <Button
            capitalize
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            {T('profilePicture.uploadNewPicture')}
          </Button>
          <Modal
            contentLabel="Profile picture uploader"
            onRequestClose={() => setIsModalOpen(false)}
            isOpen={isModalOpen}
          >
            <ProfileImageUploader
              onUploaded={update}
            />
          </Modal>
        </ButtonContainer>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <HelpText>{T('profilePicture.guidance')}</HelpText>
        <SectionSubTitle>{T('profilePicture.uploadedItem')}</SectionSubTitle>
        <SectionBody>
          {(!profilePictures) && (
            <LibraryMessage>
              {t('common:loading')}
              ...
            </LibraryMessage>
          )}
          {(Array.isArray(profilePictures) && profilePictures.length === 0)
          && (
            <LibraryMessage color="#2DA85F">
              {T('profilePicture.noPictures')}
            </LibraryMessage>
          )}
          {(Array.isArray(profilePictures) && profilePictures.length >= 1)
          && (
            <ProfilePicturesLibrary>
              {profilePictures.map((picture) => (
                <li key={picture.id}>
                  <img
                    src={picture.imgixUrl ? `${picture.imgixUrl}?w=200` : picture.url}
                    alt={T('profilePicture.uploadedItem')}
                  />
                  <LibraryItemOverlay>
                    <Button onClick={() => selectPicture(picture.id)}>
                      {T('profilePicture.useThis')}
                    </Button>
                    <Button theme="gloomy" onClick={() => deleteProfilePicture(picture.id)}>
                      <AiOutlineDelete />
                      {T('profilePicture.delete')}
                    </Button>
                  </LibraryItemOverlay>
                </li>
              ))}
              {PictureSpacers}
            </ProfilePicturesLibrary>
          )}
        </SectionBody>
      </SectionBody>
    </>
  );
}

ProfilePicture.propTypes = {
  onUpdated: PropTypes.func.isRequired,
};

export default ProfilePicture;
