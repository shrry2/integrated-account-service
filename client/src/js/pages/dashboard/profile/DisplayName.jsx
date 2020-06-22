import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { toast } from 'react-toastify';

import { useTranslation } from 'react-i18next';

import InfiniteScroll from 'react-infinite-scroller';

import { useHistory } from 'react-router-dom';

import {
  Card,
} from '../style';

import {
  ButtonContainer,
  SectionTitle,
  SectionBody,
  ErrorMessage,
  SectionSubTitle,
  History,
  HelpText,
  HistoryItem,
  HistoryDeleteButton,
} from './style';

import RoundInput from '../components/RoundInput';

import Button from '../../../components/input/Button';
import ReturnLink from '../components/ReturnLink';
import {
  updateDisplayName,
  loadDisplayNameHistory,
  deleteDisplayNameHistory,
} from '../../../domain/Backend/Profile';

import parseTZ from '../../../utils/TZParser';

function DisplayName({ currentDisplayName, timezone, onUpdated }) {
  const { t } = useTranslation();
  const T = (key, data) => t(`pages:dashboard.profile.${key}`, data);

  const history = useHistory();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [value, setValue] = useState(currentDisplayName);

  const [changeHistory, setChangeHistory] = useState([]);
  const [loadingChangeHistory, setLoadingChangeHistory] = useState(false);
  const [nextCursor, setNextCursor] = useState(undefined);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const update = async () => {
    toast.success(T('updated', { field: t('common:displayName') }));
    await onUpdated();
    history.push('/profile');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    let response;
    try {
      response = await updateDisplayName(value);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
    if (response && response.result === 'notModified') {
      // ignore if not modified
      history.push('/profile');
    } else if (response && response.result === 'ok') {
      await update();
    }
  };

  const loadHistory = async () => {
    if (nextCursor === 0) return;
    setLoadingChangeHistory(true);
    try {
      const response = await loadDisplayNameHistory(10, nextCursor);
      if (response && Array.isArray(response.history)) {
        setChangeHistory(changeHistory.concat(response.history));
        setNextCursor(response.nextCursor);
      }
    } catch (e) {
      setChangeHistory([]);
      toast.error(e.message);
    } finally {
      setLoadingChangeHistory(false);
    }
  };

  const deleteHistory = async (id) => {
    try {
      const response = await deleteDisplayNameHistory(id);
      if (response.result === 'ok') {
        // item successfully deleted
        setChangeHistory(
          changeHistory.filter((item) => item.id !== id),
        );
        if (response.needUpdate === true) {
          await update();
        }
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <SectionTitle>
        <ReturnLink to="/profile" />
        {T('edit', { field: t('common:displayName') })}
      </SectionTitle>
      <SectionBody>
        <RoundInput
          value={value}
          onChange={handleChange}
          label={t('common:displayName')}
          name="displayName"
          disabled={isProcessing}
        />
        <HelpText>{T('help.displayName')}</HelpText>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <ButtonContainer>
          <Button
            type="submit"
            capitalize
            disabled={isProcessing}
          >
            {t('labels.save')}
          </Button>
        </ButtonContainer>
      </SectionBody>
      <SectionSubTitle>
        {T('changeHistory')}
      </SectionSubTitle>
      <HelpText>{T('historyDescription', { field: t('common:displayName') })}</HelpText>
      <Card>
        <InfiniteScroll
          pageStart={0}
          loadMore={loadHistory}
          hasMore={!loadingChangeHistory && nextCursor !== 0}
          loader={<div key={0}>...</div>}
          useWindow={false}
        >
          <History>
            {changeHistory.map((item) => (
              <HistoryItem key={item.id} tabIndex="0">
                <div>
                  <span className="date">{parseTZ(item.createdAt, timezone)}</span>
                  {item.displayName}
                </div>
                <HistoryDeleteButton type="button" onClick={() => deleteHistory(item.id)}>&times;</HistoryDeleteButton>
              </HistoryItem>
            ))}
          </History>
        </InfiniteScroll>
      </Card>
    </form>
  );
}

DisplayName.propTypes = {
  currentDisplayName: PropTypes.string.isRequired,
  timezone: PropTypes.string.isRequired,
  onUpdated: PropTypes.func.isRequired,
};

export default DisplayName;
