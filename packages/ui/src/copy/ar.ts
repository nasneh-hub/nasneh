/**
 * Nasneh Arabic Copy Tokens
 * 
 * THE SINGLE SOURCE OF TRUTH for all Arabic UI text.
 * 
 * Source: docs/SPECS/BRAND_VOICE.md
 * Version: 2.0
 * Last Updated: January 2026
 * 
 * CRITICAL RULES:
 * - ALL Arabic text MUST come from this file
 * - NO hardcoded Arabic strings in components
 * - Use: import { ar } from '@nasneh/ui/copy'
 * - Structure MUST match en.ts exactly
 */

export const ar = {
  /**
   * Base UI Vocabulary
   * Source: Brand Voice Doc Section 4
   */
  ui: {
    // Greetings
    welcome: 'حياكم',
    hi: 'أهلين',
    hello: 'يا هلا',
    
    // Core Terms (Nasneh as noun)
    nasneh: 'ناسنه',
    ourNasneh: 'ناسنتنا',
    allNasneh: 'جميع ناسنه',
    featuredNasneh: 'ناسنه مميز',
    
    // Community Terms
    supporters: 'الداعمين',
    community: 'أهلنا',
    guests: 'ضيوفنا',
    partners: 'شركاؤنا',
    
    // Quality Terms
    quality: 'جودة',
    crafted: 'إتقان',
    premium: 'تبيض الوجه',
    
    // Growth Terms
    empowerment: 'تمكين',
    growth: 'نكبر سوا',
    sustainability: 'استدامة',
    
    // Actions
    browse: 'تصفح',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    view: 'عرض',
    edit: 'تعديل',
    delete: 'حذف',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',
    
    // Status
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الانتظار',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',
    info: 'معلومات',
  },

  /**
   * Platform Categories
   * Source: Brand Voice Doc Section 2
   */
  categories: {
    freshFood: 'أطعمة طازجة',
    foodProducts: 'منتجات غذائية',
    crafts: 'حرف ومنتجات',
    foodTrucks: 'عربات متنقلة',
    services: 'خدمات وإبداع',
    
    // Full description
    allCategories: 'أطعمة، منتجات، حرف، عربات، وخدمات من ناسنه البحرين',
  },

  /**
   * Taglines & Slogans
   * Source: Brand Voice Doc Section 6
   */
  taglines: {
    primary: 'منّا وفينا',
    primaryTranslation: 'From us, for us',
    secondary: 'سوق أهلنا',
    supportNasneh: 'ادعم ناسنه',
    growTogether: 'نكبر سوا',
    qualityProud: 'جودة تبيض الوجه',
    becomeNasneh: 'صير ناسنه',
  },

  /**
   * CTAs (Calls to Action)
   * Source: Brand Voice Doc Section 7
   */
  cta: {
    shopNow: 'تسوّق الحين',
    orderNow: 'اطلب الحين',
    joinWaitlist: 'سجّل اهتمامك',
    becomeNasneh: 'صير ناسنه',
    browseNasneh: 'تصفح ناسنه',
    supportNasneh: 'ادعم ناسنه',
  },

  /**
   * Authentication
   */
  auth: {
    // Welcome
    welcome: 'حياك في ناسنه! 🙌',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    
    // Forms
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    phone: 'رقم الجوال',
    phoneNumber: 'رقم الجوال',
    phonePlaceholder: '3XXXXXXX',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    
    // OTP Flow
    sendOtp: 'إرسال رمز التحقق',
    verifyOtp: 'تحقق من الرمز',
    enterOtp: 'أدخل رمز التحقق',
    otpSent: 'تم إرسال رمز التحقق',
    otpSentTo: 'تم إرسال رمز التحقق إلى',
    resendOtp: 'إعادة إرسال الرمز',
    resendIn: 'إعادة الإرسال بعد',
    changePhone: 'تغيير الرقم',
    otpExpiry: 'صلاحية الرمز',
    minutes: 'دقائق',
    seconds: 'ثانية',
    
    // OTP Errors
    invalidOtp: 'رمز التحقق غير صحيح',
    expiredOtp: 'انتهت صلاحية الرمز',
    tooManyAttempts: 'محاولات كثيرة. جرب لاحقاً',
    otpRequired: 'الرجاء إدخال رمز التحقق',
    
    // Messages
    loginSuccess: 'تم تسجيل الدخول بنجاح',
    signupSuccess: 'حياك في ناسنه! 🙌',
    logoutSuccess: 'تم تسجيل الخروج',
    passwordResetSent: 'تم إرسال رابط إعادة التعيين',
    
    // Terms
    termsAndPrivacy: 'الشروط والخصوصية',
    byLoggingIn: 'بتسجيل الدخول، أنت توافق على',
    termsOfService: 'شروط الخدمة',
    and: 'و',
    privacyPolicy: 'سياسة الخصوصية',
  },

  /**
   * System Messages - Success
   * Source: Brand Voice Doc Section 8
   */
  success: {
    orderPlaced: 'تم الطلب! تسلم على دعمك 🎉',
    paymentSuccess: 'تمت العملية بنجاح ✓',
    accountCreated: 'حياك في ناسنه! 🙌',
    becameNasneh: 'مبروك! صرت ناسنه 🎉',
    profileUpdated: 'تم تحديث الملف الشخصي',
    itemAdded: 'تمت الإضافة',
    itemRemoved: 'تمت الإزالة',
    changesSaved: 'تم حفظ التغييرات',
  },

  /**
   * System Messages - Errors
   * Source: Brand Voice Doc Section 8
   */
  errors: {
    paymentFailed: 'لم تتم العملية. جرب مرة ثانية',
    outOfStock: 'عذراً، المنتج غير متوفر حالياً',
    networkError: 'تحقق من الاتصال وجرب مرة ثانية',
    invalidEmail: 'البريد الإلكتروني غير صحيح',
    invalidPhone: 'رقم الجوال غير صحيح',
    passwordTooShort: 'كلمة المرور قصيرة جداً',
    passwordMismatch: 'كلمة المرور غير متطابقة',
    requiredField: 'هذا الحقل مطلوب',
    somethingWrong: 'حدث خطأ ما. جرب مرة ثانية',
  },

  /**
   * Push Notifications
   * Source: Brand Voice Doc Section 8
   */
  notifications: {
    orderConfirmed: '🎉 طلبك تأكد! ناسنه يجهز طلبك',
    outForDelivery: '🚗 طلبك في الطريق!',
    delivered: '✅ تم التوصيل! شكراً على دعمك',
    readyForPickup: '📍 طلبك جاهز للاستلام!',
  },

  /**
   * Milestone Messages - For Nasneh (Vendors)
   * Source: Brand Voice Doc Section 9
   */
  milestones: {
    nasneh: {
      firstSale: 'مبروك أول طلب! هذي البداية، ونكبر سوا 🎉',
      hundredOrders: '100 طلب! إبداعك يوصل لكل مكان 🚀',
      firstFiveStar: 'أول تقييم 5 نجوم! جودتك وصلت ✨',
      oneYear: 'سنة معنا! شكراً على ثقتك 💙',
    },
    
    customer: {
      firstOrder: 'أول طلب! حياك في عائلة ناسنه 🙌',
      tenthOrder: 'طلبك العاشر! شكراً على دعمك المستمر 💙',
    },
  },

  /**
   * Apologies
   * Source: Brand Voice Doc Section 9
   */
  apologies: {
    deliveryDelay: 'نعتذر عن التأخير. طلبك أولوية ونتابعه شخصياً.',
    orderIssue: 'نعتذر عن أي إزعاج. فريقنا يتواصل معك.',
  },

  /**
   * Seasonal Messages
   * Source: Brand Voice Doc Section 9
   */
  seasonal: {
    ramadan: 'رمضان كريم! كل عام وأنتم بخير 🌙',
    nationalDay: 'يوم وطني مجيد! فخورين نكون جزء من نجاح البحرين 🇧🇭',
  },

  /**
   * Orders & Shopping
   */
  orders: {
    myOrders: 'طلباتي',
    orderDetails: 'تفاصيل الطلب',
    orderNumber: 'رقم الطلب',
    orderDate: 'تاريخ الطلب',
    orderStatus: 'حالة الطلب',
    orderTotal: 'المجموع',
    trackOrder: 'تتبع الطلب',
    cancelOrder: 'إلغاء الطلب',
    reorder: 'إعادة الطلب',
    
    // Cart
    cart: 'السلة',
    addToCart: 'أضف للسلة',
    removeFromCart: 'إزالة من السلة',
    emptyCart: 'السلة فارغة',
    checkout: 'إتمام الطلب',
    
    // Delivery
    delivery: 'التوصيل',
    deliveryAddress: 'عنوان التوصيل',
    deliveryFee: 'رسوم التوصيل',
    deliveryTime: 'وقت التوصيل',
    pickup: 'الاستلام',
    
    // Payment
    payment: 'الدفع',
    paymentMethod: 'طريقة الدفع',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
  },

  /**
   * Nasneh Dashboard (Vendor)
   */
  dashboard: {
    dashboard: 'لوحة التحكم',
    myProducts: 'منتجاتي',
    myOrders: 'طلباتي',
    myServices: 'خدماتي',
    analytics: 'الإحصائيات',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    
    // Stats
    totalSales: 'إجمالي المبيعات',
    totalOrders: 'إجمالي الطلبات',
    activeProducts: 'المنتجات النشطة',
    rating: 'التقييم',
  },

  /**
   * Products & Services
   */
  products: {
    product: 'منتج',
    products: 'منتجات',
    service: 'خدمة',
    services: 'خدمات',
    
    price: 'السعر',
    description: 'الوصف',
    category: 'الفئة',
    availability: 'التوفر',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    
    addProduct: 'إضافة منتج',
    editProduct: 'تعديل منتج',
    deleteProduct: 'حذف منتج',
  },

  /**
   * Reviews & Ratings
   */
  reviews: {
    reviews: 'التقييمات',
    rating: 'التقييم',
    writeReview: 'اكتب تقييم',
    noReviews: 'لا توجد تقييمات بعد',
    stars: 'نجوم',
  },

  /**
   * Common UI Elements
   */
  common: {
    yes: 'نعم',
    no: 'لا',
    ok: 'حسناً',
    done: 'تم',
    skip: 'تخطي',
    continue: 'متابعة',
    learnMore: 'اعرف أكثر',
    seeAll: 'عرض الكل',
    showMore: 'عرض المزيد',
    showLess: 'عرض أقل',
    readMore: 'اقرأ المزيد',
    
    // Time
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    now: 'الآن',
    
    // Validation
    required: 'مطلوب',
    optional: 'اختياري',
    invalid: 'غير صحيح',
    valid: 'صحيح',
  },
} as const;

export type ArCopy = typeof ar;
