import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactCodesInput from 'react-codes-input';

const Container = styled.div`
  margin: 1rem 0;
`;

function CodeInput(props) {
  const {
    length,
    value,
    onChange,
    disabled,
  } = props;

  // ref for focusing input on initial mount
  const codeInput = useRef(null);
  useEffect(() => {
    codeInput.current.focus();
  }, []);

  return (
    <Container>
      <ReactCodesInput
        initialFocus="false"
        wrapperRef={codeInput}
        codeLength={length}
        onChange={onChange}
        type="number"
        letterCase="upper"
        value={value}
        hide={false}
        placeholder=""
        classNameWrapper="code-input"
        disabled={disabled}
      />
    </Container>
  );
}

CodeInput.propTypes = {
  length: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

CodeInput.defaultProps = {
  length: 6,
  value: '',
  onChange: () => {},
  disabled: false,
};

export default CodeInput;
