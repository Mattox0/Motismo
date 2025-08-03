import '@testing-library/jest-dom'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

// Mock Material-UI components to avoid prop warnings
jest.mock('@mui/material', () => ({
  TextField: ({ children, ...props }) => <input {...props}>{children}</input>,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  InputAdornment: ({ children, ...props }) => <span {...props}>{children}</span>,
}))

jest.mock('@mui/icons-material', () => ({
  Visibility: () => <span>Visibility</span>,
  VisibilityOff: () => <span>VisibilityOff</span>,
  Add: () => <span>Add</span>,
  PlayArrow: () => <span>PlayArrow</span>,
  Quiz: () => <span>Quiz</span>,
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'fr',
    },
  }),
  Trans: ({ children }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}))

jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    use: jest.fn(() => ({
      init: jest.fn(),
    })),
    init: jest.fn(),
    t: jest.fn((key) => key),
    changeLanguage: jest.fn(),
  },
}))

jest.mock('i18next-browser-languagedetector', () => ({
  __esModule: true,
  default: {
    type: 'languageDetector',
    detect: jest.fn(() => 'fr'),
    init: jest.fn(),
    cacheUserLanguage: jest.fn(),
  },
}))

let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => `mock-uuid-${++uuidCounter}`),
  },
})

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.fetch = jest.fn()

// Polyfill for requestSubmit which is not implemented in jsdom
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function(submitter) {
    // Simulate form submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    this.dispatchEvent(submitEvent);
  };
}

const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: `fetch` is not available') ||
       args[0].includes('An empty string ("") was passed to the src attribute') ||
               args[0].includes('React does not recognize the `startAdornment` prop') ||
        args[0].includes('React does not recognize the `whileHover` prop') ||
        args[0].includes('React does not recognize the `startIcon` prop') ||
        args[0].includes('React does not recognize the `buttonText` prop') ||
        args[0].includes('React does not recognize the `quizzId` prop') ||
        args[0].includes('An update to I18nProvider inside a test was not wrapped in act'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})