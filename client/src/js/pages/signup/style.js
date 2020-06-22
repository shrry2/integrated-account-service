import styled from 'styled-components';
import Button from '../../components/input/Button';

export const View = styled.main`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
`;

export const Heading = styled.h1`
  margin: 0;
  font-size: 2rem;
  text-align: center;
  font-weight: 300;
`;

export const Heading2 = styled.h2`
  margin: 2rem 0;
  font-size: 1.8rem;
  font-weight: 400;
  text-align: center;;
`;

export const Guidance = styled.h2`
  margin: 2rem 0;
  font-size: 1.15rem;
  font-weight: 400;
  text-align: center;
`;

export const ErrorMessage = styled.div`
  background: #e8383d;
  color: #fff;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: .5rem;
  text-align: left;
`;

export const SuccessMessage = styled.div`
  background: #00a542;
  color: #fff;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: .5rem;
  text-align: left;
`;

export const WarningMessage = styled.div`
  background: #e8a920;
  color: #fff;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: .5rem;
  text-align: left;
`;

export const CheckboxWrapper = styled.div`
  margin: 1rem 0;
`;

export const BottomWrapper = styled.div`
  margin-top: .5rem;
`;

export const ModalButtonContainer = styled.div`
  margin-top: -1rem;
  display:flex;
  justify-content: space-between;
`;

export const BottomContainer = styled.div`
  margin-top: .5rem;
  display:flex;
  justify-content: space-between;
`;

export const MailBoxWrapper = styled.div`
  margin: 2rem 0;
  text-align: center;
  font-size: 4.5rem;
`;

export const CenteredButtonWrapper = styled.div`
  margin: 2rem 0;
  text-align: center;
`;

export const WideButton = styled(Button)`
  width: 100%;
  padding: .7rem 0;
`;
