import { Box, Flex } from '@rebass/grid';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';

import Body from '../components/Body';
import CollectiveCover from '../components/CollectiveCover';
import ErrorPage, { generateError } from '../components/ErrorPage';
import ExpenseNeedsTaxFormMessage from '../components/expenses/ExpenseNeedsTaxFormMessage';
import ExpenseWithData from '../components/expenses/ExpenseWithData';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Link from '../components/Link';
import PageFeatureNotSupported from '../components/PageFeatureNotSupported';
import StyledButton from '../components/StyledButton';
import { withUser } from '../components/UserProvider';
import hasFeature, { FEATURES } from '../lib/allowed-features';
import { addCollectiveCoverData } from '../lib/graphql/queries';
import { ssrNotFoundError } from '../lib/nextjs_utils';
import Page from '../components/Page';
import { API_V2_CONTEXT, gqlV2 } from '../lib/graphql/helpers';
import { graphql } from 'react-apollo';
import { CommentFieldsFragment } from '../components/conversations/graphql';
import CollectiveThemeProvider from '../components/CollectiveThemeProvider';
import CollectiveNavbar from '../components/CollectiveNavbar';
import { Sections } from '../components/collective-page/_constants';
import ExpenseSummary from '../components/expenses/ExpenseSummary';
import StyledLink from '../components/StyledLink';
import Thread from '../components/conversations/Thread';
import CommentIcon from '../components/icons/CommentIcon';
import CommentForm from '../components/conversations/CommentForm';
import StyledRoundButton from '../components/StyledRoundButton';
import styled from 'styled-components';
import ExpenseAdminActions from '../components/expenses/ExpenseAdminActions';

const messages = defineMessages({
  title: {
    id: 'ExpensePage.title',
    defaultMessage: 'Expense #{id}: {title}',
  },
});

class ExpensePage extends React.Component {
  static getInitialProps({ query: { collectiveSlug, ExpenseId } }) {
    return { collectiveSlug, ExpenseId: parseInt(ExpenseId) };
  }

  static propTypes = {
    collectiveSlug: PropTypes.string,
    ExpenseId: PropTypes.number,
    LoggedInUser: PropTypes.object,
    expenseCreated: PropTypes.string, // actually a stringed boolean 'true'
    /** from withData */
    data: PropTypes.object.isRequired,
    /** from injectIntl */
    intl: PropTypes.object,
  };

  getPageMetaData(expense) {
    if (expense) {
      const { intl } = this.props;
      return { title: intl.formatMessage(messages.title, { id: expense.id, title: expense.title }) };
    } else {
      const { collectiveSlug, ExpenseId } = this.props;
      return { title: `Expense #${ExpenseId} on ${collectiveSlug}` };
    }
  }

  render() {
    const { collectiveSlug, data } = this.props;

    if (!data.loading) {
      if (!data || data.error) {
        return <ErrorPage data={data} />;
      } else if (!data.account) {
        ssrNotFoundError(); // Force 404 when rendered server side
        return <ErrorPage error={generateError.notFound(collectiveSlug)} log={false} />;
      } else if (!data.expense) {
        ssrNotFoundError(); // Force 404 when rendered server side
        return null; // TODO: page for expense not found
      } else if (!hasFeature(data.account, FEATURES.NEW_EXPENSE_FLOW)) {
        return <PageFeatureNotSupported />;
      }
    }

    const collective = data && data.account;
    const host = collective && collective.host;
    const expense = data && data.expense;

    return (
      <Page collective={collective} {...this.getPageMetaData(expense)} withoutGlobalStyles>
        <CollectiveThemeProvider collective={collective}>
          <CollectiveNavbar collective={collective} isLoading={!collective} selected={Sections.BUDGET} />
          <Flex mt={3}>
            <Flex flexDirection="column" alignItems="flex-end" width="calc((100% - 1260px) / 2)" minWidth={56} pt={72}>
              <ExpenseAdminActions />
            </Flex>
            <Box flex="1" maxWidth={850} p={4}>
              <Box mb={4}>
                <StyledLink as={Link} color="black.600" route="expenses" params={{ collectiveSlug }}>
                  &larr;&nbsp;
                  <FormattedMessage id="Back" defaultMessage="Back" />
                </StyledLink>
              </Box>
              <Box mb={3}>
                <ExpenseSummary expense={expense} host={host} isLoading={!expense} />
              </Box>
              {expense && (
                <Box mb={3} pt={3}>
                  <Thread
                    collective={collective}
                    items={expense.comments.nodes}
                    onCommentDeleted={this.onCommentDeleted}
                  />
                </Box>
              )}
              <Flex mt="40px">
                <Box display={['none', null, 'block']} flex="0 0" p={3}>
                  <CommentIcon size={24} color="lightgrey" />
                </Box>
                <Box flex="1 1" maxWidth={[null, null, 'calc(100% - 56px)']}>
                  <CommentForm
                    id="new-comment-on-expense"
                    ExpenseId={expense && expense.id}
                    disabled={!expense}
                    onSuccess={this.onCommentAdded}
                  />
                </Box>
              </Flex>
            </Box>
          </Flex>
        </CollectiveThemeProvider>
      </Page>
    );
  }
}

const getData = graphql(
  gqlV2`
    query CreateExpensePage($collectiveSlug: String!, $ExpenseId: Int!) {
      expense(legacyId: $ExpenseId) {
        id
        legacyId
        description
        currency
        type
        attachments {
          id
          incurredAt
          description
          amount
          url
        }
        payee {
          id
          slug
          name
          type
          location {
            address
            country
          }
        }
        payoutMethod {
          id
          type
          data
        }
        comments {
          nodes {
            ...CommentFields
          }
        }
      }
      account(slug: $collectiveSlug, throwIfMissing: false) {
        id
        slug
        name
        type
        description
        settings
        imageUrl
        twitterHandle
        currency
        expensePolicy
        ... on Collective {
          id
          isApproved
          balance
          host {
            id
            name
            slug
            type
            expensePolicy
            location {
              address
              country
            }
          }
        }
        ... on Event {
          id
          isApproved
          balance
          host {
            id
            name
            slug
            type
            expensePolicy
            location {
              address
              country
            }
          }
        }
      }
    }

    ${CommentFieldsFragment}
  `,
  {
    options: {
      context: API_V2_CONTEXT,
    },
  },
);

export default injectIntl(getData(ExpensePage));
