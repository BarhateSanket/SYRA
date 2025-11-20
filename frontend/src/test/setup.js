import { expect, afterEach } from 'vitest'
import React, { act } from 'react'
import * as ReactDOMTestUtils from 'react-dom/test-utils'

// Fix for React 19: act is not on React object, set it manually
React.act = act

// Fix for React 19: act is no longer in react-dom/test-utils
if (!ReactDOMTestUtils.act) {
  ReactDOMTestUtils.act = act
}

import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers)

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
