import '@testing-library/jest-dom';

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
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: props => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

jest.mock('@mui/material', () => ({
  TextField: ({ children, ...props }) => <input {...props}>{children}</input>,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  InputAdornment: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

jest.mock('@mui/icons-material', () => ({
  Visibility: () => <span>Visibility</span>,
  VisibilityOff: () => <span>VisibilityOff</span>,
  Add: () => <span>Add</span>,
  PlayArrow: () => <span>PlayArrow</span>,
  Quiz: () => <span>Quiz</span>,
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => {
      const translations = {
        'navigation.home': 'Accueil',
        'navigation.mySpace': 'Mon espace',
        'navigation.contact': 'Contact',
        'navigation.login': 'Se connecter',
        'navigation.logout': 'Se déconnecter',
        'navigation.myClasses': 'Mes classes',
        'navigation.myClass': 'Ma classe',
        'common.toggleMenu': 'Basculer le menu',
        'game.ranking.title': 'Classement',
        'game.ranking.players': 'joueurs',
        'game.ranking.points': 'pts',
        'game.ranking.player': 'joueur',
        'game.ranking.playerCount': '{{count}} joueur',
        'game.ranking.playerCount_plural': '{{count}} joueurs',
        'game.ranking.pointCount': '{{count}} pt',
        'game.ranking.pointCount_plural': '{{count}} pts',
        'card.term': 'Terme :',
        'card.definition': 'Définition :',
        'game.question.participantsAnswering': 'Les participants répondent à cette question...',
        'game.player.submit': 'Valider',
        'game.player.submitted': 'Réponse envoyée',
        'game.player.responsePlaceholder': 'Votre réponse...',
        'game.player.username': 'Pseudo',
        'game.player.usernamePlaceholder': 'Entrez votre pseudo',
        'game.player.chooseAvatar': 'Choisissez votre avatar',
        'game.player.join': 'Rejoindre',
        'game.errors.loadAvatarOptions': 'Impossible de charger les options d\'avatar',
        'game.errors.enterUsername': 'Veuillez entrer un pseudo.',
        'game.errors.joinGame': 'Impossible de rejoindre la partie',
        'emptyState.alt': 'État vide',
        'social.google': 'Google',
        'game.answerResults.oneResponse': '1 réponse',
        'game.answerResults.responseCount': '{{count}} réponse',
        'game.answerResults.responseCount_plural': '{{count}} réponses',
        'contact.form.firstName': 'Prénom',
        'contact.form.lastName': 'Nom',
        'contact.form.email': 'Email',
        'contact.form.subject': 'Sujet',
        'contact.form.message': 'Message',
        'contact.form.submit': 'Envoyer',
        'contact.form.requiredFields': 'Tous les champs sont obligatoires',
        'contact.form.firstNamePlaceholder': 'Entrez votre prénom',
        'contact.form.lastNamePlaceholder': 'Entrez votre nom',
        'contact.form.emailPlaceholder': 'Entrez votre email',
        'contact.form.subjectPlaceholder': 'Entrez le sujet de votre message',
        'contact.form.messagePlaceholder': 'Entrez votre message',
        'profile.yourQuizzes': 'Vos quizz',
        'profile.yourCards': 'Vos cartes',
        'profile.myAssignedCards': 'Mes cartes assignées',
        'profile.noQuizzesFound': 'Aucun quiz trouvé',
        'profile.noCardsFound': 'Aucune carte trouvée',
        'profile.noAssignedCards': 'Aucune carte assignée',
        'profile.createFirstQuiz': 'Créez votre premier quiz pour commencer à apprendre !',
        'profile.createFirstCard': 'Créez votre première carte pour commencer à apprendre !',
        'profile.noAssignedCardsDescription': 'Vos professeurs n\'ont pas encore assigné de cartes.',
        'card.overlay': 'Modifier',
        'card.button.primary': 'Modifier',
        'card.button.secondary': 'Lancer',
        'card.cards': '{{ nbCards }} cartes',
        'card.questions': '{{ nbQuestions }} questions',
        'contact.success': 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
        'contact.error': 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.',
        'contact.form.submitButton': 'Envoyer le message',
        'contact.form.sending': 'Envoi en cours...',
        'common.previous': 'Précédent',
        'common.next': 'Suivant',
        'auth.email': 'Email',
        'auth.password': 'Mot de passe',
        'auth.emailPlaceholder': 'Entrez votre email',
        'auth.login': 'Se connecter',
        'game.lobby.startQuiz': 'Démarrer le quizz',
        'game.lobby.joinText': 'Rejoignez le quiz à l\'adresse',
        'game.lobby.participants': 'Participants',
        'game.finished.points': 'points',
        'game.finished.yourRanking': 'Votre classement',
        'game.finished.rankSuffix.2': 'ème',
        'game.player.answeredBy': 'Répondu par :',
        'game.player.responses': 'réponses',
      };
      return translations[key] || key;
    },
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
}));

jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    use: jest.fn(() => ({
      init: jest.fn(),
    })),
    init: jest.fn(),
    t: jest.fn(key => key),
    changeLanguage: jest.fn(),
  },
}));

jest.mock('i18next-browser-languagedetector', () => ({
  __esModule: true,
  default: {
    type: 'languageDetector',
    detect: jest.fn(() => 'fr'),
    init: jest.fn(),
    cacheUserLanguage: jest.fn(),
  },
}));

let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => `mock-uuid-${++uuidCounter}`),
  },
});

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.fetch = jest.fn();

global.URL.createObjectURL = jest.fn(() => 'mocked-url');

if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function (submitter) {
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    this.dispatchEvent(submitEvent);
  };
}

const originalError = console.error;
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
        args[0].includes('An update to I18nProvider inside a test was not wrapped in act') ||
        args[0].includes('An update to PlayerAccess inside a test was not wrapped in act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
