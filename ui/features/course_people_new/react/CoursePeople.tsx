/*
 * Copyright (C) 2025 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useEffect, type FC} from 'react'
import {Flex} from '@instructure/ui-flex'
import {View} from '@instructure/ui-view'
import {showFlashAlert} from '@canvas/alerts/react/FlashAlert'
import CoursePeopleHeader from './components/PageHeader/CoursePeopleHeader'
import PeopleSearchBar from './components/SearchPeople/PeopleSearchBar'
import RosterTable from './components/RosterTable/RosterTable'
import NoPeopleFound from './components/SearchPeople/NoPeopleFound'
import LoadingIndicator from '@canvas/loading-indicator'
import useSearch from './hooks/useSearch'
import useCoursePeopleContext from './hooks/useCoursePeopleContext'
import useCoursePeopleQuery from './hooks/useCoursePeopleQuery'
import {useScope as createI18nScope} from '@canvas/i18n'

const I18n = createI18nScope('course_people')

const CoursePeople: FC = () => {
  const {
    search: rawSearchTerm,
    debouncedSearch: searchTerm,
    onChangeHandler,
    onClearHandler
  } = useSearch()
  const {courseId} = useCoursePeopleContext()
  const {data: users, isLoading, error} = useCoursePeopleQuery({courseId, searchTerm})
  const numberOfResults = users ? users.length : 0

  useEffect(() => {
    if (error) {
      showFlashAlert({
        message: I18n.t('An error occurred while loading people.'),
        type: 'error',
      })
    }
  }, [error])

  return (
    <View>
      <CoursePeopleHeader />
      <View as="div" margin="medium 0">
        <PeopleSearchBar
          searchTerm={rawSearchTerm}
          numberOfResults={numberOfResults}
          isLoading={isLoading}
          onChangeHandler={onChangeHandler}
          onClearHandler={onClearHandler}
        />
      </View>
      {isLoading && (
        <Flex as="div" justifyItems="center">
          <Flex.Item as="div" padding="xx-large">
            <LoadingIndicator />
          </Flex.Item>
        </Flex>
      )}
      {!isLoading && numberOfResults > 0 && (
        <RosterTable users={users} />
      )}
      {!isLoading && numberOfResults === 0 && (
        <NoPeopleFound />
      )}
    </View>
  )
}

export default CoursePeople
