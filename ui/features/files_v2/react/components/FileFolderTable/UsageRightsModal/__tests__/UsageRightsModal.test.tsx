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

import {render, screen, waitFor} from '@testing-library/react'
import doFetchApi from '@canvas/do-fetch-api-effect'
import userEvent from '@testing-library/user-event'
import UsageRightsModal from '../UsageRightsModal'
import {FAKE_FILES, FAKE_FOLDERS, FAKE_FOLDERS_AND_FILES} from '../../../../../fixtures/fakeData'
import {createMockFileManagementContext} from '../../../../__tests__/createMockContext'
import {FileManagementProvider} from '../../../Contexts'

jest.mock('@canvas/do-fetch-api-effect')

const MOCK_LICENSES = [
  {
    id: 'private',
    name: 'Private (Copyrighted)',
    url: 'http://en.wikipedia.org/wiki/Copyright',
  },
  {
    id: 'public_domain',
    name: 'Public Domain',
    url: 'http://en.wikipedia.org/wiki/Public_domain',
  },
  {
    id: 'cc_by',
    name: 'CC Attribution',
    url: 'http://creativecommons.org/licenses/by/4.0',
  },
  {
    id: 'cc_by_sa',
    name: 'CC Attribution Share Alike',
    url: 'http://creativecommons.org/licenses/by-sa/4.0',
  },
  {
    id: 'cc_by_nc',
    name: 'CC Attribution Non-Commercial',
    url: 'http://creativecommons.org/licenses/by-nc/4.0',
  },
  {
    id: 'cc_by_nc_sa',
    name: 'CC Attribution Non-Commercial Share Alike',
    url: 'http://creativecommons.org/licenses/by-nc-sa/4.0',
  },
  {
    id: 'cc_by_nd',
    name: 'CC Attribution No Derivatives',
    url: 'http://creativecommons.org/licenses/by-nd/4.0',
  },
  {
    id: 'cc_by_nc_nd',
    name: 'CC Attribution Non-Commercial No Derivatives',
    url: 'http://creativecommons.org/licenses/by-nc-nd/4.0/',
  },
]

const defaultProps = {
  open: true,
  items: FAKE_FOLDERS_AND_FILES,
  onDismiss: jest.fn(),
}

const renderComponent = (props?: any) =>
  render(
    <FileManagementProvider value={createMockFileManagementContext()}>
      <UsageRightsModal {...defaultProps} {...props} />
    </FileManagementProvider>,
  )

describe('UsageRightsModal', () => {
  beforeEach(() => {
    ;(doFetchApi as jest.Mock).mockResolvedValueOnce({json: MOCK_LICENSES})
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('renders header', async () => {
    renderComponent()
    expect(await screen.findByText('Manage Usage Rights')).toBeInTheDocument()
  })

  describe('renders body', () => {
    describe('with preview', () => {
      it('for a files and folders', async () => {
        renderComponent()
        expect(
          await screen.findByText(`Selected Items (${FAKE_FOLDERS_AND_FILES.length})`),
        ).toBeInTheDocument()
      })

      it('for a file', async () => {
        renderComponent({items: [FAKE_FILES[0]]})
        expect(await screen.findByText(FAKE_FILES[0].display_name)).toBeInTheDocument()
      })

      it('for a folder', async () => {
        renderComponent({items: [FAKE_FOLDERS[0]]})
        expect(await screen.findByText(FAKE_FOLDERS[0].name)).toBeInTheDocument()
      })
    })

    it('with alert', async () => {
      renderComponent()
      expect(
        await screen.findByText('Items selected have different usage rights.'),
      ).toBeInTheDocument()
    })

    describe('with elements', () => {
      it('for justification', async () => {
        renderComponent()
        const selector = await screen.findByTestId('usage-rights-justification-selector')
        expect(selector).toBeInTheDocument()

        await userEvent.click(selector)
        expect(await screen.findByText('Choose usage rights...')).toBeInTheDocument()
        expect(await screen.findByText('I hold the copyright')).toBeInTheDocument()
        expect(await screen.findByText('I have permission to use this file')).toBeInTheDocument()
        expect(await screen.findByText('The material is in the public domain')).toBeInTheDocument()
        expect(
          await screen.findByText(
            'The material is subject to an exception - e.g. fair use, the right to quote, or others under applicable copyright laws',
          ),
        ).toBeInTheDocument()
        expect(await screen.findByText('Creative Commons License')).toBeInTheDocument()
      })

      it('for CC license', async () => {
        const file = {...FAKE_FILES[0], usage_rights: {use_justification: 'creative_commons'}}
        renderComponent({items: [file]})
        const selector = await screen.findByTestId('usage-rights-license-selector')
        expect(selector).toBeInTheDocument()

        await userEvent.click(selector)
        expect(await screen.findByText('CC Attribution')).toBeInTheDocument()
        expect(await screen.findByText('CC Attribution Share Alike')).toBeInTheDocument()
        expect(await screen.findByText('CC Attribution Non-Commercial')).toBeInTheDocument()
        expect(
          await screen.findByText('CC Attribution Non-Commercial Share Alike'),
        ).toBeInTheDocument()
        expect(await screen.findByText('CC Attribution No Derivatives')).toBeInTheDocument()
        expect(
          await screen.findByText('CC Attribution Non-Commercial No Derivatives'),
        ).toBeInTheDocument()
      })

      it('for holder', async () => {
        renderComponent()
        expect(await screen.findByTestId('usage-rights-holder-input')).toBeInTheDocument()
      })
    })
  })

  it('renders footer', async () => {
    renderComponent()
    expect(await screen.findByTestId('usage-rights-cancel-button')).toBeInTheDocument()
    expect(await screen.findByTestId('usage-rights-save-button')).toBeInTheDocument()
  })

  it('shows an error when there is not a selected folder', async () => {
    renderComponent()
    await userEvent.click(await screen.findByTestId('usage-rights-save-button'))
    expect(await screen.findByText('You must specify a usage right')).toBeInTheDocument()
  })

  it('performs fetch request and shows alert', async () => {
    renderComponent()

    await userEvent.click(await screen.findByTestId('usage-rights-justification-selector'))
    await userEvent.click(await screen.findByText('I hold the copyright'))
    await userEvent.type(await screen.findByTestId('usage-rights-holder-input'), 'acme inc')

    // PUT request response
    ;(doFetchApi as jest.Mock).mockResolvedValueOnce({})
    await userEvent.click(await screen.findByTestId('usage-rights-save-button'))

    await waitFor(() => {
      expect(screen.getAllByText(/usage rights have been set/i)[0]).toBeInTheDocument()
      expect(doFetchApi).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/api/v1/courses/2/usage_rights',
        params: {
          folder_ids: FAKE_FOLDERS.map(f => f.id),
          file_ids: FAKE_FILES.map(f => f.id),
          usage_rights: {legal_copyright: 'acme inc', use_justification: 'own_copyright'},
        },
      })
    })
  })

  it('fails fetch request and shows alert', async () => {
    renderComponent()

    await userEvent.click(await screen.findByTestId('usage-rights-justification-selector'))
    await userEvent.click(await screen.findByText('I hold the copyright'))
    await userEvent.type(await screen.findByTestId('usage-rights-holder-input'), 'acme inc')

    // PUT request response
    ;(doFetchApi as jest.Mock).mockRejectedValue({})
    await userEvent.click(await screen.findByTestId('usage-rights-save-button'))
    await waitFor(() => {
      expect(screen.getAllByText(/there was an error setting usage rights/i)[0]).toBeInTheDocument()

      expect(doFetchApi).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/api/v1/courses/2/usage_rights',
        params: {
          folder_ids: FAKE_FOLDERS.map(f => f.id),
          file_ids: FAKE_FILES.map(f => f.id),
          usage_rights: {legal_copyright: 'acme inc', use_justification: 'own_copyright'},
        },
      })
    })
  })
})
