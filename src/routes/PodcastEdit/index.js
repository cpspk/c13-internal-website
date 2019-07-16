import React, { useEffect } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Redirect, Route, Switch } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import PropTypes from 'prop-types'

import {
  getPodcastDetails,
  updatePodcastDetails,
  podcastDetailsSelector,
} from 'redux/modules/podcast'
import { formSubmit } from 'utils/form'
import LoadingIndicator from 'components/LoadingIndicator'
import NavTabs from './NavTabs'
import GeneralEdit from './GeneralEdit'
import CrewMembers from './CrewMembers'
import SubscribeLinks from './SubscribeLinks'
import CrewMemberEdit from './CrewMemberEdit'
import styles from './styles'

const renderComingSoon = () => <div>Coming Soon...</div>

export const PodcastEdit = (props) => {
  const { classes, match, getPodcastDetails, podcastDetails, updatePodcastDetails } = props
  const { podcastGuid } = match.params

  useEffect(
    () => {
      getPodcastDetails({ guid: podcastGuid })
    },
    [podcastGuid, getPodcastDetails]
  )

  const handleSubmit = (values, formActions) => {
    formSubmit(
      updatePodcastDetails,
      {
        guid: podcastGuid,
        data: values
      },
      formActions
    )
  }

  return (
    <>
      <NavTabs />
      {podcastDetails ? (
        <Switch>
          <Route
            path={`${match.path}/general`}
            render={props => (
              <Paper className={classes.paper}>
                <GeneralEdit
                  {...props}
                  podcastDetails={podcastDetails}
                  onSubmit={handleSubmit}
                />
              </Paper>
            )}
          />
          <Route
            path={`${match.path}/crew/new`}
            render={props => (
              <Paper className={classes.paper}>
                <CrewMemberEdit
                  {...props}
                />
              </Paper>
            )}
          />
          <Route
            path={`${match.path}/crew/:crewGuid/edit`}
            render={props => (
              <Paper className={classes.paper}>
                <CrewMemberEdit
                  {...props}
                />
              </Paper>
            )}
          />
          <Route
            path={`${match.path}/crew`}
            exact
            component={CrewMembers}
          />
          <Route
            path={`${match.path}/subscribe-links`}
            render={props => (
              <Paper className={classes.paper}>
                <SubscribeLinks
                  {...props}
                  initialValues={podcastDetails}
                  onSubmit={handleSubmit}
                />
              </Paper>
            )}
          />
          <Route
            path={`${match.path}/settings`}
            render={renderComingSoon}
          />
          <Redirect to={`${match.url}/general`} />
        </Switch>
      ) : (
        <LoadingIndicator />
      )}
    </>
  )
}

PodcastEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  getPodcastDetails: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  podcastDetails: PropTypes.object,
  queryParams: PropTypes.object,
  updatePodcastDetails: PropTypes.func.isRequired,
}

const selector = createStructuredSelector({
  podcastDetails: podcastDetailsSelector
})

const actions = {
  getPodcastDetails,
  updatePodcastDetails,
}

export default compose(
  connect(selector, actions),
  withStyles(styles)
)(PodcastEdit)