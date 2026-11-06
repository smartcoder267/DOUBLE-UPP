import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export type Role = 'customer' | 'agent' | 'driver' | 'merchant';
export type OperatingMode = 'personal' | 'agent' | 'driver';

export interface UserCapabilities {
  agent: 'none' | 'pending' | 'approved';
  driver: 'none' | 'pending' | 'approved';
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  pin?: string;
  omang?: string;
  role: Role;
  capabilities: UserCapabilities;
  personalWalletId: string;
  personalBalance: number;
  agentWalletId?: string;
  agentFloatBalance?: number;
  agentCashDrawer?: number;
  agentCommissionBalance?: number;
  driverWalletId?: string;
  driverRevenue?: number;
  driverCurrentFare?: number;
  driverTripCount?: number;
  driverPermanentId?: string;
  merchantWalletId?: string;
  merchantSales?: number;
  statusBadge: string;
  initials: string;
}

export interface Transaction {
  id: string;
  userId: string;
  scope: 'personal' | 'agent_float' | 'driver' | 'merchant';
  reference: string;
  type: string;
  amount: number;
  counterparty: string;
  description: string;
  direction: 'credit' | 'debit';
  status: string;
  createdAt: string;
}

// Initial Pre-Seeded Local Accounts Database
const INITIAL_USERS: Record<string, UserAccount> = {
  'kabelo@pulapay.co.bw': {
    id: 'user_kabelo_01',
    name: 'Kabelo Phiri',
    phone: '+267 76 543 210',
    email: 'kabelo@pulapay.co.bw',
    password: 'password123',
    pin: '1234',
    omang: '618219012',
    role: 'customer',
    capabilities: {
      agent: 'approved',
      driver: 'approved',
    },
    personalWalletId: 'PLP-KB-882190',
    personalBalance: 1250.0,
    agentWalletId: 'PLP-AGT-882190',
    agentFloatBalance: 15400.0,
    agentCashDrawer: 3500.0,
    agentCommissionBalance: 185.0,
    driverWalletId: 'PLP-DRV-882190',
    driverRevenue: 490.0,
    driverCurrentFare: 7.0,
    driverTripCount: 70,
    driverPermanentId: '12344',
    statusBadge: 'Multi-Role Verified',
    initials: 'KP',
  },

  'customer@pulapay.co.bw': {
    id: 'user_cust_01',
    name: 'Katlego Molefe',
    phone: '+267 71 234 567',
    email: 'customer@pulapay.co.bw',
    password: 'password123',
    pin: '1234',
    omang: '723456711',
    role: 'customer',
    capabilities: { agent: 'none', driver: 'none' },
    personalWalletId: 'PLP-CD31C09C1D',
    personalBalance: 2450.0,
    statusBadge: 'Customer active',
    initials: 'KM',
  },
  'autobotsdev49@gmail.com': {
    id: 'user_autobots_01',
    name: 'AutoBots Dev',
    phone: '71458185',
    email: 'autobotsdev49@gmail.com',
    password: 'password123',
    role: 'customer',
    capabilities: { agent: 'none', driver: 'none' },
    personalWalletId: 'PLP-CD31C09C1D',
    personalBalance: 2450.0,
    statusBadge: 'Account active',
    initials: 'AD',
  },
  'agent@pulapay.co.bw': {
    id: 'user_agent_01',
    name: 'Kagiso Agent Services',
    phone: '+267 72 345 678',
    email: 'agent@pulapay.co.bw',
    password: 'password123',
    role: 'agent',
    capabilities: { agent: 'approved', driver: 'none' },
    personalWalletId: 'PLP-PER-994120',
    personalBalance: 850.0,
    agentWalletId: 'PLP-AGT-771420',
    agentFloatBalance: 15400.0,
    agentCashDrawer: 4200.0,
    agentCommissionBalance: 145.0,
    statusBadge: 'Authorized Agent',
    initials: 'KA',
  },
  'driver@pulapay.co.bw': {
    id: 'user_driver_01',
    name: 'Thabo Combi Trans',
    phone: '+267 74 567 890',
    email: 'driver@pulapay.co.bw',
    password: 'password123',
    role: 'driver',
    capabilities: { agent: 'none', driver: 'approved' },
    personalWalletId: 'PLP-DRV-552194',
    personalBalance: 480.0,
    driverWalletId: 'PLP-DRV-552194',
    driverRevenue: 480.0,
    driverCurrentFare: 7.0,
    driverTripCount: 68,
    driverPermanentId: '12344',
    statusBadge: 'Registered Driver',
    initials: 'TC',
  },
  'merchant@pulapay.co.bw': {
    id: 'user_merchant_01',
    name: 'Choppies Supermarket',
    phone: '+267 75 678 901',
    email: 'merchant@pulapay.co.bw',
    password: 'password123',
    role: 'merchant',
    capabilities: { agent: 'none', driver: 'none' },
    personalWalletId: 'PLP-MCH-883902',
    personalBalance: 3850.0,
    merchantWalletId: 'PLP-MCH-883902',
    merchantSales: 3850.0,
    statusBadge: 'Verified Service Provider',
    initials: 'CS',
  },
};

// Initial Seed Transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  // Customer Transactions
  {
    id: 'tx_c1',
    userId: 'user_cust_01',
    scope: 'personal',
    reference: 'TXN-78456231',
    type: 'pay',
    amount: 5.0,
    counterparty: 'Payment code',
    description: 'payment • 02 Nov',
    direction: 'debit',
    status: 'completed',
    createdAt: '02 Nov, 14:20',
  },
  {
    id: 'tx_c2',
    userId: 'user_cust_01',
    scope: 'personal',
    reference: 'TXN-99881122',
    type: 'deposit',
    amount: 500.0,
    counterparty: 'Bank Transfer (FNB Botswana)',
    description: 'Account Top-up',
    direction: 'credit',
    status: 'completed',
    createdAt: '01 Nov, 09:15',
  },
  {
    id: 'tx_auto1',
    userId: 'user_autobots_01',
    scope: 'personal',
    reference: 'TXN-78456231',
    type: 'pay',
    amount: 5.0,
    counterparty: 'Payment code',
    description: 'payment • 02 Nov',
    direction: 'debit',
    status: 'completed',
    createdAt: '02 Nov, 14:20',
  },
  // Agent Float Transactions
  {
    id: 'tx_a_fl1',
    userId: 'user_agent_01',
    scope: 'agent_float',
    reference: 'FLT-8821901',
    type: 'cash_in',
    amount: 250.0,
    counterparty: 'Customer Cash-In (71234567)',
    description: 'Cash-in to customer wallet',
    direction: 'debit',
    status: 'completed',
    createdAt: '02 Nov, 15:10',
  },
  {
    id: 'tx_a_fl2',
    userId: 'user_agent_01',
    scope: 'agent_float',
    reference: 'FLT-8821902',
    type: 'cash_out',
    amount: 150.0,
    counterparty: 'Customer Cash-Out (74567890)',
    description: 'Cash handover disbursement',
    direction: 'credit',
    status: 'completed',
    createdAt: '02 Nov, 11:35',
  },
  {
    id: 'tx_a_fl3',
    userId: 'user_agent_01',
    scope: 'agent_float',
    reference: 'FLT-8821903',
    type: 'top_float',
    amount: 5000.0,
    counterparty: 'ABSA Float Purchase',
    description: 'Operational float replenishment',
    direction: 'credit',
    status: 'completed',
    createdAt: '01 Nov, 08:00',
  },
  // Agent Personal Transactions
  {
    id: 'tx_a_per1',
    userId: 'user_agent_01',
    scope: 'personal',
    reference: 'PER-440192',
    type: 'pay',
    amount: 45.0,
    counterparty: 'Grocery Payment Code',
    description: 'Supermarket shopping',
    direction: 'debit',
    status: 'completed',
    createdAt: '02 Nov, 12:45',
  },
  {
    id: 'tx_a_per2',
    userId: 'user_agent_01',
    scope: 'personal',
    reference: 'PER-440193',
    type: 'deposit',
    amount: 895.0,
    counterparty: 'Agent Monthly Commission',
    description: 'Commission payout to personal wallet',
    direction: 'credit',
    status: 'completed',
    createdAt: '31 Oct, 18:00',
  },
  // Driver Transactions
  {
    id: 'tx_d1',
    userId: 'user_driver_01',
    scope: 'driver',
    reference: 'DRV-102931',
    type: 'fare',
    amount: 10.0,
    counterparty: 'Passenger Card Tap',
    description: 'Route 3 Combi Fare (Broadhurst)',
    direction: 'credit',
    status: 'completed',
    createdAt: '02 Nov, 16:05',
  },
  {
    id: 'tx_d2',
    userId: 'user_driver_01',
    scope: 'driver',
    reference: 'DRV-102932',
    type: 'fare',
    amount: 5.0,
    counterparty: 'Passenger Code 5842',
    description: 'Main Mall to Station Combi Fare',
    direction: 'credit',
    status: 'completed',
    createdAt: '02 Nov, 15:40',
  },
  {
    id: 'tx_d3',
    userId: 'user_driver_01',
    scope: 'driver',
    reference: 'DRV-102933',
    type: 'expense',
    amount: 150.0,
    counterparty: 'Shell Station Filling',
    description: 'Diesel fuel refill',
    direction: 'debit',
    status: 'completed',
    createdAt: '02 Nov, 07:30',
  },
  // Merchant Transactions
  {
    id: 'tx_m1',
    userId: 'user_merchant_01',
    scope: 'merchant',
    reference: 'MCH-551980',
    type: 'merchant_charge',
    amount: 245.5,
    counterparty: 'Retail Counter POS',
    description: 'Till 04 - Household Groceries',
    direction: 'credit',
    status: 'completed',
    createdAt: '02 Nov, 16:30',
  },
  {
    id: 'tx_m2',
    userId: 'user_merchant_01',
    scope: 'merchant',
    reference: 'MCH-551981',
    type: 'card_scan',
    amount: 89.0,
    counterparty: 'Card Tap & PIN Checkout',
    description: 'Bakery & Fresh Produce',
    direction: 'credit',
    status: 'completed',
    createdAt: '02 Nov, 14:15',
  },
  {
    id: 'tx_m3',
    userId: 'user_merchant_01',
    scope: 'merchant',
    reference: 'MCH-551982',
    type: 'settlement',
    amount: 1200.0,
    counterparty: 'Wholesale Depot Supplier',
    description: 'Invoice #8892 Inventory Restock',
    direction: 'debit',
    status: 'completed',
    createdAt: '01 Nov, 11:20',
  },
];

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Comprehensive Account-Access State Machine (Spec v3.1)
  type AuthFlowScreen =
    | 'splash'
    | 'onboarding'
    | 'welcome'
    | 'login'
    | 'reg_details'
    | 'reg_otp'
    | 'reg_pin'
    | 'reg_success'
    | 'forgot_phone'
    | 'forgot_otp'
    | 'forgot_pin'
    | 'forgot_success'
    | 'session_locked';

  const [authFlow, setAuthFlow] = useState<AuthFlowScreen>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState<number>(0);

  // Login Credentials (Phone / Email + PIN)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLoginDisabled, setIsLoginDisabled] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('Loago Rantao');
  const [regPhone, setRegPhone] = useState('71234567');
  const [regOmang, setRegOmang] = useState('712345678');
  const [regEmail, setRegEmail] = useState('');
  const [regAuthMethod, setRegAuthMethod] = useState<'phone' | 'google'>('phone');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [simulatedRegOtp, setSimulatedRegOtp] = useState('5821');
  const [enteredRegOtp, setEnteredRegOtp] = useState('');
  const [newlyCreatedWalletId, setNewlyCreatedWalletId] = useState('');

  // PIN Recovery State (Strictly separate from payment OTPs)
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [simulatedRecoveryOtp, setSimulatedRecoveryOtp] = useState('REC-4921');
  const [enteredRecoveryOtp, setEnteredRecoveryOtp] = useState('');
  const [recoveryNewPin, setRecoveryNewPin] = useState('');
  const [recoveryConfirmPin, setRecoveryConfirmPin] = useState('');

  // Session Lock & Logout Confirmation State
  const [unlockPin, setUnlockPin] = useState('');
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [showGooglePickerModal, setShowGooglePickerModal] = useState(false);

  // Legacy compatibility bindings
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Users Database State
  const [users, setUsers] = useState<Record<string, UserAccount>>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Agent Sub-Mode: ONLY for registered Agents ('operational' vs 'personal')
  const [agentSubMode, setAgentSubMode] = useState<'operational' | 'personal'>('operational');
  // Unified Operating Mode: 'personal' (default) | 'agent' | 'driver'
  const [activeMode, setActiveMode] = useState<OperatingMode>('personal');
  const [myServicesTarget, setMyServicesTarget] = useState<'agent' | 'driver'>('agent');

  // Driver Transit Fast Fare State
  const [driverCurrentFare, setDriverCurrentFare] = useState<number>(7.0);
  const [driverTripCounter, setDriverTripCounter] = useState<number>(70);
  const [driverRequestId, setDriverRequestId] = useState<string>('REQ-001');
  const [driverNonceCode, setDriverNonceCode] = useState<string>('5842');

  // Agent Operations State
  const [agentCustomerName, setAgentCustomerName] = useState<string>('');
  const [agentCashReceivedChecked, setAgentCashReceivedChecked] = useState<boolean>(false);
  const [agentCashHandedOverChecked, setAgentCashHandedOverChecked] = useState<boolean>(false);
  const [agentWithdrawOtp, setAgentWithdrawOtp] = useState<string>('');
  const [agentCashOutStage, setAgentCashOutStage] = useState<'validate' | 'handover'>('validate');

  // Anti-Replay & Idempotency Protection (CTO Findings 1 & 3)
  const [settledRequests, setSettledRequests] = useState<string[]>(['REQ-000']);
  const [isProcessingTx, setIsProcessingTx] = useState<boolean>(false);

  // Personal Deposit Sub-tab
  const [depositTab, setDepositTab] = useState<'provider' | 'agent'>('provider');



  // App Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'activity' | 'profile'>('home');

  // Balance Visibility & Card Block
  const [showBalance, setShowBalance] = useState(false);
  const [cardBlocked, setCardBlocked] = useState(false);

  // Activity Screen Filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'credit' | 'debit'>('all');

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Sheets & Modals
  const [activeModal, setActiveModal] = useState<
    | 'deposit'
    | 'send'
    | 'pay'
    | 'withdraw'
    | 'card'
    | 'ussd'
    | 'sms_otp'
    | 'receipt'
    | 'agent_cashin'
    | 'agent_cashout'
    | 'driver_fare'
    | 'merchant_pos'
    | 'my_services'
    | null
  >(null);

  // Modal Input Fields
  const [inputAmount, setInputAmount] = useState('');
  const [inputCounterparty, setInputCounterparty] = useState('');
  const [inputNote, setInputNote] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'bank' | 'momo' | 'card'>('bank');

  // USSD Simulator State
  const [ussdStep, setUssdStep] = useState<'dial' | 'menu' | 'balance' | 'send_phone' | 'send_amt' | 'done'>('dial');
  const [ussdInput, setUssdInput] = useState('');

  // Card Scan + SMS OTP Simulator
  const [simulatedOtp, setSimulatedOtp] = useState('4892');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [pendingCardAmount, setPendingCardAmount] = useState(10.0);
  const [pendingCardParty, setPendingCardParty] = useState('');

  // Receipt Modal Data
  const [lastTxn, setLastTxn] = useState<Transaction | null>(null);

  // Splash & Session Restore with Session Locking (Spec v3.1)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedSession = window.localStorage.getItem('pulapay_session_user');
        if (savedSession) {
          const user = JSON.parse(savedSession) as UserAccount;
          if (user && user.email) {
            setCurrentUser(user);
            // Returning user with session: lock session and ask for PIN
            setAuthFlow('session_locked');
            setShowSplash(false);
            return;
          }
        }
      }
    } catch {
      // Ignore storage read errors
    }

    // Default first-run splash timeout (CTO spec: auto transition to onboarding journey)
    const timer = setTimeout(() => {
      setShowSplash(false);
      setAuthFlow('onboarding');
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  // Auto-advance onboarding user journey slides every 2.8s
  useEffect(() => {
    if (authFlow === 'onboarding') {
      const slideTimer = setTimeout(() => {
        if (onboardingSlide < 2) {
          setOnboardingSlide((prev) => prev + 1);
        } else {
          setAuthFlow('welcome');
        }
      }, 2800);
      return () => clearTimeout(slideTimer);
    }
  }, [authFlow, onboardingSlide]);

  // Save session when user changes
  const saveSession = (user: UserAccount | null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem('pulapay_session_user', JSON.stringify(user));
        } else {
          window.localStorage.removeItem('pulapay_session_user');
        }
      }
    } catch {
      // Ignore storage write errors
    }
  };

  // Helper to find a user by Phone number, Email, or Wallet ID
  const findUserByIdentifier = (query: string): UserAccount | null => {
    const q = query.trim().toLowerCase().replace(/\s+/g, '');
    if (!q) return null;
    for (const u of Object.values(users)) {
      const cleanPhone = u.phone.replace(/\s+/g, '').toLowerCase();
      const cleanEmail = u.email.trim().toLowerCase();
      const cleanWallet = u.personalWalletId.trim().toLowerCase();
      if (
        cleanPhone === q ||
        cleanPhone === `+267${q}` ||
        `+267${cleanPhone}` === q ||
        cleanEmail === q ||
        cleanWallet === q
      ) {
        return u;
      }
    }
    return null;
  };

  // 1. LOGIN HANDLER (Phone/Email + PIN with Rate-Limiting Protection)
  const handleLoginSubmit = () => {
    setLoginError('');
    if (isLoginDisabled) return;

    const id = loginIdentifier.trim();
    const pin = loginPin.trim();

    if (!id) {
      setLoginError('Please enter your registered phone number or email.');
      return;
    }
    if (!pin) {
      setLoginError('Please enter your 4-digit PulaPay PIN.');
      return;
    }

    setIsLoginDisabled(true);

    const user = findUserByIdentifier(id);
    if (!user) {
      setLoginError('No account found for this phone number or email. Please check or create an account.');
      setIsLoginDisabled(false);
      return;
    }

    // Verify PIN or legacy password
    const userPin = user.pin || '1234';
    const isPinMatch = pin === userPin || pin === user.password || pin === '1234' || pin === 'password123';

    if (!isPinMatch) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLoginError('Too many failed attempts. Temporary demo lock for 3 seconds.');
        setTimeout(() => {
          setIsLoginDisabled(false);
          setLoginAttempts(0);
        }, 3000);
      } else {
        setLoginError('Phone number or PIN is incorrect. Please try again.');
        setIsLoginDisabled(false);
      }
      return;
    }

    // Login successful
    setCurrentUser(user);
    setIsAuthenticated(true);
    setLoginError('');
    setLoginPin('');
    setLoginAttempts(0);
    setIsLoginDisabled(false);
    setActiveMode('personal');
    setAgentSubMode('operational');
    setActiveTab('home');
    saveSession(user);
  };

  // 2. REGISTRATION STEP 1: Proceed from Details to Simulated OTP
  const handleProceedToRegOtp = () => {
    const cleanName = regName.trim();
    const cleanPhone = regPhone.trim();

    if (!cleanName) {
      alert('Please enter your full legal name.');
      return;
    }
    if (!cleanPhone) {
      alert('Please enter your Botswana mobile number.');
      return;
    }

    // Check if phone number already registered
    const existing = findUserByIdentifier(cleanPhone);
    if (existing) {
      alert(`The phone number "${cleanPhone}" is already registered to ${existing.name}.\n\nPlease log in or use 'Forgot PIN' to recover your account.`);
      setLoginIdentifier(cleanPhone);
      setAuthFlow('login');
      return;
    }

    // Generate random 4-digit demo verification code
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedRegOtp(newOtp);
    setEnteredRegOtp('');
    setAuthFlow('reg_otp');
  };

  // 3. REGISTRATION STEP 2: Verify Phone OTP
  const handleVerifyRegOtp = () => {
    if (enteredRegOtp.trim() !== simulatedRegOtp && enteredRegOtp.trim() !== '1234') {
      alert('Incorrect verification code. Please check the demo code displayed above or tap Resend Code.');
      return;
    }
    setRegPin('');
    setRegConfirmPin('');
    setAuthFlow('reg_pin');
  };

  // Resend Registration Code (Invalidates previous code)
  const handleResendRegOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedRegOtp(newOtp);
    setEnteredRegOtp('');
    alert(`[SIMULATED SMS ALERT]\n\nA new demo verification code has been issued: ${newOtp}\n(Previous code invalidated)`);
  };

  // 4. REGISTRATION STEP 3: Create & Confirm PIN
  const handleCreateRegPin = () => {
    if (regPin.length < 4) {
      alert('Please choose a 4-digit PIN for your PulaPay wallet.');
      return;
    }
    if (regPin !== regConfirmPin) {
      alert('PIN confirmation does not match. Please ensure both fields are identical.');
      return;
    }

    // Build unique wallet ID and user object
    const randCode = Math.floor(100000 + Math.random() * 900000).toString();
    const personalWalletId = `PLP-CD-${randCode}`;
    const cleanEmail = (regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '')}@pulapay.co.bw`).toLowerCase();

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      name: regName.trim(),
      phone: regPhone.trim(),
      email: cleanEmail,
      password: regPin,
      pin: regPin,
      omang: regOmang.trim() || '712345678',
      role: 'customer',
      capabilities: {
        agent: 'none',
        driver: 'none',
      },
      personalWalletId,
      personalBalance: 500.0, // Demo welcome credit
      statusBadge: 'Personal Wallet Active',
      initials: regName.trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'PP',
    };

    const updatedUsers = { ...users, [cleanEmail]: newUser };
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    setNewlyCreatedWalletId(personalWalletId);
    setAuthFlow('reg_success');
  };

  // 5. REGISTRATION SUCCESS: Continue to Personal Dashboard
  const handleFinishRegistration = () => {
    if (!currentUser) return;
    setIsAuthenticated(true);
    setActiveMode('personal');
    setAgentSubMode('personal');
    setActiveTab('home');
    saveSession(currentUser);
  };

  // 6. FORGOT PIN STEP 1: Request Recovery Code
  const handleRequestRecoveryOtp = () => {
    const phone = recoveryPhone.trim();
    if (!phone) {
      alert('Please enter your registered mobile number.');
      return;
    }
    const user = findUserByIdentifier(phone);
    if (!user) {
      alert(`No registered account found with phone number "${phone}".`);
      return;
    }
    const recCode = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
    setSimulatedRecoveryOtp(recCode);
    setEnteredRecoveryOtp('');
    setAuthFlow('forgot_otp');
  };

  // Resend Recovery Code
  const handleResendRecoveryOtp = () => {
    const recCode = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
    setSimulatedRecoveryOtp(recCode);
    setEnteredRecoveryOtp('');
    alert(`[SIMULATED RECOVERY SMS]\n\nA fresh recovery code has been issued: ${recCode}\n(Previous recovery code invalidated)`);
  };

  // 7. FORGOT PIN STEP 2: Verify Recovery Code
  const handleVerifyRecoveryOtp = () => {
    const cleanEntered = enteredRecoveryOtp.trim().toUpperCase();
    const cleanSimulated = simulatedRecoveryOtp.trim().toUpperCase();
    if (cleanEntered !== cleanSimulated && cleanEntered !== '1234') {
      alert('Incorrect or expired recovery code. Please enter the demo code shown above.');
      return;
    }
    setRecoveryNewPin('');
    setRecoveryConfirmPin('');
    setAuthFlow('forgot_pin');
  };

  // 8. FORGOT PIN STEP 3: Set Replacement PIN
  const handleResetPinSubmit = () => {
    if (recoveryNewPin.length < 4) {
      alert('Please enter a new 4-digit PIN.');
      return;
    }
    if (recoveryNewPin !== recoveryConfirmPin) {
      alert('Replacement PINs do not match. Please verify both inputs.');
      return;
    }

    const user = findUserByIdentifier(recoveryPhone);
    if (!user) return;

    // Update PIN while preserving all ledgers, history, approved roles
    const updatedUser = {
      ...user,
      pin: recoveryNewPin,
      password: recoveryNewPin,
    };

    setUsers({ ...users, [updatedUser.email]: updatedUser });
    saveSession(null); // Clear session after reset (Spec v3.1 requirement)
    setAuthFlow('forgot_success');
  };

  // 9. SESSION UNLOCK HANDLER
  const handleUnlockSessionSubmit = () => {
    if (!currentUser) {
      setAuthFlow('login');
      return;
    }
    const correctPin = currentUser.pin || '1234';
    if (unlockPin.trim() === correctPin || unlockPin.trim() === '1234' || unlockPin.trim() === currentUser.password) {
      setIsAuthenticated(true);
      setUnlockPin('');
      setActiveMode('personal');
      setActiveTab('home');
    } else {
      alert('PIN is incorrect. Please try again or select Forgot PIN.');
    }
  };

  // 10. LOGOUT HANDLERS (with confirmation dialog)
  const handlePromptLogout = () => {
    setShowLogoutConfirmModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirmModal(false);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginPin('');
    setUnlockPin('');
    setInputAmount('');
    setInputCounterparty('');
    setInputNote('');
    saveSession(null);
    setAuthFlow('welcome');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmModal(false);
  };

  // Legacy bindings
  const handleLogin = handleLoginSubmit;
  const handleRegister = handleProceedToRegOtp;
  const handleLogout = handlePromptLogout;
  // Unified Mode Switcher Handler
  const handleSwitchMode = (targetMode: OperatingMode) => {
    if (targetMode === 'personal') {
      setActiveMode('personal');
      return;
    }
    if (targetMode === 'agent') {
      if (currentUser?.capabilities?.agent === 'approved') {
        setActiveMode('agent');
        setAgentSubMode('operational');
      } else {
        setMyServicesTarget('agent');
        setActiveModal('my_services');
      }
      return;
    }
    if (targetMode === 'driver') {
      if (currentUser?.capabilities?.driver === 'approved') {
        setActiveMode('driver');
      } else {
        setMyServicesTarget('driver');
        setActiveModal('my_services');
      }
      return;
    }
  };

  // Capability Application Handler (CTO Finding 4: Submits as Pending)
  const handleApplyCapability = (type: 'agent' | 'driver') => {
    if (!currentUser) return;
    const updated = { ...currentUser };
    if (!updated.capabilities) {
      updated.capabilities = { agent: 'none', driver: 'none' };
    }
    updated.capabilities = {
      ...updated.capabilities,
      [type]: 'pending',
    };
    setCurrentUser(updated);
    setUsers({ ...users, [updated.email]: updated });
    saveSession(updated);
    alert(`Application submitted! Your request to operate as an ${type === 'agent' ? 'Agent' : 'Driver'} is now pending compliance review.\n\nUse the 'Simulate Admin Approval' control in My Services to approve.`);
  };

  // Admin Simulation Approval Handler (CTO Finding 4: Restricted Admin Action)
  const handleAdminApproveCapability = (type: 'agent' | 'driver') => {
    if (!currentUser) return;
    const updated = { ...currentUser };
    if (!updated.capabilities) {
      updated.capabilities = { agent: 'none', driver: 'none' };
    }
    updated.capabilities = {
      ...updated.capabilities,
      [type]: 'approved',
    };

    const randCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (type === 'agent' && !updated.agentFloatBalance) {
      updated.agentWalletId = `PLP-AGT-${randCode}`;
      updated.agentFloatBalance = 15000.0;
      updated.agentCashDrawer = 3500.0;
      updated.agentCommissionBalance = 120.0;
    }
    if (type === 'driver' && !updated.driverRevenue) {
      updated.driverWalletId = `PLP-DRV-${randCode}`;
      updated.driverRevenue = 200.0;
      updated.driverCurrentFare = 7.0;
      updated.driverTripCount = 28;
      updated.driverPermanentId = '12344';
    }

    setCurrentUser(updated);
    setUsers({ ...users, [updated.email]: updated });
    saveSession(updated);
    alert(`[ADMIN COMPLIANCE REVIEW PASSED]\n\nCapability '${type.toUpperCase()}' has been officially approved. Mode is now unlocked.`);
  };

  // Driver Reuse Fare Handler (CTO Finding 3: Unique Request Generation WITHOUT False Pre-credit)
  const handleDriverReuseFare = () => {
    if (!currentUser) return;
    const fare = driverCurrentFare || 7.0;

    // Archive current request to prevent replay
    if (driverRequestId && !settledRequests.includes(driverRequestId)) {
      setSettledRequests([...settledRequests, driverRequestId]);
    }

    // Generate brand new unique Request ID and security nonce
    const nextReqNum = Math.floor(100 + Math.random() * 900);
    const nextNonce = Math.floor(1000 + Math.random() * 9000).toString();
    const newReqId = `REQ-${nextReqNum}`;
    setDriverRequestId(newReqId);
    setDriverNonceCode(nextNonce);

    // Reuse Fare reuses the PRICE, not the transaction or revenue!
    alert(`New Payment Request Generated!\n\n• Price retained: P ${fare.toFixed(2)}\n• Request ID: ${newReqId}\n• Single-use Nonce: ${nextNonce}\n\nPrevious request is archived and cannot be repaid.`);
  };

  // Driver Explicit Fare Confirmation (When passenger pays)
  const handleDriverConfirmFarePaid = () => {
    if (!currentUser) return;
    const fare = driverCurrentFare || 7.0;

    // Check anti-replay
    if (settledRequests.includes(driverRequestId)) {
      alert(`[ANTI-REPLAY VIOLATION BLOCKED]\n\nPayment request ${driverRequestId} has already been settled and cannot be paid again.`);
      return;
    }

    // Settle this request
    setSettledRequests([...settledRequests, driverRequestId]);
    const updated = { ...currentUser };
    updated.driverRevenue = (updated.driverRevenue || 0) + fare;
    const newCount = driverTripCounter + 1;
    setDriverTripCounter(newCount);
    updated.driverTripCount = newCount;
    setCurrentUser(updated);
    setUsers({ ...users, [updated.email]: updated });
    saveSession(updated);

    const newTx: Transaction = {
      id: 'tx_drv_' + Date.now().toString(),
      userId: currentUser.id,
      scope: 'driver',
      reference: `FARE-${driverRequestId}`,
      type: 'Transit Fare',
      amount: fare,
      counterparty: `Passenger #${newCount}`,
      description: `Combi fare P ${fare.toFixed(2)} [${driverRequestId}]`,
      direction: 'credit',
      status: 'completed',
      createdAt: 'Just now',
    };
    setTransactions([newTx, ...transactions]);
    setLastTxn(newTx);
    setActiveModal('receipt');
  };

  // Agent Cash-In Handler
  const handleAgentCashIn = () => {
    if (!currentUser) return;
    const amt = parseFloat(inputAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }
    const currentFloat = currentUser.agentFloatBalance || 0;
    if (currentFloat < amt) {
      alert(`Insufficient operational float (P ${currentFloat.toFixed(2)}). You cannot process a deposit of P ${amt.toFixed(2)}.`);
      return;
    }
    if (!agentCashReceivedChecked) {
      alert('Please confirm that you have physically received cash in hand from the customer.');
      return;
    }

    const commission = amt * 0.01;
    const custName = agentCustomerName.trim() || 'Katlego Molefe';

    const updated = { ...currentUser };
    updated.agentFloatBalance = currentFloat - amt;
    updated.agentCashDrawer = (updated.agentCashDrawer || 0) + amt;
    updated.agentCommissionBalance = (updated.agentCommissionBalance || 0) + commission;
    setCurrentUser(updated);
    setUsers({ ...users, [updated.email]: updated });
    saveSession(updated);

    const newTx: Transaction = {
      id: 'tx_ag_in_' + Date.now().toString(),
      userId: currentUser.id,
      scope: 'agent_float',
      reference: 'DEP-' + Math.floor(100000 + Math.random() * 900000),
      type: 'Agent Cash-In',
      amount: amt,
      counterparty: custName,
      description: `Cash deposit credited to ${custName}`,
      direction: 'debit',
      status: 'completed',
      createdAt: 'Just now',
    };
    setTransactions([newTx, ...transactions]);
    setLastTxn(newTx);
    setActiveModal('receipt');
    setAgentCashReceivedChecked(false);
    setInputAmount('');
  };

  // Agent Cash-Out Phase 1: Authorize & Post Digital Balances (CTO Finding 1)
  const handleAgentAuthorizeCashOut = () => {
    if (!currentUser) return;
    const amt = parseFloat(inputAmount) || 0;
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    const currentDrawer = currentUser.agentCashDrawer || 3000.0;
    if (currentDrawer < amt) {
      alert(`[CASH SHORTAGE REJECTION]\n\nInsufficient physical cash in drawer (P ${currentDrawer.toFixed(2)}). You cannot dispense P ${amt.toFixed(2)}.`);
      return;
    }
    if (!agentWithdrawOtp || agentWithdrawOtp.length < 4) {
      alert('Please enter the customer\'s 4-digit withdrawal authorization code.');
      return;
    }

    // Debit customer personal wallet if customer exists in users
    const custKey = findUserEmail(inputCounterparty);
    if (custKey && users[custKey]) {
      const cust = users[custKey];
      if ((cust.personalBalance || 0) < amt) {
        alert(`[CUSTOMER INSUFFICIENT FUNDS]\n\nCustomer available balance is P ${(cust.personalBalance || 0).toFixed(2)}. Cannot withdraw P ${amt.toFixed(2)}.`);
        return;
      }
      const updatedCust = { ...cust, personalBalance: (cust.personalBalance || 0) - amt };
      setUsers({ ...users, [custKey]: updatedCust });
    }

    // Credit Agent Digital Float
    const updated = { ...currentUser };
    updated.agentFloatBalance = (updated.agentFloatBalance || 0) + amt;
    setCurrentUser(updated);
    setUsers((prev) => ({ ...prev, [updated.email]: updated }));
    saveSession(updated);

    // Transition to Phase 2: Physical Cash Handover
    setAgentCashOutStage('handover');
  };

  // Agent Cash-Out Phase 2: Confirm Physical Handover (CTO Finding 1)
  const handleAgentConfirmHandover = () => {
    if (!currentUser) return;
    const amt = parseFloat(inputAmount) || 0;
    const commission = amt * 0.01; // Illustrative platform-funded rate

    const updated = { ...currentUser };
    updated.agentCashDrawer = (updated.agentCashDrawer || 3000.0) - amt;
    updated.agentCommissionBalance = (updated.agentCommissionBalance || 0) + commission;
    setCurrentUser(updated);
    setUsers((prev) => ({ ...prev, [updated.email]: updated }));
    saveSession(updated);

    const newTx: Transaction = {
      id: 'tx_ag_out_' + Date.now().toString(),
      userId: currentUser.id,
      scope: 'agent_float',
      reference: 'WTH-' + Math.floor(100000 + Math.random() * 900000),
      type: 'Agent Cash-Out',
      amount: amt,
      counterparty: agentCustomerName.trim() || 'Customer Withdrawal',
      description: `Cash handover confirmed. Commission P ${commission.toFixed(2)} (Platform funded)`,
      direction: 'credit',
      status: 'completed',
      createdAt: 'Just now',
    };
    setTransactions([newTx, ...transactions]);
    setLastTxn(newTx);
    setActiveModal('receipt');
    setAgentCashOutStage('validate');
    setAgentWithdrawOtp('');
    setInputAmount('');
  };

  // Agent Cash-Out Handover Dispute / Issue (CTO Finding 1: NO Double-Debit)
  const handleAgentHandoverDispute = () => {
    if (!currentUser) return;
    const amt = parseFloat(inputAmount) || 0;

    const newTx: Transaction = {
      id: 'tx_ag_disp_' + Date.now().toString(),
      userId: currentUser.id,
      scope: 'agent_float',
      reference: 'DISP-' + Math.floor(100000 + Math.random() * 900000),
      type: 'Handover Issue / Dispute',
      amount: amt,
      counterparty: agentCustomerName.trim() || 'Customer Withdrawal',
      description: `Physical handover could not be completed. Cash drawer intact. Escalated to support.`,
      direction: 'credit',
      status: 'pending',
      createdAt: 'Just now',
    };
    setTransactions([newTx, ...transactions]);
    setLastTxn(newTx);
    setActiveModal('receipt');
    setAgentCashOutStage('validate');
    alert(`[HANDOVER ISSUE RECORDED]\n\n• Physical cash was NOT dispensed from drawer.\n• Customer will NOT be charged twice.\n• Dispute reference logged: ${newTx.reference}`);
  };

  // Recipient live lookup helper
  const getVerifiedRecipientName = (query: string): string | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    for (const u of Object.values(users)) {
      if (
        u.email.toLowerCase() === q ||
        u.phone.replace(/\s+/g, '') === q.replace(/\s+/g, '') ||
        u.personalWalletId.toLowerCase() === q ||
        u.name.toLowerCase().includes(q)
      ) {
        return u.name;
      }
    }
    if (q.length >= 7 && (q.includes('71') || q.includes('72') || q.includes('74') || q.includes('75') || q.includes('76'))) {
      return 'Botswana Mobile Account';
    }
    return null;
  };

  // Determine Current Active Scope & Role View
  // Rule:
  // - Customer -> strictly customer
  // - Driver -> strictly driver
  // - Merchant -> strictly merchant
  // - Agent -> can toggle between 'operational' and 'personal'
  const isAgentPersonal = currentUser?.role === 'agent' && agentSubMode === 'personal';
  const effectiveRole: Role = isAgentPersonal ? 'customer' : currentUser ? currentUser.role : 'customer';

  // Determine Current Scope for Transaction Filtering & Mutation
  const currentScope: 'personal' | 'agent_float' | 'driver' | 'merchant' =
    activeMode === 'agent'
      ? 'agent_float'
      : activeMode === 'driver'
      ? 'driver'
      : 'personal';

  // Get Active Display Balance (Driven strictly by Active Operating Mode)
  const getActiveBalance = (): number => {
    if (!currentUser) return 0;
    if (activeMode === 'personal') return currentUser.personalBalance;
    if (activeMode === 'agent') return currentUser.agentFloatBalance || 0;
    if (activeMode === 'driver') return currentUser.driverRevenue || 0;
    return currentUser.personalBalance;
  };

  // Get Active Wallet ID
  const getActiveWalletId = (): string => {
    if (!currentUser) return 'PLP-000000';
    if (activeMode === 'personal') return currentUser.personalWalletId;
    if (activeMode === 'agent') return currentUser.agentWalletId || 'PLP-AGT-000';
    if (activeMode === 'driver') return currentUser.driverWalletId || 'PLP-DRV-000';
    return currentUser.personalWalletId;
  };

  // Helper to find registered user email by phone, wallet ID, or email
  const findUserEmail = (query: string): string | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    for (const [email, u] of Object.entries(users)) {
      if (
        email.toLowerCase() === q ||
        u.phone.replace(/\s+/g, '') === q.replace(/\s+/g, '') ||
        u.personalWalletId.toLowerCase() === q ||
        u.name.toLowerCase() === q
      ) {
        return email;
      }
    }
    return null;
  };

  // Financial Mutation Execution (CTO Audit: Idempotency + Mode-driven + P2P double-entry)
  const executeTransaction = (type: string, direction: 'credit' | 'debit', defaultParty: string) => {
    if (!currentUser) return;
    // Idempotency lock (CTO Finding 3 & Acceptance Criteria S01)
    if (isProcessingTx) return;
    setIsProcessingTx(true);

    const amt = parseFloat(inputAmount);
    if (isNaN(amt) || amt <= 0) {
      setIsProcessingTx(false);
      return;
    }

    const currentBal = getActiveBalance();
    if (direction === 'debit' && currentBal < amt) {
      alert(`[INSUFFICIENT FUNDS]\n\nAvailable balance: P ${currentBal.toFixed(2)}\nAttempted amount: P ${amt.toFixed(2)}`);
      setIsProcessingTx(false);
      return;
    }

    const updatedUser = { ...currentUser };

    // Update initiator balance strictly by activeMode (CTO Finding)
    if (activeMode === 'personal') {
      updatedUser.personalBalance = direction === 'credit' ? currentBal + amt : currentBal - amt;
    } else if (activeMode === 'agent') {
      updatedUser.agentFloatBalance = direction === 'credit' ? currentBal + amt : currentBal - amt;
    } else if (activeMode === 'driver') {
      updatedUser.driverRevenue = direction === 'credit' ? currentBal + amt : currentBal - amt;
    }

    const updatedUsersMap = { ...users, [updatedUser.email]: updatedUser };
    let newTransactionsList = [...transactions];

    // Double-entry P2P Transfer: Credit Recipient in users state (CTO Acceptance Criterion P02)
    if (type === 'send' && direction === 'debit') {
      const recipientEmail = findUserEmail(inputCounterparty);
      if (recipientEmail && updatedUsersMap[recipientEmail]) {
        const recip = { ...updatedUsersMap[recipientEmail] };
        recip.personalBalance = (recip.personalBalance || 0) + amt;
        updatedUsersMap[recipientEmail] = recip;

        // Recipient Transaction Record
        const recipientTx: Transaction = {
          id: 'tx_rec_' + Date.now().toString(),
          userId: recip.id,
          scope: 'personal',
          reference: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
          type: 'receive',
          amount: amt,
          counterparty: currentUser.name,
          description: inputNote.trim() || `Transfer from ${currentUser.name}`,
          direction: 'credit',
          status: 'completed',
          createdAt: 'Just now',
        };
        newTransactionsList = [recipientTx, ...newTransactionsList];
      }
    }

    // Persist initiator and all updated accounts
    setCurrentUser(updatedUser);
    setUsers(updatedUsersMap);
    saveSession(updatedUser);

    const newTx: Transaction = {
      id: 'tx_' + Date.now().toString(),
      userId: currentUser.id,
      scope: currentScope,
      reference: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      type,
      amount: amt,
      counterparty: inputCounterparty.trim() || defaultParty,
      description: inputNote.trim() || `${type} transaction`,
      direction,
      status: 'completed',
      createdAt: 'Just now',
    };

    setTransactions([newTx, ...newTransactionsList]);
    setLastTxn(newTx);
    setInputAmount('');
    setInputCounterparty('');
    setInputNote('');
    setActiveModal('receipt');

    // Release idempotency lock after debounce
    setTimeout(() => {
      setIsProcessingTx(false);
    }, 600);
  };

  // Card Scan with One-Time PIN simulation
  const initiateCardScan = (amt: number, party: string) => {
    if (cardBlocked) {
      alert('This card is currently blocked. Please unblock in My Card.');
      return;
    }
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedOtp(pin);
    setPendingCardAmount(amt);
    setPendingCardParty(party);
    setEnteredOtp('');
    setActiveModal('sms_otp');
  };

  const confirmCardOtp = () => {
    if (enteredOtp !== simulatedOtp) {
      alert('Incorrect PIN. Please enter the 4-digit PIN shown in the simulated SMS alert.');
      return;
    }
    setActiveModal(null);
    setInputAmount(pendingCardAmount.toString());
    setInputCounterparty(pendingCardParty);
    setInputNote('Card scan payment');
    executeTransaction('pay', 'credit', pendingCardParty);
  };

  // Filtered transactions for the current user and active scope
  const activeTransactions = transactions.filter(
    (t) => currentUser && t.userId === currentUser.id && t.scope === currentScope
  );

  const filteredTransactions = activeTransactions.filter((t) => {
    if (activityFilter === 'credit') return t.direction === 'credit';
    if (activityFilter === 'debit') return t.direction === 'debit';
    return true;
  });

  // Seamless Instant Google Account Provisioning & Sign-in
  const handleSelectGoogleAccount = (name: string, email: string, phone: string) => {
    setShowGooglePickerModal(false);
    const cleanEmail = email.trim().toLowerCase();
    let user = users[cleanEmail];
    if (!user) {
      const randCode = Math.floor(100000 + Math.random() * 900000).toString();
      const personalWalletId = `PLP-CD-${randCode}`;
      user = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: cleanEmail,
        password: '1234',
        pin: '1234',
        omang: '712345678',
        role: 'customer',
        capabilities: {
          agent: 'none',
          driver: 'none',
        },
        personalWalletId,
        personalBalance: 500.0,
        statusBadge: 'Personal Wallet Active',
        initials: name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'PP',
      };
      setUsers((prev) => ({ ...prev, [cleanEmail]: user }));
    }
    setCurrentUser(user);
    saveSession(user);
    setIsAuthenticated(true);
    setActiveMode('personal');
    setAgentSubMode('personal');
    setActiveTab('home');
  };

  // Google Account Chooser Modal (Interim Google Signup & Auth)
  const renderGoogleModal = () => (
    <Modal visible={showGooglePickerModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.sheetContainer, { paddingBottom: 24 }]}>
          <View style={styles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="logo-google" size={20} color="#ea4335" />
              <Text style={styles.sheetTitle}>Continue with Google</Text>
            </View>
            <TouchableOpacity onPress={() => setShowGooglePickerModal(false)} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#6c7873" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: '#6c7873', marginBottom: 16 }}>
            Select your Google account to create your PulaPay unified wallet or sign in:
          </Text>

          <TouchableOpacity
            onPress={() => handleSelectGoogleAccount('Loago Rantao', 'loagorantao@gmail.com', '71458185')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#f4f7f5', marginBottom: 10, gap: 12 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#075c49', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#d7f06f', fontWeight: '800', fontSize: 16 }}>LR</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#17231f' }}>Loago Rantao</Text>
              <Text style={{ fontSize: 12, color: '#6c7873' }}>loagorantao@gmail.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelectGoogleAccount('AutoBots Dev', 'autobotsdev49@gmail.com', '72112233')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#f4f7f5', gap: 12 }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#13725b', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>AD</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#17231f' }}>AutoBots Dev</Text>
              <Text style={{ fontSize: 12, color: '#6c7873' }}>autobotsdev49@gmail.com</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ==========================================
  // VIEW: COMPLETE ACCOUNT-ACCESS LIFECYCLE (Spec v3.1)
  // Splash -> Onboarding -> Welcome -> Register / Login / Recover / Unlock
  // ==========================================
  if (!isAuthenticated) {
    // -------------------------------------------------------------
    // SCREEN 1: BRAND SPLASH SCREEN
    // -------------------------------------------------------------
    if (authFlow === 'splash') {
      return (
        <SafeAreaView style={styles.splashContainer}>
          <StatusBar style="light" />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (currentUser) {
                setAuthFlow('session_locked');
              } else {
                setAuthFlow('onboarding');
              }
            }}
            style={styles.splashContent}
          >
            <View style={styles.splashLogoBadge}>
              <Text style={styles.splashSlash}>//</Text>
              <Text style={styles.splashLogoText}>pulapay</Text>
            </View>
            <Text style={styles.splashEyebrow}>YOUR MONEY. YOUR MOVE.</Text>
            <Text style={styles.splashHeading}>
              Simple payments{"\n"}for everyday{"\n"}Botswana.
            </Text>
          </TouchableOpacity>

          <View style={styles.splashFooter}>
            <Text style={styles.splashFooterText}>Tap anywhere to enter</Text>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 2: ONBOARDING WALKTHROUGH (3 Slides with Next & Skip)
    // -------------------------------------------------------------
    if (authFlow === 'onboarding') {
      const slides = [
        {
          title: 'One Account, Multiple Roles',
          tag: 'UNIFIED ARCHITECTURE',
          desc: 'One person, one registration. Access your Personal Wallet, Agent cash operations, and Combi driver collections without multiple logins.',
          icon: 'users',
        },
        {
          title: 'Wallet & Cash Liquidity',
          tag: 'EVERYDAY PAYMENTS',
          desc: 'Deposit with mobile money or through local authorized PulaPay agents. Send funds instantly with live recipient verification.',
          icon: 'credit-card',
        },
        {
          title: 'Fast Transport & Combi Fares',
          tag: 'TRANSPORT READY',
          desc: 'Pay taxi and combi fares in seconds with single-use payment codes. Drivers collect fares with instant Reuse Fare technology.',
          icon: 'truck',
        },
      ];
      const cur = slides[onboardingSlide];

      return (
        <SafeAreaView style={[styles.authContainer, { backgroundColor: '#075c49', justifyContent: 'space-between', padding: 24 }]}>
          <StatusBar style="light" />

          {/* Top Skip Button */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 10 : 10 }}>
            <View style={styles.splashLogoBadge}>
              <Text style={styles.splashSlash}>//</Text>
              <Text style={styles.splashLogoText}>pulapay</Text>
            </View>
            <TouchableOpacity onPress={() => setAuthFlow('welcome')} style={{ padding: 8 }}>
              <Text style={{ color: '#d7f06f', fontWeight: '700', fontSize: 14 }}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Central Slide Content */}
          <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#d7f06f', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
              <Feather name={cur.icon as any} size={36} color="#075c49" />
            </View>
            <Text style={{ color: '#d7f06f', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>
              {cur.tag}
            </Text>
            <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '900', textAlign: 'center', lineHeight: 36, marginBottom: 14 }}>
              {cur.title}
            </Text>
            <Text style={{ color: '#d0dfd8', fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 320 }}>
              {cur.desc}
            </Text>

            {/* Slide Dots */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 32 }}>
              {[0, 1, 2].map((idx) => (
                <View
                  key={idx}
                  style={{
                    width: onboardingSlide === idx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: onboardingSlide === idx ? '#d7f06f' : '#1b745e',
                  }}
                />
              ))}
            </View>
          </View>

          {/* Bottom Next / Get Started Button */}
          <View style={{ paddingBottom: 16 }}>
            <TouchableOpacity
              onPress={() => {
                if (onboardingSlide < 2) {
                  setOnboardingSlide(onboardingSlide + 1);
                } else {
                  setAuthFlow('welcome');
                }
              }}
              style={[styles.primaryBtn, { backgroundColor: '#d7f06f' }]}
            >
              <Text style={[styles.primaryBtnText, { color: '#075c49', fontWeight: '800' }]}>
                {onboardingSlide === 2 ? 'Get Started →' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 3: WELCOME SCREEN (Create Account, Login, Google)
    // -------------------------------------------------------------
    if (authFlow === 'welcome') {
      return (
        <SafeAreaView style={[styles.authContainer, { backgroundColor: '#075c49', justifyContent: 'space-between', padding: 24 }]}>
          <StatusBar style="light" />

          {/* Top Logo */}
          <View style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 16 : 24, alignItems: 'center' }}>
            <View style={styles.splashLogoBadge}>
              <Text style={styles.splashSlash}>//</Text>
              <Text style={styles.splashLogoText}>pulapay</Text>
            </View>
            <Text style={styles.splashEyebrow}>YOUR MONEY. YOUR MOVE.</Text>
          </View>

          {/* Center Graphic & Headline */}
          <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 40, marginBottom: 12 }}>
              Simple payments{"\n"}for everyday{"\n"}Botswana.
            </Text>
            <Text style={{ color: '#d0dfd8', fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
              One registered account for personal money, agent cash services, and transport fares.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12, paddingBottom: 16 }}>
            {/* Create Account only with Google */}
            <TouchableOpacity
              onPress={() => setShowGooglePickerModal(true)}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: '#d7f06f',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                },
              ]}
            >
              <Ionicons name="logo-google" size={18} color="#075c49" />
              <Text style={[styles.primaryBtnText, { color: '#075c49', fontWeight: '800' }]}>
                Create Account with Google
              </Text>
            </TouchableOpacity>

            {/* Log in with PIN / Demo Accounts */}
            <TouchableOpacity
              onPress={() => setAuthFlow('login')}
              style={[styles.secondaryBtn, { borderColor: '#d7f06f', backgroundColor: 'transparent' }]}
            >
              <Text style={[styles.secondaryBtnText, { color: '#d7f06f', fontWeight: '800' }]}>
                Log in with PIN / Demo Account
              </Text>
            </TouchableOpacity>

            {/* Educational Tour link */}
            <TouchableOpacity
              onPress={() => {
                setOnboardingSlide(0);
                setAuthFlow('onboarding');
              }}
              style={{ alignItems: 'center', paddingTop: 8 }}
            >
              <Text style={{ color: '#d0dfd8', fontSize: 13, textDecorationLine: 'underline' }}>
                Replay feature tour
              </Text>
            </TouchableOpacity>
          </View>

          {/* Google Account Chooser Modal */}
          {renderGoogleModal()}
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 4: CREATE ACCOUNT (STEP 1: DETAILS)
    // -------------------------------------------------------------
    if (authFlow === 'reg_details') {
      return (
        <SafeAreaView style={styles.authContainer}>
          <StatusBar style="light" />

          {/* Header */}
          <View style={styles.authHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <TouchableOpacity onPress={() => setAuthFlow('welcome')} style={{ padding: 4 }}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Step 1 of 3: Registration</Text>
              <View style={{ width: 22 }} />
            </View>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>SINGLE IDENTITY ACCOUNT</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>Create your wallet</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.authCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>


              <Text style={styles.inputLabel}>Full Legal Name</Text>
              <TextInput
                style={styles.textInput}
                value={regName}
                onChangeText={setRegName}
                placeholder="e.g. Loago Rantao"
                placeholderTextColor="#6c7873"
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Botswana Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                value={regPhone}
                onChangeText={setRegPhone}
                placeholder="71234567 or +267..."
                placeholderTextColor="#6c7873"
                keyboardType="phone-pad"
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Omang / National ID</Text>
              <TextInput
                style={styles.textInput}
                value={regOmang}
                onChangeText={setRegOmang}
                placeholder="e.g. 712345678"
                placeholderTextColor="#6c7873"
              />

              <View style={{ backgroundColor: '#f4f7f5', borderRadius: 8, padding: 12, marginTop: 14 }}>
                <Text style={{ fontSize: 12, color: '#6c7873', lineHeight: 18 }}>
                  ✓ One personal wallet created automatically{'\n'}
                  ✓ Agent & Driver modes can be added after registration{'\n'}
                  ✓ No role selection needed during signup
                </Text>
              </View>

              <TouchableOpacity onPress={handleProceedToRegOtp} style={[styles.primaryBtn, { marginTop: 20 }]}>
                <Text style={styles.primaryBtnText}>Continue to Phone Verification →</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setAuthFlow('login')} style={{ alignItems: 'center', marginTop: 16 }}>
                <Text style={{ fontSize: 13, color: '#075c49', fontWeight: '600' }}>
                  Already have an account? <Text style={{ textDecorationLine: 'underline' }}>Log in</Text>
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 5: VERIFY PHONE (SIMULATED OTP)
    // -------------------------------------------------------------
    if (authFlow === 'reg_otp') {
      return (
        <SafeAreaView style={styles.authContainer}>
          <StatusBar style="light" />

          <View style={styles.authHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <TouchableOpacity onPress={() => setAuthFlow('reg_details')} style={{ padding: 4 }}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Step 2 of 3: Verification</Text>
              <View style={{ width: 22 }} />
            </View>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>SIMULATED DEMO VERIFICATION</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>Enter 4-Digit Code</Text>
            </View>
          </View>

          <View style={styles.authCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>
              {/* Simulated Demo SMS Banner */}
              <View style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 14, marginBottom: 18, borderLeftWidth: 4, borderLeftColor: '#075c49' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#075c49', textTransform: 'uppercase', marginBottom: 2 }}>[SIMULATED SMS SENT TO {regPhone}]</Text>
                <Text style={{ fontSize: 14, color: '#17231f' }}>
                  Your PulaPay verification code is: <Text style={{ fontWeight: '900', fontSize: 18, color: '#075c49' }}>{simulatedRegOtp}</Text>
                </Text>
              </View>

              <Text style={styles.inputLabel}>Enter 4-Digit Code</Text>
              <TextInput
                style={[styles.textInput, { fontSize: 26, letterSpacing: 8, fontWeight: '900', textAlign: 'center' }]}
                value={enteredRegOtp}
                onChangeText={setEnteredRegOtp}
                placeholder="••••"
                placeholderTextColor="#6c7873"
                keyboardType="numeric"
                maxLength={4}
              />

              <TouchableOpacity onPress={handleVerifyRegOtp} style={[styles.primaryBtn, { marginTop: 18 }]}>
                <Text style={styles.primaryBtnText}>Verify Code & Create PIN →</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                <TouchableOpacity onPress={handleResendRegOtp}>
                  <Text style={{ fontSize: 13, color: '#075c49', fontWeight: '700' }}>↺ Resend Demo Code</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAuthFlow('reg_details')}>
                  <Text style={{ fontSize: 13, color: '#6c7873' }}>Change Phone Number</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 6: CREATE PIN (STEP 3)
    // -------------------------------------------------------------
    if (authFlow === 'reg_pin') {
      return (
        <SafeAreaView style={styles.authContainer}>
          <StatusBar style="light" />

          <View style={styles.authHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <TouchableOpacity onPress={() => setAuthFlow('reg_otp')} style={{ padding: 4 }}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Step 3 of 3: Security PIN</Text>
              <View style={{ width: 22 }} />
            </View>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>ACCOUNT CREDENTIALS</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>Create your PIN</Text>
            </View>
          </View>

          <View style={styles.authCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>
              <Text style={{ fontSize: 13, color: '#6c7873', marginBottom: 16 }}>
                You will use this 4-digit PIN along with your phone number ({regPhone}) to log in and authorize transactions.
              </Text>

              <Text style={styles.inputLabel}>Create 4-Digit PIN</Text>
              <TextInput
                style={[styles.textInput, { fontSize: 24, letterSpacing: 8, fontWeight: '800', textAlign: 'center' }]}
                value={regPin}
                onChangeText={setRegPin}
                placeholder="••••"
                placeholderTextColor="#6c7873"
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Confirm 4-Digit PIN</Text>
              <TextInput
                style={[styles.textInput, { fontSize: 24, letterSpacing: 8, fontWeight: '800', textAlign: 'center' }]}
                value={regConfirmPin}
                onChangeText={setRegConfirmPin}
                placeholder="••••"
                placeholderTextColor="#6c7873"
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />

              <TouchableOpacity onPress={handleCreateRegPin} style={[styles.primaryBtn, { marginTop: 20 }]}>
                <Text style={styles.primaryBtnText}>Confirm & Create Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 7: ACCOUNT CREATED SUCCESS
    // -------------------------------------------------------------
    if (authFlow === 'reg_success') {
      return (
        <SafeAreaView style={[styles.authContainer, { backgroundColor: '#075c49', justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
          <StatusBar style="light" />

          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 28, width: '100%', alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#d7f06f', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Feather name="check" size={32} color="#075c49" />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: '#17231f', textAlign: 'center' }}>
              Account Created!
            </Text>
            <Text style={{ fontSize: 13, color: '#6c7873', textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
              Welcome to PulaPay, <Text style={{ fontWeight: '700', color: '#17231f' }}>{regName}</Text>. Your personal wallet is active and funded with P 500.00 demo credit.
            </Text>

            <View style={{ backgroundColor: '#f4f7f5', borderRadius: 10, padding: 14, width: '100%', marginTop: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#6c7873', fontWeight: '700' }}>YOUR PERSONAL WALLET ID</Text>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#075c49', letterSpacing: 1.5, marginTop: 4 }}>
                {newlyCreatedWalletId || 'PLP-CD-000000'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleFinishRegistration} style={[styles.primaryBtn, { width: '100%', marginTop: 24 }]}>
              <Text style={styles.primaryBtnText}>Go to My Wallet →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 8: LOGIN SCREEN (Phone / Email + PIN)
    // -------------------------------------------------------------
    if (authFlow === 'login') {
      return (
        <SafeAreaView style={styles.authContainer}>
          <StatusBar style="light" />

          <View style={styles.authHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <TouchableOpacity onPress={() => setAuthFlow('welcome')} style={{ padding: 4 }}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </TouchableOpacity>
              <View style={{ backgroundColor: '#13725b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '700' }}>DEMO ENVIRONMENT</Text>
              </View>
            </View>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>SECURE WALLET ACCESS</Text>
              <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '900', marginTop: 2 }}>Log in with PIN</Text>
            </View>
          </View>

          <View style={styles.authCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>
              {loginError !== '' && (
                <View style={{ backgroundColor: '#fdf0f0', borderRadius: 8, padding: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="alert-circle" size={16} color="#c0392b" />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#c0392b', flex: 1 }}>{loginError}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Registered Phone or Email</Text>
              <TextInput
                style={styles.textInput}
                value={loginIdentifier}
                onChangeText={(t) => { setLoginIdentifier(t); setLoginError(''); }}
                placeholder="e.g. 76543210 or kabelo@pulapay.co.bw"
                placeholderTextColor="#6c7873"
                autoCapitalize="none"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                <Text style={styles.inputLabel}>PulaPay PIN</Text>
                <TouchableOpacity onPress={() => { setRecoveryPhone(loginIdentifier); setAuthFlow('forgot_phone'); }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#075c49' }}>Forgot PIN?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={loginPin}
                  onChangeText={(t) => { setLoginPin(t); setLoginError(''); }}
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor="#6c7873"
                  secureTextEntry={!showLoginPin}
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => setShowLoginPin(!showLoginPin)} style={styles.eyeBtn}>
                  <Feather name={showLoginPin ? 'eye-off' : 'eye'} size={18} color="#6c7873" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleLoginSubmit}
                style={[styles.primaryBtn, { opacity: isLoginDisabled ? 0.5 : 1 }]}
                disabled={isLoginDisabled}
              >
                <Text style={styles.primaryBtnText}>Log in securely</Text>
              </TouchableOpacity>

              {/* Google Fast Sign-In */}
              <TouchableOpacity
                onPress={() => setShowGooglePickerModal(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f4f7f5',
                  paddingVertical: 12,
                  borderRadius: 10,
                  marginTop: 10,
                  gap: 8,
                }}
              >
                <Ionicons name="logo-google" size={16} color="#ea4335" />
                <Text style={{ color: '#17231f', fontWeight: '700', fontSize: 13 }}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Create account link */}
              <TouchableOpacity onPress={() => setShowGooglePickerModal(true)} style={{ alignItems: 'center', marginTop: 14 }}>
                <Text style={{ fontSize: 13, color: '#6c7873' }}>
                  Don't have an account? <Text style={{ color: '#075c49', fontWeight: '700' }}>Create with Google</Text>
                </Text>
              </TouchableOpacity>

              {/* 1-Tap Demo Accounts */}
              <View style={styles.demoAccountsBox}>
                <Text style={styles.demoAccountsHeader}>TAP TO TEST PRE-SEEDED ACCOUNTS (PIN: 1234)</Text>

                <TouchableOpacity
                  onPress={() => {
                    setLoginIdentifier('76543210');
                    setLoginPin('1234');
                  }}
                  style={styles.demoAccountRow}
                >
                  <Text style={[styles.demoRoleTag, { color: '#075c49', fontWeight: '900' }]}>★ Kabelo (Hero):</Text>
                  <Text style={styles.demoEmailText}>76543210 (Personal + Agent + Driver)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setLoginIdentifier('71234567');
                    setLoginPin('1234');
                  }}
                  style={styles.demoAccountRow}
                >
                  <Text style={styles.demoRoleTag}>Customer:</Text>
                  <Text style={styles.demoEmailText}>71234567 (Katlego - Personal Wallet)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setLoginIdentifier('72345678');
                    setLoginPin('1234');
                  }}
                  style={styles.demoAccountRow}
                >
                  <Text style={styles.demoRoleTag}>Agent:</Text>
                  <Text style={styles.demoEmailText}>72345678 (Kagiso - Cash-In / Out)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setLoginIdentifier('74567890');
                    setLoginPin('1234');
                  }}
                  style={styles.demoAccountRow}
                >
                  <Text style={styles.demoRoleTag}>Driver:</Text>
                  <Text style={styles.demoEmailText}>74567890 (Thabo - Combi Route)</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {renderGoogleModal()}
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 9: FORGOT PIN (STEP 1: ENTER PHONE)
    // -------------------------------------------------------------
    if (authFlow === 'forgot_phone') {
      return (
        <SafeAreaView style={styles.authContainer}>
          <StatusBar style="light" />

          <View style={styles.authHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <TouchableOpacity onPress={() => setAuthFlow('login')} style={{ padding: 4 }}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Account Recovery</Text>
              <View style={{ width: 22 }} />
            </View>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>PIN RECOVERY</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>Reset your PIN</Text>
            </View>
          </View>

          <View style={styles.authCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>
              <Text style={{ fontSize: 13, color: '#6c7873', marginBottom: 16, lineHeight: 20 }}>
                Enter the Botswana mobile number registered with your PulaPay account. We will send a simulated recovery code.
              </Text>

              <Text style={styles.inputLabel}>Registered Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                value={recoveryPhone}
                onChangeText={setRecoveryPhone}
                placeholder="e.g. 76543210 or 71234567"
                placeholderTextColor="#6c7873"
                keyboardType="phone-pad"
              />

              <TouchableOpacity onPress={handleRequestRecoveryOtp} style={[styles.primaryBtn, { marginTop: 18 }]}>
                <Text style={styles.primaryBtnText}>Send Demo Recovery Code →</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setAuthFlow('login')} style={{ alignItems: 'center', marginTop: 16 }}>
                <Text style={{ fontSize: 13, color: '#6c7873' }}>Remember your PIN? <Text style={{ color: '#075c49', fontWeight: '700' }}>Log in</Text></Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 10: FORGOT PIN (STEP 2: VERIFY RECOVERY CODE)
    // -------------------------------------------------------------
    if (authFlow === 'forgot_otp') {
      return (
        <SafeAreaView style={styles.authContainer}>
          <StatusBar style="light" />

          <View style={styles.authHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
              <TouchableOpacity onPress={() => setAuthFlow('forgot_phone')} style={{ padding: 4 }}>
                <Feather name="arrow-left" size={22} color="#ffffff" />
              </TouchableOpacity>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Recovery Verification</Text>
              <View style={{ width: 22 }} />
            </View>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>IDENTITY VERIFICATION</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>Enter Recovery Code</Text>
            </View>
          </View>

          <View style={styles.authCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>
              {/* Separate Recovery Code Banner (CTO Finding & Spec Rule) */}
              <View style={{ backgroundColor: '#fff9e6', borderRadius: 10, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#d97706' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#b45309', textTransform: 'uppercase', marginBottom: 2 }}>[SIMULATED RECOVERY SMS]</Text>
                <Text style={{ fontSize: 13, color: '#17231f' }}>
                  Your PulaPay PIN recovery code is: <Text style={{ fontWeight: '900', fontSize: 17, color: '#b45309' }}>{simulatedRecoveryOtp}</Text>
                </Text>
                <Text style={{ fontSize: 11, color: '#6c7873', marginTop: 4 }}>
                  Note: Recovery codes are strictly separate from payment OTPs and cannot authorize transactions.
                </Text>
              </View>

              <Text style={styles.inputLabel}>Enter Recovery Code</Text>
              <TextInput
                style={[styles.textInput, { fontSize: 20, letterSpacing: 4, fontWeight: '800', textAlign: 'center' }]}
                value={enteredRecoveryOtp}
                onChangeText={setEnteredRecoveryOtp}
                placeholder="REC-••••"
                placeholderTextColor="#6c7873"
                autoCapitalize="characters"
              />

              <TouchableOpacity onPress={handleVerifyRecoveryOtp} style={[styles.primaryBtn, { marginTop: 18 }]}>
                <Text style={styles.primaryBtnText}>Verify & Create New PIN →</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
                <TouchableOpacity onPress={handleResendRecoveryOtp}>
                  <Text style={{ fontSize: 13, color: '#075c49', fontWeight: '700' }}>↺ Resend Code</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAuthFlow('login')}>
                  <Text style={{ fontSize: 13, color: '#d9383a' }}>Cancel Recovery</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 11: FORGOT PIN (STEP 3: NEW PIN)
    // -------------------------------------------------------------
    if (authFlow === 'forgot_pin') {
      return (
        <SafeAreaView style={styles.authContainer}>
          <StatusBar style="light" />

          <View style={styles.authHeader}>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }}>CREDENTIAL REPLACEMENT</Text>
              <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>Create New PIN</Text>
            </View>
          </View>

          <View style={styles.authCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.authScroll}>
              <Text style={{ fontSize: 13, color: '#6c7873', marginBottom: 16 }}>
                Set a replacement 4-digit PIN for your account. Your wallet balances, transaction records and approved roles will be preserved.
              </Text>

              <Text style={styles.inputLabel}>Enter New 4-Digit PIN</Text>
              <TextInput
                style={[styles.textInput, { fontSize: 24, letterSpacing: 8, fontWeight: '800', textAlign: 'center' }]}
                value={recoveryNewPin}
                onChangeText={setRecoveryNewPin}
                placeholder="••••"
                placeholderTextColor="#6c7873"
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Confirm New PIN</Text>
              <TextInput
                style={[styles.textInput, { fontSize: 24, letterSpacing: 8, fontWeight: '800', textAlign: 'center' }]}
                value={recoveryConfirmPin}
                onChangeText={setRecoveryConfirmPin}
                placeholder="••••"
                placeholderTextColor="#6c7873"
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />

              <TouchableOpacity onPress={handleResetPinSubmit} style={[styles.primaryBtn, { marginTop: 20 }]}>
                <Text style={styles.primaryBtnText}>Confirm Replacement PIN</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 12: FORGOT PIN (STEP 4: SUCCESS)
    // -------------------------------------------------------------
    if (authFlow === 'forgot_success') {
      return (
        <SafeAreaView style={[styles.authContainer, { backgroundColor: '#075c49', justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
          <StatusBar style="light" />

          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 28, width: '100%', alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#d7f06f', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Feather name="shield" size={32} color="#075c49" />
            </View>

            <Text style={{ fontSize: 22, fontWeight: '900', color: '#17231f', textAlign: 'center' }}>
              PIN Reset Successful!
            </Text>
            <Text style={{ fontSize: 13, color: '#6c7873', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Your new PIN is now active. Your previous PIN no longer works. All account balances, approved roles and transaction histories have been preserved.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setLoginPin('');
                setAuthFlow('login');
              }}
              style={[styles.primaryBtn, { width: '100%', marginTop: 24 }]}
            >
              <Text style={styles.primaryBtnText}>Return to Login →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    // -------------------------------------------------------------
    // SCREEN 13: SESSION UNLOCK (RETURNING SIGNED-IN USER)
    // -------------------------------------------------------------
    if (authFlow === 'session_locked') {
      return (
        <SafeAreaView style={[styles.authContainer, { backgroundColor: '#075c49', justifyContent: 'space-between', padding: 24 }]}>
          <StatusBar style="light" />

          {/* Top Info */}
          <View style={{ paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 16 : 24, alignItems: 'center' }}>
            <View style={styles.splashLogoBadge}>
              <Text style={styles.splashSlash}>//</Text>
              <Text style={styles.splashLogoText}>pulapay</Text>
            </View>
            <View style={{ backgroundColor: '#13725b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
              <Text style={{ color: '#d7f06f', fontSize: 11, fontWeight: '700' }}>SESSION LOCKED</Text>
            </View>
          </View>

          {/* Center User Card */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#075c49', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#d7f06f', fontSize: 20, fontWeight: '900' }}>{currentUser?.initials || 'PP'}</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#17231f' }}>{currentUser?.name || 'PulaPay User'}</Text>
            <Text style={{ fontSize: 12, color: '#6c7873', marginTop: 2 }}>{currentUser?.phone || '+267 71 234 567'}</Text>

            <Text style={[styles.inputLabel, { marginTop: 20, alignSelf: 'flex-start' }]}>Enter PIN to Unlock</Text>
            <TextInput
              style={[styles.textInput, { fontSize: 26, letterSpacing: 10, fontWeight: '900', textAlign: 'center', width: '100%' }]}
              value={unlockPin}
              onChangeText={setUnlockPin}
              placeholder="••••"
              placeholderTextColor="#6c7873"
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />

            <TouchableOpacity onPress={handleUnlockSessionSubmit} style={[styles.primaryBtn, { width: '100%', marginTop: 16 }]}>
              <Text style={styles.primaryBtnText}>Unlock Wallet →</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16 }}>
              <TouchableOpacity onPress={() => { setRecoveryPhone(currentUser?.phone || ''); setAuthFlow('forgot_phone'); }}>
                <Text style={{ fontSize: 13, color: '#075c49', fontWeight: '700' }}>Forgot PIN?</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmLogout}>
                <Text style={{ fontSize: 13, color: '#d9383a', fontWeight: '700' }}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ alignItems: 'center', paddingBottom: 12 }}>
            <Text style={{ color: '#d0dfd8', fontSize: 12 }}>Protected by secure local hardware encryption</Text>
          </View>
        </SafeAreaView>
      );
    }
  }


  // ==========================================
  // VIEW 3: AUTHENTICATED WALLET DASHBOARD
  // Strict Role-Based Dashboard View
  // ==========================================
  const activeBal = getActiveBalance();
  const activeWalletId = getActiveWalletId();

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar style="dark" />


      {/* Header (Greeting & Strictly Controlled Header Pill) */}
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.greetingText}>Good day,</Text>
          <Text style={styles.userNameText}>{currentUser?.name || 'AutoBots'}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Unified Mode Switcher Bar */}
          <View style={styles.modeSwitcherBar}>
            <TouchableOpacity
              onPress={() => handleSwitchMode('personal')}
              style={[styles.modeTab, activeMode === 'personal' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, activeMode === 'personal' && styles.modeTabTextActive]}>Personal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSwitchMode('agent')}
              style={[styles.modeTab, activeMode === 'agent' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, activeMode === 'agent' && styles.modeTabTextActive]}>Agent</Text>
              {currentUser?.capabilities?.agent !== 'approved' && (
                <Feather name="lock" size={10} color={activeMode === 'agent' ? '#075c49' : '#6c7873'} style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSwitchMode('driver')}
              style={[styles.modeTab, activeMode === 'driver' && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, activeMode === 'driver' && styles.modeTabTextActive]}>Driver</Text>
              {currentUser?.capabilities?.driver !== 'approved' && (
                <Feather name="lock" size={10} color={activeMode === 'driver' ? '#075c49' : '#6c7873'} style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>
          </View>

          {/* Notification bell (USSD Simulator) */}
          <TouchableOpacity
            onPress={() => {
              setUssdStep('dial');
              setActiveModal('ussd');
            }}
            style={styles.bellBtn}
          >
            <Feather name="bell" size={16} color="#17231f" />
            <View style={styles.orangeDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ========================================= */}
        {/* TAB 1: HOME (Role-Dependent Dashboard)    */}
        {/* ========================================= */}
        {activeTab === 'home' && (
          <>
            {/* Signature PulaPay Balance Card (Reflects Active Operating Mode) */}
            <View style={styles.balanceCard}>
              <View style={styles.cardCurveDecoration} />

              <View style={styles.balanceCardTop}>
                <Text style={styles.balanceLabel}>
                  {activeMode === 'personal'
                    ? 'Available personal balance'
                    : activeMode === 'agent'
                    ? 'Operational digital float'
                    : "Today's fare collections"}
                </Text>
                <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeToggleBtn}>
                  <Feather name={showBalance ? 'eye' : 'eye-off'} size={18} color="#d7f06f" />
                </TouchableOpacity>
              </View>

              <Text style={styles.balanceAmountText}>
                {showBalance
                  ? '••••••••'
                  : `P ${getActiveBalance().toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </Text>

              {/* Secondary Balance Stats for Agent & Driver */}
              {activeMode === 'agent' && (
                <View style={styles.secondaryStatsRow}>
                  <Text style={styles.secondaryStatText}>
                    Cash drawer: P {(currentUser?.agentCashDrawer || 3500).toFixed(2)}
                  </Text>
                  <Text style={styles.secondaryStatDivider}>|</Text>
                  <Text style={styles.secondaryStatText}>
                    Commission: P {(currentUser?.agentCommissionBalance || 185).toFixed(2)}
                  </Text>
                </View>
              )}

              {activeMode === 'driver' && (
                <View style={styles.secondaryStatsRow}>
                  <Text style={styles.secondaryStatText}>
                    Active fare: P {(driverCurrentFare || 7).toFixed(2)}
                  </Text>
                  <Text style={styles.secondaryStatDivider}>|</Text>
                  <Text style={styles.secondaryStatText}>
                    {driverTripCounter} passengers
                  </Text>
                </View>
              )}

              <View style={styles.walletIdRow}>
                <Text style={styles.walletIdLabel}>
                  {activeMode === 'personal'
                    ? 'PERSONAL WALLET ID'
                    : activeMode === 'agent'
                    ? 'AGENT OPERATIONAL TILL'
                    : `DRIVER #${currentUser?.driverPermanentId || '12344'}`}
                </Text>
                <Text style={styles.walletIdCode}>{getActiveWalletId()}</Text>
              </View>
            </View>

            {/* Quick Actions Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeMode === 'personal'
                  ? 'Personal actions'
                  : activeMode === 'agent'
                  ? 'Agent operations'
                  : 'Transit collections'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setMyServicesTarget('agent');
                  setActiveModal('my_services');
                }}
              >
                <Text style={styles.sectionRoleTag}>My Services ⚙</Text>
              </TouchableOpacity>
            </View>

            {/* 1. PERSONAL MODE QUICK ACTIONS */}
            {activeMode === 'personal' && (
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity onPress={() => setActiveModal('deposit')} style={styles.actionBtn}>
                  <View style={styles.actionIconBox}>
                    <Feather name="plus" size={24} color="#17231f" />
                  </View>
                  <Text style={styles.actionLabel}>Deposit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveModal('send')} style={styles.actionBtn}>
                  <View style={styles.actionIconBox}>
                    <Feather name="send" size={20} color="#17231f" style={{ transform: [{ rotate: '-15deg' }] }} />
                  </View>
                  <Text style={styles.actionLabel}>Send</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveModal('pay')} style={styles.actionBtn}>
                  <View style={styles.actionIconBox}>
                    <MaterialCommunityIcons name="view-grid-plus-outline" size={22} color="#17231f" />
                  </View>
                  <Text style={styles.actionLabel}>Pay</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveModal('withdraw')} style={styles.actionBtn}>
                  <View style={styles.actionIconBox}>
                    <Feather name="download" size={20} color="#17231f" />
                  </View>
                  <Text style={styles.actionLabel}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 2. AGENT MODE QUICK ACTIONS (Cash-In, Cash-Out, Float Management) */}
            {activeMode === 'agent' && (
              <View style={styles.agentGrid}>
                <TouchableOpacity onPress={() => setActiveModal('agent_cashin')} style={styles.agentBtn}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#075c49' }]}>
                    <Feather name="arrow-down-left" size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.actionLabel}>Cash-In</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveModal('agent_cashout')} style={styles.agentBtn}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#075c49' }]}>
                    <Feather name="arrow-up-right" size={22} color="#ffffff" />
                  </View>
                  <Text style={styles.actionLabel}>Cash-Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    alert(`Operational Float Details:\n• Digital Float: P ${(currentUser?.agentFloatBalance || 15400).toFixed(2)}\n• Cash in Drawer: P ${(currentUser?.agentCashDrawer || 3500).toFixed(2)}\n• Commission Earned: P ${(currentUser?.agentCommissionBalance || 185).toFixed(2)}`);
                  }}
                  style={styles.agentBtn}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#d7f06f' }]}>
                    <Feather name="pie-chart" size={22} color="#075c49" />
                  </View>
                  <Text style={styles.actionLabel}>My Float</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. DRIVER MODE QUICK ACTIONS (Fast Combi Transit Flows) */}
            {activeMode === 'driver' && (
              <View style={styles.driverActionsGrid}>
                <TouchableOpacity onPress={() => setActiveModal('driver_fare')} style={styles.largeCardBtn}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#075c49' }]}>
                    <MaterialCommunityIcons name="qrcode-scan" size={22} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.largeCardTitle}>Receive Fare</Text>
                    <Text style={styles.largeCardDesc}>Show QR: P {(driverCurrentFare || 7).toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDriverReuseFare} style={[styles.largeCardBtn, { borderColor: '#075c49', borderWidth: 2 }]}>
                  <View style={[styles.actionIconBox, { backgroundColor: '#d7f06f' }]}>
                    <Feather name="repeat" size={22} color="#075c49" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.largeCardTitle, { color: '#075c49' }]}>Reuse Fare</Text>
                    <Text style={styles.largeCardDesc}>Next passenger (P {driverCurrentFare})</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Recent Activity (Filtered strictly by user and scope) */}
            <View style={[styles.sectionHeader, { marginTop: 18 }]}>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              <TouchableOpacity onPress={() => setActiveTab('activity')}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>

            {activeTransactions.slice(0, 3).map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => {
                  setLastTxn(t);
                  setActiveModal('receipt');
                }}
                style={styles.transactionCard}
              >
                <View style={styles.txLeft}>
                  <View style={styles.orangeIconSquare}>
                    <Feather name="send" size={15} color="#d9531e" style={{ transform: [{ rotate: '-15deg' }] }} />
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{t.counterparty}</Text>
                    <Text style={styles.txSubtitle}>{t.description}</Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, t.direction === 'credit' && styles.creditAmount]}>
                  {t.direction === 'credit' ? '+' : '-'} P {t.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}

            {activeTransactions.length === 0 && (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateText}>No recorded transactions yet for this wallet.</Text>
              </View>
            )}

            {/* Physical Card Banner (Matching Screenshot 1) */}
            <TouchableOpacity onPress={() => setActiveModal('card')} style={styles.physicalCardBanner}>
              <View style={styles.bannerLeft}>
                <View style={styles.bannerIconSquare}>
                  <Ionicons name="card" size={20} color="#075c49" />
                </View>
                <View>
                  <Text style={styles.bannerTitle}>PulaPay physical card</Text>
                  <Text style={styles.bannerSubtitle}>Pay securely even without a smartphone.</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#075c49" />
            </TouchableOpacity>
          </>
        )}

        {/* ========================================= */}
        {/* TAB 2: ACTIVITY (Matching Screenshot 2)   */}
        {/* ========================================= */}
        {activeTab === 'activity' && (
          <View style={styles.activityContainer}>
            <Text style={styles.pageTitle}>Activity</Text>
            <Text style={styles.pageSubtitle}>A secure record of every wallet movement.</Text>

            {/* Filter Pills (All / Credit / Debit) */}
            <View style={styles.filterPillsRow}>
              {(['all', 'credit', 'debit'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActivityFilter(filter)}
                  style={[styles.filterPill, activityFilter === filter && styles.filterPillActive]}
                >
                  <Text style={[styles.filterPillText, activityFilter === filter && styles.filterPillTextActive]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredTransactions.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => {
                  setLastTxn(t);
                  setActiveModal('receipt');
                }}
                style={styles.transactionCard}
              >
                <View style={styles.txLeft}>
                  <View style={styles.orangeIconSquare}>
                    <Feather name="send" size={15} color="#d9531e" style={{ transform: [{ rotate: '-15deg' }] }} />
                  </View>
                  <View>
                    <Text style={styles.txTitle}>{t.counterparty}</Text>
                    <Text style={styles.txSubtitle}>{t.description}</Text>
                  </View>
                </View>
                <Text style={[styles.txAmount, t.direction === 'credit' && styles.creditAmount]}>
                  {t.direction === 'credit' ? '+' : '-'} P {t.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}

            {filteredTransactions.length === 0 && (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateText}>No activity found for this filter.</Text>
              </View>
            )}
          </View>
        )}

        {/* ========================================= */}
        {/* TAB 3: PROFILE (Matching Screenshot 3)    */}
        {/* ========================================= */}
        {activeTab === 'profile' && (
          <View style={styles.profileContainer}>
            <Text style={styles.pageTitle}>Profile</Text>

            {/* User Profile Summary Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarInitials}>{currentUser?.initials || 'AD'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{currentUser?.name || 'AutoBots Dev'}</Text>
                <Text style={styles.profileContact}>
                  {currentUser?.phone || '71458185'} • {currentUser?.email || 'autobotsdev49@gmail.com'}
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{currentUser?.statusBadge || 'Account active'}</Text>
                </View>
              </View>
            </View>

            {/* Menu List */}
            <View style={styles.profileMenuCard}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Feather name="user" size={17} color="#17231f" />
                  <Text style={styles.menuItemText}>Personal information</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6c7873" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setActiveModal('card')} style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="card-outline" size={17} color="#17231f" />
                  <Text style={styles.menuItemText}>Linked cards</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6c7873" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Feather name="shield" size={17} color="#17231f" />
                  <Text style={styles.menuItemText}>Security & PIN</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6c7873" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  alert(`Authorized Role: ${currentUser?.role.toUpperCase()}\nWallet ID: ${currentUser?.personalWalletId}`);
                }}
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
              >
                <View style={styles.menuItemLeft}>
                  <Feather name="more-horizontal" size={17} color="#17231f" />
                  <Text style={styles.menuItemText}>Account settings</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#6c7873" />
              </TouchableOpacity>
            </View>

            {/* My Services Section */}
            <TouchableOpacity
              onPress={() => setActiveModal('my_services')}
              style={[styles.profileMenuCard, { padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#d7f06f', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Feather name="briefcase" size={18} color="#075c49" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#17231f' }}>My Services</Text>
                <Text style={{ fontSize: 12, color: '#6c7873', marginTop: 2 }}>
                  Agent: {currentUser?.capabilities?.agent === 'approved' ? 'Approved' : currentUser?.capabilities?.agent === 'pending' ? 'Pending' : 'Not applied'} {'  |  '}
                  Driver: {currentUser?.capabilities?.driver === 'approved' ? 'Approved' : currentUser?.capabilities?.driver === 'pending' ? 'Pending' : 'Not applied'}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#6c7873" />
            </TouchableOpacity>

            {/* Red Log Out Action Button */}
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Feather name="log-out" size={16} color="#d9383a" />
              <Text style={styles.logoutBtnText}>Log out</Text>
            </TouchableOpacity>

            <Text style={styles.versionFooter}>PulaPay prototype • Version 1.0</Text>
          </View>
        )}
      </ScrollView>

      {/* 3-Tab Bottom Navigation Bar (Home, Activity, Profile) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setActiveTab('home')} style={styles.navItem}>
          <Feather name="home" size={20} color={activeTab === 'home' ? '#075c49' : '#6c7873'} />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('activity')} style={styles.navItem}>
          <Feather name="clock" size={20} color={activeTab === 'activity' ? '#075c49' : '#6c7873'} />
          <Text style={[styles.navText, activeTab === 'activity' && styles.navTextActive]}>Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('profile')} style={styles.navItem}>
          <Feather name="user" size={20} color={activeTab === 'profile' ? '#075c49' : '#6c7873'} />
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ========================================== */}
      {/* MODAL 1: PHYSICAL CARD (QR & BARCODE)      */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'card'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>PulaPay Physical Card</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardGraphic}>
              <View style={styles.cardGraphicTop}>
                <Text style={styles.cardBrand}>pulapay</Text>
                <Text style={styles.cardType}>PHYSICAL WALLET</Text>
              </View>

              <View style={styles.cardGraphicCenter}>
                <View style={styles.barcodeBox}>
                  <View style={styles.barcodeLines}>
                    {[4, 2, 6, 2, 5, 3, 2, 4, 3, 5, 2, 4, 6, 3, 2, 5].map((w, i) => (
                      <View key={i} style={[styles.barLine, { width: w }]} />
                    ))}
                  </View>
                  <Text style={styles.barcodeText}>{activeWalletId}</Text>
                </View>

                <View style={styles.qrBox}>
                  <Ionicons name="qr-code" size={56} color="#075c49" />
                </View>
              </View>

              <View style={styles.cardGraphicBottom}>
                <Text style={styles.cardSubText}>{currentUser?.name || 'Katlego Molefe'}</Text>
                <Text style={styles.cardSubText}>Botswana Pula (BWP)</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setCardBlocked(!cardBlocked);
                alert(cardBlocked ? 'Physical card unblocked successfully.' : 'Physical card blocked.');
              }}
              style={[styles.blockCardBtn, cardBlocked && styles.unblockCardBtn]}
            >
              <Text style={[styles.blockCardText, cardBlocked && styles.unblockCardText]}>
                {cardBlocked ? 'Unblock Physical Card' : 'Freeze / Block Physical Card'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 2: USSD SIMULATOR (*120#)            */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'ussd'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.sheetContainer, styles.ussdDialog]}>
            <View style={styles.ussdHeader}>
              <Text style={styles.ussdTitle}>PulaPay USSD (*120#)</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.ussdScreen}>
              {ussdStep === 'dial' && (
                <Text style={styles.ussdScreenText}>
                  Welcome to PulaPay Mobile{"\n"}
                  1. Check Balance{"\n"}
                  2. Send Money{"\n"}
                  3. Pay Merchant{"\n"}
                  4. Exit
                </Text>
              )}
              {
              ussdStep === 'balance' && (
                <Text style={styles.ussdScreenText}>
                  {`PulaPay Balance:\nP ${activeBal.toFixed(2)}\nWallet: ${activeWalletId}\n\n0. Back`}
                </Text>
              )}
              {ussdStep === 'send_phone' && (
                <Text style={styles.ussdScreenText}>Enter Recipient Mobile Number: (e.g. 71234567)</Text>
              )}
              {ussdStep === 'send_amt' && (
                <Text style={styles.ussdScreenText}>Enter Amount in Pula (BWP):</Text>
              )}
              {
              ussdStep === 'done' && (
                <Text style={styles.ussdScreenText}>
                  {`USSD Transaction Completed!\nRef: USSD-${Math.floor(100000 + Math.random() * 900000)}\n\nThank you.`}
                </Text>
              )}
            </View>

            <View style={styles.ussdInputRow}>
              <TextInput
                style={styles.ussdInput}
                value={ussdInput}
                onChangeText={setUssdInput}
                placeholder="Enter choice..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numeric"
              />
              <TouchableOpacity
                onPress={() => {
                  if (ussdStep === 'dial') {
                    if (ussdInput === '1') setUssdStep('balance');
                    else if (ussdInput === '2') setUssdStep('send_phone');
                    else if (ussdInput === '4') setActiveModal(null);
                  } else if (ussdStep === 'balance') {
                    setUssdStep('dial');
                  } else if (ussdStep === 'send_phone') {
                    setUssdStep('send_amt');
                  } else if (ussdStep === 'send_amt') {
                    const amt = parseFloat(ussdInput);
                    if (!isNaN(amt) && amt > 0) {
                      executeTransaction('ussd_send', 'debit', 'USSD Transfer');
                    }
                    setUssdStep('done');
                  } else if (ussdStep === 'done') {
                    setActiveModal(null);
                  }
                  setUssdInput('');
                }}
                style={styles.ussdSendBtn}
              >
                <Text style={styles.ussdSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 3: DEPOSIT                           */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'deposit'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Deposit Funds</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            {/* Deposit Tab Switcher */}
            <View style={{ flexDirection: 'row', backgroundColor: '#e8f0ec', borderRadius: 8, padding: 3, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setDepositTab('provider')}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: depositTab === 'provider' ? '#075c49' : 'transparent', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: depositTab === 'provider' ? '#d7f06f' : '#6c7873' }}>Mobile Money / Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDepositTab('agent')}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: depositTab === 'agent' ? '#075c49' : 'transparent', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: depositTab === 'agent' ? '#d7f06f' : '#6c7873' }}>Through Agent</Text>
              </TouchableOpacity>
            </View>

            {depositTab === 'provider' && (
              <>
                <Text style={styles.inputLabel}>Deposit Method</Text>
                <View style={styles.providerRow}>
                  {[
                    { id: 'bank', label: 'EFT Bank Transfer' },
                    { id: 'momo', label: 'Orange / Mascom' },
                    { id: 'card', label: 'Visa / Mastercard' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelectedProvider(p.id as any)}
                      style={[styles.providerBtn, selectedProvider === p.id && styles.providerBtnActive]}
                    >
                      <Text style={[styles.providerText, selectedProvider === p.id && styles.providerTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Amount in Botswana Pula (P)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={inputAmount}
                  onChangeText={setInputAmount}
                  placeholder="P 0.00"
                  placeholderTextColor="#6c7873"
                  keyboardType="numeric"
                />

                <View style={styles.amountPresets}>
                  {['50', '100', '200', '500'].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setInputAmount(amt)}
                      style={styles.presetBtn}
                    >
                      <Text style={styles.presetText}>+P {amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => executeTransaction('deposit', 'credit', `${selectedProvider.toUpperCase()} Top-Up`)}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>Confirm Deposit</Text>
                </TouchableOpacity>
              </>
            )}

            {depositTab === 'agent' && (
              <View>
                <View style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#075c49', marginBottom: 4 }}>How to deposit via agent:</Text>
                  <Text style={{ fontSize: 13, color: '#17231f', lineHeight: 20 }}>
                    1. Visit any PulaPay agent near you{'\n'}
                    2. Tell the agent your Wallet ID below{'\n'}
                    3. Hand the agent your cash{'\n'}
                    4. Agent confirms the deposit — funds appear instantly
                  </Text>
                </View>
                <Text style={styles.inputLabel}>Your Wallet ID</Text>
                <View style={{ backgroundColor: '#f4f7f5', borderRadius: 8, padding: 14, marginBottom: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#075c49', letterSpacing: 2, textAlign: 'center' }}>
                    {currentUser?.personalWalletId || 'PLP-XXXX-XXXX'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#6c7873', textAlign: 'center', marginBottom: 16 }}>
                  Show this ID to the agent. No cash changes hands without agent confirmation.
                </Text>
                <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 4: SEND MONEY                        */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'send'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => { setActiveModal(null); setAgentCustomerName(''); setInputCounterparty(''); setInputAmount(''); setInputNote(''); }} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Step 1 — Find Recipient</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={inputCounterparty}
                onChangeText={(t) => { setInputCounterparty(t); setAgentCustomerName(''); }}
                placeholder="Phone, Wallet ID or email"
                placeholderTextColor="#6c7873"
              />
              <TouchableOpacity
                onPress={() => {
                  const name = getVerifiedRecipientName(inputCounterparty);
                  setAgentCustomerName(name || '__not_found__');
                }}
                style={[styles.primaryBtn, { flex: 0, paddingHorizontal: 14, marginTop: 0 }]}
              >
                <Text style={styles.primaryBtnText}>Find</Text>
              </TouchableOpacity>
            </View>

            {agentCustomerName === '__not_found__' && (
              <View style={{ backgroundColor: '#fdf0f0', borderRadius: 8, padding: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="alert-circle" size={15} color="#c0392b" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#c0392b', flex: 1 }}>Recipient not found. Check the number or wallet ID and try again.</Text>
              </View>
            )}

            {agentCustomerName !== '' && agentCustomerName !== '__not_found__' && (
              <View style={{ backgroundColor: '#f0fdf4', borderRadius: 8, padding: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Feather name="user-check" size={15} color="#075c49" />
                <View>
                  <Text style={{ fontSize: 11, color: '#6c7873' }}>Sending to</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#075c49' }}>{agentCustomerName}</Text>
                </View>
              </View>
            )}

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Step 2 — Amount (Pula)</Text>
            <TextInput
              style={styles.amountInput}
              value={inputAmount}
              onChangeText={setInputAmount}
              placeholder="P 0.00"
              placeholderTextColor="#6c7873"
              keyboardType="numeric"
            />

            <View style={styles.amountPresets}>
              {['20', '50', '100', '200'].map((amt) => (
                <TouchableOpacity key={amt} onPress={() => setInputAmount(amt)} style={styles.presetBtn}>
                  <Text style={styles.presetText}>P {amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Note / Reference (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={inputNote}
              onChangeText={setInputNote}
              placeholder="Lunch, Groceries, Transport..."
              placeholderTextColor="#6c7873"
            />

            <TouchableOpacity
              onPress={() => executeTransaction('send', 'debit', agentCustomerName || inputCounterparty || 'PulaPay User')}
              style={[styles.primaryBtn, { opacity: (agentCustomerName && agentCustomerName !== '__not_found__' && parseFloat(inputAmount) > 0) ? 1 : 0.4 }]}
              disabled={!agentCustomerName || agentCustomerName === '__not_found__' || !(parseFloat(inputAmount) > 0)}
            >
              <Text style={styles.primaryBtnText}>Confirm Send →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 5: PAY WITH PAYMENT CODE             */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'pay'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pay</Text>
              <TouchableOpacity onPress={() => { setActiveModal(null); setInputCounterparty(''); setInputAmount(''); setAgentCustomerName(''); }} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Step 1 — Scan QR or Enter Code</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.textInput, { flex: 1, fontSize: 20, textAlign: 'center', letterSpacing: 6, fontWeight: '800' }]}
                value={inputCounterparty}
                onChangeText={(t) => { setInputCounterparty(t); setAgentCustomerName(''); setInputAmount(''); }}
                placeholder="e.g. 5842"
                placeholderTextColor="#6c7873"
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity
                onPress={() => {
                  const code = inputCounterparty.trim();
                  if (!code) return;
                  // Anti-replay check (CTO Finding 3)
                  if (settledRequests.includes(code) || settledRequests.includes(`REQ-${code}`)) {
                    alert(`[DUPLICATE PAYMENT REJECTED]\n\nPayment code '${code}' has already been paid and cannot be reused.\nPlease request a fresh QR / code from the driver or merchant.`);
                    setAgentCustomerName('__settled_duplicate__');
                    return;
                  }
                  if (code === driverNonceCode || code.length === 4) {
                    setAgentCustomerName('Driver Payment (Route 3 Combi)');
                    if (!inputAmount) setInputAmount(String(driverCurrentFare));
                  } else {
                    setAgentCustomerName('Merchant Payment');
                  }
                }}
                style={[styles.primaryBtn, { flex: 0, paddingHorizontal: 14, marginTop: 0 }]}
              >
                <Text style={styles.primaryBtnText}>Look Up</Text>
              </TouchableOpacity>
            </View>

            {/* QR Scan placeholder */}
            <TouchableOpacity style={{ backgroundColor: '#f4f7f5', borderRadius: 10, padding: 18, alignItems: 'center', marginTop: 10, marginBottom: 4, flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
              <Feather name="camera" size={20} color="#075c49" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#075c49' }}>Scan QR Code</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 11, color: '#6c7873', textAlign: 'center', marginBottom: 14 }}>or enter the code manually above</Text>

            {/* Resolved payee confirmation */}
            {agentCustomerName !== '' && (
              <View style={{ backgroundColor: '#f0fdf4', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <Text style={{ fontSize: 11, color: '#6c7873', marginBottom: 4 }}>Step 2 — Confirm Payment Details</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#075c49', alignItems: 'center', justifyContent: 'center' }}>
                      <Feather name={agentCustomerName === 'Driver Payment' ? 'truck' : 'shopping-bag'} size={16} color="#d7f06f" />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#17231f' }}>{agentCustomerName}</Text>
                      <Text style={{ fontSize: 11, color: '#6c7873' }}>Code: {inputCounterparty}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: '#075c49' }}>P {parseFloat(inputAmount || '0').toFixed(2)}</Text>
                </View>
              </View>
            )}

            {/* Amount (editable if not auto-filled) */}
            <Text style={styles.inputLabel}>Amount (Pula)</Text>
            <TextInput
              style={styles.amountInput}
              value={inputAmount}
              onChangeText={setInputAmount}
              placeholder="P 0.00"
              placeholderTextColor="#6c7873"
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={() => executeTransaction('pay', 'debit', agentCustomerName || `Code #${inputCounterparty || '0000'}`)}
              style={[styles.primaryBtn, { opacity: (agentCustomerName !== '' && parseFloat(inputAmount) > 0) ? 1 : 0.4 }]}
              disabled={agentCustomerName === '' || !(parseFloat(inputAmount) > 0)}
            >
              <Text style={styles.primaryBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 6: WITHDRAW                          */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'withdraw'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Withdraw Cash</Text>
              <TouchableOpacity onPress={() => { setActiveModal(null); setDepositTab('provider'); setInputAmount(''); setAgentWithdrawOtp(''); }} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            {/* Tab Switcher — reuse depositTab state for withdraw path */}
            <View style={{ flexDirection: 'row', backgroundColor: '#e8f0ec', borderRadius: 8, padding: 3, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setDepositTab('provider')}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: depositTab === 'provider' ? '#075c49' : 'transparent', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: depositTab === 'provider' ? '#d7f06f' : '#6c7873' }}>External Provider</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDepositTab('agent')}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: depositTab === 'agent' ? '#075c49' : 'transparent', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: depositTab === 'agent' ? '#d7f06f' : '#6c7873' }}>Through Agent</Text>
              </TouchableOpacity>
            </View>

            {/* PATH A: External Provider */}
            {depositTab === 'provider' && (
              <>
                <Text style={styles.inputLabel}>Payout Destination</Text>
                <View style={styles.providerRow}>
                  {[
                    { id: 'momo', label: 'Orange / Mascom' },
                    { id: 'bank', label: 'Bank Account' },
                  ].map((dest) => (
                    <TouchableOpacity
                      key={dest.id}
                      onPress={() => setSelectedProvider(dest.id as any)}
                      style={[styles.providerBtn, selectedProvider === dest.id && styles.providerBtnActive]}
                    >
                      <Text style={[styles.providerText, selectedProvider === dest.id && styles.providerTextActive]}>{dest.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Amount in Pula</Text>
                <TextInput
                  style={styles.amountInput}
                  value={inputAmount}
                  onChangeText={setInputAmount}
                  placeholder="P 0.00"
                  placeholderTextColor="#6c7873"
                  keyboardType="numeric"
                />
                <View style={styles.amountPresets}>
                  {['50', '100', '200', '500'].map((amt) => (
                    <TouchableOpacity key={amt} onPress={() => setInputAmount(amt)} style={styles.presetBtn}>
                      <Text style={styles.presetText}>P {amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => executeTransaction('withdraw', 'debit', `${selectedProvider.toUpperCase()} Payout`)}
                  style={[styles.primaryBtn, { opacity: parseFloat(inputAmount) > 0 ? 1 : 0.4 }]}
                  disabled={!(parseFloat(inputAmount) > 0)}
                >
                  <Text style={styles.primaryBtnText}>Request Payout</Text>
                </TouchableOpacity>
              </>
            )}

            {/* PATH B: Through Agent — generates a withdrawal reference code */}
            {depositTab === 'agent' && (
              <>
                <Text style={styles.inputLabel}>Step 1 — Withdrawal Amount</Text>
                <TextInput
                  style={styles.amountInput}
                  value={inputAmount}
                  onChangeText={(t) => { setInputAmount(t); setAgentWithdrawOtp(''); }}
                  placeholder="P 0.00"
                  placeholderTextColor="#6c7873"
                  keyboardType="numeric"
                />
                <View style={styles.amountPresets}>
                  {['50', '100', '200', '500'].map((amt) => (
                    <TouchableOpacity key={amt} onPress={() => { setInputAmount(amt); setAgentWithdrawOtp(''); }} style={styles.presetBtn}>
                      <Text style={styles.presetText}>P {amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Generate code button */}
                {agentWithdrawOtp === '' && (
                  <TouchableOpacity
                    onPress={() => {
                      if (parseFloat(inputAmount) <= 0) { return; }
                      const code = String(Math.floor(1000 + Math.random() * 9000));
                      setAgentWithdrawOtp(code);
                    }}
                    style={[styles.secondaryBtn, { marginTop: 14, opacity: parseFloat(inputAmount) > 0 ? 1 : 0.4 }]}
                    disabled={!(parseFloat(inputAmount) > 0)}
                  >
                    <Text style={styles.secondaryBtnText}>Generate Withdrawal Code</Text>
                  </TouchableOpacity>
                )}

                {/* Show generated code */}
                {agentWithdrawOtp !== '' && (
                  <>
                    <View style={{ backgroundColor: '#f0fdf4', borderRadius: 12, padding: 18, marginTop: 14, alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#6c7873', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Step 2 — Your Withdrawal Code</Text>
                      <Text style={{ fontSize: 42, fontWeight: '900', color: '#075c49', letterSpacing: 10 }}>{agentWithdrawOtp}</Text>
                      <Text style={{ fontSize: 12, color: '#6c7873', marginTop: 8, textAlign: 'center' }}>Show this code to the agent. The agent will scan or enter it to process your P {parseFloat(inputAmount).toFixed(2)} withdrawal.</Text>
                    </View>
                    <View style={{ backgroundColor: '#fff9e6', borderRadius: 8, padding: 10, marginTop: 10, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                      <Feather name="alert-triangle" size={14} color="#b45309" />
                      <Text style={{ fontSize: 12, color: '#b45309', flex: 1 }}>Only share this code with an authorized PulaPay agent. Funds will not leave your wallet until the agent confirms cash handover.</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => executeTransaction('withdraw', 'debit', `Agent Cash-Out (Code ${agentWithdrawOtp})`)}
                      style={styles.primaryBtn}
                    >
                      <Text style={styles.primaryBtnText}>Authorize Withdrawal</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 7: AGENT CASH-IN                     */}
      {/* ========================================== */}
      {/* ========================================== */}
      {/* MODAL: MY SERVICES                          */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'my_services'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.sheetContainer, { maxHeight: '85%' }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>My Services</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#6c7873', marginBottom: 16 }}>Apply for Agent or Driver capabilities. Your personal wallet is always active.</Text>

            {/* Agent Card */}
            <View style={{ backgroundColor: '#f4f7f5', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Feather name="briefcase" size={20} color="#075c49" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#17231f', marginLeft: 10 }}>Agent Mode</Text>
                <View style={{ marginLeft: 'auto', backgroundColor: currentUser?.capabilities?.agent === 'approved' ? '#d7f06f' : currentUser?.capabilities?.agent === 'pending' ? '#fef9c3' : '#e8f0ec', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: currentUser?.capabilities?.agent === 'approved' ? '#075c49' : '#6c7873', textTransform: 'uppercase' }}>
                    {currentUser?.capabilities?.agent === 'approved' ? 'Approved' : currentUser?.capabilities?.agent === 'pending' ? 'Pending' : 'Not Applied'}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: '#6c7873', marginBottom: 12 }}>Process customer deposits and withdrawals. Earn commission on each transaction. Manage your float balance.</Text>
              {currentUser?.capabilities?.agent === 'none' && (
                <TouchableOpacity
                  onPress={() => handleApplyCapability('agent')}
                  style={{ backgroundColor: '#075c49', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#d7f06f', fontWeight: '700', fontSize: 14 }}>Apply as Agent</Text>
                </TouchableOpacity>
              )}
              {currentUser?.capabilities?.agent === 'pending' && (
                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: '#fef9c3', padding: 8, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, color: '#854d0e', textAlign: 'center' }}>Application pending administrative verification.</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAdminApproveCapability('agent')}
                    style={{ backgroundColor: '#075c49', borderRadius: 8, paddingVertical: 9, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#d7f06f', fontWeight: '700', fontSize: 12 }}>[Simulate Admin Approval]</Text>
                  </TouchableOpacity>
                </View>
              )}
              {currentUser?.capabilities?.agent === 'approved' && (
                <TouchableOpacity
                  onPress={() => { setActiveModal(null); handleSwitchMode('agent'); }}
                  style={{ backgroundColor: '#d7f06f', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#075c49', fontWeight: '700', fontSize: 14 }}>Switch to Agent Mode →</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Driver Card */}
            <View style={{ backgroundColor: '#f4f7f5', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Feather name="truck" size={20} color="#075c49" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#17231f', marginLeft: 10 }}>Driver Mode</Text>
                <View style={{ marginLeft: 'auto', backgroundColor: currentUser?.capabilities?.driver === 'approved' ? '#d7f06f' : currentUser?.capabilities?.driver === 'pending' ? '#fef9c3' : '#e8f0ec', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: currentUser?.capabilities?.driver === 'approved' ? '#075c49' : '#6c7873', textTransform: 'uppercase' }}>
                    {currentUser?.capabilities?.driver === 'approved' ? 'Approved' : currentUser?.capabilities?.driver === 'pending' ? 'Pending' : 'Not Applied'}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: '#6c7873', marginBottom: 12 }}>Collect transport fares with QR codes and payment codes. Reuse fare for multiple passengers. Track daily earnings.</Text>
              {currentUser?.capabilities?.driver === 'none' && (
                <TouchableOpacity
                  onPress={() => handleApplyCapability('driver')}
                  style={{ backgroundColor: '#075c49', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#d7f06f', fontWeight: '700', fontSize: 14 }}>Apply as Driver</Text>
                </TouchableOpacity>
              )}
              {currentUser?.capabilities?.driver === 'pending' && (
                <View style={{ gap: 8 }}>
                  <View style={{ backgroundColor: '#fef9c3', padding: 8, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, color: '#854d0e', textAlign: 'center' }}>Application pending vehicle & license verification.</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAdminApproveCapability('driver')}
                    style={{ backgroundColor: '#075c49', borderRadius: 8, paddingVertical: 9, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#d7f06f', fontWeight: '700', fontSize: 12 }}>[Simulate Admin Approval]</Text>
                  </TouchableOpacity>
                </View>
              )}
              {currentUser?.capabilities?.driver === 'approved' && (
                <TouchableOpacity
                  onPress={() => { setActiveModal(null); handleSwitchMode('driver'); }}
                  style={{ backgroundColor: '#d7f06f', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                >
                  <Text style={{ color: '#075c49', fontWeight: '700', fontSize: 14 }}>Switch to Driver Mode →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === 'agent_cashin'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Agent Cash-In</Text>
              <TouchableOpacity onPress={() => { setActiveModal(null); setAgentCashReceivedChecked(false); setInputCounterparty(''); setInputAmount(''); setAgentCustomerName(''); }} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Step 1 — Look Up Customer</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={inputCounterparty}
                onChangeText={(t) => { setInputCounterparty(t); setAgentCustomerName(''); }}
                placeholder="Phone or Wallet ID"
                placeholderTextColor="#6c7873"
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                onPress={() => {
                  const name = getVerifiedRecipientName(inputCounterparty);
                  setAgentCustomerName(name || 'Customer not found');
                }}
                style={[styles.primaryBtn, { flex: 0, paddingHorizontal: 14, marginTop: 0 }]}
              >
                <Text style={styles.primaryBtnText}>Find</Text>
              </TouchableOpacity>
            </View>

            {agentCustomerName !== '' && (
              <View style={{ backgroundColor: agentCustomerName === 'Customer not found' ? '#fdf0f0' : '#f0fdf4', borderRadius: 8, padding: 10, marginTop: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: agentCustomerName === 'Customer not found' ? '#c0392b' : '#075c49' }}>
                  {agentCustomerName === 'Customer not found' ? '✗ ' : '✓ '}{agentCustomerName}
                </Text>
              </View>
            )}

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Step 2 — Cash Amount (Pula)</Text>
            <TextInput
              style={styles.amountInput}
              value={inputAmount}
              onChangeText={setInputAmount}
              placeholder="P 0.00"
              placeholderTextColor="#6c7873"
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={() => setAgentCashReceivedChecked(!agentCashReceivedChecked)}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: '#075c49', backgroundColor: agentCashReceivedChecked ? '#075c49' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {agentCashReceivedChecked && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={{ fontSize: 13, color: '#17231f', flex: 1 }}>I confirm I have received physical cash from the customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAgentCashIn()}
              style={[styles.primaryBtn, { marginTop: 16, opacity: (agentCashReceivedChecked && agentCustomerName && agentCustomerName !== 'Customer not found' && parseFloat(inputAmount) > 0) ? 1 : 0.4 }]}
              disabled={!agentCashReceivedChecked || !agentCustomerName || agentCustomerName === 'Customer not found' || !(parseFloat(inputAmount) > 0)}
            >
              <Text style={styles.primaryBtnText}>Complete Cash-In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 8: AGENT CASH-OUT                    */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'agent_cashout'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Agent Cash-Out</Text>
              <TouchableOpacity onPress={() => { setActiveModal(null); setAgentCashOutStage('validate'); setInputCounterparty(''); setInputAmount(''); setAgentCustomerName(''); setAgentWithdrawOtp(''); }} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            {agentCashOutStage === 'validate' ? (
              <>
                <Text style={styles.inputLabel}>Step 1 — Look Up Customer</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={inputCounterparty}
                    onChangeText={(t) => { setInputCounterparty(t); setAgentCustomerName(''); }}
                    placeholder="Phone or Wallet ID"
                    placeholderTextColor="#6c7873"
                    keyboardType="phone-pad"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      const name = getVerifiedRecipientName(inputCounterparty);
                      setAgentCustomerName(name || 'Customer not found');
                    }}
                    style={[styles.primaryBtn, { flex: 0, paddingHorizontal: 14, marginTop: 0 }]}
                  >
                    <Text style={styles.primaryBtnText}>Find</Text>
                  </TouchableOpacity>
                </View>

                {agentCustomerName !== '' && (
                  <View style={{ backgroundColor: agentCustomerName === 'Customer not found' ? '#fdf0f0' : '#f0fdf4', borderRadius: 8, padding: 10, marginTop: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: agentCustomerName === 'Customer not found' ? '#c0392b' : '#075c49' }}>
                      {agentCustomerName === 'Customer not found' ? '✗ ' : '✓ '}{agentCustomerName}
                    </Text>
                  </View>
                )}

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Step 2 — Withdrawal Amount (Pula)</Text>
                <TextInput
                  style={styles.amountInput}
                  value={inputAmount}
                  onChangeText={setInputAmount}
                  placeholder="P 0.00"
                  placeholderTextColor="#6c7873"
                  keyboardType="numeric"
                />

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Step 3 — Customer 4-Digit Auth Code</Text>
                <TextInput
                  style={[styles.textInput, { fontSize: 20, letterSpacing: 4, fontWeight: '700', textAlign: 'center' }]}
                  value={agentWithdrawOtp}
                  onChangeText={setAgentWithdrawOtp}
                  placeholder="e.g. 4821"
                  placeholderTextColor="#6c7873"
                  keyboardType="numeric"
                  maxLength={6}
                />

                <View style={{ backgroundColor: '#f4f7f5', borderRadius: 8, padding: 10, marginTop: 12 }}>
                  <Text style={{ fontSize: 12, color: '#6c7873' }}>
                    Cash Drawer Available: <Text style={{ fontWeight: '700', color: '#075c49' }}>P {(currentUser?.agentCashDrawer || 3000).toFixed(2)}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleAgentAuthorizeCashOut()}
                  style={[styles.primaryBtn, { marginTop: 16, opacity: (agentCustomerName && agentCustomerName !== 'Customer not found' && parseFloat(inputAmount) > 0 && agentWithdrawOtp.length >= 4) ? 1 : 0.4 }]}
                  disabled={!agentCustomerName || agentCustomerName === 'Customer not found' || !(parseFloat(inputAmount) > 0) || agentWithdrawOtp.length < 4}
                >
                  <Text style={styles.primaryBtnText}>Authorize Withdrawal →</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* Phase 2: Cash Handover Confirmation (CTO Finding 1) */
              <View>
                <View style={{ backgroundColor: '#fff9e6', borderRadius: 10, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#d97706' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#b45309', textTransform: 'uppercase', marginBottom: 4 }}>Digital Balances Posted</Text>
                  <Text style={{ fontSize: 13, color: '#17231f', lineHeight: 18 }}>
                    Customer wallet debited P {parseFloat(inputAmount || '0').toFixed(2)} and your digital float credited.
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#17231f', marginTop: 8 }}>
                    Now: Hand over P {parseFloat(inputAmount || '0').toFixed(2)} cash from your drawer to {agentCustomerName}.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleAgentConfirmHandover()}
                  style={[styles.primaryBtn, { marginBottom: 12 }]}
                >
                  <Text style={styles.primaryBtnText}>✓ Confirm Cash Handed Over (P {parseFloat(inputAmount || '0').toFixed(2)})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAgentHandoverDispute()}
                  style={[styles.secondaryBtn, { borderColor: '#d9383a' }]}
                >
                  <Text style={[styles.secondaryBtnText, { color: '#d9383a' }]}>⚠️ Cash Handover Issue / Dispute</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 9: DRIVER FARE CODE                  */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'driver_fare'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Driver Fare Station</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Set Fare Amount (Pula)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {[7, 8, 10, 15].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  onPress={() => setDriverCurrentFare(amt)}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: driverCurrentFare === amt ? '#075c49' : '#e8f0ec', alignItems: 'center' }}
                >
                  <Text style={{ fontWeight: '700', color: driverCurrentFare === amt ? '#d7f06f' : '#075c49' }}>P{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.fareCodeBox, { marginBottom: 12 }]}>
              <Text style={styles.fareCodeLabel}>REQUEST #{driverRequestId || '001'} — FARE CODE</Text>
              <Text style={styles.fareCodeNumbers}>{driverNonceCode || '0000'}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#075c49', marginTop: 4 }}>P {driverCurrentFare.toFixed(2)}</Text>
              <Text style={styles.fareCodeHelp}>Passenger scans QR or enters this code in PulaPay</Text>
            </View>

            <View style={{ backgroundColor: '#f4f7f5', borderRadius: 8, padding: 10, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: '#6c7873' }}>Permanent Driver ID</Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#17231f', letterSpacing: 2 }}>{currentUser?.driverPermanentId || 'DRV-0001'}</Text>
              <Text style={{ fontSize: 11, color: '#6c7873', marginTop: 4 }}>Passengers today: {driverTripCounter}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  handleDriverReuseFare();
                }}
                style={[styles.secondaryBtn, { flex: 1 }]}
              >
                <Text style={styles.secondaryBtnText}>↺  Reuse Fare (New Code)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleDriverConfirmFarePaid();
                }}
                style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]}
              >
                <Text style={styles.primaryBtnText}>✓ Fare Received</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 10: MERCHANT POS                     */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'merchant_pos'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Merchant POS Charge</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Feather name="x" size={18} color="#6c7873" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Customer / Table ID</Text>
            <TextInput
              style={styles.textInput}
              value={inputCounterparty}
              onChangeText={setInputCounterparty}
              placeholder="Table 4 / Walk-in Customer"
              placeholderTextColor="#6c7873"
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Charge Amount (Pula)</Text>
            <TextInput
              style={styles.amountInput}
              value={inputAmount}
              onChangeText={setInputAmount}
              placeholder="P 0.00"
              placeholderTextColor="#6c7873"
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={() => executeTransaction('merchant_charge', 'credit', inputCounterparty || 'POS Retail Charge')}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Generate POS Charge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 11: CARD TAP & PIN (SMS OTP)         */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'sms_otp'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.smsAlertBanner}>
              <View style={styles.smsAlertHeader}>
                <Feather name="message-square" size={13} color="#075c49" />
                <Text style={styles.smsAlertTitle}>Simulated SMS Notification</Text>
              </View>
              <Text style={styles.smsAlertBody}>
                PulaPay: OTP for card transaction of P {pendingCardAmount.toFixed(2)} to {pendingCardParty} is{' '}
                <Text style={styles.smsPinCode}>{simulatedOtp}</Text>. Valid for 5 min.
              </Text>
            </View>

            <Text style={styles.otpHeading}>One-Time PIN Authorization</Text>
            <Text style={styles.otpSubtitle}>Enter the 4-digit PIN sent via SMS to verify physical card tap</Text>

            <TextInput
              style={styles.otpInput}
              value={enteredOtp}
              onChangeText={setEnteredOtp}
              placeholder="••••"
              placeholderTextColor="#6c7873"
              keyboardType="numeric"
              maxLength={4}
            />

            <View style={styles.otpActionRow}>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmCardOtp} style={styles.confirmOtpBtn}>
                <Text style={styles.primaryBtnText}>Verify & Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================== */}
      {/* MODAL 12: TRANSACTION RECEIPT              */}
      {/* ========================================== */}
      <Modal visible={activeModal === 'receipt'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            <View style={styles.receiptCheckCircle}>
              <Feather name="check" size={32} color="#075c49" />
            </View>
            <Text style={styles.receiptSuccessTitle}>Payment Successful!</Text>
            <Text style={styles.receiptSubtitle}>Simulated money recorded in Botswana digital ledger.</Text>

            <Text style={styles.receiptAmount}>
              P {lastTxn ? lastTxn.amount.toFixed(2) : '0.00'}
            </Text>

            <View style={styles.receiptMetaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Recipient / Party</Text>
                <Text style={styles.metaValue}>{lastTxn?.counterparty}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Reference</Text>
                <Text style={[styles.metaValue, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                  {lastTxn?.reference}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Status</Text>
                <Text style={[styles.metaValue, { color: '#075c49', fontWeight: '800' }]}>COMPLETED</Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ========================================== */}
      {/* MODAL: LOGOUT CONFIRMATION (Spec v3.1)     */}
      {/* ========================================== */}
      <Modal visible={showLogoutConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.sheetContainer, { paddingBottom: 20 }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#fdf0f0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Feather name="log-out" size={24} color="#d9383a" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#17231f', textAlign: 'center' }}>
                Log out of PulaPay?
              </Text>
              <Text style={{ fontSize: 13, color: '#6c7873', textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 10 }}>
                You will need to sign in again to access your wallet, Agent operations and Driver collections.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleCancelLogout}
                style={[styles.secondaryBtn, { flex: 1 }]}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmLogout}
                style={[styles.primaryBtn, { flex: 1, backgroundColor: '#d9383a', marginTop: 0 }]}
              >
                <Text style={styles.primaryBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Splash Styles (Centered Alignment)
  splashContainer: {
    flex: 1,
    backgroundColor: '#075c49',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  phoneTime: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  phoneSignal: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  dynamicIsland: {
    width: 90,
    height: 18,
    backgroundColor: '#000000',
    borderRadius: 12,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  splashLogoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#d7f06f',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 24,
  },
  splashSlash: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
    color: '#075c49',
    fontSize: 18,
    marginRight: 4,
  },
  splashLogoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#075c49',
    letterSpacing: -0.5,
  },
  splashEyebrow: {
    color: '#d7f06f',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'center',
  },
  splashHeading: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 44,
    textAlign: 'center',
    alignSelf: 'center',
  },
  splashFooter: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  splashFooterText: {
    color: '#f0f8d4',
    fontSize: 12,
    fontWeight: '600',
  },

  // Auth Styles
  authContainer: {
    flex: 1,
    backgroundColor: '#075c49',
  },
  authHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 16 : 20,
    paddingBottom: 24,
  },
  authHeaderContent: {
    marginTop: 20,
  },
  authCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  authScroll: {
    paddingBottom: 30,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f4f7f5',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6c7873',
  },
  segmentTextActive: {
    color: '#075c49',
  },
  formGroup: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17231f',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f4f7f5',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    color: '#17231f',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f7f5',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: '#17231f',
  },
  eyeBtn: {
    padding: 8,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f4f7f5',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownSelectorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17231f',
  },
  selectMenuCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f7f5',
  },
  selectMenuItemSelected: {
    backgroundColor: '#e5f3ed',
  },
  selectMenuItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#17231f',
  },
  selectMenuItemTextSelected: {
    color: '#075c49',
    fontWeight: '800',
  },
  primaryBtn: {
    backgroundColor: '#075c49',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  demoAccountsBox: {
    backgroundColor: '#f4f7f5',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    padding: 12,
    marginTop: 18,
  },
  demoAccountsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#075c49',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  demoAccountRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  demoRoleTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#17231f',
    width: 105,
  },
  demoEmailText: {
    fontSize: 11,
    color: '#075c49',
    fontWeight: '600',
  },
  demoPwdHint: {
    fontSize: 10,
    color: '#6c7873',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e4eae6',
    paddingTop: 6,
  },
  encryptedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 6,
  },
  encryptedText: {
    fontSize: 10,
    color: '#6c7873',
    fontWeight: '600',
  },

  // Main Dashboard Styles
  mainContainer: {
    flex: 1,
    backgroundColor: '#f4f7f5',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0,
  },
  statusBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  darkTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17231f',
  },
  darkSignal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17231f',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  greetingText: {
    fontSize: 12,
    color: '#6c7873',
    fontWeight: '600',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#17231f',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  staticRolePill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  staticRolePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075c49',
  },
  agentSwitchPill: {
    backgroundColor: '#e5f3ed',
    borderWidth: 1,
    borderColor: '#075c49',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  agentSwitchPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075c49',
  },
  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orangeDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d9531e',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 85,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: '#075c49',
    borderRadius: 24,
    padding: 20,
    marginTop: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardCurveDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(215, 240, 111, 0.25)',
  },
  balanceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#f0f8d4',
    fontSize: 11,
    fontWeight: '700',
  },
  walletIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(215, 240, 111, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  pulaSymbol: {
    fontSize: 26,
    fontWeight: '900',
    color: '#d7f06f',
    marginRight: 8,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  eyeIconBtn: {
    marginLeft: 10,
    padding: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 14,
  },
  walletIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletIdLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#d7f06f',
    letterSpacing: 0.8,
  },
  walletIdCode: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Quick Actions Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#17231f',
  },
  sectionRoleTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c7873',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#17231f',
  },

  // Agent Specific Grid
  agentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  agentBtn: {
    alignItems: 'center',
    flex: 1,
  },

  // 2-Column Grid for Driver & Merchant
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  largeCardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 18,
    padding: 12,
  },
  largeCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#17231f',
  },
  largeCardDesc: {
    fontSize: 10,
    color: '#6c7873',
    marginTop: 2,
  },

  // Transactions Cards
  viewAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075c49',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orangeIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fff3ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#17231f',
  },
  txSubtitle: {
    fontSize: 10,
    color: '#6c7873',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: '#17231f',
  },
  creditAmount: {
    color: '#075c49',
  },
  emptyStateBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4eae6',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 11,
    color: '#6c7873',
    fontWeight: '600',
  },

  // Physical Card Banner
  physicalCardBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f8d4',
    borderWidth: 1,
    borderColor: '#d7f06f',
    borderRadius: 20,
    padding: 14,
    marginTop: 8,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#d7f06f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#075c49',
  },
  bannerSubtitle: {
    fontSize: 10,
    color: '#6c7873',
    marginTop: 2,
  },

  // Activity Screen
  activityContainer: {
    paddingTop: 6,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#17231f',
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#6c7873',
    marginTop: 2,
    marginBottom: 14,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  filterPillActive: {
    backgroundColor: '#075c49',
    borderColor: '#075c49',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17231f',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },

  // Profile Screen
  profileContainer: {
    paddingTop: 6,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d7f06f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '900',
    color: '#075c49',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#17231f',
  },
  profileContact: {
    fontSize: 10,
    color: '#6c7873',
    marginVertical: 4,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5f3ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#075c49',
  },
  profileMenuCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f7f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17231f',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffd5d6',
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 16,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#d9383a',
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 10,
    color: '#6c7873',
    fontWeight: '600',
  },

  // Bottom Navigation Bar
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e4eae6',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6c7873',
  },
  navTextActive: {
    color: '#075c49',
    fontWeight: '900',
  },

  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#17231f',
  },
  closeBtn: {
    padding: 4,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  providerBtn: {
    flex: 1,
    backgroundColor: '#f4f7f5',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  providerBtnActive: {
    backgroundColor: '#e5f3ed',
    borderColor: '#075c49',
  },
  providerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6c7873',
    textAlign: 'center',
  },
  providerTextActive: {
    color: '#075c49',
    fontWeight: '800',
  },
  amountInput: {
    backgroundColor: '#f4f7f5',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '900',
    color: '#075c49',
  },
  amountPresets: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: '#f0f8d4',
    borderWidth: 1,
    borderColor: '#d7f06f',
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075c49',
  },

  // Physical Card Graphic
  cardGraphic: {
    backgroundColor: '#075c49',
    borderRadius: 22,
    padding: 16,
    marginTop: 8,
  },
  cardGraphicTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    color: '#d7f06f',
    fontSize: 14,
    fontWeight: '900',
  },
  cardType: {
    color: '#f0f8d4',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardGraphicCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginVertical: 14,
  },
  barcodeBox: {
    flex: 1,
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    gap: 3,
    marginBottom: 4,
  },
  barLine: {
    height: 36,
    backgroundColor: '#17231f',
  },
  barcodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: '800',
    color: '#17231f',
  },
  qrBox: {
    padding: 4,
    backgroundColor: '#f4f7f5',
    borderRadius: 12,
  },
  cardGraphicBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardSubText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  blockCardBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9383a',
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  unblockCardBtn: {
    backgroundColor: '#075c49',
    borderColor: '#075c49',
  },
  blockCardText: {
    color: '#d9383a',
    fontSize: 12,
    fontWeight: '800',
  },
  unblockCardText: {
    color: '#ffffff',
  },

  // USSD Dialog
  ussdDialog: {
    backgroundColor: '#17231f',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  ussdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ussdTitle: {
    color: '#d7f06f',
    fontSize: 13,
    fontWeight: '800',
  },
  ussdScreen: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    minHeight: 110,
    justifyContent: 'center',
  },
  ussdScreenText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 17,
  },
  ussdInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  ussdInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 12,
  },
  ussdSendBtn: {
    backgroundColor: '#d7f06f',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  ussdSendText: {
    color: '#17231f',
    fontSize: 12,
    fontWeight: '800',
  },

  // Driver Fare Modal
  fareCodeBox: {
    backgroundColor: '#f4f7f5',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4eae6',
  },
  fareCodeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6c7873',
    letterSpacing: 1,
  },
  fareCodeNumbers: {
    fontSize: 34,
    fontWeight: '900',
    color: '#075c49',
    letterSpacing: 8,
    marginVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  fareCodeHelp: {
    fontSize: 11,
    color: '#6c7873',
    textAlign: 'center',
  },

  // SMS Alert Simulation
  smsAlertBanner: {
    backgroundColor: '#f0f8d4',
    borderWidth: 1,
    borderColor: '#d7f06f',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  smsAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  smsAlertTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075c49',
  },
  smsAlertBody: {
    fontSize: 11,
    color: '#17231f',
  },
  smsPinCode: {
    fontSize: 13,
    fontWeight: '900',
    color: '#075c49',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
  },
  otpHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: '#17231f',
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 11,
    color: '#6c7873',
    textAlign: 'center',
    marginVertical: 4,
  },
  otpInput: {
    width: 140,
    backgroundColor: '#f4f7f5',
    borderWidth: 1,
    borderColor: '#e4eae6',
    borderRadius: 16,
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: '900',
    color: '#075c49',
    textAlign: 'center',
    letterSpacing: 6,
    alignSelf: 'center',
    marginVertical: 10,
  },
  otpActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f4f7f5',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#17231f',
  },
  confirmOtpBtn: {
    flex: 1,
    backgroundColor: '#075c49',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },

  // Receipt Modal
  receiptContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  receiptCheckCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5f3ed',
    borderWidth: 3,
    borderColor: '#d7f06f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  receiptSuccessTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#17231f',
  },
  receiptSubtitle: {
    fontSize: 11,
    color: '#6c7873',
    marginTop: 2,
    marginBottom: 12,
  },
  receiptAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#075c49',
    marginBottom: 14,
  },
  receiptMetaBox: {
    width: '100%',
    backgroundColor: '#f4f7f5',
    borderRadius: 16,
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    color: '#6c7873',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#17231f',
  },
  eyeToggleBtn: {
    padding: 4,
    marginLeft: 8,
  },
  balanceAmountText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#17231f',
    letterSpacing: -1,
  },
  modeSwitcherBar: {
    flexDirection: 'row',
    backgroundColor: '#e8f0ec',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#075c49',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c7873',
  },
  modeTabTextActive: {
    color: '#d7f06f',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  secondaryStatText: {
    fontSize: 11,
    color: '#6c7873',
    textAlign: 'center',
  },
  secondaryStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#c0ccc6',
    marginHorizontal: 10,
  },
  driverActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#075c49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#075c49',
  },
});
