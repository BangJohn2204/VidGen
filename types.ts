


export type ProductType = 
  // Makanan
  'makanan-ringan' | 'roti-kue' | 'makanan-beku' | 'bahan-masak' | 'hidangan-utama' | 'hidangan-pembuka' | 'hidangan-penutup' | 'mie-pasta' | 'seafood' |
  // Minuman
  'kopi-teh' | 'jus-smoothie' | 'minuman-kemasan' | 'minuman-tradisional' |
  // Kecantikan
  'skincare' | 'makeup' | 'parfum' | 'perawatan-rambut' |
  // Aksesoris
  'aksesoris-general' | 'perhiasan' | 'jam-tangan' | 'tas' | 'topi' | 'kacamata' |
  // Alat Masak
  'peralatan-masak' | 'peralatan-makan' | 'elektronik-dapur' | 'wadah-penyimpanan' |
  // Olahraga
  'pakaian-olahraga' | 'sepatu-olahraga' | 'aksesoris-gym' | 'alat-yoga-pilates' |
  // Potret
  'portrait-headshot' | 'portrait-full-body' | 'portrait-couple' | 'portrait-group';


export interface GenerationConfig {
  photoType: ProductType;
  productName?: string;
  angleStyle: string;
  lightingStyle: string;
  stylingStyle: string;
  outfitStyle: string;
  backgroundStyle: string;
  customBackgroundStyle?: string;
  extraInstructions: string;
  withWatermark: boolean;
  customWatermarkText?: string;
  portraitProductImage?: File | null;
}

export interface PosterConfig {
  productName?: string;
  theme: string;
  colorPalette: string;
  fontStyle: string;
  headline: string;
  bodyText: string;
  cta: string;
}

export interface VideoConfig {
  productName: string;
  productImage: File | null;
  referenceImage: File | null;
  videoPrompt: string;
  aspectRatio: '16:9' | '9:16';
}

export interface UGCVideoConfig {
  productName: string;
  productImage: File | null;
  modelMode: 'upload' | 'ai';
  modelImage: File | null;
  modelDescription: string;
  targetAudience: string;
  tone: string;
  overlayHook: string;
}

export interface UGCSoundVideoConfig {
  productName: string;
  productCategory: string;
  productBenefits: string;
  productUsp: string;
  productImage: File | null;
  voiceGender: 'pria' | 'wanita';
  targetAudience: string;
  tone: string;
  hookText: string;
  shortBenefitSentence: string;
  shortCtaText: string;
}

export interface UGCAffiliateConfig {
    productImage: File | null;
    modelImage: File | null;
    productName: string;
    backgroundStyle: string;
    modelMode: 'upload' | 'ai';
    modelDescription: string;
}

export interface UGCAffiliateScene {
    id: 'hook' | 'problem' | 'solution' | 'cta';
    title_id: string;
    title_en: string;
    image: ResultItem;
    video: VideoResultItem;
    script: string;
}

export interface InteractiveAnimationConfig {
    images: (File | null)[];
    context: string;
    animationStyle: string;
    backgroundAtmosphere: string;
}

export interface InteractiveAnimationScene {
    id: 'opening' | 'context' | 'main' | 'closing';
    title_id: string;
    title_en: string;
    previewFrame: ResultItem;
    animationDescription: string;
    headline: string;
    subHeadline: string;
    cta: string;
    voiceOverScript: string;
}


export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
}

export interface ResultItem {
  id: number;
  status: 'empty' | 'generating' | 'completed' | 'error' | 'upscaling';
  data?: GeneratedImage;
  errorMessage?: string;
  upscaledImageUrl?: string;
}

export interface VideoResultItem {
  id: number;
  status: 'empty' | 'generating' | 'completed' | 'error';
  videoUrl?: string;
  errorMessage?: string;
  operationName?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'id' | 'en';
  numberOfResults: 2 | 4 | 6;
  defaultWatermark: boolean;
  aspectRatio: '1:1' | '4:5' | '9:16';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  recommendations?: Partial<GenerationConfig> | Partial<PosterConfig>;
}