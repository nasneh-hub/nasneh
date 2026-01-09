/**
 * Nasneh English Copy Tokens
 * 
 * THE SINGLE SOURCE OF TRUTH for all English UI text.
 * 
 * Source: docs/SPECS/BRAND_VOICE.md
 * Version: 2.0
 * Last Updated: January 2026
 * 
 * CRITICAL RULES:
 * - ALL English text MUST come from this file
 * - NO hardcoded English strings in components
 * - Use: import { en } from '@nasneh/ui/copy'
 * - Structure MUST match ar.ts exactly
 */

export const en = {
  /**
   * Base UI Vocabulary
   * Source: Brand Voice Doc Section 4
   */
  ui: {
    // Greetings
    welcome: 'Welcome',
    hi: 'Hi there',
    hello: 'Hello',
    
    // Core Terms (Nasneh as noun)
    nasneh: 'Nasneh',
    ourNasneh: 'Our Nasneh',
    allNasneh: 'All Nasneh',
    featuredNasneh: 'Featured Nasneh',
    
    // Community Terms
    supporters: 'Supporters',
    community: 'Community',
    guests: 'Guests',
    partners: 'Partners',
    
    // Quality Terms
    quality: 'Quality',
    crafted: 'Crafted',
    premium: 'Premium',
    
    // Growth Terms
    empowerment: 'Empowerment',
    growth: 'We grow together',
    sustainability: 'Sustainability',
    
    // Actions
    browse: 'Browse',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    tryAgain: 'Try Again',
    provider: 'Provider',
  },

  /**
   * Platform Categories
   * Source: Brand Voice Doc Section 2
   */
  categories: {
    freshFood: 'Fresh Food',
    foodProducts: 'Food Products',
    crafts: 'Crafts & Goods',
    foodTrucks: 'Food Trucks',
    services: 'Services',
    
    // Full description
    allCategories: 'Fresh food, products, crafts, food trucks & services from Bahrain\'s Nasneh',
  },

  /**
   * Taglines & Slogans
   * Source: Brand Voice Doc Section 6
   */
  taglines: {
    primary: 'From us, for us',
    primaryArabic: 'منّا وفينا',
    secondary: 'Our people\'s marketplace',
    supportNasneh: 'Support Nasneh',
    growTogether: 'We grow together',
    qualityProud: 'Quality that makes you proud',
    becomeNasneh: 'Become a Nasneh',
  },

  /**
   * CTAs (Calls to Action)
   * Source: Brand Voice Doc Section 7
   */
  cta: {
    shopNow: 'Shop Now',
    orderNow: 'Order Now',
    joinWaitlist: 'Join Waitlist',
    becomeNasneh: 'Become a Nasneh',
    browseNasneh: 'Browse Nasneh',
    supportNasneh: 'Support Nasneh',
  },

  /**
   * Authentication
   */
  auth: {
    // Welcome
    welcome: 'Welcome to Nasneh! 🙌',
    login: 'Log In',
    signup: 'Sign Up',
    logout: 'Log Out',
    
    // Forms
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    phone: 'Phone',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '3XXXXXXX',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    
    // OTP Flow
    sendOtp: 'Send Verification Code',
    verifyOtp: 'Verify Code',
    enterOtp: 'Enter Verification Code',
    otpSent: 'Verification code sent',
    otpSentTo: 'Verification code sent to',
    resendOtp: 'Resend Code',
    resendIn: 'Resend in',
    changePhone: 'Change Number',
    otpExpiry: 'Code expires in',
    minutes: 'minutes',
    seconds: 'seconds',
    
    // OTP Errors
    invalidOtp: 'Invalid verification code',
    expiredOtp: 'Code has expired',
    tooManyAttempts: 'Too many attempts. Try again later',
    otpRequired: 'Please enter the verification code',
    
    // Messages
    loginSuccess: 'Logged in successfully',
    signupSuccess: 'Welcome to Nasneh! 🙌',
    logoutSuccess: 'Logged out successfully',
    passwordResetSent: 'Password reset link sent',
    
    // Navigation
    goBack: 'Go Back',
    
    // Country Codes
    countryCode: 'Country Code',
    bahrain: 'Bahrain',
    bahrainCode: '+973',
    gccSoon: 'GCC (Soon)',
    
    // Terms
    termsAndPrivacy: 'Terms & Privacy',
    byLoggingIn: 'By logging in, you agree to our',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
  },

  /**
   * System Messages - Success
   * Source: Brand Voice Doc Section 8
   */
  success: {
    orderPlaced: 'Order placed! Thanks for your support 🎉',
    paymentSuccess: 'Payment successful ✓',
    accountCreated: 'Welcome to Nasneh! 🙌',
    becameNasneh: 'Congrats! You\'re now a Nasneh 🎉',
    profileUpdated: 'Profile updated',
    itemAdded: 'Item added',
    itemRemoved: 'Item removed',
    changesSaved: 'Changes saved',
  },

  /**
   * System Messages - Errors
   * Source: Brand Voice Doc Section 8
   */
  errors: {
    paymentFailed: 'Payment failed. Please try again.',
    outOfStock: 'Sorry, currently unavailable.',
    networkError: 'Check connection and try again.',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    passwordTooShort: 'Password too short',
    passwordMismatch: 'Passwords don\'t match',
    requiredField: 'This field is required',
    somethingWrong: 'Something went wrong. Please try again.',
  },

  /**
   * Push Notifications
   * Source: Brand Voice Doc Section 8
   */
  notifications: {
    orderConfirmed: '🎉 Order confirmed! Nasneh is preparing your order',
    outForDelivery: '🚗 Your order is on the way!',
    delivered: '✅ Delivered! Thanks for your support',
    readyForPickup: '📍 Your order is ready for pickup!',
  },

  /**
   * Milestone Messages - For Nasneh (Vendors)
   * Source: Brand Voice Doc Section 9
   */
  milestones: {
    nasneh: {
      firstSale: 'Congrats on your first order! This is the beginning, we grow together 🎉',
      hundredOrders: '100 orders! Your craft reaches everywhere 🚀',
      firstFiveStar: 'First 5-star review! Your quality shines ✨',
      oneYear: 'One year with us! Thanks for your trust 💙',
    },
    
    customer: {
      firstOrder: 'First order! Welcome to the Nasneh family 🙌',
      tenthOrder: 'Your 10th order! Thanks for your continued support 💙',
    },
  },

  /**
   * Apologies
   * Source: Brand Voice Doc Section 9
   */
  apologies: {
    deliveryDelay: 'We apologize for the delay. Your order is our priority and we\'re following up personally.',
    orderIssue: 'We apologize for any inconvenience. Our team will contact you.',
  },

  /**
   * Seasonal Messages
   * Source: Brand Voice Doc Section 9
   */
  seasonal: {
    ramadan: 'Ramadan Kareem! Happy Ramadan 🌙',
    nationalDay: 'Happy National Day! Proud to be part of Bahrain\'s success 🇧🇭',
  },

  /**
   * Orders & Shopping
   */
  orders: {
    myOrders: 'My Orders',
    orderDetails: 'Order Details',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    orderTotal: 'Order Total',
    trackOrder: 'Track Order',
    cancelOrder: 'Cancel Order',
    reorder: 'Reorder',
    noOrders: 'No orders yet',
    orderHistory: 'Your order history will appear here',
    startShopping: 'Start Shopping',
    
    // Cart
    cart: 'Cart',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    emptyCart: 'Cart is empty',
    checkout: 'Checkout',
    
    // Delivery
    delivery: 'Delivery',
    deliveryAddress: 'Delivery Address',
    deliveryFee: 'Delivery Fee',
    deliveryTime: 'Delivery Time',
    pickup: 'Pickup',
    
    // Payment
    payment: 'Payment',
    paymentMethod: 'Payment Method',
    total: 'Total',
    subtotal: 'Subtotal',
  },

  /**
   * Nasneh Dashboard (Unified)
   */
  dashboard: {
    dashboard: 'Dashboard',
    myProducts: 'My Products',
    myOrders: 'My Orders',
    myServices: 'My Services',
    analytics: 'Analytics',
    settings: 'Settings',
    profile: 'Profile',
    
    // Stats
    totalSales: 'Total Sales',
    totalOrders: 'Total Orders',
    activeProducts: 'Active Products',
    rating: 'Rating',
    
    // Login
    loginTitle: 'Dashboard Login',
    loginSubtitle: 'Sign in to manage your account',
    backToWebsite: 'Back to Website',
    
    // Role Selection
    selectRole: 'Select Your Role',
    selectRoleSubtitle: 'You have multiple roles. Choose which role to enter with.',
    switchRole: 'Switch Role',
    currentRole: 'Current Role',
    
    // Roles
    roles: {
      admin: 'Admin',
      adminDesc: 'Manage the platform and users',
      vendor: 'Nasneh',
      vendorDesc: 'Manage your products and orders',
      provider: 'Service Provider',
      providerDesc: 'Manage your services and bookings',
      driver: 'Driver',
      driverDesc: 'Manage deliveries',
    },
    
    // Sidebar
    home: 'Home',
    orders: 'Orders',
    products: 'Products',
    services: 'Services',
    bookings: 'Bookings',
    deliveries: 'Deliveries',
    users: 'Users',
    applications: 'Applications',
    reports: 'Reports',
    
    // Unauthorized
    unauthorized: 'Unauthorized',
    unauthorizedMessage: 'You do not have permission to access this page',
    goBack: 'Go Back',
  },

  /**
   * Products & Services
   */
  products: {
    product: 'Product',
    products: 'Products',
    service: 'Service',
    services: 'Services',
    
    price: 'Price',
    description: 'Description',
    category: 'Category',
    availability: 'Availability',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
  },

  /**
   * Currency
   */
  currency: {
    bhd: 'BHD',
    bd: 'BD',
  },

  /**
   * Settings Dropdown (Language/Currency/Country)
   */
  settings: {
    // Language
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    
    // Currency
    currency: 'Currency',
    bahrainDinar: 'Bahraini Dinar (BHD)',
    
    // Country
    country: 'Country',
    bahrain: 'Bahrain',
    gcc: 'GCC',
    
    // Status
    comingSoon: 'Coming soon',
  },

  /**
   * Profile
   */
  profile: {
    // Profile
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    accountSettings: 'Account Settings',
    name: 'Name',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    phoneReadOnly: 'Phone (cannot be changed)',
    saveChanges: 'Save Changes',
    profileUpdated: 'Profile updated',
    
    // Addresses
    myAddresses: 'My Addresses',
    addresses: 'Addresses',
    addAddress: 'Add Address',
    editAddress: 'Edit Address',
    deleteAddress: 'Delete Address',
    noAddresses: 'No saved addresses',
    addFirstAddress: 'Add your first address',
    
    // Address Fields
    addressLabel: 'Address Label',
    labelHome: 'Home',
    labelWork: 'Work',
    labelOther: 'Other',
    governorate: 'Governorate',
    area: 'Area',
    block: 'Block',
    road: 'Road',
    building: 'Building',
    floor: 'Floor',
    apartment: 'Apartment',
    additionalNotes: 'Additional Notes',
    setAsDefault: 'Set as default address',
    defaultAddress: 'Default Address',
    
    // Governorates
    capitalGovernorate: 'Capital Governorate',
    muharraqGovernorate: 'Muharraq Governorate',
    northernGovernorate: 'Northern Governorate',
    southernGovernorate: 'Southern Governorate',
    
    // Messages
    addressAdded: 'Address added',
    addressUpdated: 'Address updated',
    addressDeleted: 'Address deleted',
    confirmDeleteAddress: 'Are you sure you want to delete this address?',
    setAsDefaultSuccess: 'Default address set',
  },

  /**
   * Bookings
   */
  bookings: {
    myBookings: 'My Bookings',
    bookingDetails: 'Booking Details',
    bookingNumber: 'Booking Number',
    bookingDate: 'Booking Date',
    bookingStatus: 'Booking Status',
    bookingTime: 'Booking Time',
    cancelBooking: 'Cancel Booking',
    reschedule: 'Reschedule',
    noBookings: 'No bookings yet',
    bookingHistory: 'Your service bookings will appear here',
    bookService: 'Book Service',
  },

  /**
   * Reviews & Ratings
   */
  reviews: {
    reviews: 'Reviews',
    myReviews: 'My Reviews',
    rating: 'Rating',
    writeReview: 'Write Review',
    noReviews: 'No reviews yet',
    reviewHistory: 'Your reviews and ratings will appear here',
    stars: 'stars',
  },

  /**
   * Wishlist
   */
  wishlist: {
    wishlist: 'Wishlist',
    myWishlist: 'My Wishlist',
    addToWishlist: 'Add to Wishlist',
    removeFromWishlist: 'Remove from Wishlist',
    noItems: 'No items in your wishlist',
    wishlistEmpty: 'Your favorite items will appear here',
    comingSoon: 'Coming Soon',
  },

  /**
   * Support
   */
  support: {
    support: 'Support',
    helpCenter: 'Help Center',
    contactUs: 'Contact Us',
    faq: 'FAQ',
    supportDescription: 'Get help with your orders and account',
    needHelp: 'Need Help?',
    getInTouch: 'Get in Touch',
  },

  /**
   * Footer
   */
  footer: {
    // Section Titles
    marketplace: 'Marketplace',
    company: 'Company',
    support: 'Support',
    legal: 'Legal',
    
    // Marketplace Links
    kitchens: 'Kitchens',
    craft: 'Craft',
    products: 'Products',
    foodTrucks: 'Food Trucks',
    services: 'Services',
    
    // Company Links
    aboutUs: 'About Us',
    howItWorks: 'How It Works',
    careers: 'Careers',
    press: 'Press',
    
    // Support Links
    helpCenter: 'Help Center',
    safety: 'Safety',
    contactUs: 'Contact Us',
    
    // Legal Links
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    cookiePolicy: 'Cookie Policy',
    
    // Copyright
    madeIn: 'Made with care in',
    bahrain: 'Bahrain',
  },

  /**
   * Listing Pages
   */
  listing: {
    // Page Headings
    products: 'Products',
    services: 'Services',
    allProducts: 'All Products',
    allServices: 'All Services',
    
    // Sort Options
    sortBy: 'Sort by',
    newest: 'Newest',
    oldest: 'Oldest',
    priceLowToHigh: 'Price: Low to High',
    priceHighToLow: 'Price: High to Low',
    nameAtoZ: 'Name: A to Z',
    nameZtoA: 'Name: Z to A',
    
    // Pagination
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    results: 'results',
    
    // Empty States
    noResults: 'No results found',
    noProducts: 'No products available yet',
    noServices: 'No services available yet',
    emptyDescription: 'Check back soon for new items from our Nasneh',
    browseCategories: 'Browse Categories',
    backToHome: 'Back to Home',
  },

  /**
   * Common UI Elements
   */
  common: {
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    done: 'Done',
    skip: 'Skip',
    continue: 'Continue',
    learnMore: 'Learn More',
    seeAll: 'See All',
    showMore: 'Show More',
    showLess: 'Show Less',
    readMore: 'Read More',
    
    // Time
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    now: 'Now',
    
    // Validation
    required: 'Required',
    optional: 'Optional',
    invalid: 'Invalid',
    valid: 'Valid',
  },
} as const;

export type EnCopy = typeof en;
