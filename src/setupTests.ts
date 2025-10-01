import '@testing-library/jest-dom'
import { randomUUID } from 'crypto'

// Polyfill for crypto.randomUUID in Jest
if (typeof global.crypto === 'undefined') {
  global.crypto = {} as Crypto
}

if (typeof global.crypto.randomUUID === 'undefined') {
  global.crypto.randomUUID = randomUUID
}
