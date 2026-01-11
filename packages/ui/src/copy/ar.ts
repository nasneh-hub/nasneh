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
   * Nasneh Dashboard (Unified)
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
    
    // Login
    loginTitle: 'دخول لوحة التحكم',
    loginSubtitle: 'سجل دخولك لإدارة حسابك',
    backToWebsite: 'العودة للموقع',
    
    // Role Selection
    selectRole: 'اختر دورك',
    selectRoleSubtitle: 'لديك أكثر من دور. اختر الدور الذي تريد الدخول به.',
    switchRole: 'تغيير الدور',
    currentRole: 'الدور الحالي',
    
    // Roles
    roles: {
      admin: 'مدير النظام',
      adminDesc: 'إدارة المنصة والمستخدمين',
      vendor: 'ناسنه',
      vendorDesc: 'إدارة منتجاتك وطلباتك',
      provider: 'مقدم خدمة',
      providerDesc: 'إدارة خدماتك وحجوزاتك',
      driver: 'سائق',
      driverDesc: 'إدارة التوصيلات',
    },
    
    // Sidebar
    home: 'الرئيسية',
    orders: 'الطلبات',
    products: 'المنتجات',
    services: 'الخدمات',
    bookings: 'الحجوزات',
    deliveries: 'التوصيلات',
    users: 'المستخدمين',
    applications: 'الطلبات',
    reports: 'التقارير',
    
    // Unauthorized
    unauthorized: 'غير مصرح',
    unauthorizedMessage: 'ليس لديك صلاحية الوصول لهذه الصفحة',
    goBack: 'العودة',
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
   * Profile & Addresses
   */
  profile: {
    // Profile
    myProfile: 'ملفي الشخصي',
    editProfile: 'تعديل الملف الشخصي',
    name: 'الاسم',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الجوال',
    phoneReadOnly: 'رقم الجوال (لا يمكن تغييره)',
    saveChanges: 'حفظ التغييرات',
    profileUpdated: 'تم تحديث الملف الشخصي',
    
    // Addresses
    myAddresses: 'عناويني',
    addresses: 'العناوين',
    addAddress: 'إضافة عنوان',
    editAddress: 'تعديل العنوان',
    deleteAddress: 'حذف العنوان',
    noAddresses: 'لا توجد عناوين محفوظة',
    addFirstAddress: 'أضف عنوانك الأول',
    
    // Address Fields
    addressLabel: 'تسمية العنوان',
    labelHome: 'المنزل',
    labelWork: 'العمل',
    labelOther: 'آخر',
    governorate: 'المحافظة',
    area: 'المنطقة',
    block: 'المجمع',
    road: 'الطريق',
    building: 'المبنى',
    floor: 'الطابق',
    apartment: 'الشقة',
    additionalNotes: 'ملاحظات إضافية',
    setAsDefault: 'تعيين كعنوان افتراضي',
    defaultAddress: 'العنوان الافتراضي',
    
    // Governorates
    capitalGovernorate: 'محافظة العاصمة',
    muharraqGovernorate: 'محافظة المحرق',
    northernGovernorate: 'المحافظة الشمالية',
    southernGovernorate: 'المحافظة الجنوبية',
    
    // Messages
    addressAdded: 'تم إضافة العنوان',
    addressUpdated: 'تم تحديث العنوان',
    addressDeleted: 'تم حذف العنوان',
    confirmDeleteAddress: 'هل أنت متأكد من حذف هذا العنوان؟',
    setAsDefaultSuccess: 'تم تعيين العنوان الافتراضي',
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
   * Onboarding Section
   * For vendor/provider application flow
   */
  onboarding: {
    // Selection Page
    selectionTitle: 'اختر مسارك',
    selectionSubtitle: 'اختر كيف تريد الانضمام إلى ناسنه',
    becomeVendor: 'كن بائع',
    becomeVendorDesc: 'بيع المنتجات على ناسنه',
    becomeProvider: 'كن مقدم خدمة',
    becomeProviderDesc: 'قدم خدمات للعملاء',
    startApplication: 'ابدأ التقديم',
    viewStatus: 'عرض حالة الطلب',
    
    // Status Messages
    checkingStatus: 'جاري التحقق من حالة الطلب...',
    loadingError: 'فشل تحميل حالة الطلب',
    tryAgain: 'حاول مرة أخرى',
  },
  /**
   * Admin Dashboard
   * For admin application review and management
   */
  admin: {
    applications: {
      // Page title
      title: 'الطلبات',
      
      // Tabs
      tabs: {
        all: 'الكل',
        vendors: 'البائعين',
        providers: 'مقدمي الخدمات',
      },
      
      // Status filter
      status: {
        all: 'كل الحالات',
        pending: 'قيد المراجعة',
        approved: 'مقبول',
        rejected: 'مرفوض',
      },
      
      // Table headers
      table: {
        id: 'الرقم',
        applicant: 'المتقدم',
        business: 'اسم النشاط',
        type: 'النوع',
        status: 'الحالة',
        submitted: 'تاريخ التقديم',
        actions: 'الإجراءات',
      },
      
      // Search and actions
      search: 'ابحث بالاسم أو النشاط...',
      empty: 'لا توجد طلبات',
      view: 'عرض',
      
      // Detail page
      detail: {
        back: 'العودة إلى الطلبات',
        applicantInfo: 'معلومات المتقدم',
        businessInfo: 'معلومات النشاط',
        documents: 'المستندات',
        actions: 'الإجراءات',
        approve: 'قبول الطلب',
        reject: 'رفض الطلب',
        
        // Fields
        name: 'الاسم',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        crNumber: 'رقم السجل التجاري',
        category: 'الفئة',
        description: 'الوصف',
        qualifications: 'المؤهلات',
        notProvided: 'غير متوفر',
        
        // Documents
        documentsComingSoon: 'ميزة رفع المستندات قريباً',
        
        // Status history
        statusHistory: 'سجل الحالة',
        adminNotes: 'ملاحظات الإدارة',
      },
      
      // Reject modal
      reject: {
        title: 'رفض الطلب',
        reason: 'سبب الرفض',
        reasonPlaceholder: 'اشرح سبب رفض هذا الطلب...',
        reasonRequired: 'سبب الرفض مطلوب',
        quickReasons: {
          invalidLicense: 'رخصة غير صالحة',
          incompleteDocuments: 'مستندات ناقصة',
          notEligible: 'النشاط غير مؤهل',
          other: 'أخرى',
        },
        confirm: 'تأكيد الرفض',
        cancel: 'إلغاء',
      },
      
      // Success messages
      success: {
        approved: 'تم قبول الطلب بنجاح',
        rejected: 'تم رفض الطلب بنجاح',
      },
      
      // Error messages
      errors: {
        loadFailed: 'فشل تحميل الطلبات',
        approveFailed: 'فشل قبول الطلب',
        rejectFailed: 'فشل رفض الطلب',
        notFound: 'الطلب غير موجود',
        unauthorized: 'غير مصرح لك بعرض هذه الصفحة',
      },
      
      // Loading states
      loading: 'جاري تحميل الطلبات...',
      loadingDetail: 'جاري تحميل تفاصيل الطلب...',
    },
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
