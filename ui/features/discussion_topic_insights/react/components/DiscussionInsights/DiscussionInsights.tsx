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
import {useScope as createI18nScope} from '@canvas/i18n'
import React, {useState} from 'react'
import {Flex} from '@instructure/ui-flex'
import {Button} from '@instructure/ui-buttons'
import FilterDropDown from '../FilterDropDown/FilterDropDown'
import {Text} from '@instructure/ui-text'
import {Heading} from '@instructure/ui-heading'
import InsightsTable from '../InsightsTable/InsightsTable'
import InsightsSearchBar from '../InsightsSearchBar/InsightsSearchBar'
import {View} from '@instructure/ui-view'
import {Header, Row} from '../InsightsTable/SimpleTable'
import AiIcon from '@canvas/ai-icon'

const I18n = createI18nScope('discussion_insights')

type DiscussionInsightsProps = {
  headers: Header[]
  rows: Row[]
}

const DiscussionInsights: React.FC<DiscussionInsightsProps> = ({headers, rows}) => {
  const [filteredRows, setFilteredRows] = useState(rows)

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredRows(rows)
    } else {
      const results = rows.filter((row: Row) =>
        row.name.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredRows(results)
    }
  }

  return (
    <div>
      <Flex padding="0 0 small 0" direction="column" as="div" width="100%">
        <Flex.Item margin="0">
          <Heading as="h1" level="h1">
            {I18n.t('Discussion Insights')}
          </Heading>
        </Flex.Item>
        <Flex.Item padding="small 0 small 0" direction="column" as="div">
          <Text>
            {I18n.t(
              'Insights are generated by AI and reflect the latest contributions to the discussion. Please note that the output may not always be accurate. Insights are only visible to instructors.',
            )}
          </Text>
        </Flex.Item>
      </Flex>
      <Flex width="100%" direction="row" wrap="wrap" gap="small">
        <Flex.Item shouldGrow shouldShrink align-item="center">
          <InsightsSearchBar onSearch={handleSearch} />
        </Flex.Item>
        <Flex.Item shouldShrink shouldGrow={false} width="fit-content" align-item="top">
          <FilterDropDown
            onFilterClick={() => {
              console.log('Filter clicked')
            }}
          />
        </Flex.Item>
        <Flex.Item>
          <Button
            display="inline-block"
            color="primary"
            renderIcon={<AiIcon />}
            onClick={() => {
              console.log('Generate insights clicked')
            }}
            data-testid="discussion-insights-generate-button"
          >
            <Text>{I18n.t('Generate Insights')}</Text>
          </Button>
        </Flex.Item>
      </Flex>
      {filteredRows.length > 0 && (
        <View as="div" padding="medium 0">
          <Text color="secondary">
            {filteredRows.length} {I18n.t('Results')}
          </Text>
        </View>
      )}
      <InsightsTable
        caption="Discussion Insights"
        headers={headers}
        rows={filteredRows}
        perPage={2}
      />
    </div>
  )
}

export default DiscussionInsights
