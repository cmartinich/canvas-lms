/*
 * Copyright (C) 2019 - present Instructure, Inc.
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

import React from 'react'
import {render, within} from '@testing-library/react'

import DimensionsInput, {useDimensionsState} from '..'
import DimensionsInputDriver from './DimensionsInputDriver'

const W_AND_H_NAN_ERROR = 'Width and height must be numbers'
const ASPECT_MESSAGE = 'Aspect ratio will be preserved'

describe('RCE > Plugins > Shared > DimensionsInput', () => {
  let $container
  let component
  let dimensions
  let dimensionsState
  let initialState
  let props

  beforeEach(() => {
    $container = document.body.appendChild(document.createElement('div'))
    dimensionsState = null

    initialState = {
      appliedHeight: 300,
      appliedWidth: 150,
      appliedPercentage: 70,
      usePercentageUnits: false,
      naturalHeight: 200,
      naturalWidth: 100,
    }

    props = {
      minWidth: 30,
      minHeight: 60,
      minPercentage: 10,
      hidePercentage: false,
    }
  })

  afterEach(() => {
    component.unmount()
    $container.remove()
  })

  function SpecComponent() {
    const {minHeight, minWidth, minPercentage} = props
    dimensionsState = useDimensionsState(initialState, {minHeight, minWidth, minPercentage})

    return <DimensionsInput dimensionsState={dimensionsState} {...props} />
  }

  function renderComponent() {
    component = render(<SpecComponent />, {container: $container})
    dimensions = new DimensionsInputDriver($container)
  }

  function buildMinDimensionsError() {
    return `Pixels must be at least ${props.minWidth} x ${props.minHeight}px`
  }

  function currentMessageText() {
    const message = component.getByTestId('message')
    return within(message).getAllByText(/.*/)[0]?.textContent
  }

  describe('"Width" field', () => {
    it('is present', () => {
      renderComponent()
      expect(dimensions.width).not.toBeNull()
    })

    it('is not present', () => {
      initialState.usePercentageUnits = true
      renderComponent()
      expect(dimensions.width).toBeNull()
    })

    describe('when a width has been applied to the element', () => {
      it('uses the applied width as the field value', () => {
        renderComponent()
        expect(dimensions.width.value).toEqual(`${initialState.appliedWidth}`)
      })

      it('uses the applied width for the dimensions state width', () => {
        renderComponent()
        expect(dimensionsState.width).toEqual(initialState.appliedWidth)
      })

      describe('when the applied width is less than the minimum width', () => {
        beforeEach(() => {
          initialState.appliedWidth = props.minWidth - 1
          renderComponent()
        })

        it('displays a validation error with the field', () => {
          expect(currentMessageText()).toEqual(buildMinDimensionsError())
        })

        it('sets the dimensions state as invalid', () => {
          expect(dimensionsState.isValid).toEqual(false)
        })
      })
    })

    describe('when no width has been applied to the element', () => {
      beforeEach(() => {
        initialState.appliedWidth = null
        renderComponent()
      })

      it('uses the natural width as the field value', () => {
        expect(dimensions.width.value).toEqual(`${initialState.naturalWidth}`)
      })

      it('uses the applied width for the dimensions state width', () => {
        expect(dimensionsState.width).toEqual(initialState.naturalWidth)
      })
    })

    describe('when the value changes', () => {
      beforeEach(renderComponent)

      it('updates the value in the field', () => {
        dimensions.width.setValue('120')
        expect(dimensions.width.value).toEqual('120')
      })

      it('updates dimensions state width with the parsed number', () => {
        dimensions.width.setValue('120')
        expect(dimensionsState.width).toEqual(120)
      })

      it('proportionally scales the height in the dimensions state', () => {
        dimensions.width.setValue('120')
        expect(dimensionsState.height).toEqual(240)
      })

      it('updates the height field with the scaled height', () => {
        dimensions.width.setValue('120')
        expect(dimensions.height.value).toEqual('240')
      })

      describe('when the value includes whitespace', () => {
        it('preserves the whitespace in the field', () => {
          dimensions.width.setValue('  120  ')
          expect(dimensions.width.value).toEqual('  120  ')
        })

        it('ignores whitespace in the dimensions state width', () => {
          dimensions.width.setValue('  120  ')
          expect(dimensionsState.width).toEqual(120)
        })
      })

      describe('when the value is a decimal number', () => {
        it('preserves the decimal value in the field', () => {
          dimensions.width.setValue('119.51')
          expect(dimensions.width.value).toEqual('119.51')
        })

        it('sets the dimensions state width with the rounded integer', () => {
          dimensions.width.setValue('119.51')
          expect(dimensionsState.width).toEqual(120)
        })
      })

      describe('when the value is cleared', () => {
        beforeEach(() => {
          dimensions.width.setValue('')
        })

        it('sets the dimensions state width to null', () => {
          expect(dimensionsState.width).toBeNull()
        })

        it('clears the height field', () => {
          expect(dimensions.height.value).toEqual('')
        })

        it('sets the dimensions state height to null', () => {
          expect(dimensionsState.height).toBeNull()
        })

        it('sets the dimensions state as invalid', () => {
          expect(dimensionsState.isValid).toEqual(false)
        })
      })

      describe('when the value is not a number', () => {
        it('preserves the invalid value in the field', () => {
          dimensions.width.setValue('twelve')
          expect(dimensions.width.value).toEqual('twelve')
        })

        it('sets the dimensions state width to NaN', () => {
          dimensions.width.setValue('twelve')
          expect(dimensionsState.width).toBeNaN()
        })

        it('clears the height field', () => {
          dimensions.width.setValue('twelve')
          expect(dimensions.height.value).toEqual('')
        })

        it('sets the dimensions state height to NaN', () => {
          dimensions.width.setValue('twelve')
          expect(dimensionsState.height).toBeNaN()
        })
      })

      describe('when the value is not a finite number', () => {
        beforeEach(() => {
          dimensions.width.setValue('Infinity')
        })

        it('preserves the value in the field', () => {
          expect(dimensions.width.value).toEqual('Infinity')
        })

        it('sets the dimensions state width to NaN', () => {
          expect(dimensionsState.width).toBeNaN()
        })

        it('sets the dimensions state as invalid', () => {
          expect(dimensionsState.isValid).toEqual(false)
        })

        it('displays a validation error with the field', () => {
          expect(currentMessageText()).toEqual(W_AND_H_NAN_ERROR)
        })
      })

      describe('when the value is less than the minimum', () => {
        it('displays a validation error with the field', () => {
          dimensions.width.setValue(props.minWidth - 1)
          expect(currentMessageText()).toEqual(buildMinDimensionsError())
        })

        it('sets the dimensions state as invalid', () => {
          dimensions.width.setValue(props.minWidth - 1)
          expect(dimensionsState.isValid).toEqual(false)
        })
      })

      describe('when the value becomes valid', () => {
        beforeEach(() => {
          dimensions.width.setValue(props.minWidth - 1)
          dimensions.width.setValue(props.minWidth)
        })

        it('removes the validation error from the field', () => {
          expect(currentMessageText()).toEqual(ASPECT_MESSAGE)
        })

        it('sets the dimensions state as valid', () => {
          expect(dimensionsState.isValid).toEqual(true)
        })
      })

      describe('when the value remains invalid', () => {
        beforeEach(() => {
          dimensions.width.setValue('')
          dimensions.width.setValue(1)
        })

        it('displays a validation error with the field', () => {
          expect(currentMessageText()).toEqual(buildMinDimensionsError())
        })

        it('sets the dimensions state as invalid', () => {
          expect(dimensionsState.isValid).toEqual(false)
        })
      })
    })

    describe('when decremented', () => {
      describe('when a width has been applied to the element', () => {
        beforeEach(() => {
          renderComponent()
          dimensions.width.decrement()
        })

        it('decrements the applied width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${initialState.appliedWidth - 1}`)
        })

        it('decrements the applied width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(initialState.appliedWidth - 1)
        })
      })

      describe('when no width has been applied to the element', () => {
        beforeEach(() => {
          initialState.appliedWidth = null
          renderComponent()
          dimensions.width.decrement()
        })

        it('decrements the natural width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${initialState.naturalWidth - 1}`)
        })

        it('decrements the natural width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(initialState.naturalWidth - 1)
        })
      })

      describe('when the applied width is less than the minimum width', () => {
        beforeEach(() => {
          initialState.appliedWidth = props.minWidth - 1
          renderComponent()
          dimensions.width.decrement()
        })

        it('uses the minimum width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${props.minWidth}`)
        })

        it('uses the minimum width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(props.minWidth)
        })

        it('removes the validation error from the field', () => {
          expect(currentMessageText()).toEqual(ASPECT_MESSAGE)
        })

        it('sets the dimensions state as valid', () => {
          expect(dimensionsState.isValid).toEqual(true)
        })
      })

      it('proportionally scales the height in the dimensions state', () => {
        renderComponent()
        dimensions.width.decrement()
        expect(dimensionsState.height).toEqual(initialState.appliedHeight - 2)
      })

      it('updates the height field with the scaled height', () => {
        renderComponent()
        dimensions.width.decrement()
        expect(dimensions.height.value).toEqual(`${initialState.appliedHeight - 2}`)
      })

      describe('when the value had been cleared', () => {
        beforeEach(() => {
          renderComponent()
          dimensions.width.setValue('')
          dimensions.width.decrement()
        })

        it('decrements the initial width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${initialState.appliedWidth - 1}`)
        })

        it('decrements the initial width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(initialState.appliedWidth - 1)
        })

        it('removes the validation error from the field', () => {
          expect(currentMessageText()).toEqual(ASPECT_MESSAGE)
        })

        it('sets the dimensions state as valid', () => {
          expect(dimensionsState.isValid).toEqual(true)
        })
      })

      describe('when the value is the minimum width', () => {
        beforeEach(() => {
          renderComponent()
          dimensions.width.setValue(props.minWidth)
          dimensions.width.decrement()
        })

        it('preserves the value in the field', () => {
          expect(dimensions.width.value).toEqual(`${props.minWidth}`)
        })

        it('sets the dimensions state width to the minimum width', () => {
          expect(dimensionsState.width).toEqual(props.minWidth)
        })
      })

      describe('when the height is the minimum height', () => {
        beforeEach(() => {
          props.minHeight = 120
          props.minWidth = 10

          renderComponent()
          dimensions.height.setValue(props.minHeight)
          dimensions.width.decrement()
        })

        it('preserves the value in the height field', () => {
          expect(dimensions.height.value).toEqual(`${props.minHeight}`)
        })

        it('preserves the aspect ratio for the width field', () => {
          expect(dimensions.width.value).toEqual(`${props.minHeight / 2}`)
        })

        it('sets the dimensions state height to the minimum height', () => {
          expect(dimensionsState.height).toEqual(props.minHeight)
        })

        it('preserves the aspect ratio for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(props.minHeight / 2)
        })
      })

      describe('when the value is not a number', () => {
        beforeEach(() => {
          renderComponent()
          dimensions.height.setValue('twelve')
          dimensions.height.decrement()
        })

        it('preserves the invalid value in the field', () => {
          expect(dimensions.height.value).toEqual('twelve')
        })

        it('sets the dimensions state height to NaN', () => {
          expect(dimensionsState.height).toBeNaN()
        })
      })
    })

    describe('when incremented', () => {
      describe('when a width has been applied to the element', () => {
        beforeEach(() => {
          renderComponent()
          dimensions.width.increment()
        })

        it('increments the applied width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${initialState.appliedWidth + 1}`)
        })

        it('increments the applied width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(initialState.appliedWidth + 1)
        })
      })

      describe('when no width has been applied to the element', () => {
        beforeEach(() => {
          initialState.appliedWidth = null
          renderComponent()
          dimensions.width.increment()
        })

        it('increments the natural width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${initialState.naturalWidth + 1}`)
        })

        it('increments the natural width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(initialState.naturalWidth + 1)
        })
      })

      describe('when the applied width is less than the minimum width', () => {
        beforeEach(() => {
          initialState.appliedWidth = props.minWidth - 2
          renderComponent()
          dimensions.width.increment()
        })

        it('uses the minimum width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${props.minWidth}`)
        })

        it('uses the minimum width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(props.minWidth)
        })

        it('removes the validation error from the field', () => {
          expect(currentMessageText()).toEqual(ASPECT_MESSAGE)
        })

        it('sets the dimensions state as valid', () => {
          expect(dimensionsState.isValid).toEqual(true)
        })
      })

      it('proportionally scales the height in the dimensions state', () => {
        renderComponent()
        dimensions.width.increment()
        // height is twice the width and scales at twice the rate
        expect(dimensionsState.height).toEqual(initialState.appliedHeight + 2)
      })

      it('updates the height field with the scaled height', () => {
        renderComponent()
        dimensions.width.increment()
        // height is twice the width and scales at twice the rate
        expect(dimensions.height.value).toEqual(`${initialState.appliedHeight + 2}`)
      })

      describe('when the value had been cleared', () => {
        beforeEach(() => {
          renderComponent()
          dimensions.width.setValue('')
          dimensions.width.increment()
        })

        it('increments the initial width for the field value', () => {
          expect(dimensions.width.value).toEqual(`${initialState.appliedWidth + 1}`)
        })

        it('increments the initial width for the dimensions state width', () => {
          expect(dimensionsState.width).toEqual(initialState.appliedWidth + 1)
        })

        it('removes the validation error from the field', () => {
          expect(currentMessageText()).toEqual(ASPECT_MESSAGE)
        })

        it('sets the dimensions state as valid', () => {
          expect(dimensionsState.isValid).toEqual(true)
        })
      })

      describe('when the value is not a number', () => {
        beforeEach(() => {
          renderComponent()
          dimensions.width.setValue('twelve')
          dimensions.width.increment()
        })

        it('preserves the invalid value in the field', () => {
          expect(dimensions.width.value).toEqual('twelve')
        })

        it('sets the dimensions state width to NaN', () => {
          expect(dimensionsState.width).toBeNaN()
        })
      })
    })
  })
})
