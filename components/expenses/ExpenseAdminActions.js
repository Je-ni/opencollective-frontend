import React from 'react';
import styled from 'styled-components';

import { Download as IconDownload } from '@styled-icons/feather/Download';
import { Link as IconLink } from '@styled-icons/feather/Link';
import { Trash2 as IconTrash } from '@styled-icons/feather/Trash2';

import StyledRoundButton from '../StyledRoundButton';
import { fadeIn } from '../StyledKeyframes';
import { FormattedMessage } from 'react-intl';

const ButtonLabel = styled.div`
  position: absolute;
  background: rgba(10, 10, 10, 0.9);
  right: 50px;
  top: 5px;
  width: 154px;
  padding: 6px;
  color: white;
  border-radius: 4px;
  display: none;
  animation: ${fadeIn} 0.2s;
`;

const ButtonWithLabel = styled(StyledRoundButton)`
  position: relative;

  &:hover ${ButtonLabel} {
    display: block;
  }
`;

/**
 * Admin buttons for the expense, displayed in a React fragment to let parent
 * in control of the layout.
 */
const ExpenseAdminActions = () => {
  return (
    <React.Fragment>
      <ButtonWithLabel size={40} m={2}>
        <IconDownload size={18} />
        <ButtonLabel>
          <FormattedMessage id="actions.download" defaultMessage="Download" />
        </ButtonLabel>
      </ButtonWithLabel>
      <ButtonWithLabel size={40} m={2}>
        <IconLink size={18} />
        <ButtonLabel>
          <FormattedMessage id="CopyLink" defaultMessage="Copy link" />
        </ButtonLabel>
      </ButtonWithLabel>
      <ButtonWithLabel size={40} m={2} buttonStyle="danger">
        <IconTrash size={18} />
        <ButtonLabel>
          <FormattedMessage id="Expense.delete" defaultMessage="Delete expense" />
        </ButtonLabel>
      </ButtonWithLabel>
    </React.Fragment>
  );
};

export default ExpenseAdminActions;
