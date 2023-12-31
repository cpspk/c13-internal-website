import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import React, { useEffect, useState } from 'react'
import { allPodcastsLoadingSelector, allPodcastsSelector, getAllPodcasts } from 'redux/modules/podcast'
import {
  featuredPodcastDeletingSelector,
  featuredPodcastsListLoadingSelector,
  featuredPodcastsListSelector,
  getFeaturedPodcastsList,
  updateCategories
} from 'redux/modules/category'

import Box from '@material-ui/core/Box'
import Breadcrumbs from 'components/Breadcrumbs'
import Button from '@material-ui/core/Button'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import FeaturedPodcast from './FeaturedPodcast'
import IconButton from '@material-ui/core/IconButton'
import { Link } from 'react-router-dom'
import LoadingIndicator from 'components/LoadingIndicator'
import PropTypes from 'prop-types'
import { SNACKBAR_TYPE } from 'config/constants'
import Typography from '@material-ui/core/Typography'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { reorder } from 'utils/helpers'
import styles from './styles'
import { useSnackbar } from 'notistack'
import { userIsAuthenticatedRedir } from 'hocs/withAuth'
import { withStyles } from '@material-ui/core/styles'

export const FeaturedPodcasts = props => {
  const {
    classes,
    featuredPodcasts,
    getFeaturedPodcastsList,
    featuredPodcastsLoading,
    getAllPodcasts,
    allPodcasts,
    allPodcastsLoading,
    updateCategories,
    featuredPodcastDeleting
  } = props
  const { enqueueSnackbar } = useSnackbar()
  const [openAll, setOpenAll] = useState(true)
  const [categories, setCategories] = useState(featuredPodcasts)

  useEffect(() => {
    if (featuredPodcasts && featuredPodcasts.length === 0) {
      getFeaturedPodcastsList({
        fail: () => enqueueSnackbar('Failed to load featured podcasts!', { variant: SNACKBAR_TYPE.ERROR }),
        success: res => setCategories(res)
      })
    }
  }, [getFeaturedPodcastsList, enqueueSnackbar, featuredPodcasts])

  useEffect(() => {
    if (allPodcasts.length === 0) {
      getAllPodcasts({
        fail: () => enqueueSnackbar('Failed to load all podcasts!', { variant: SNACKBAR_TYPE.ERROR })
      })
    }
  }, [getAllPodcasts, enqueueSnackbar, allPodcasts])

  useEffect(() => {
    setCategories(featuredPodcasts)
  }, [featuredPodcasts])

  const handleToggleOpenAll = () => setOpenAll(!openAll)

  const handleOnDragEnd = result => {
    if (!result.destination) {
      return
    }

    updateCategoryPriorites(result.source.index, result.destination.index)
  }

  const handleMovePosition = (sourceIndex, destinationIndex) => {
    updateCategoryPriorites(sourceIndex, destinationIndex)
  }

  const updateCategoryPriorites = (sourceIndex, destinationIndex) => {
    const orderedArr = reorder(categories, sourceIndex, destinationIndex)
    setCategories(orderedArr)
    const length = orderedArr.length
    const orderedIdAndPriorityArr = orderedArr.map((item, index) => ({
      id: item.id,
      priority: length - index
    }))

    updateCategories({
      data: orderedIdAndPriorityArr,
      fail: () => enqueueSnackbar('Failed to change category priority!', { variant: SNACKBAR_TYPE.ERROR })
    })
  }

  return (
    <div className={classes.root}>
      <Breadcrumbs />
      <Box display="flex">
        <Box flexGrow={1} display="flex" mb={1} alignItems="flex-end">
          <Typography variant="h6">Show Hub Categories</Typography>
        </Box>
        <Box mb={2} mr={1}>
          <Button color="primary" variant="contained" component={Link} to="/featuredPodcasts/new">
            ADD NEW CUSTOM CATEGORY
          </Button>
        </Box>
      </Box>
      {featuredPodcasts && featuredPodcasts.length > 0 && (
        <Box display="flex">
          <IconButton onClick={handleToggleOpenAll}>
            {openAll ? <ExpandLessIcon color="action" /> : <ExpandMoreIcon color="action" />}
          </IconButton>
          <Box my="auto">
            <Typography>{openAll ? 'Collapse All' : 'Expand All'}</Typography>
          </Box>
        </Box>
      )}
      {featuredPodcastsLoading || allPodcastsLoading || featuredPodcastDeleting ? (
        <LoadingIndicator />
      ) : (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {categories &&
                  categories.map((featuredPodcast, index) => (
                    <Draggable key={featuredPodcast.id} draggableId={featuredPodcast.id} index={index}>
                      {(provided, snapshot) => (
                        <FeaturedPodcast
                          featuredPodcast={featuredPodcast}
                          openAll={openAll}
                          draggableProvided={provided}
                          onMovePosition={handleMovePosition}
                          index={index}
                          length={featuredPodcasts.length}
                        />
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}

FeaturedPodcasts.propTypes = {
  classes: PropTypes.object.isRequired,
  getFeaturedPodcastsList: PropTypes.func.isRequired,
  featuredPodcasts: PropTypes.array.isRequired,
  featuredPodcastsLoading: PropTypes.bool.isRequired
}

const selector = createStructuredSelector({
  featuredPodcasts: featuredPodcastsListSelector,
  featuredPodcastsLoading: featuredPodcastsListLoadingSelector,
  allPodcasts: allPodcastsSelector,
  allPodcastsLoading: allPodcastsLoadingSelector,
  featuredPodcastDeleting: featuredPodcastDeletingSelector
})

const actions = {
  getFeaturedPodcastsList,
  getAllPodcasts,
  updateCategories
}

export default compose(userIsAuthenticatedRedir, connect(selector, actions), withStyles(styles))(FeaturedPodcasts)
