/*
 * Copyright (C) 2018 - present Instructure, Inc.
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

import I18n from 'i18n!assignments_2_student_points_display'

import PropTypes from 'prop-types'
import React from 'react'

import Text from '@instructure/ui-elements/lib/components/Text'
import Flex, {FlexItem} from '@instructure/ui-layout/lib/components/Flex'
import ScreenReaderContent from '@instructure/ui-a11y/lib/components/ScreenReaderContent'

function renderPoints(receivedGrade, possiblePoints) {
  let screenReaderPoints, displayPoints
  if (receivedGrade === null || receivedGrade === undefined) {
    screenReaderPoints = I18n.t('Ungraded')
    displayPoints = '-'
  } else {
    screenReaderPoints = receivedGrade
    displayPoints = receivedGrade
  }

  return (
    <div>
      <ScreenReaderContent>
        {`${screenReaderPoints} ${I18n.t('out of')} ${possiblePoints} ${I18n.t('points')}`}
      </ScreenReaderContent>

      <Flex aria-hidden="true" direction="column" textAlign="end">
        <FlexItem>
          <Text size="x-large" data-test-id="points-display">
            {displayPoints}/{possiblePoints}
          </Text>
        </FlexItem>
        <FlexItem>
          <Text>{I18n.t('Points')}</Text>
        </FlexItem>
      </Flex>
    </div>
  )
}

function renderPercent(receivedGrade) {
  let screenReaderPoints, displayPoints
  const convertedRecievedPoints = receivedGrade ? Number(receivedGrade.slice(0, -1)) : null // NOTE: percentage grade comes as a x% format
  if (convertedRecievedPoints === null || convertedRecievedPoints === undefined) {
    screenReaderPoints = I18n.t('Ungraded')
    displayPoints = '-'
  } else {
    screenReaderPoints = receivedGrade
    displayPoints = convertedRecievedPoints
  }

  return (
    <div>
      <ScreenReaderContent>{`${screenReaderPoints} ${I18n.t('percent')}`}</ScreenReaderContent>

      <Flex aria-hidden="true" direction="column" textAlign="end">
        <FlexItem>
          <Text size="x-large" data-test-id="points-display">
            {`${displayPoints}%`}
          </Text>
        </FlexItem>
      </Flex>
    </div>
  )
}

function renderPointsPossible(possiblePoints) {
  return (
    <div>
      <Flex direction="row" alignItems="end" justifyItems="end" textAlign="end">
        <FlexItem padding="0 x-small">
          <Text size="large" margin="small" data-test-id="points-possible-display">
            {I18n.t('%{possiblePoints} Points Possible', {possiblePoints})}
          </Text>
        </FlexItem>
      </Flex>
    </div>
  )
}

function PointsDisplay(props) {
  const {displayAs, receivedGrade, possiblePoints} = props

  switch (displayAs) {
    case 'points':
      return renderPoints(receivedGrade, possiblePoints)
    case 'percent':
      return renderPercent(receivedGrade)
    // NOTE: this is in another ticket where we handle these cases
    case 'pass_fail':
    case 'gpa_scale':
    case 'letter_grade':
      return renderPointsPossible(possiblePoints)
    case 'not_graded':
      return <div />
    default:
      throw new Error(`Invalid displayAs option "${displayAs}"`)
  }
}

// TODO once we add other types here, we can use this to only make possiblePoints
//      required if the displayAs is set to points: https://stackoverflow.com/questions/42299335
//      Would be helpful if the other types are actually passing in different data (A, C+, etc).
PointsDisplay.propTypes = {
  displayAs: PropTypes.string.isRequired,
  receivedGrade: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
  possiblePoints: PropTypes.number.isRequired
}

PointsDisplay.defaultProps = {
  displayAs: 'points'
}

export default React.memo(PointsDisplay)
